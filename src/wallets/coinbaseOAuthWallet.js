// @flow
import type { IWallet } from '../types/wallet.flow.js'
import type { IAccount, AccountData } from '../types/account.flow.js'
import type { TxFee, TxHash, Signature } from '../types/transfer.flow'
import type { BasicTokenUnit, Address } from '../types/token.flow'

import EthereumAccount from '../accounts/EthereumAccount.js'
import BitcoinAccount from '../accounts/BitcoinAccount.js'
import env from '../typedEnv'
import * as CoinbaseClient from './CoinbaseClient'

const DEFAULT_ACCOUNT = 0

export default class CoinbaseOAuthWallet implements IWallet<AccountData> {
  WALLET_TYPE = 'coinbaseOAuthWallet'
  account: IAccount
  network: number

  constructor (accountData?: AccountData) {
    if (accountData && accountData.cryptoType) {
      switch (accountData.cryptoType) {
        case 'dai':
        case 'ethereum':
          this.account = new EthereumAccount(accountData)
          break
        case 'bitcoin':
          this.account = new BitcoinAccount(accountData)
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

  _newEthereumAccount = async (
    name: string,
    cryptoType: string,
    options?: Object
  ): Promise<EthereumAccount> => {
    const { address, email } = await CoinbaseClient.getCyrptoAddress(cryptoType)
    const accountData = {
      cryptoType: cryptoType,
      walletType: this.WALLET_TYPE,

      address: address,
      name: name, // the name of this account set by the user.
      email: email,

      // token balance for erc20 tokens/
      balance: '0',
      balanceInStandardUnit: '0',

      // eth balance only
      ethBalance: '0',

      connected: false,
      verified: true,
      receivable: true,
      sendable: false,

      lastSynced: 0
    }

    this.account = new EthereumAccount(accountData)
    return this.account
  }

  _newBitcoinAccount = async (name: string): Promise<BitcoinAccount> => {
    const { address, email } = await CoinbaseClient.getCyrptoAddress('bitcoin')
    let accountData = {
      cryptoType: 'bitcoin',
      walletType: this.WALLET_TYPE,
      name: name,
      email: email,
      balance: '0',
      balanceInStandardUnit: '0',
      address: address,
      privateKey: undefined,
      hdWalletVariables: {
        xpriv: undefined,
        xpub: null,
        nextAddressIndex: 0,
        nextChangeIndex: 0,
        changeAddress: address,
        addresses: [
          {
            address: address,
            path: env.REACT_APP_BTC_PATH + `/${DEFAULT_ACCOUNT}'/0/0`,
            utxos: []
          }
        ],
        lastUpdate: 0,
        endAddressIndex: 0,
        endChangeIndex: 0
      },
      connected: false,
      verified: true,
      receivable: true,
      sendable: false,

      lastSynced: 0
    }

    this.account = new BitcoinAccount(accountData)
    return this.account
  }

  async newAccount (name: string, cryptoType: string, options?: Object): Promise<IAccount> {
    if (['dai', 'ethereum'].includes(cryptoType)) {
      return this._newEthereumAccount(name, cryptoType, options)
    } else if (cryptoType === 'bitcoin') {
      return this._newBitcoinAccount(name)
    } else {
      throw new Error('Invalid crypto type')
    }
  }

  checkWalletConnection = async (additionalInfo: ?Object): Promise<boolean> => {
    // wallet is not sendable
    // no need to check wallet connection
    //
    // during account adding process
    // newCryptoAccountFromWallet action is invoked and oauth procedure will start
    // afterward
    return true
  }

  verifyAccount = async (additionalInfo: ?Object): Promise<boolean> => {
    // This is used only in sending
    // Not sendabled, return false by default
    return false
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
    // not sendable, not used
    return {}
  }

  getTxFee = async ({
    value,
    options
  }: {
    value: BasicTokenUnit,
    options?: Object
  }): Promise<TxFee> => {
    // not sendable, not used
    return {}
  }

  setTokenAllowance = async (amount: BasicTokenUnit): Promise<TxHash> => {
    // not used
    return '0x0'
  }
}
