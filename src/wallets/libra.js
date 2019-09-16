// @flow
import utils from '../utils'

import type { IWallet, WalletDataEthereum, AccountEthereum } from '../types/wallet.flow'
import type { TxFee, TxHash } from '../types/transfer.flow'
import type { BasicTokenUnit, Address } from '../types/token.flow'
 // eslint-disable-next-line
import { LibraWallet, LibraClient } from 'kulap-libra'
import API from '../apis'

// Proof-of-concept
// use Ethereum data struct for quick implementation
export default class WalletLibra implements IWallet<WalletDataEthereum, AccountEthereum> {
  ledger: any
  walletData: WalletDataEthereum

  constructor (walletData?: WalletDataEthereum) {
    if (walletData) {
      this.walletData = walletData
    }
  }

  getWalletData = (): WalletDataEthereum => this.walletData

  generateWallet = async ({
    walletType,
    cryptoType
  }: {
    walletType: string,
    cryptoType: string
  }) => {
    this.walletData = {
      walletType: walletType,
      cryptoType: cryptoType,
      accounts: []
    }
    // createAccount may use walletType and cryptoType
    // need to be done in two steps
    this.walletData.accounts.push(await this.createAccount())
  }

  createAccount = async (): Promise<AccountEthereum> => {
    const wallet = new LibraWallet()
    const _account = wallet.newAccount()
    const _config = wallet.getConfig()
    let account = {
      balance: '0',
      ethBalance: '0',
      address: _account.getAddress().toHex(),
      privateKey: _config.mnemonic.toString()
    }
    if (this.walletData.walletType !== 'escrow') {
      // mint 100 libracoins to new accounts
      await API.mintLibra({address: _account.getAddress().toHex(), amount: '100000000'})
    }

    return account
  }

  // get account (default first account)
  getAccount = (accountIdx?: number): AccountEthereum => {
    if (!accountIdx) accountIdx = 0
    return this.walletData.accounts[accountIdx]
  }

  encryptAccount = async (password: string) => {
    let accountIdx = 0
    if (!this.walletData.accounts[accountIdx].privateKey) {
      throw new Error('PrivateKey does not exist')
    }
    this.walletData.accounts[accountIdx].encryptedPrivateKey = await utils.encryptMessage(
      this.walletData.accounts[accountIdx].privateKey,
      password
    )
  }

  decryptAccount = async (password: string) => {
    let accountIdx = 0
    if (!this.walletData.accounts[accountIdx].encryptedPrivateKey) {
      throw new Error('EncryptedPrivateKey does not exist')
    }
    let privateKey = await utils.decryptMessage(
      this.walletData.accounts[accountIdx].encryptedPrivateKey,
      password
    )
    if (!privateKey) throw new Error('Incorrect password')
    const wallet = new LibraWallet({mnemonic: privateKey})
    const _account = wallet.newAccount()
    this.walletData.accounts[accountIdx].privateKey = privateKey
    this.walletData.accounts[accountIdx].address =  _account.getAddress().toHex()
  }

  clearPrivateKey = (): void => {
    let accountIdx = 0
    this.walletData.accounts[accountIdx].privateKey = undefined
  }

  retrieveAddress = async (): Promise<void> => {
    // suppress flow warning
    // Not implemented
  }

  sync = async (progress: any) => {
    // use the first account only
    let account = this.walletData.accounts[0]
    const client = new LibraClient({
      transferProtocol: 'https',
      host: 'ac-libra-testnet.kulap.io',
      port: '443',
      dataProtocol: 'grpc-web-text'
    })
    const accountState = await client.getAccountState(account.address)
    account.balance = accountState.balance.toString()
  }

  getTxFee = async ({
    to,
    value,
    options
  }: {
    to?: string,
    value: BasicTokenUnit,
    options?: Object
  }): Promise<TxFee> => {
    return {
      price: '0',
      gas: '0',
      costInBasicUnit: '0',
      costInStandardUnit: '0'
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
    const client = new LibraClient({
      transferProtocol: 'https',
      host: 'ac-libra-testnet.kulap.io',
      port: '443',
      dataProtocol: 'grpc-web-text'
    })
    const account = this.getAccount()
    const wallet = new LibraWallet({mnemonic: account.privateKey})
    const _account = wallet.newAccount()
    const response = await client.transferCoins(_account, to, value);

    // wait for transaction confirmation
    await response.awaitConfirmation(client);
    return account.address
  }
}
