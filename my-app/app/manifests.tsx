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
  collateral.forEach((amount, address) => (
    s_resource += `CALL_METHOD
    Address("${account_address}")
    "withdraw"
    Address("${address}")
    Decimal("${amount}");
  TAKE_FROM_WORKTOP
    Address("${address}")
    Decimal("${amount}")
    Bucket("Bucket_${address}");
    
  `));
  let s_bucket = "";
  collateral.forEach((_, address) => (s_bucket += `Bucket("Bucket_${address}"), `));

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
