// @flow
import type { IWallet } from '../types/wallet.flow.js'
import type { IAccount, AccountData } from '../types/account.flow.js'
import type { TxFee, TxHash } from '../types/transfer.flow'
import type { BasicTokenUnit, Address } from '../types/token.flow'

import EthereumAccount from '../accounts/EthereumAccount.js'
import Web3 from 'web3'

import url from '../url'
import env from '../typedEnv'
import { networkIdMap, web3SendTransactions } from './utils.js'

const DEFAULT_ACCOUNT = 0

export default class MetamaskWallet implements IWallet<AccountData> {
  WALLET_TYPE = 'metamask'

  account: IAccount

  constructor (accountData?: AccountData) {
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

  _getMetamaskAddresses = async (additionalInfo: ?Object) => {
    if (typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask) {
      window._web3 = new Web3(window.ethereum)
      if (
        window.ethereum.networkVersion !== networkIdMap[env.REACT_APP_ETHEREUM_NETWORK].toString()
      ) {
        throw new Error('Incorrect Metamask network') // eslint-disable-line
      }
      return window.ethereum.enable()
    } else {
      throw new Error('Metamask not found')
    }
  }

  _newEthereumAccount = async (
    name: string,
    cryptoType: string,
    options?: Object
  ): Promise<EthereumAccount> => {
    const addresses = await this._getMetamaskAddresses()
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
    if (typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask) {
      return true
    }
    return false
  }

  verifyAccount = async (additionalInfo: ?Object): Promise<boolean> => {
    let accountData = this.getAccount().getAccountData()

    const metamaskAddresses = await this._getMetamaskAddresses(additionalInfo)
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

    if (!options) throw new Error('Options must not be null for metamask wallet')
    let txObj
    if (options.directTransfer) {
      // direct transfer to another address
      txObj = {
        from: account.address,
        to: to,
        value: value
      }
    } else {
      // transfer to escrow wallet
      let { multisig } = options
      txObj = multisig.getSendToEscrowTxObj(accountData.address, to, value, accountData.cryptoType)
    }

    // boardcast tx
    return web3SendTransactions(window._web3.eth.sendTransaction, txObj)
  }
}
