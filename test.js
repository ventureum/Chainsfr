let bip32 = require('bip32')
let bip39 = require('bip39')
let bitcoin = require('bitcoinjs-lib')

const NETWORK = bitcoin.networks.testnet
const accountIdx = 0
const BASE_BTC_PATH = "49'/1'"
const path = `m/${BASE_BTC_PATH}/${accountIdx}'`
const xpriv = "tprv8ZgxMBicQKsPdsEdmkNMrnrD1g2jc78MoJ1zdkAeHCpHkM1hx1R7iWCCy5VuEZ6WNJ3xnbqqoELm852GhuLRgLAec6jb8daPGgGF51Y6tBK"
const root = bip32.fromBase58(xpriv, NETWORK)
const child = root.derivePath(path)
console.log('child: ', child)
const xpub = child.neutered().toBase58()
const privateKey = child.toWIF()
const keyPair = bitcoin.ECPair.fromWIF(privateKey, NETWORK)
const p2wpkh = bitcoin.payments.p2wpkh({
    pubkey: keyPair.publicKey,
    network: NETWORK
})

const { address } = bitcoin.payments.p2sh({
    redeem: p2wpkh,
    network: NETWORK
})

let xxpub = bip32.fromBase58(xpriv, NETWORK).derivePath(path).neutered().toBase58()

function getDerivedAddress (xpub, change, addressIdx) {
    const root = bip32.fromBase58(xpub, NETWORK)
    const child = root.derive(change).derive(addressIdx)
    console.log('child: ', child)
    const { address } = bitcoin.payments.p2sh({
      redeem: bitcoin.payments.p2wpkh({
        pubkey: child.publicKey,
        network: NETWORK
      }),
      network: NETWORK
    })
    return address
  }

console.log(address, xpub, xxpub)
console.log(getDerivedAddress(xpub, 0, 0))