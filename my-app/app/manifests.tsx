export function generateEstimateLoan(component_address: String, collateral: Map<String, Number>) {
  // CALL_METHOD
  //   Address("${component_address}")
  //   "lock_fee"
  //   Decimal("5");  
  let s1 = `
    CALL_METHOD
      Address("${component_address}")
      "estimate_loan"
      Map<Address, Decimal>(`
  
  let s2 = ""
  collateral.forEach((decimal, address) => {
    s2 += `Address("${address}") => Decimal("${decimal}"), `
  })

  return s1 + s2 + ");"


  
  // return `
  //   CALL_METHOD
  //     Address("${component_address}")
  //     "estimate_loan"
  //     Map<Address, Decimal>(${() => {
  //     let s = '';
  //     collateral.forEach((address, decimal) => {
  //       s += `Address("${address}") => Decimal("${decimal}"), `
  //     })
  //     return s
  //   }
  //   });
  //   `

  //   CALL_METHOD
  //   Address("component_tdx_2_1crxwj8t0y54sk4kyfl6xlxhzff7tfjecqetexeqhc29xp5vydtcj3u")
  //   "estimate_loan"
  //   Map<Address, Decimal>(()=>{
  //     let s = "";
  //     collateral.forEach((address, decimal)=>{
  //         s += 'Address("'.concat(address, '") => Decimal("').concat(decimal, '"), ');
  //     });
  //     return s;
  // });
}