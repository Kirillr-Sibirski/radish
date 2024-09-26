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
  borrower_badge_address: string,
  borrower_badge_id: string
) {
  return `CALL_METHOD
    Address("${account_address}")
    "create_proof_of_non_fungibles"
    Address("${borrower_badge_address}")
    Array<NonFungibleLocalId>(NonFungibleLocalId("${borrower_badge_id}"));

  POP_FROM_AUTH_ZONE 
    Proof("Proof_${borrower_badge_id}");

  CALL_METHOD
    Address("${component_address}")
    "estimate_repay"
    Proof("Proof_${borrower_badge_id}")
    Decimal("0.6");

  CALL_METHOD
    Address("${account_address}")
    "deposit_batch"
    Expression("ENTIRE_WORKTOP");`;
}
