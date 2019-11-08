// @flow
import type { IWallet } from '../types/wallet.flow.js'
import type { IAccount, AccountData } from '../types/account.flow.js'
import type { TxFee, TxHash } from '../types/transfer.flow'
import type { BasicTokenUnit, Address } from '../types/token.flow'

import EthereumAccount from '../accounts/EthereumAccount.js'
import Web3 from 'web3'
import WalletConnect from '@walletconnect/browser'
import WalletConnectQRCodeModal from '@walletconnect/qrcode-modal'

import ERC20 from '../ERC20'
import API from '../apis.js'
import url from '../url'
import utils from '../utils'
import WalletUtils from './utils.js'

const DEFAULT_ACCOUNT = 0

export default class MetamaskWalletConnect implements IWallet<AccountData> {
  WALLET_TYPE = 'metamaskWalletConnect'
  account: IAccount

  constructor (accountData?: AccountData) {
    // Create a walletConnector
    if (!window.walletConnector) {
      window.walletConnector = new WalletConnect({
        bridge: 'https://bridge.walletconnect.org' // Required
      })
    }
    this._subscribeToWalletConnectEvents()

    if (accountData && accountData.cryptoType) {
      switch (accountData.cryptoType) {
        case 'dai':
        case 'ethereum':
          this.account = new EthereumAccount(accountData)
          break
        default:
          throw new Error('Invalid crypto type')
      }
    }
  }

  getAccount = (): IAccount => {
    if (!this.account) {
      throw new Error('Account is undefined')
    }
    return this.account
  }

  _getMetamaskWalletConnectAddresses = async (additionalInfo: ?Object) => {
    if (window.walletConnector.connected) {
      return window.walletConnector.accounts
    } else {
      const _newConnector = await this._CreateWalletConnectSession()
      return _newConnector.accounts
    }
  }

  _newEthereumAccount = async (
    name: string,
    cryptoType: string,
    options?: Object
  ): Promise<EthereumAccount> => {
    const addresses = await this._getMetamaskWalletConnectAddresses()
    const accountData = {
      cryptoType: cryptoType,
      walletType: this.WALLET_TYPE,

      address: addresses[0],
      name: name, // the name of this account set by the user.

      // token balance for erc20 tokens/
      balance: '0',
      balanceInStandardUnit: '0',

      // eth balance only
      ethBalance: '0',

      connected: true,
      verified: true,
      receivable: true,
      sendable: true,

      lastSynced: 0
    }

    this.account = new EthereumAccount(accountData)
    return this.account
  }

  async newAccount (name: string, cryptoType: string, options?: Object): Promise<IAccount> {
    if (['dai', 'ethereum'].includes(cryptoType)) {
      return this._newEthereumAccount(name, cryptoType, options)
    } else {
      throw new Error('Invalid crypto type')
    }
  }

  checkWalletConnection = async (additionalInfo: ?Object): Promise<boolean> => {
    const account = this.getAccount()
    const accountData = account.getAccountData()
    if (!window.walletConnector) {
      return false
    }
    if (!window.walletConnector.connected) {
      await this._CreateWalletConnectSession()
    }

    // If connection is already established
    if (window.walletConnector.connected) {
      const { accounts } = window.walletConnector
      if (accounts[DEFAULT_ACCOUNT] !== accountData.address) {
        await this._resetWalletConnectSession()
      }
    }
    return true
  }

  _QRCodeModalPromise = (): Promise<Object> => {
    const uri = window.walletConnector.uri
    return new Promise((resolve, reject) => {
      WalletConnectQRCodeModal.open(uri, () => {
        console.info('QR Code Modal closed')
        reject(new Error('User closed WalletConnect modal'))
      })

      window.walletConnector.on('connect', (error, payload) => {
        if (error) {
          throw error
        }
        // Close QR Code Modal
        WalletConnectQRCodeModal.close()
        resolve(window.walletConnector)
      })
    })
  }

  verifyAccount = async (additionalInfo: ?Object): Promise<boolean> => {
    let accountData = this.getAccount().getAccountData()

    const metamaskAddresses = await this._getMetamaskWalletConnectAddresses(additionalInfo)
    if (metamaskAddresses[DEFAULT_ACCOUNT].toLowerCase() === accountData.address.toLowerCase()) {
      this.account.accountData.connected = true
      this.account.accountData.verified = true
      return this.account.accountData.connected
    } else {
      this.account.accountData.connected = false
      throw new Error('Account verfication with Metamask failed')
    }
  }

  sendTransaction = async ({
    to,
    value,
    txFee,
    options
  }: {
    to: Address,
    value: BasicTokenUnit,
    txFee?: TxFee,
    options?: Object
  }): Promise<TxHash | Array<TxHash>> => {
    const account = this.getAccount()
    const accountData = account.getAccountData()

    if (!accountData.connected) {
      throw new Error('Must connect and verify account first')
    }

    let txObjs: any = []
    if (!txFee) txFee = await account.getTxFee({ to, value, options: options })

    const { cryptoType } = accountData
    txObjs = await WalletUtils.buildEthereumTxObjs({
      cryptoType: cryptoType,
      value: value,
      from: accountData.address,
      to: to,
      txFee: txFee,
      options: options
    })

    let txHashList = []
    const _web3 = new Web3(new Web3.providers.HttpProvider(url.INFURA_API_URL))
    for (let txObj of txObjs) {
      const _txObj = {
        from: txObj.from,
        to: txObj.to,
        data: txObj.data,
        gasPrice: _web3.utils.numberToHex(txObj.gasPrice),
        gasLimit: _web3.utils.numberToHex(txObj.gas),
        value: _web3.utils.numberToHex(txObj.value),
        nonce: txObj.nonce ? _web3.utils.numberToHex(txObj.nonce) : undefined
      }

      const txHash = await window.walletConnector.sendTransaction(_txObj)
      txHashList.push(txHash)
    }
    return txHashList.length === 1 ? txHashList[0] : txHashList
  }

  getTxFee = async ({
    value,
    options
  }: {
    value: BasicTokenUnit,
    options?: Object
  }): Promise<TxFee> => {
    const accountData = this.getAccount().getAccountData()
    return WalletUtils.getTxFee({
      value,
      cryptoType: accountData.cryptoType,
      directTransfer: !!options && options.directTransfer
    })
  }

  _CreateWalletConnectSession = async (): Promise<any> => {
    // create new session
    await window.walletConnector.createSession()
    // display QR Code modal
    const _newConnector = await this._QRCodeModalPromise()
    return _newConnector
  }

  _resetWalletConnectSession = async () => {
    if (window.walletConnector && window.walletConnector.connected) {
      await window.walletConnector.killSession()
    }
    window.walletConnector = new WalletConnect({
      bridge: 'https://bridge.walletconnect.org' // Required
    })
  }

  _subscribeToWalletConnectEvents = () => {
    window.walletConnector.on('session_update', (error, payload) => {
      if (error) {
        throw error
      }
      console.log('session_update', payload)
    })

    window.walletConnector.on('disconnect', (error, payload) => {
      if (error) {
        throw error
      }
      console.log('disconnect', payload)
      delete window.walletConnector
    })
  }
}
