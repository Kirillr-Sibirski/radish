export function generateEstimateLoan(
  component_address: string,
  collateral: Map<string, number>
) {
  const s1 = `
    CALL_METHOD
      Address("${component_address}")
      "estimate_loan"
      Map<Address, Decimal>(`;

  let s2 = "";
  collateral.forEach((decimal, address) => {
    s2 += `Address("${address}") => Decimal("${decimal}"), `;
  });

  return s1 + s2 + ");";
}

export function generateGetLoan(
  account_address: string,
  component_address: string,
  collateral: Map<string, number>
) {
  let s_resource = "";
  collateral.forEach(
    (amount, address) =>
      (s_resource += `CALL_METHOD
    Address("${account_address}")
    "withdraw"
    Address("${address}")
    Decimal("${amount}");
  TAKE_FROM_WORKTOP
    Address("${address}")
    Decimal("${amount}")
    Bucket("Bucket_${address}");
    
  `)
  );
  let s_bucket = "";
  collateral.forEach(
    (_, address) => (s_bucket += `Bucket("Bucket_${address}"), `)
  );

  return `${s_resource}CALL_METHOD
    Address("${component_address}")
    "get_loan"
    Array<Bucket>(${s_bucket});

  CALL_METHOD
    Address("${account_address}")
    "deposit_batch"
    Expression("ENTIRE_WORKTOP");
`;
}

export function generateEstimateRepay(
  account_address: string,
  component_address: string,
  borrower_badge_id: string,
  repay_amount: number
) {
  return `CALL_METHOD
    Address("${component_address}")
    "estimate_repay"
    NonFungibleLocalId("${borrower_badge_id}")
    Decimal("${repay_amount}");

  CALL_METHOD
    Address("${account_address}")
    "deposit_batch"
    Expression("ENTIRE_WORKTOP");
  `;
}

export function generateRepayLoan(
  account_address:   string,
  component_address: string,
  borrower_badge:    string,
  borrower_badge_id: string,
  rsh_address:       string,
  rsh_amount:        number
) {
  return `CALL_METHOD 
    Address("${account_address}") 
    "withdraw"
    Address("${rsh_address}") 
    Decimal("${rsh_amount}");

  CALL_METHOD 
    Address("${account_address}") 
    "withdraw_non_fungibles" 
    Address("${borrower_badge}") 
    Array<NonFungibleLocalId>(NonFungibleLocalId("${borrower_badge_id}"));

  TAKE_FROM_WORKTOP 
    Address("${rsh_address}")
    Decimal("${rsh_amount}")
    Bucket("RSH");

  TAKE_NON_FUNGIBLES_FROM_WORKTOP
    Address("${borrower_badge}")
    Array<NonFungibleLocalId>(NonFungibleLocalId("${borrower_badge_id}"))
    Bucket("NFT");

  CALL_METHOD
    Address("${component_address}")
    "repay_loan"
    Bucket("NFT")
    Bucket("RSH");

  CALL_METHOD
    Address("${account_address}")
    "deposit_batch"
    Expression("ENTIRE_WORKTOP");
  `;
}
