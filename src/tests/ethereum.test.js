
import WalletEthereum from '../wallets/ethereum'
import API from '../apis'
import env from '../typedEnv'
import url from '../url'
import type { WalletDataEthereum } from '../types/wallet.flow'
import utils from '../utils'
import Web3 from 'web3'
import WalletUtils from '../wallets/utils'

const mockPrivKey = '0xbaec836a3fdb1200e46f7391a05e7d7c12a9cd335375ff6860644a0fa06027d9'
const mockAddresss = '0x4a081641692c28D596020a7A9C11DC0740E495Be'
const mockTxHash = '0x1234567890'
const mockEthBalance = '10000000'
const mockGasPrice = '1000000000'
const mockGas = '53000'
const mockEthCallReturnValue = '0x0000000000000000000000000000000000000000000000000000000000000001'
const mockSimpleTxFee = {
  costInBasicUnit: '53000000000000',
  costInStandardUnit: '0.000053',
  'gas': mockGas,
  price: mockGasPrice
}
const mockComplexTxFee = {
  'costInBasicUnit': '159000000000000',
  'costInStandardUnit': '0.000159',
  'gas': '106000',
  price: mockGasPrice,
  costByType: {
    txFeeERC20: {
      'costInBasicUnit': '53000000000000',
      'costInStandardUnit': '0.000053',
      gas: mockGas,
      price: mockGasPrice
    },
    txFeeEth: {
      'costInBasicUnit': '53000000000000',
      'costInStandardUnit': '0.000053',
      gas: mockGas,
      price: mockGasPrice
    },
    'ethTransfer': '53000000000000'
  }
}
API.getPrefilledAccount = jest.fn(() => (mockPrivKey))

utils.encryptMessage = jest.fn(() => ('encryptMessage'))
utils.decryptMessage = jest.fn((msg, password) => {
  return password ? mockPrivKey : null
})

jest.mock('../ledgerSigner', () => {
  return function () {
    return {
      getEthAddress: () => (mockAddresss),
      signSendTransaction: () => ({ rawTransaction: 'rawTx' })
    }
  }
})

const mockSendFunction = jest.fn(async (method, parameters) => {
  switch (method) {
    case 'eth_getBalance':
      return mockEthBalance
    case 'eth_gasPrice':
      return mockGasPrice
    case 'eth_getTransactionCount':
      return 1
    case 'eth_chainId':
      return 4
    case 'eth_sendRawTransaction':
      return mockTxHash
    case 'eth_call':
      return mockEthCallReturnValue
    case 'eth_estimateGas':
      return mockGas
    default:
      console.log(method, parameters)
      return null
  }
})
jest.mock('web3-providers', () => {
  return {
    HttpProvider: function () {
      return {
        send: mockSendFunction,
        supportsSubscriptions: () => {
          return false
        }
      }
    },
    ProviderResolver: function () {
      return {
        resolve: function (provider, net) {
          return provider
        }
      }
    },
    ProviderDetector: {
      detect () {
        return null
      }
    }
  }
})

describe('constructor', () => {
  const mockWalletData: WalletDataEthereum = {
    walletType: 'drive',
    cryptoType: 'ethereum',
    accounts: [{
      balance: '0',
      ethBalance: '0',
      address: '0x0'
    }]
  }

  it('should succeed without walletData', async () => {
    let walletEthereum = new WalletEthereum()
    expect(walletEthereum).toBeDefined()
    expect(walletEthereum.ledger).toBeUndefined()
    await expect(walletEthereum.getWalletData).toThrowError(new Error('walletData does not exist'))
  })

  it('should succeed with given walletData', () => {
    let walletEthereum = new WalletEthereum(mockWalletData)
    expect(walletEthereum).toBeDefined()
    expect(walletEthereum.ledger).toBeUndefined()
    expect(walletEthereum.getWalletData()).toEqual(mockWalletData)
  })

  it('should succeed with given walletData but empty accounts array', () => {
    let walletEthereum = new WalletEthereum({ ...mockWalletData, accounts: [] })
    expect(walletEthereum).toBeDefined()
    expect(walletEthereum.ledger).toBeUndefined()
    expect(walletEthereum.getWalletData()).toEqual(mockWalletData)
  })

  it('should succeed with given walletData with Ledger wallet type', () => {
    let walletEthereum = new WalletEthereum({ ...mockWalletData, walletType: 'ledger' })
    expect(walletEthereum).toBeDefined()
    expect(walletEthereum.ledger).toBeDefined()
    expect(walletEthereum.getWalletData()).toEqual({ ...mockWalletData, walletType: 'ledger' })
  })
})

describe('generateWallet', () => {
  let walletEthereum

  beforeEach(() => {
    walletEthereum = new WalletEthereum()
  })

  it('should should generable with prefilled account ', async () => {
    API.getPrefilledAccount = jest.fn(() => (mockPrivKey))
    await walletEthereum.generateWallet({ walletType: 'drive', cryptoType: 'ethereum' })

    let walletData = walletEthereum.getWalletData()
    expect(walletData.walletType).toEqual('drive')
    expect(walletData.cryptoType).toEqual('ethereum')

    let account = walletData.accounts[0]
    expect(account.balance).toEqual('0')
    expect(account.ethBalance).toEqual('0')
    expect(account.address).toEqual(mockAddresss)
    expect(account.privateKey).toEqual(mockPrivKey)
  })

  it('should should generable without prefilled account', async () => {
    API.getPrefilledAccount = jest.fn(() => (null))
    await walletEthereum.generateWallet({ walletType: 'drive', cryptoType: 'dai' })

    let walletData = walletEthereum.getWalletData()
    expect(walletData.walletType).toEqual('drive')
    expect(walletData.cryptoType).toEqual('dai')

    let account = walletData.accounts[0]
    expect(account.balance).toEqual('0')
    expect(account.ethBalance).toEqual('0')
    expect(account.address).toBeDefined()
    expect(account.privateKey).toBeDefined()
  })

  it('should should generable without prefilled account url', async () => {
    const link = env.REACT_APP_PREFILLED_ACCOUNT_ENDPOINT
    env.REACT_APP_PREFILLED_ACCOUNT_ENDPOINT = null
    await walletEthereum.generateWallet({ walletType: 'drive', cryptoType: 'dai' })

    let walletData = walletEthereum.getWalletData()
    expect(walletData.walletType).toEqual('drive')
    expect(walletData.cryptoType).toEqual('dai')

    let account = walletData.accounts[0]
    expect(account.balance).toEqual('0')
    expect(account.ethBalance).toEqual('0')
    expect(account.address).toBeDefined()
    expect(account.privateKey).toBeDefined()
    env.REACT_APP_PREFILLED_ACCOUNT_ENDPOINT = link
  })
})

describe('generateWallet', () => {
  let walletEthereum
  beforeEach(async () => {
    walletEthereum = new WalletEthereum()
    API.getPrefilledAccount = jest.fn(() => (mockPrivKey))
    await walletEthereum.generateWallet({ walletType: 'drive', cryptoType: 'ethereum' })
  })
  it('should get account without account index', () => {
    const account = walletEthereum.getAccount()
    expect(account.balance).toEqual('0')
    expect(account.ethBalance).toEqual('0')
    expect(account.address).toEqual(mockAddresss)
    expect(account.privateKey).toEqual(mockPrivKey)
  })

  it('should get account with given account index', () => {
    const account = walletEthereum.getAccount(0)
    expect(account.balance).toEqual('0')
    expect(account.ethBalance).toEqual('0')
    expect(account.address).toEqual(mockAddresss)
    expect(account.privateKey).toEqual(mockPrivKey)
  })
})

describe('encryptAccount', () => {
  let walletEthereum
  API.getPrefilledAccount = jest.fn(() => (mockPrivKey))
  beforeEach(async () => {
    walletEthereum = new WalletEthereum()
  })

  it('it should throw error if walletData does not exist', async () => {
    await expect(walletEthereum.encryptAccount('password')).rejects.toThrow(new Error('walletData does not exist'))
  })

  it('it should throw error if PrivateKey does not exist', async () => {
    await walletEthereum.generateWallet({ walletType: 'drive', cryptoType: 'ethereum' })
    walletEthereum.clearPrivateKey()
    await expect(walletEthereum.encryptAccount('password')).rejects.toThrow(new Error('PrivateKey does not exist'))
  })

  it('it should encrypt account', async () => {
    await walletEthereum.generateWallet({ walletType: 'drive', cryptoType: 'ethereum' })
    await walletEthereum.encryptAccount('password')
    let account = walletEthereum.getAccount()
    expect(account.encryptedPrivateKey).toEqual('encryptMessage')
  })
})

describe('decryptAccount', () => {
  let walletEthereum
  beforeEach(async () => {
    walletEthereum = new WalletEthereum()
  })

  it('it should throw error if walletData does not exist', async () => {
    await expect(walletEthereum.decryptAccount('password')).rejects.toThrow(new Error('walletData does not exist'))
  })

  it('it should throw error if EncryptedPrivateKey does not exist', async () => {
    await walletEthereum.generateWallet({ walletType: 'drive', cryptoType: 'ethereum' })
    await expect(walletEthereum.decryptAccount('password')).rejects.toThrow(Error('EncryptedPrivateKey does not exist'))
  })

  it('it should throw error if decryption failed', async () => {
    await walletEthereum.generateWallet({ walletType: 'drive', cryptoType: 'ethereum' })
    await walletEthereum.encryptAccount('password')
    await expect(walletEthereum.decryptAccount()).rejects.toThrow(new Error('Incorrect password'))
  })

  it('it should decrypt account', async () => {
    API.getPrefilledAccount = jest.fn(() => (mockPrivKey))

    await walletEthereum.generateWallet({ walletType: 'drive', cryptoType: 'ethereum' })
    await walletEthereum.encryptAccount('password')
    await walletEthereum.decryptAccount('password')

    let account = walletEthereum.getAccount()
    expect(account.address).toEqual(mockAddresss)
  })
})

describe('retrieveAddress', () => {
  let walletEthereum
  beforeEach(async () => {
    walletEthereum = new WalletEthereum()
  })

  it('it should throw error if walletData does not exist', async () => {
    await expect(walletEthereum.retrieveAddress()).rejects.toThrow(new Error('walletData does not exist'))
  })

  it('should retrieve Ledger address', async () => {
    await walletEthereum.generateWallet({ walletType: 'ledger', cryptoType: 'ethereum' })
    await walletEthereum.retrieveAddress()
    const account = walletEthereum.getAccount()
    expect(account.address).toEqual(mockAddresss)

    walletEthereum = new WalletEthereum(WalletUtils.toWalletData('ledger', 'ethereum', []))
    await walletEthereum.retrieveAddress()
    const account2 = walletEthereum.getAccount()
    expect(account2.address).toEqual(mockAddresss)
  })

  it('should retrieve metamask address', async () => {
    window.ethereum = {
      isMetaMask: true,
      networkVersion: '4',
      enable: async () => ([mockAddresss])
    }
    await walletEthereum.generateWallet({ walletType: 'metamask', cryptoType: 'ethereum' })
    await walletEthereum.retrieveAddress()
    const account = walletEthereum.getAccount()
    expect(account.address).toEqual(mockAddresss)

    walletEthereum = new WalletEthereum(WalletUtils.toWalletData('metamask', 'ethereum', []))
    await walletEthereum.retrieveAddress()
    const account2 = walletEthereum.getAccount()
    expect(account2.address).toEqual(mockAddresss)
  })

  it('should throw if metamask is not found', async () => {
    window.ethereum = {}
    await walletEthereum.generateWallet({ walletType: 'metamask', cryptoType: 'ethereum' })
    await expect(walletEthereum.retrieveAddress()).rejects.toThrow(new Error('Metamask not found'))
  })

  it('should throw if Incorrect Metamask network', async () => {
    window.ethereum = {
      isMetaMask: true,
      enable: async () => ([mockAddresss])
    }
    await walletEthereum.generateWallet({ walletType: 'metamask', cryptoType: 'ethereum' })
    await expect(walletEthereum.retrieveAddress()).rejects.toThrow(new Error('Incorrect Metamask network'))
  })

  it('should throw if invalid wallet type', async () => {
    await walletEthereum.generateWallet({ walletType: 'invalid', cryptoType: 'ethereum' })
    await expect(walletEthereum.retrieveAddress()).rejects.toThrow(new Error('Cannot retrieve address for walletType invalid'))
  })
})

describe('sync', () => {
  let walletEthereum
  beforeEach(async () => {
    walletEthereum = new WalletEthereum()
  })

  it('it should throw error if walletData does not exist', async () => {
    await expect(walletEthereum.sync()).rejects.toThrow(new Error('walletData does not exist'))
  })

  it('should sync dai balance', async () => {
    let _web3 = new Web3(new Web3.providers.HttpProvider(url.INFURA_API_URL))
    await walletEthereum.generateWallet({ walletType: 'metamask', cryptoType: 'dai' })
    const expectedBalance = _web3.utils.toDecimal(mockEthCallReturnValue).toString()
    await walletEthereum.sync()
    expect(walletEthereum.getAccount(0).balance).toEqual(expectedBalance)
  })

  it('should sync eth balance', async () => {
    let _web3 = new Web3(new Web3.providers.HttpProvider(url.INFURA_API_URL))
    await walletEthereum.generateWallet({ walletType: 'metamask', cryptoType: 'ethereum' })
    const expectedBalance = await _web3.eth.getBalance(mockAddresss)
    await walletEthereum.sync()
    expect(walletEthereum.getAccount(0).balance).toEqual(expectedBalance)
  })
})

describe('getTxFee', () => {
  let walletEthereum
  beforeEach(async () => {
    walletEthereum = new WalletEthereum()
  })

  it('it should throw error if walletData does not exist', async () => {
    await expect(walletEthereum.getTxFee({})).rejects.toThrow(new Error('walletData does not exist'))
  })

  it('it should throw error if cryptoType invalid', async () => {
    await walletEthereum.generateWallet({ walletType: 'metamask', cryptoType: 'invalid' })
    await expect(walletEthereum.getTxFee({})).rejects.toThrow(new Error('Invalid cryptoType: invalid'))
  })

  it('it should return ether tx fee', async () => {
    const expectedTxFee = JSON.parse(JSON.stringify(mockSimpleTxFee))
    await walletEthereum.generateWallet({ walletType: 'metamask', cryptoType: 'ethereum' })
    expect(await walletEthereum.getTxFee({ value: '1000000' })).toEqual(expectedTxFee)
    expect(await walletEthereum.getTxFee({ value: '1000000', options: { prepayTxFee: false } })).toEqual(expectedTxFee)
    expect(await walletEthereum.getTxFee({ value: '1000000', options: {} })).toEqual(expectedTxFee)
  })

  it('it should return dai tx fee', async () => {
    const expectedTxFee = JSON.parse(JSON.stringify(mockComplexTxFee))
    await walletEthereum.generateWallet({ walletType: 'metamask', cryptoType: 'dai' })
    expect(await walletEthereum.getTxFee({ value: '1000000', options: { prepayTxFee: true } })).toEqual(expectedTxFee)
  })
})

describe('sendTransaction', () => {
  let walletEthereum
  let txFee = JSON.parse(JSON.stringify(mockComplexTxFee))
  window._web3 = {
    eth: {
      sendTransaction: jest.fn(() => ({
        on: (type, callback) => {
          if (type === 'transactionHash') {
            callback(mockTxHash)
          } else {
            callback(new Error('tx error'))
          }
        }
      }))
    }
  }

  let generateWalletData = (walletType, cryptoType) => WalletUtils.toWalletData(
    walletType,
    cryptoType,
    [{
      balance: '0',
      ethBalance: '0',
      address: mockAddresss,
      privateKey: mockPrivKey
    }]
  )

  it('it should be able to send dai tx from metamask ', async () => {
    const walletData = generateWalletData('metamask', 'dai')
    walletEthereum = new WalletEthereum(walletData)
    let txHash = await walletEthereum.sendTransaction({ to: mockAddresss, value: '1', txFee: txFee, options: { prepayTxFee: true } })
    expect(txHash).toEqual([mockTxHash, mockTxHash])
  })

  it('it should be able to send dai tx from drive ', async () => {
    const walletData = generateWalletData('drive', 'dai')
    walletEthereum = new WalletEthereum(walletData)
    const txHash = await walletEthereum.sendTransaction({ to: mockAddresss, value: '1', txFee: txFee, options: { prepayTxFee: true } })
    expect(txHash).toEqual([mockTxHash, mockTxHash])
  })

  it('it should be able to send dai tx from escrow', async () => {
    const walletData = generateWalletData('escrow', 'dai')
    walletEthereum = new WalletEthereum(walletData)
    // does not need to prepay when send from escrow
    const txHash = await walletEthereum.sendTransaction({ to: mockAddresss, value: '1', txFee: txFee })
    expect(txHash).toEqual(mockTxHash)

    // when txFee is not given
    const txHash2 = await walletEthereum.sendTransaction({ to: mockAddresss, value: '1' })
    expect(txHash2).toEqual(mockTxHash)
  })

  it('it should be able to send dai tx from ledger', async () => {
    const walletData = generateWalletData('ledger', 'dai')
    walletEthereum = new WalletEthereum(walletData)
    const txHash = await walletEthereum.sendTransaction({ to: mockAddresss, value: '1', txFee: txFee, options: { prepayTxFee: true } })
    expect(txHash).toEqual([mockTxHash, mockTxHash])

    // when txFee is not given
    const txHash2 = await walletEthereum.sendTransaction({ to: mockAddresss, value: '1', options: { prepayTxFee: true } })
    expect(txHash2).toEqual([mockTxHash, mockTxHash])
  })

  // ethereum
  it('it should be able to send ethereum from metamask', async () => {
    // from metamask
    const walletData = generateWalletData('metamask', 'ethereum')

    walletEthereum = new WalletEthereum(walletData)
    const txHash = await walletEthereum.sendTransaction({ to: mockAddresss, value: '1', txFee: txFee })
    expect(txHash).toEqual(mockTxHash)
  })

  it('it should be able to send ethereum from drive', async () => {
    // drive
    const walletData = generateWalletData('drive', 'ethereum')
    walletEthereum = new WalletEthereum(walletData)
    const txHash = await walletEthereum.sendTransaction({ to: mockAddresss, value: '1', txFee: txFee })
    expect(txHash).toEqual(mockTxHash)
  })
  it('it should be able to send ethereum from escrow', async () => {
    // escrow
    const walletData = generateWalletData('escrow', 'ethereum')
    walletEthereum = new WalletEthereum(walletData)
    const txHash = await walletEthereum.sendTransaction({ to: mockAddresss, value: '1', txFee: txFee })
    expect(txHash).toEqual(mockTxHash)
  })

  it('it should be able to send ethereum from ledger', async () => {
    // ledger
    const walletData = generateWalletData('ledger', 'ethereum')
    walletEthereum = new WalletEthereum(walletData)
    let txHash = await walletEthereum.sendTransaction({ to: mockAddresss, value: '1', txFee: txFee })
    expect(txHash).toEqual(mockTxHash)

    // when txFee is not given
    txHash = await walletEthereum.sendTransaction({ to: mockAddresss, value: '1' })
    expect(txHash).toEqual(mockTxHash)
  })

  it('should throw when invalid wallet given', async () => {
    const walletData = WalletUtils.toWalletData(
      'void',
      'ethereum',
      [{
        balance: '0',
        ethBalance: '0',
        address: mockAddresss,
        privateKey: mockPrivKey
      }]
    )
    walletEthereum = new WalletEthereum(walletData)
    await expect(walletEthereum.sendTransaction({ to: mockAddresss, value: '1', txFee: txFee }))
      .rejects.toThrow(new Error('Invalid walletType: void'))
  })

  it('should throw when invalid cryptoType given', async () => {
    walletEthereum = new WalletEthereum()
    await walletEthereum.generateWallet({ walletType: 'drive', cryptoType: 'void' })
    await expect(walletEthereum.sendTransaction({ to: mockAddresss, value: '1', txFee: txFee }))
      .rejects.toThrow(new Error('Invalid cryptoType: void'))
  })

  it('should throw when ERC20 tx fee is not given in a ERC20 tx', async () => {
    const _txFee = JSON.parse(JSON.stringify(mockSimpleTxFee))
    let walletData = WalletUtils.toWalletData(
      'metamask',
      'dai',
      [{
        balance: '0',
        ethBalance: '0',
        address: mockAddresss,
        privateKey: mockPrivKey
      }]
    )
    walletEthereum = new WalletEthereum(walletData)
    await expect(walletEthereum.sendTransaction({ to: mockAddresss, value: '1', txFee: _txFee, options: { prepayTxFee: true } }))
      .rejects.toThrow(new Error('txFeeERC20 not found in txFee'))
  })

  it('should throw error when send failed', async () => {
    mockSendFunction.mockImplementationOnce(async () => Promise.reject(new Error('send error')))
    let walletData = WalletUtils.toWalletData(
      'drive',
      'ethereum',
      [{
        balance: '0',
        ethBalance: '0',
        address: mockAddresss,
        privateKey: mockPrivKey
      }]
    )

    walletEthereum = new WalletEthereum(walletData)
    await expect(walletEthereum.sendTransaction({ to: mockAddresss, value: '10000', txFee: txFee }))
      .rejects.toThrow(new Error('send error'))
  })
})
