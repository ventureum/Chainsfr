const { addHexPrefix, isValidAddress } = require('ethereumjs-util')
const BN = require('bn.js')
const ethUtil = require('ethereumjs-util')

/**
@module
*/
module.exports = {
  normalizeTxParams,
  validateTxParams,
  validateFrom,
  validateRecipient,
  getFinalStates,
  hexToBn,
  bnToHex,
  BnMultiplyByFraction
}

// functions that handle normalizing of that key in txParams
const normalizers = {
  from: (from, LowerCase = true) =>
    LowerCase ? addHexPrefix(from).toLowerCase() : addHexPrefix(from),
  to: (to, LowerCase = true) => (LowerCase ? addHexPrefix(to).toLowerCase() : addHexPrefix(to)),
  nonce: nonce => addHexPrefix(nonce),
  value: value => addHexPrefix(value),
  data: data => addHexPrefix(data),
  gas: gas => addHexPrefix(gas),
  gasPrice: gasPrice => addHexPrefix(gasPrice)
}

/**
  normalizes txParams
  @param txParams {object}
  @returns {object} normalized txParams
 */
function normalizeTxParams (txParams, LowerCase) {
  // apply only keys in the normalizers
  const normalizedTxParams = {}
  for (const key in normalizers) {
    if (txParams[key]) normalizedTxParams[key] = normalizers[key](txParams[key], LowerCase)
  }
  return normalizedTxParams
}

/**
  validates txParams
  @param txParams {object}
 */
function validateTxParams (txParams) {
  validateFrom(txParams)
  validateRecipient(txParams)
  if ('value' in txParams) {
    const value = txParams.value.toString()
    if (value.includes('-')) {
      throw new Error(`Invalid transaction value of ${txParams.value} not a positive number.`)
    }

    if (value.includes('.')) {
      throw new Error(`Invalid transaction value of ${txParams.value} number must be in wei`)
    }
  }
}

/**
  validates the from field in  txParams
  @param txParams {object}
 */
function validateFrom (txParams) {
  if (!(typeof txParams.from === 'string'))
    throw new Error(`Invalid from address ${txParams.from} not a string`)
  if (!isValidAddress(txParams.from)) throw new Error('Invalid from address')
}

/**
  validates the to field in  txParams
  @param txParams {object}
 */
function validateRecipient (txParams) {
  if (txParams.to === '0x' || txParams.to === null) {
    if (txParams.data) {
      delete txParams.to
    } else {
      throw new Error('Invalid recipient address')
    }
  } else if (txParams.to !== undefined && !isValidAddress(txParams.to)) {
    throw new Error('Invalid recipient address')
  }
  return txParams
}

/**
    @returns an {array} of states that can be considered final
  */
function getFinalStates () {
  return [
    'rejected', // the user has responded no!
    'confirmed', // the tx has been included in a block.
    'failed', // the tx failed for some reason, included on tx data.
    'dropped' // the tx nonce was already used
  ]
}

/**
 * Converts a BN object to a hex string with a '0x' prefix
 *
 * @param {BN} inputBn The BN to convert to a hex string
 * @returns {string} A '0x' prefixed hex string
 *
 */
function bnToHex (inputBn) {
  return ethUtil.addHexPrefix(inputBn.toString(16))
}

/**
 * Converts a hex string to a BN object
 *
 * @param {string} inputHex A number represented as a hex string
 * @returns {Object} A BN object
 *
 */
function hexToBn (inputHex) {
  return new BN(ethUtil.stripHexPrefix(inputHex), 16)
}

/**
 * Used to multiply a BN by a fraction
 *
 * @param {BN} targetBN The number to multiply by a fraction
 * @param {number|string} numerator The numerator of the fraction multiplier
 * @param {number|string} denominator The denominator of the fraction multiplier
 * @returns {BN} The product of the multiplication
 *
 */
function BnMultiplyByFraction (targetBN, numerator, denominator) {
  const numBN = new BN(numerator)
  const denomBN = new BN(denominator)
  return targetBN.mul(numBN).div(denomBN)
}
