/*
 * @param val BN instance, assuming smallest token unit
 * @return float number of val/(10**decimals) with precision [precision]
 */
function toHumanReadableUnit (val, decimals = 18, precision = 3) {
  const BN = window._web3.utils.BN
  let base = new BN(10).pow(new BN(decimals - precision))
  let precisionBase = new BN(10).pow(new BN(precision))
  let rv = val.div(base)
  return rv.toNumber() / precisionBase.toNumber()
}

/*
 * @param val float number representing token units with precision [precision]
 * @return BN smallest token unit
 */
function toBasicTokenUnit (val, decimals = 18, precision = 3) {
  const BN = window._web3.utils.BN
  let base = new BN(10).pow(new BN(decimals - precision))
  let precisionBase = new BN(10).pow(new BN(precision))
  let rv = parseInt(val * precisionBase.toNumber())
  return new BN(rv).pow(base)
}

export default { toHumanReadableUnit, toBasicTokenUnit }
