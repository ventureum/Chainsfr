// @flow
import type { IWallet } from '../types/wallet.flow.js'
import type { IAccount, AccountData } from '../types/account.flow.js'
import type { TxFee, TxHash, Signature } from '../types/transfer.flow'
import type { BasicTokenUnit, Address } from '../types/token.flow'

import EthereumAccount from '../accounts/EthereumAccount.js'
import Web3 from 'web3'
import WalletLink from 'walletlink'
import WalletUtils from './utils.js'
import env from '../typedEnv'
import WalletErrors from './walletErrors'

const coinbaseWalletLinkError = WalletErrors.coinbaseWalletLink
const DEFAULT_ACCOUNT = 0
const APP_LOGO = 'https://chainsfr-logo.s3.amazonaws.com/logo_wide.png'
const APP_NAME = 'Chainsfr'

export default class CoinbaseWalletLink implements IWallet<AccountData> {
  WALLET_TYPE = 'coinbaseWalletLink'
  account: IAccount
  network: number

  constructor (accountData?: AccountData) {
    // Create a walletConnector
    if (!window.walletLink) {
      window.walletLink = new WalletLink({
        appName: APP_NAME,
        appLogoUrl: APP_LOGO
      })
    }

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

  _getCoinbaseWalletLinkAddresses = async (additionalInfo: ?Object) => {
    if (window.walletLinkProvider) {
      return window.walletLinkProvider.enable()
    } else {
      const { accounts } = await this._createWalletLinkProvider()
      return accounts
    }
  }

  _newEthereumAccount = async (
    name: string,
    cryptoType: string,
    options?: Object
  ): Promise<EthereumAccount> => {
    const addresses = await this._getCoinbaseWalletLinkAddresses()
    const accountData = {
      cryptoType: cryptoType,
      walletType: this.WALLET_TYPE,

      address: addresses[DEFAULT_ACCOUNT],
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
    if (!window.walletLink) {
      return false
    }

    if (window.walletLinkProvider) {
      const accounts = window.walletLinkProvider.enable()
      const network = window.walletLinkProvider.networkVersion
      if (accounts[DEFAULT_ACCOUNT] !== accountData.address || network !== this.network) {
        await this._resetWalletLink()
      }
    }

    return true
  }

  verifyAccount = async (additionalInfo: ?Object): Promise<boolean> => {
    let accountData = this.getAccount().getAccountData()

    const addresses = await this._getCoinbaseWalletLinkAddresses()
    if (addresses[DEFAULT_ACCOUNT].toLowerCase() === accountData.address.toLowerCase()) {
      this.account.accountData.connected = true
      this.account.accountData.verified = true
      return this.account.accountData.connected
    } else {
      this.account.accountData.connected = false
      throw new Error(coinbaseWalletLinkError.incorrectAccount)
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
    txFee: TxFee,
    options?: Object
  }): Promise<{ txHash?: TxHash, clientSig?: Signature }> => {
    const account = this.getAccount()
    const accountData = account.getAccountData()

    if (!accountData.connected) {
      throw new Error('Must connect and verify account first')
    }

    if (!txFee) throw new Error('Missing txFee')
    if (!options) throw new Error(coinbaseWalletLinkError.noOptions)

    const { multisig } = options
    const txObj = multisig.getSendToEscrowTxObj(
      accountData.address,
      to,
      value,
      accountData.cryptoType
    )

    return {
      txHash: await WalletUtils.web3SendTransactions(
        window._walletLinkWeb3.eth.sendTransaction,
        txObj
      )
    }
  }

  _createWalletLinkProvider = async (): Promise<any> => {
    window.walletLinkProvider = window.walletLink.makeWeb3Provider(
      `https://mainnet.infura.io/v3/${env.REACT_APP_INFURA_API_KEY}`,
      env.REACT_APP_ETHEREUM_NETWORK !== 'mainnet' ? 4 : 1
    )
    window._walletLinkWeb3 = new Web3(window.walletLinkProvider)
    const accounts = await window.walletLinkProvider.enable()
    const network = window.walletLinkProvider.networkVersion
    this.network = network
    return {
      accounts,
      network
    }
  }

  _resetWalletLink = async () => {
    delete window.walletLink
    localStorage.removeItem('__WalletLink__:https://www.walletlink.org:Addresses')
    window.walletLink = new WalletLink({
      appName: APP_NAME,
      appLogoUrl: APP_LOGO
    })
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
}
