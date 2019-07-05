// @flow
import env from '../typedEnv'
import axios from 'axios'
import utils from '../utils'

import type { IWallet, WalletDataEthereum, AccountEthereum } from '../types/wallet.flow'
import type { TxFee, TxHash } from '../types/transfer.flow'
import type { BasicTokenUnit, Address } from '../types/token.flow'

const apiLibra = axios.create({
  baseURL: env.REACT_APP_LIBRA_API_ENDPOINT,
  headers: {
    'Content-Type': 'application/json'
  },
  validateStatus: function (status) {
    return status === 200 // default
  }
})

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
      accounts: [await this.createAccount()]
    }
  }

  createAccount = async (): Promise<AccountEthereum> => {
    let response = await apiLibra.post('/createWallet')
    let { data } = response
    let account = {
      balance: data.balance,
      ethBalance: '0',
      address: data.address,
      privateKey: JSON.stringify({ mnemonic: data.mnemonic, address: data.address })
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
    let { mnemonic, address } = JSON.parse(privateKey)
    this.walletData.accounts[accountIdx].privateKey = mnemonic
    this.walletData.accounts[accountIdx].address = address
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
    let response = await apiLibra.post(`/getBalance`, {
      address: account.address
    })
    account.balance = response.data.balance
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
    const account = this.getAccount()
    const response = await apiLibra.post('/transfer', {
      fromAddress: account.address,
      mnemonic: account.privateKey,
      toAddress: to,
      amount: value
    })
    return response.data.address
  }
}
