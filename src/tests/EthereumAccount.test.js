import EthereumAccount from '../accounts/EthereumAccount'
import ERC20 from '../ERC20'
import Web3 from 'web3'

ERC20.getBalance = jest.fn().mockImplementation((address, cryptoType) => {
  return 1000000000000000000
})
let id = 0
const mockSendFunction = jest.fn(async (payload, callback) => {
  switch (payload.method) {
    case 'eth_getBalance':
      id++
      callback(null, { jsonrpc: '2.0', id: id, result: '1000000000000000000' })
      break
    default:
      console.log(method, parameters)
      return null
  }
})

jest.mock('web3-providers-http', () => {
  return function () {
    return {
      send: mockSendFunction,
      supportsSubscriptions: () => {
        return false
      }
    }
  }
})

const privateKey = '0x72becf8d1190a9e49b8963b6fce381d85d86b597beb29b07b78a905e6f124730'
const mockEthereumAccontData = {
  address: '0x9B689d8e1E903B77C7643DA02045d7925748C3F5',
  balance: '0',
  balanceInStandardUnit: '0',
  ethBalance: '0',
  connected: false,
  cryptoType: 'ethereum',
  displayName: 'Ethereum Cloud Wallet (Drive)',
  encryptedPrivateKey: undefined,
  id:
    '{"cryptoType":"ethereum","walletType":"drive","address":"0x9B689d8e1E903B77C7643DA02045d7925748C3F5"}',
  name: 'Ethereum Cloud Wallet',
  privateKey: privateKey,
  receivable: true,
  sendable: true,
  status: 'INITIALIZED',
  verified: true,
  walletType: 'drive'
}

const mockEthereumSyncedAccontData = {
  address: '0x9B689d8e1E903B77C7643DA02045d7925748C3F5',
  balance: '1000000000000000000',
  balanceInStandardUnit: '1',
  ethBalance: '1000000000000000000',
  connected: false,
  cryptoType: 'ethereum',
  displayName: 'Ethereum Cloud Wallet (Drive)',
  encryptedPrivateKey: undefined,
  id:
    '{"cryptoType":"ethereum","walletType":"drive","address":"0x9B689d8e1E903B77C7643DA02045d7925748C3F5"}',
  name: 'Ethereum Cloud Wallet',
  privateKey: privateKey,
  receivable: true,
  sendable: true,
  status: 'SYNCED',
  verified: true,
  walletType: 'drive'
}

let _account

describe('constructor', () => {
  afterEach(() => {
    _account = null
  })

  it('should throw error if cryptoType !== [ethereum, dai]', () => {
    expect(() => {
      _account = new EthereumAccount({ cryptoType: 'bitcoin' })
    }).toThrow()
  })

  it('should have displayName', () => {
     _account = new EthereumAccount(mockEthereumAccontData)
    expect(_account.accountData.displayName).toEqual(mockEthereumAccontData.displayName)
  })

  it('should set id', () => {
     _account = new EthereumAccount(mockEthereumAccontData)
    expect(_account.accountData.id).toEqual(mockEthereumAccontData.id)

    _account = new EthereumAccount({...mockEthereumAccontData,id:''})
    expect(_account.accountData.id).toEqual(mockEthereumAccontData.id)
  })
})

describe('clearPrivateKey', () => {
  it('should clear private keys', async () => {
     _account = new EthereumAccount(mockEthereumAccontData)
    await _account.clearPrivateKey()
    expect(_account.accountData.privateKey).toBeNull()
  })
})

describe('getAccountData', () => {
  it('should get accountData', () => {
     _account = new EthereumAccount(mockEthereumAccontData)
    const accountData = _account.getAccountData()
    expect(accountData).toEqual(_account.accountData)
  })
})

describe('encryptAccount', () => {
  it('should throw when no privateKey', async () => {
     _account = new EthereumAccount(mockEthereumAccontData)
    _account.accountData.privateKey = undefined
    await expect(_account.encryptAccount('123')).rejects.toThrow()
  })

  it('should encrypt xpriv and clear', async () => {
     _account = new EthereumAccount(mockEthereumAccontData)
    await _account.encryptAccount('123')
    expect(_account.accountData.encryptedPrivateKey).toBeDefined()
    expect(_account.accountData.privateKey).toBeNull()
  })
})

describe('decryptAccount', () => {
  beforeEach(async () => {
    _account = new EthereumAccount(mockEthereumAccontData)
    await _account.encryptAccount('123')
  })

  afterEach(() => {
    _account = null
  })

  it('should throw if encrypted privateKey not exist', async () => {
    _account.accountData.encryptedPrivateKey = null
    await expect(_account.decryptAccount('123')).rejects.toThrow()
  })

  it('should throw if incorrect password', async () => {
    await expect(_account.decryptAccount('abc')).rejects.toThrow()
  })

  it('should decrypt', async () => {
    await _account.decryptAccount('123')
    const accountData = _account.accountData
    expect(accountData.privateKey).toEqual(privateKey)
    expect(accountData.address).toEqual(mockEthereumAccontData.address)
  })
})

describe('syncWithNetwork', () => {
  afterEach(() => {
    _account = null
  })

  it('should sync eth balance', async () => {
    _account = new EthereumAccount(mockEthereumAccontData)
    await _account.syncWithNetwork()
    const accountData = _account.accountData
    expect(accountData.balance).toEqual(mockEthereumSyncedAccontData.balance)
    expect(accountData.ethBalance).toEqual(mockEthereumSyncedAccontData.ethBalance)
    expect(accountData.balanceInStandardUnit).toEqual(
      mockEthereumSyncedAccontData.balanceInStandardUnit
    )
    expect(accountData.status).toEqual('SYNCED')
  })

  it('should sync dai balance ', async () => {
    _account = new EthereumAccount({ ...mockEthereumAccontData, cryptoType: 'dai' })
    await _account.syncWithNetwork()
    const accountData = _account.accountData
    expect(accountData.balance).toEqual(mockEthereumSyncedAccontData.balance)
    expect(accountData.ethBalance).toEqual(mockEthereumSyncedAccontData.ethBalance)
    expect(accountData.balanceInStandardUnit).toEqual(
      mockEthereumSyncedAccontData.balanceInStandardUnit
    )
    expect(accountData.status).toEqual('SYNCED')
  })
})
