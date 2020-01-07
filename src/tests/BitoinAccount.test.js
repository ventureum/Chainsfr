import BitcoinAccount from '../accounts/BitcoinAccount'
import env from '../typedEnv'
import axios from 'axios'
import moment from 'moment'
import {
  xpriv,
  privateKey,
  balance,
  mockCloudBitcoinAccountData,
  mockCloudSyncedAccountData,
  mockLedgerBitcoinAccountData,
  mockLedgerSyncedAccountData,
  mockEscrowBitcoinAccountData,
  mockEscrowSyncedAccountData,
  tx,
  blockInfo,
  utxos
} from './mockBitcoinAccountData'

// mock functions
axios.get = jest.fn().mockImplementation(param => {
  if (param.includes('addresses')) {
    if (param.includes('2NA5CaRyYKAwnBGZpbwJu6DXvU9r7WzyfzM'))
      return {
        data: {
          txs: [tx]
        }
      }
    else return { data: { txs: [] } }
  } else {
    return {
      data: blockInfo
    }
  }
})

jest.mock('../typedEnv', () => ({
  REACT_APP_BTC_NETWORK: 'testnet',
  REACT_APP_BTC_PATH: "49'/1'"
}))

jest.mock('moment', () => {
  return function () {
    return {
      unix: () => {
        return 1576696999
      }
    }
  }
})

let _account
describe('BitcoinAccount', () => {
  describe('constructor', () => {
    afterEach(() => {
      _account = null
    })

    it('should throw error if cryptoType !== bitcoin', () => {
      expect(() => {
        _account = new BitcoinAccount({ cryptoType: 'ethereum' })
      }).toThrow()
    })

    it('should have displayName', () => {
      const _account = new BitcoinAccount(mockCloudBitcoinAccountData)
      expect(_account.accountData.displayName).toEqual(mockCloudBitcoinAccountData.displayName)
    })

    it('should have xpub if provided', () => {
      let data = mockCloudBitcoinAccountData
      data.xpub =
        'tpubDCCcm4U25Atjud4iF8vLTncNqx47k3oqjNSWav3UhdsoRpyRU7uue7omdQCE1KRtqwgRar8oarN9jJyfRwn4oPQt3h7XumStnt4mJi851US'
      const _account = new BitcoinAccount(mockCloudBitcoinAccountData)
      expect(_account.accountData.hdWalletVariables.xpub).toEqual(data.xpub)
    })

    it('should have id', () => {
      const _account = new BitcoinAccount(mockCloudBitcoinAccountData)
      expect(_account.accountData.id).toEqual(mockCloudBitcoinAccountData.id)
    })
  })

  describe('clearPrivateKey', () => {
    it('should clear private keys', async () => {
      const _account = new BitcoinAccount(mockCloudBitcoinAccountData)
      await _account.clearPrivateKey()
      expect(_account.accountData.privateKey).toBeNull()
      expect(_account.accountData.hdWalletVariables.xpriv).toBeNull()
    })
  })

  describe('getAccountData', () => {
    it('should get accountData', () => {
      const _account = new BitcoinAccount(mockCloudBitcoinAccountData)
      const accountData = _account.getAccountData()
      expect(accountData).toEqual(_account.accountData)
    })
  })

  describe('encryptAccount', () => {
    it('should throw when no privateKey', async () => {
      const _account = new BitcoinAccount(mockCloudBitcoinAccountData)
      _account.accountData.hdWalletVariables.xpriv = null
      await expect(_account.encryptAccount('123')).rejects.toThrow()
    })

    it('should encrypt xpriv and clear', async () => {
      const _account = new BitcoinAccount(mockCloudBitcoinAccountData)
      _account.accountData.hdWalletVariables.xpriv = '0x000123'
      await _account.encryptAccount('123')
      expect(_account.accountData.encryptedPrivateKey).toBeDefined()
      expect(_account.accountData.privateKey).toBeNull()
      expect(_account.accountData.hdWalletVariables.xpriv).toBeNull()
    })
  })

  describe('decryptAccount', () => {
    beforeEach(async () => {
      _account = new BitcoinAccount(mockCloudBitcoinAccountData)
      _account.accountData.hdWalletVariables.xpriv = xpriv
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
      expect(accountData.hdWalletVariables.xpub).toEqual(
        mockCloudBitcoinAccountData.hdWalletVariables.xpub
      )
      expect(accountData.address).toEqual(mockCloudBitcoinAccountData.address)
    })

    it('should not override address if address !== 0x0', async () => {
      _account.accountData.address = '0x123'
      await _account.decryptAccount('123')
      const accountData = _account.accountData
      expect(accountData.address === mockCloudBitcoinAccountData.address).toBeFalsy()
    })
  })

  describe('syncWithNetwork', () => {
    afterEach(() => {
      _account = null
    })

    it('should sync Drive wallet', async () => {
      _account = new BitcoinAccount(mockCloudBitcoinAccountData)

      await _account.syncWithNetwork()
      const accountData = _account.accountData
      // lastUpdate
      expect(accountData).toEqual(mockCloudSyncedAccountData)
    })
  })

  it('should sync ledger wallet', async () => {
    _account = new BitcoinAccount(mockLedgerBitcoinAccountData)
    await _account.syncWithNetwork()
    const accountData = _account.accountData
    expect(accountData).toEqual(mockLedgerSyncedAccountData)

    // sync second time
    await _account.syncWithNetwork()
    const accountData2 = _account.accountData
    expect(accountData2).toEqual(mockLedgerSyncedAccountData)
  })

  it('should sync escrow wallet', async () => {
    _account = new BitcoinAccount(mockEscrowBitcoinAccountData)
    await _account.syncWithNetwork()
    const accountData = _account.accountData
    expect(accountData).toEqual(mockEscrowSyncedAccountData)
  })
})
