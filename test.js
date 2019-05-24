const bitcoin = require('bitcoinjs-lib')
const bip32 = require('bip32')
const bip39 = require('bip39')

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

const bcrypt = require('bcrypt')

async function encryptMessage (message, password) {
  const cryptr = new Cryptr(password)
  return JSON.stringify({
    hash: await bcrypt.hash(message, 10),
    encryptedMessage: cryptr.encrypt(message)
  })
}

async function decryptMessage (encryptedMessage, password) {
  const cryptr = new Cryptr(password)
  let encryptedMessageObj = JSON.parse(encryptedMessage)
  let message = cryptr.decrypt(encryptedMessageObj.encryptedMessage)
  if (!(await bcrypt.compare(message, encryptedMessageObj.hash))) {
    throw new Error('Decryption failed: Wrong password')
  }
  return message
}

async function main () {
  const seed = await bip39.mnemonicToSeed(bip39.generateMnemonic())
  const root = bip32.fromSeed(seed)
  let xpriv = root.toBase58()
  let xpub = root.neutered().toBase58()

  try {
    let a = await encryptMessage(xpriv, 'abcde')
    let b = await decryptMessage(a, 'abcde')
    console.log(a, b)
  } catch (e) {
    console.log(e)
  }
}

main()
