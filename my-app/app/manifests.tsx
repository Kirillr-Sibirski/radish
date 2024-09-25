export function generateEstimateLoan(component_address: String, collateral: Map<String, Number>) {
    return `
    CALL_METHOD
      Address("${component_address}")
      "lock_fee"
      Decimal("5");
    CALL_METHOD
      Address("${component_address}")
      "estimate_loan"
      Map<Address, Decimal>(${
        () => {
            let s = '';
            collateral.forEach((address, decimal) => {
                s += `Address("${address}") => Decimal("${decimal}"), `
            })
            return s
        }
      });
    `
}