// @flow
import Web3 from 'web3'
import BN from 'bn.js'
import randomBytes from 'randombytes'
import wordlist from './wordlist.js'
import wif from 'wif'
import bitcore from 'bitcore-lib'
import axios from 'axios'
import CryptoWorker from './crypto.worker.js'
import url from './url'

const WIF_VERSION = {
  testnet: 0xef,
  mainnet: 0x80
}

/*
 * @param val BN instance, assuming smallest token unit
 * @return float number of val/(10**decimals) with precision [precision]
 */
function toHumanReadableUnit (val, decimals = 18, precision = 3) {
  let base = new BN(10).pow(new BN(decimals - precision))
  let precisionBase = new BN(10).pow(new BN(precision))
  let rv = new BN(val).div(base)
  return rv.toNumber() / precisionBase.toNumber()
}

/*
 * @param val float number representing token units with precision [precision]
 * @return BN smallest token unit
 */
function toBasicTokenUnit (val, decimals = 18, precision = 3) {
  let base = new BN(10).pow(new BN(decimals - precision))
  let precisionBase = new BN(10).pow(new BN(precision))
  let rv = parseInt(val * precisionBase.toNumber())
  return new BN(rv).mul(base)
}

async function getGasCost (txObj) {
  const _web3 = new Web3(new Web3.providers.HttpProvider(url.INFURA_API_URL))
  let price = await _web3.eth.getGasPrice()
  let gas = (await _web3.eth.estimateGas(txObj)).toString()
  let costInBasicUnit = new BN(price).mul(new BN(gas)).toString()
  let costInStandardUnit = _web3.utils.fromWei(costInBasicUnit, 'ether')

  return { price, gas, costInBasicUnit, costInStandardUnit }
}

/**
 * Converts a byte array into a passphrase.
 * @param {Buffer} bytes The bytes to convert
 * @returns {Array.<string>}
 */
function bytesToPassphrase (bytes) {
  // Uint8Array should only be used when this is called in the browser
  // context.
  if (
    !Buffer.isBuffer(bytes) &&
    !(typeof window === 'object' && bytes instanceof window.Uint8Array)
  ) {
    throw new Error('Input must be a Buffer or Uint8Array.')
  }

  if ((bytes.length * 8) % 12 !== 0) {
    // 4096 words = 12 bit per word
    throw new Error('Must be divisible by 12 bit')
  }

  const words = []
  let byteIdx = 0
  while (byteIdx < bytes.length) {
    let len = words.length
    let wordIdx = null
    if (len % 2 === 0) {
      // 1 byte + next 4 bit
      wordIdx = (bytes[byteIdx] << 4) + (bytes[byteIdx + 1] >> 4)
    } else {
      // 4 bit + next 1 byte
      wordIdx = (bytes[byteIdx] % 16 << 8) + bytes[byteIdx + 1]
      // skip next byte
      byteIdx++
    }

    let word = wordlist[wordIdx]
    if (!word) {
      throw new Error('Invalid byte encountered')
    } else {
      words.push(word)
    }

    byteIdx++
  }

  return words
}

/**
 * Generates a random passphrase with the specified number of bytes.
 * NOTE: `size` must be an even number.
 * @param {number} size The number of random bytes to use
 * @returns {Array.<string>}
 */
function generatePassphrase (size) {
  const MAX_PASSPHRASE_SIZE = 1024 // Max size of passphrase in bytes

  if (typeof size !== 'number' || size < 0 || size > MAX_PASSPHRASE_SIZE) {
    throw new Error(`Size must be between 0 and ${MAX_PASSPHRASE_SIZE} bytes.`)
  }
  const bytes = randomBytes(size)
  return bytesToPassphrase(bytes)
}

export async function getBtcLastBlockHeight () {
  const rv = (await axios.get(url.BLOCKCYPHER_API_URL)).data
  return rv.height
}

async function getBtcTxFeePerByte () {
  const rv = (await axios.get(url.BTC_FEE_ENDPOINT)).data
  // safety check
  if (new BN(rv.hourFee).gt(new BN(200))) {
    console.warn(new Error('Abnormal btc fee per byte'))
    return 200
  }
  return rv.hourFee
}

/*
 * cryptr is a simple aes-256-ctr encrypt and decrypt module for node.js
 *
 * Usage:
 *
 * const cryptr = new Cryptr('myTotalySecretKey');
 *
 * const encryptedString = cryptr.encrypt('bacon');
 * const decryptedString = cryptr.decrypt(encryptedString);
 *
 * console.log(encryptedString); // 5590fd6409be2494de0226f5d7
 * console.log(decryptedString); // bacon
 */
function Cryptr (secret) {
  if (!secret || typeof secret !== 'string') {
    throw new Error('Cryptr: secret must be a non-0-length string')
  }

  const crypto = require('crypto')
  const algorithm = 'aes-256-ctr'
  const key = crypto
    .createHash('sha256')
    .update(String(secret))
    .digest()

  this.encrypt = function encrypt (value) {
    if (value == null) {
      throw new Error('value must not be null or undefined')
    }

    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(algorithm, key, iv)
    const encrypted = cipher.update(String(value), 'utf8', 'hex') + cipher.final('hex')

    return iv.toString('hex') + encrypted
  }

  this.decrypt = function decrypt (value) {
    if (value == null) {
      throw new Error('value must not be null or undefined')
    }

    const stringValue = String(value)
    const iv = Buffer.from(stringValue.slice(0, 32), 'hex')
    const encrypted = stringValue.slice(32)

    const decipher = crypto.createDecipheriv(algorithm, key, iv)
    return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8')
  }
}

async function encryptMessage (message: string, password: string): Promise<string> {
  const cryptr = new Cryptr(password)
  return cryptr.encrypt(message)
}

async function decryptMessage (encryptedMessage: string, password: string): Promise<string> {
  const cryptr = new Cryptr(password)
  return cryptr.decrypt(encryptedMessage)
}

export default {
  toHumanReadableUnit,
  toBasicTokenUnit,
  getGasCost,
  generatePassphrase,
  getBtcTxFeePerByte,
  encryptMessage,
  decryptMessage
}
