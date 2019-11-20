// Modified and referenced from https://github.com/LedgerHQ/ledger-wallet-webtool/blob/master/src/PathFinderUtils.js
import 'babel-polyfill'
import * as bitcoinjs from 'bitcoinjs-lib'
import bs58 from 'bs58'
import padStart from 'lodash/padStart'
import * as BIP32 from 'bip32'
import env from '../typedEnv'

const networks = bitcoinjs.networks

function parseHexString (str) {
  let result = []
  while (str.length >= 2) {
    result.push(parseInt(str.substring(0, 2), 16))
    str = str.substring(2, str.length)
  }
  return result
}

function toPrefixBuffer (network) {
  return {
    ...network,
    messagePrefix: Buffer.concat([
      Buffer.from([network.messagePrefix.length + 1]),
      Buffer.from(network.messagePrefix + '\n', 'utf8')
    ]).toString('hex')
  }
}

function compressPublicKey (publicKey) {
  let compressedKeyIndex
  if (publicKey.substring(0, 2) !== '04') {
    console.error('Invalid public key format')
  }
  if (parseInt(publicKey.substring(128, 130), 16) % 2 !== 0) {
    compressedKeyIndex = '03'
  } else {
    compressedKeyIndex = '02'
  }
  let result = compressedKeyIndex + publicKey.substring(2, 66)
  return result
}

function toHexDigit (number) {
  let digits = '0123456789abcdef'
  return digits.charAt(number >> 4) + digits.charAt(number & 0x0f)
}

function toHexInt (number) {
  return (
    toHexDigit((number >> 24) & 0xff) +
    toHexDigit((number >> 16) & 0xff) +
    toHexDigit((number >> 8) & 0xff) +
    toHexDigit(number & 0xff)
  )
}

function encodeBase58Check (vchIn) {
  vchIn = parseHexString(vchIn)
  let chksum = bitcoinjs.crypto.sha256(Buffer.from(vchIn, 'hex'))
  chksum = bitcoinjs.crypto.sha256(chksum)
  chksum = chksum.slice(0, 4)
  let hash = vchIn.concat(Array.from(chksum))
  return bs58.encode(Buffer.from(hash))
}

function createXPUB (depth, fingerprint, childnum, chaincode, publicKey, network) {
  let xpub = toHexInt(network)
  xpub = xpub + padStart(depth.toString(16), 2, '0')
  xpub = xpub + padStart(fingerprint.toString(16), 8, '0')
  xpub = xpub + padStart(childnum.toString(16), 8, '0')
  xpub = xpub + chaincode
  xpub = xpub + publicKey
  return xpub
}

export async function getAccountXPub (btcLedger, prevPath, account, segwit) {
  const finalize = async fingerprint => {
    let path = prevPath + '/' + account
    let nodeData = await btcLedger.getWalletPublicKey(path, undefined, segwit)
    let publicKey = compressPublicKey(nodeData.publicKey)
    let childnum = (0x80000000 | account) >>> 0
    let xpub = createXPUB(
      3,
      fingerprint,
      childnum,
      nodeData.chainCode,
      publicKey,
      networks[env.REACT_APP_BITCOIN_JS_LIB_NETWORK].bip32.public
    )
    return encodeBase58Check(xpub)
  }
  let nodeData = await btcLedger.getWalletPublicKey(prevPath, undefined, segwit)
  let publicKey = compressPublicKey(nodeData.publicKey)
  publicKey = parseHexString(publicKey)
  let result = bitcoinjs.crypto.sha256(Buffer.from(publicKey))
  result = bitcoinjs.crypto.ripemd160(Buffer.from(result))
  let fingerprint = ((result[0] << 24) | (result[1] << 16) | (result[2] << 8) | result[3]) >>> 0
  return finalize(fingerprint)
}

export async function findAddress (path, segwit, xpub58) {
  let script = segwit
    ? networks[env.REACT_APP_BITCOIN_JS_LIB_NETWORK].scriptHash
    : networks[env.REACT_APP_BITCOIN_JS_LIB_NETWORK].pubKeyHash

  let hdnode = BIP32.fromBase58(
    xpub58,
    toPrefixBuffer(networks[env.REACT_APP_BITCOIN_JS_LIB_NETWORK])
  )
  let pubKeyToSegwitAddress = (pubKey, scriptVersion, segwit) => {
    let script = [0x00, 0x14].concat(Array.from(bitcoinjs.crypto.hash160(pubKey)))
    let hash160 = bitcoinjs.crypto.hash160(Buffer.from(script))
    return bitcoinjs.address.toBase58Check(hash160, scriptVersion)
  }

  let getPublicAddress = (hdnode, path, script, segwit) => {
    hdnode = hdnode.derivePath(
      path
        .split('/')
        .splice(3, 2)
        .join('/')
    )
    if (!segwit) {
      return hdnode.getAddress().toString()
    } else {
      return pubKeyToSegwitAddress(hdnode.publicKey, script, segwit)
    }
  }
  try {
    return await getPublicAddress(hdnode, path, script, segwit)
  } catch (e) {
    throw e
  }
}
