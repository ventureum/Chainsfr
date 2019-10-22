// @flow
import type { IWallet } from '../types/wallet.flow.js'
import type { IAccount, AccountData } from '../types/account.flow.js'
import type { TxFee, TxHash } from '../types/transfer.flow'
import type { BasicTokenUnit, Address } from '../types/token.flow'

import EthereumAccount from '../accounts/EthereumAccount.js'
import BitcoinAccount from '../accounts/BitcoinAccount.js'
import bitcoin from 'bitcoinjs-lib'
import Web3 from 'web3'
import * as bip32 from 'bip32'
import * as bip39 from 'bip39'

import ERC20 from '../ERC20'
import API from '../apis.js'
import url from '../url'
import env from '../typedEnv'
import utils from '../utils'
import {
  broadcastBtcRawTx,
  networkIdMap,
  web3SendTransactions,
  buildEthereumTxObjs
} from './utils.js'

const BASE_BTC_PATH = env.REACT_APP_BTC_PATH
const DEFAULT_ACCOUNT = 0
const NETWORK =
  env.REACT_APP_BTC_NETWORK === 'mainnet' ? bitcoin.networks.bitcoin : bitcoin.networks.testnet

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

    let txObjs: any = []
    if (!txFee) txFee = await account.getTxFee({ to, value, options: options })

    const _web3 = new Web3(new Web3.providers.HttpProvider(url.INFURA_API_URL))

    const { cryptoType } = accountData
    txObjs = await buildEthereumTxObjs({
      cryptoType: cryptoType,
      value: value,
      from: accountData.address,
      to: to,
      txFee: txFee,
      options: options
    })
    // convert decimal to hex
    for (let txObj of txObjs) {
      txObj.nonce = _web3.utils.toHex(txObj.nonce)
      txObj.value = _web3.utils.toHex(txObj.value)
      txObj.gas = _web3.utils.toHex(txObj.gas)
      txObj.gasPrice = _web3.utils.toHex(txObj.gasPrice)
    }
    return web3SendTransactions(window._web3.eth.sendTransaction, txObjs)
  }
}
