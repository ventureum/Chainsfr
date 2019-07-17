import WalletBitcoin from '../wallets/bitcoin'
import WalletUtils from '../wallets/utils'
import utils from '../utils'
import env from '../typedEnv'
import axios from 'axios'

const mockAddress = '2MvRQT3x5HxCrVcvB9dJTNQBwCkCu6VuPvk'
const mockAddress2 = '2NFHynziuhhMWdUUqWpmqBQPnuYW1BbcvSw'
const mockPrivKey = 'cP6KRFJcWroHQYSRhQ6K1gkGicMSFYGp7YBhdnSXUVtb6NoQf2AJ'
const mockXpub = 'tpubDCFR6dz4WRkaM4qwqVSpqfREKZYo4VMLRmahh2Jf3KWL4YsU7NbvjhoXK6K6A3XhpPWTLWbinLCK5EhwB3KodoUafpwjsqbCo51NyYj2427'
const mockXpriv = 'tprv8ZgxMBicQKsPfQaqmQ4u2nQxV124k4uta7sECKQiSoYLtt6UC7dmRN4ZYC2jqRhRhWXwqpXzjeqGDvt6RHBxqD45i77edr1zqLrFB5CH1wC'
const mockTxHash = '00000000000000000011d0cd37d89efcd1efdce2ee97ef3565094f9c71d2cb0c'
const mockRawTx = '02000000000101a91b794baed3507d942d07dcb110e3f9eadf193397d9fe9198279fd984c8d1830000000017160014265d20df98620ec9b208024a0f160c1a55c9520cffffffff02e80300000000000017a91422d545119cab2e8e2ebf7f83eba13cc6c562d6e787c16396000000000017a91422d545119cab2e8e2ebf7f83eba13cc6c562d6e787024830450221009976e55bb06ed2c2db2a0569c7b0278a0cfdaccdac55fea740301e6cdcade54202205ddbc9f0eb031ec8d9d8788b7a45ac0668dd3c0ba4037fdf73808df1afeb943c012103c54fdebd95f39320897419b45682e1f6ef8bef63c9fc68148fefec57ed3822bb00000000'
const mockBalance = 9859397
const basicBitcoinWalletData = {
  walletType: 'drive',
  cryptoType: 'bitcoin',
  accounts: [{
    balance: '0',
    address: mockAddress,
    privateKey: mockPrivKey,
    hdWalletVariables: {
      xpub: mockXpub,
      xpriv: mockXpriv,
      nextAddressIndex: 0,
      nextChangeIndex: 0,
      addresses: [{
        address: mockAddress,
        path: "49'/1'/0'/0/0",
        utxos: []
      }],
      lastBlockHeight: 0,
      lastUpdate: 0,
      changeAddress: mockAddress
    }
  }]
}

const mockTxFee = {
  'costInBasicUnit': '2460',
  'costInStandardUnit': '0.0000246',
  'gas': '164',
  'price': '15'
}

const mockTxs = [
  {
    hash: '83d1c884d99f279891fed9973319dfeaf9e310b1dc072d947d50d3ae4b791ba9',
    inputs: [{
      address: 'tb1q9tynatqtvmy78xygnc8w0je90c46dpueng7evl',
      input_index: 0,
      output_hash: '85433ed55240b259173591c86969fd39a92ef83dec962d7bbce06cfe68255341',
      output_index: 0,
      value: 8961318058
    }],
    outputs: [
      {
        address: mockAddress,
        output_index: 0,
        script_hex: 'a914541b11a8cd5dadf89f96dee0bff57e46adb4743a87',
        value: mockBalance
      },
      {
        address: '2NCBpTgkKWNZu5geT5kkBZBmsqDKBbgWPSf',
        output_index: 1,
        script_hex: 'a914cfc58090043cdd0372e67bdc8dbb22542e7db12d87',
        value: 8951444248
      }
    ]
  }
]

jest.mock('bip39', () => {
  return {
    mnemonicToSeedSync: () => 'seed',
    generateMnemonic: () => 'mnemonic'
  }
})

jest.mock('bip32', () => {
  return {
    fromSeed: (seed, network) => ({ toBase58: () => (mockXpriv) }),
    fromBase58: jest.requireActual('bip32').fromBase58
  }
})

jest.mock('../ledgerSigner', () => {
  return function () {
    return {
      getBtcAddresss: () => ({ address: mockAddress, xpub: mockXpub }),
      createNewBtcPaymentTransaction: (utxos, to, value, fee, changeAddress) => {
        if (utxos && to && value && fee && changeAddress !== undefined) {
          return mockRawTx
        }
        return 'BAD'
      }
    }
  }
})

axios.get = jest.fn(async (param) => {
  if (param.match(/addresses/i)) {
    const address = param.split('/')[7]
    if (address === mockAddress || address === mockAddress2) {
      return {
        data: {
          txs: mockTxs
        }
      }
    }
    return {
      data: {
        txs: []
      }
    }
  } else if (param === 'https://api.blockcypher.com/v1/btc/test3') {
    return { data: { height: 100 } }
  }
})
axios.post = jest.fn(async (url, param) => {
  if (param.tx === mockRawTx) {
    return { data: { result: mockTxHash } }
  }
  return null
})

utils.encryptMessage = jest.fn((msg, password) => (password))
utils.decryptMessage = jest.fn((msg, password) => {
  return (password && password === msg) ? mockXpriv : null
})

describe('constructor', () => {
  it('should create instance without walletData', async () => {
    let walletBitcoin = new WalletBitcoin()
    expect(walletBitcoin).toBeDefined()
    expect(walletBitcoin.ledger).toBeUndefined()
    await expect(walletBitcoin.getWalletData).toThrowError(new Error('walletData does not exist'))
  })

  it('should throw given invalid wallet type', () => {
    const walletData = JSON.parse(JSON.stringify({ ...basicBitcoinWalletData, walletType: 'invalid' }))
    // eslint-disable-next-line no-new
    expect(() => { new WalletBitcoin(walletData) }).toThrowError(new Error('Invalid walletType: invalid'))
  })

  it('should create Ledger wallet instance', () => {
    const walletData = WalletUtils.toWalletData('ledger', 'bitcoin')
    let walletBitcoin = new WalletBitcoin(walletData)
    expect(walletBitcoin).toBeDefined()
    expect(walletBitcoin.ledger).toBeDefined()
  })
})

describe('generateWallet', () => {
  let walletBitcoin = new WalletBitcoin()

  it('should generate ledger wallet', async () => {
    await walletBitcoin.generateWallet({ walletType: 'ledger', cryptoType: 'bitcoin' })
    expect(walletBitcoin.getWalletData()).toEqual({ ...basicBitcoinWalletData, walletType: 'ledger' })
  })

  it('should generate drive wallet', async () => {
    await walletBitcoin.generateWallet({ walletType: 'drive', cryptoType: 'bitcoin' })
    expect(walletBitcoin.getWalletData()).toEqual({ ...basicBitcoinWalletData, walletType: 'drive' })
  })
})

describe('getAccount', () => {
  let walletBitcoin
  beforeEach(async () => {
    walletBitcoin = new WalletBitcoin()
    await walletBitcoin.generateWallet({ walletType: 'drive', cryptoType: 'bitcoin' })
  })
  it('should get account given account index', () => {
    const { address } = walletBitcoin.getAccount(0)
    expect(address).toEqual(mockAddress)
  })

  it('should get account without account index', () => {
    const { address } = walletBitcoin.getAccount()
    expect(address).toEqual(mockAddress)
  })
})

describe('encryptAccount', () => {
  let walletBitcoin
  beforeEach(async () => {
    walletBitcoin = new WalletBitcoin()
    await walletBitcoin.generateWallet({ walletType: 'drive', cryptoType: 'bitcoin' })
  })

  it('should be able to encrypt private key when privKey exist', async () => {
    await walletBitcoin.encryptAccount('password')
    const account = walletBitcoin.getAccount()
    expect(account.encryptedPrivateKey).toEqual('password')
  })

  it('should throw when xpriv does not exist', async () => {
    walletBitcoin.clearPrivateKey()
    await expect(walletBitcoin.encryptAccount('password')).rejects.toThrow(new Error('PrivateKey does not exist'))
  })
})

describe('decryptAccount', () => {
  let walletBitcoin
  beforeEach(async () => {
    walletBitcoin = new WalletBitcoin()
    await walletBitcoin.generateWallet({ walletType: 'drive', cryptoType: 'bitcoin' })
  })

  it('it should be able to decrypt account', async () => {
    await walletBitcoin.encryptAccount('password')

    walletBitcoin.clearPrivateKey()
    walletBitcoin.walletData.accounts[0].hdWalletVariables.xpub = null

    await walletBitcoin.decryptAccount('password')
    const account = walletBitcoin.getAccount(0)
    expect(account.privateKey).toEqual(mockPrivKey)
    expect(account.hdWalletVariables.xpub).toEqual(mockXpub)
  })

  it('should throw if password not match', async () => {
    await walletBitcoin.encryptAccount('password')

    walletBitcoin.clearPrivateKey()
    walletBitcoin.walletData.accounts[0].hdWalletVariables.xpub = null
    await expect(walletBitcoin.decryptAccount('wrongPassword')).rejects.toThrow(new Error('Incorrect password'))
  })

  it('should throw if EncryptedPrivateKey not exist', async () => {
    await expect(walletBitcoin.decryptAccount('wrongPassword')).rejects.toThrow(new Error('EncryptedPrivateKey does not exist'))
  })
})

describe('retrieveAddress', () => {
  let walletBitcoin
  beforeEach(async () => {
    walletBitcoin = new WalletBitcoin()
  })

  it('should be able to retrieve ledger address', async () => {
    await walletBitcoin.generateWallet({ walletType: 'ledger', cryptoType: 'bitcoin' })
    await walletBitcoin.retrieveAddress()
    const account = walletBitcoin.getAccount(0)
    expect(account.address).toEqual(mockAddress)
    expect(account.hdWalletVariables.xpub).toEqual(mockXpub)
  })

  it('should throw if trying to retrieve address other than from ledger', async () => {
    await walletBitcoin.generateWallet({ walletType: 'drive', cryptoType: 'bitcoin' })
    await expect(walletBitcoin.retrieveAddress()).rejects.toThrow(new Error('Cannot retrieve address for drive'))
  })
})

describe('sync', () => {
  let walletBitcoin

  beforeEach(async () => {
    walletBitcoin = new WalletBitcoin()
  })

  it('should sync drive wallet', async () => {
    await walletBitcoin.generateWallet({ walletType: 'drive', cryptoType: 'bitcoin' })
    await walletBitcoin.sync()
    const account = walletBitcoin.getAccount()
    const { hdWalletVariables } = account
    expect(hdWalletVariables.nextAddressIndex).toEqual(0)
    expect(hdWalletVariables.nextChangeIndex).toEqual(0)
    const mockUtxo = {
      'outputIndex': 0,
      'script': 'a914541b11a8cd5dadf89f96dee0bff57e46adb4743a87',
      'txHash': '83d1c884d99f279891fed9973319dfeaf9e310b1dc072d947d50d3ae4b791ba9',
      'value': mockBalance
    }
    expect(hdWalletVariables.addresses[0])
      .toEqual({ address: mockAddress, path: env.REACT_APP_BTC_PATH + `/0'/0/0`, utxos: [mockUtxo] })
  })

  it('should sync escrow wallet', async () => {
    await walletBitcoin.generateWallet({ walletType: 'escrow', cryptoType: 'bitcoin' })
    await walletBitcoin.sync()
    const account = walletBitcoin.getAccount()
    const { hdWalletVariables } = account
    expect(hdWalletVariables.nextAddressIndex).toEqual(0)
    expect(hdWalletVariables.nextChangeIndex).toEqual(0)
    const mockUtxo = {
      'outputIndex': 0,
      'script': 'a914541b11a8cd5dadf89f96dee0bff57e46adb4743a87',
      'txHash': '83d1c884d99f279891fed9973319dfeaf9e310b1dc072d947d50d3ae4b791ba9',
      'value': mockBalance
    }
    expect(hdWalletVariables.addresses[0])
      .toEqual({ address: mockAddress, path: env.REACT_APP_BTC_PATH + `/0'/0/0`, utxos: [mockUtxo] })
  })

  it('should sync ledger wallet', async () => {
    const walletData = WalletUtils.toWalletData('ledger', 'bitcoin')
    walletBitcoin = new WalletBitcoin(walletData)
    await walletBitcoin.retrieveAddress()

    await walletBitcoin.sync()
    const account = walletBitcoin.getAccount()
    const { hdWalletVariables } = account

    expect(hdWalletVariables.nextAddressIndex).toEqual(2)
    expect(hdWalletVariables.nextChangeIndex).toEqual(0)
    const mockUtxo = {
      'outputIndex': 0,
      'script': 'a914541b11a8cd5dadf89f96dee0bff57e46adb4743a87',
      'txHash': '83d1c884d99f279891fed9973319dfeaf9e310b1dc072d947d50d3ae4b791ba9',
      'value': 9859397
    }
    expect(hdWalletVariables.addresses[0])
      .toEqual({ address: mockAddress, path: env.REACT_APP_BTC_PATH + `/0'/0/0`, utxos: [mockUtxo] })
  })
})

describe('getTxFee', () => {
  let walletBitcoin
  utils.getBtcTxFeePerByte = async () => {
    return 15
  }

  it('should get tx fee for drive wallet', async () => {
    walletBitcoin = new WalletBitcoin()
    await walletBitcoin.generateWallet({ walletType: 'drive', cryptoType: 'bitcoin' })
    await walletBitcoin.sync()
    const txFee = await walletBitcoin.getTxFee({ value: 1000 })
    expect(txFee).toEqual(mockTxFee)
  })

  it('should get tx fee for escrow wallet', async () => {
    walletBitcoin = new WalletBitcoin()
    await walletBitcoin.generateWallet({ walletType: 'escrow', cryptoType: 'bitcoin' })
    await walletBitcoin.sync()
    const txFee = await walletBitcoin.getTxFee({ value: 1000 })
    expect(txFee).toEqual(mockTxFee)
  })

  it('should get tx fee for ledger wallet', async () => {
    const walletData = WalletUtils.toWalletData('ledger', 'bitcoin')
    walletBitcoin = new WalletBitcoin(walletData)
    await walletBitcoin.retrieveAddress()
    await walletBitcoin.sync()
    const txFee = await walletBitcoin.getTxFee({ value: 1000 })
    expect(txFee).toEqual(mockTxFee)
  })
})

describe('sendTransaction', () => {
  let walletBitcoin

  it('should be able to send drive transaction', async () => {
    walletBitcoin = new WalletBitcoin()
    await walletBitcoin.generateWallet({ walletType: 'drive', cryptoType: 'bitcoin' })
    await walletBitcoin.sync()
    const txHash = await walletBitcoin.sendTransaction({ to: mockAddress, value: 1000 })
    expect(txHash).toEqual(mockTxHash)
  })

  it('should be able to send ledger transaction', async () => {
    const walletData = WalletUtils.toWalletData('ledger', 'bitcoin')
    walletBitcoin = new WalletBitcoin(walletData)
    await walletBitcoin.retrieveAddress()
    await walletBitcoin.sync()
    const txHash = await walletBitcoin.sendTransaction({ to: mockAddress, value: 1000 })
    expect(txHash).toEqual(mockTxHash)
  })
})

describe('_estimateTransactionSize', () => {
  let walletBitcoin = new WalletBitcoin()
  const outputCount = 10
  it('should be able to handle inputsCount > 0xfd', () => {
    const estimate = walletBitcoin._estimateTransactionSize(0xfe, outputCount, true)
    expect(estimate).toEqual({ 'max': 22188, 'min': 22041 })
  })

  it('should be able to handle inputsCount > 0xffff', () => {
    const estimate = walletBitcoin._estimateTransactionSize(0x1ffff, outputCount, true)
    expect(estimate).toEqual({ max: 11272452, min: 11206896.5 })
  })

  it('should be able to handle not Segwit ', () => {
    const estimate = walletBitcoin._estimateTransactionSize(0xfe, outputCount, false)
    expect(estimate).toEqual({ max: 37934, min: 37406 })
  })
})
