/* ------------------ Imports ----------------- */
use scrypto::prelude::*;


/* ------------------- Misc. ------------------ */
#[derive(NonFungibleData, ScryptoSbor, Clone)]
struct Borrower {
    #[mutable]
    collateral: HashMap<ResourceAddress, Decimal>,
    #[mutable]
    debt: Decimal,
}

#[derive(ScryptoSbor, ScryptoEvent)]
struct EstimateLoanEvent {
    value: Decimal,
}


/* ----------------- Blueprint ---------------- */
#[blueprint]
#[events(EstimateLoanEvent)]
mod radish {
    enable_method_auth! {
        roles {
            borrower => updatable_by: [OWNER];
        },
        methods {
            estimate_loan => PUBLIC;
            get_loan => PUBLIC;
            repay_loan => restrict_to: [borrower];
        }
    }

    struct Radish {
        // Radish Resources
        radish_manager: ResourceManager,
        radish_resource: ResourceAddress,
        radish_vault: Vault,
        // Borrower Resources        
        borrower_manager: ResourceManager,
        // borrowers: LazySet<NonFungibleGlobalId>,
        // collateral_addresses: Vec<ResourceAddress>, //! May have to re-enable later
        collateral_vaults: KeyValueStore<ResourceAddress, Vault>,
        // Badges
        // ...
        // Placeholder Oracle
        placeholder_oracle_collateral_prices: KeyValueStore<ResourceAddress, Decimal>, // Resource -> USD
    }

    impl Radish {
        pub fn instantise_radish() -> (Global<Radish>, Bucket) {
            let (address_reservation, component_address) =
                Runtime::allocate_component_address(Radish::blueprint_id());

            /* ------------------ Badges ------------------ */
            let owner_badge: Bucket = ResourceBuilder::new_fungible(OwnerRole::None)
                .metadata(metadata!(init {
                    "name" => "Radish Lending Platform Owner Badge", locked;
                }))
                .divisibility(DIVISIBILITY_NONE)
                .mint_initial_supply(1)
                .into();


            /* ----------------- Resources ---------------- */
            // Radish
            let radish_bucket: Bucket = ResourceBuilder::new_fungible(OwnerRole::None)
                .metadata(metadata!(init {
                    "name" => "Radish", locked;
                    "symbol" => "RSH", locked;
                    // "description" => "Radish provided by the Radish Lending Platform", locked;
                }))
                .mint_roles(mint_roles! {
                    minter => rule!(require(global_caller(component_address)));
                    minter_updater => rule!(deny_all);
                })
                .mint_initial_supply(10000)
                .into();
            
            // Borrower
            let borrower_manager: ResourceManager = ResourceBuilder::new_ruid_non_fungible::<Borrower>(OwnerRole::None)
                .metadata(metadata!(init {
                    "name" => "Radish Borrower Badge", locked;
                }))
                .mint_roles(mint_roles! {
                    minter => rule!(require(global_caller(component_address)));
                    minter_updater => rule!(deny_all);
                })
                .recall_roles(recall_roles! {
                    recaller => rule!(require(global_caller(component_address)));
                    recaller_updater => rule!(deny_all);
                })
                .burn_roles(burn_roles! {
                    burner => rule!(require(global_caller(component_address)));
                    burner_updater => rule!(deny_all);
                })
                .create_with_no_initial_supply();

            let collateral_addresses = vec![XRD];
            let collateral_vaults = KeyValueStore::new();
            
            for address in &collateral_addresses {
                collateral_vaults.insert(address.clone(), Vault::new(address.clone()));
            }
            

            /* ------------ Placeholder Oracle ------------ */
            let placeholder_oracle_collateral_prices = KeyValueStore::new();
            placeholder_oracle_collateral_prices.insert(radish_bucket.resource_address(), dec!(2.0));
            placeholder_oracle_collateral_prices.insert(XRD, dec!(0.02099)); // OCISWAP 


            /* --------------- Instantising --------------- */
            let component = Radish {
                // Radish Resources
                radish_manager: radish_bucket.resource_manager(),
                radish_resource: radish_bucket.resource_address(),
                radish_vault: Vault::with_bucket(radish_bucket),
                // Borrower Resources
                borrower_manager,
                // borrowers: KeyValueStore::new(),
                // collateral_addresses,
                collateral_vaults,
                // Badges
                // ...
                // Placeholder Oracle
                placeholder_oracle_collateral_prices,
            }
            .instantiate()
            .prepare_to_globalize(OwnerRole::Fixed(rule!(require(
                owner_badge.resource_address()
            ))))
            .roles(roles!(
                borrower => rule!(require(borrower_manager.address()));
            ))
            .with_address(address_reservation)
            .globalize();

            (component, owner_badge)
        }

        pub fn estimate_loan(&self, collateral: HashMap<ResourceAddress, Decimal>) -> Decimal {
            info!("[estimate_loan] collateral: {:?}", collateral);

            /* ---------------- Validation ---------------- */
            assert!(collateral.len() > 0, "No resources provided");
            assert!(self.placeholder_oracle_collateral_prices.get(&self.radish_resource).is_some(), "RSH price not tracked by oracle");

            for (address, amount) in collateral.iter() {
                assert!(self.collateral_vaults.get(address).is_some(), "Invalid resource provided as collateral");
                assert!(self.placeholder_oracle_collateral_prices.get(address).is_some(), "Invalid oracle does not track provided collateral price");
                assert!(amount >= &Decimal::ZERO, "Bucket somehow less than 0");
            }

            /* ------------------- Logic ------------------ */
            let mut estimated_usd: Decimal = dec!(0.0);
            
            for (address, amount) in collateral.iter() {
                let usd_value: Decimal = amount.clone().checked_mul(
                    *self.placeholder_oracle_collateral_prices.get(address).unwrap()
                ).unwrap();

                estimated_usd = estimated_usd.checked_add(usd_value).unwrap();
            }
            
            let estimated_rsh: Decimal = estimated_usd.checked_div(
                *self.placeholder_oracle_collateral_prices.get(&self.radish_resource).unwrap()
            ).unwrap();
            
            /* ------------------ Return ------------------ */
            info!("[estimate_loan] Collateral in USD: {:?}\n[estimate_loan] Collateral in RSH: {:?}", estimated_usd, estimated_rsh);

            Runtime::emit_event(EstimateLoanEvent { value: estimated_rsh.clone() });
            estimated_rsh
        }

        pub fn get_loan(&mut self, collateral: Vec<Bucket>) -> (Bucket, Bucket) {
            assert!(collateral.len() > 0, "No buckets provided");
            info!("[get_loan] Collateral: {:?} {:?}", &collateral, &collateral[0].amount());
            
            let resource_map: HashMap<ResourceAddress, Decimal> = collateral.iter()
                .map(|bucket| (bucket.resource_address(), bucket.amount()))
                .collect();
            let estimated_rsh: Decimal = self.estimate_loan(resource_map.clone());

            assert!(self.radish_vault.amount() >= estimated_rsh, "Insufficient RSH in vault to provide loan");

            let borrower_badge: Bucket = self.borrower_manager.mint_ruid_non_fungible(Borrower {
                collateral: resource_map,
                debt: estimated_rsh.clone(),
            });
            info!("[get_loan] borrower badge: {:?}", borrower_badge);

            for bucket in collateral {
                let mut resource_vault = self.collateral_vaults.get_mut(&bucket.resource_address()).unwrap();
                resource_vault.put(bucket);
            }

            (borrower_badge, self.radish_vault.take(estimated_rsh))
        }

        pub fn repay_loan(&mut self) {
            // TODO: Pass Proof
        }
    }
}
