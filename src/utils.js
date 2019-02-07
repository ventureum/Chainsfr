import Web3 from 'web3'
import BN from 'bn.js'

const infuraApi = `https://${process.env.REACT_APP_NETWORK_NAME}.infura.io/v3/${process.env.REACT_APP_INFURA_API_KEY}`

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

async function getGasCost (txObj) {
  const _web3 = new Web3(new Web3.providers.HttpProvider(infuraApi))
  let gasPrice = await _web3.eth.getGasPrice()
  let gas = (await _web3.eth.estimateGas(txObj)).toString()
  let costInWei = (new BN(gasPrice).mul(new BN(gas))).toString()
  let costInEther = _web3.utils.fromWei(costInWei, 'ether')

  return { gasPrice, gas, costInWei, costInEther }
}

export default { toHumanReadableUnit, toBasicTokenUnit, getGasCost }
