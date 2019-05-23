const bitcoin = require('bitcoinjs-lib')
const bip32 = require('bip32')
const bip39 = require('bip39')

const seed = await bip39.mnemonicToSeed(bip39.generateMnemonic())
const root = bip32.fromSeed(seed)
let xpriv = root.toBase58()
let xpub = root.neutered().toBase58()

console.log(xpriv)