// @flow
import type { IAccount, AccountData } from '../types/account.flow.js'
import { accountStatus } from '../types/account.flow.js'

import Web3 from 'web3'
import utils from '../utils'
import url from '../url'
import ERC20 from '../ERC20'
import { getCryptoDecimals } from '../tokens'

export default class EthereumAccount implements IAccount<AccountData> {
  accountData: AccountData

  constructor (accountData: AccountData) {
    if (!['dai', 'ethereum'].includes(accountData.cryptoType)) {
      throw new Error('Invalid crypto type')
    }
    let _accountData = {
      cryptoType: accountData.cryptoType,
      walletType: accountData.walletType,
      // address in hardware wallet is the next receiving address
      address: accountData.address || '0x0',
      name: accountData.name, // the name of this account set by the user.

      // token balance for erc20 tokens/
      balance: accountData.balance || '0',
      balanceInStandardUnit: accountData.balanceInStandardUnit || '0',

      ethBalance: accountData.ethBalance || '0',

      connected: accountData.connected || false,
      verified: accountData.verified || false,
      receivable: accountData.receivable || false,
      sendable: accountData.sendable || false,
      status: accountStatus.initialized,

      privateKey: accountData.privateKey,
      encryptedPrivateKey: accountData.encryptedPrivateKey
    }
    this.accountData = _accountData
  }

  getAccountData = (): AccountData => {
    return this.accountData
  }

  encryptAccount = async (password: string): Promise<void> => {
    if (!this.accountData.privateKey) {
      throw new Error('Private key is undefined')
    }
    this.accountData.encryptedPrivateKey = await utils.encryptMessage(
      this.accountData.privateKey,
      password
    )
    // errase private key
    this.accountData.privateKey = null
  }

  decryptAccount = async (password: string) => {
    if (!this.accountData.encryptedPrivateKey) {
      throw new Error('EncryptedPrivateKey does not exist')
    }
    let privateKey = await utils.decryptMessage(this.accountData.encryptedPrivateKey, password)
    if (!privateKey) throw new Error('Incorrect password')
    this.accountData.privateKey = privateKey
    this.accountData.encryptedPrivateKey = undefined

    const _web3 = new Web3(new Web3.providers.HttpProvider(url.INFURA_API_URL))
    this.accountData.address = _web3.eth.accounts.privateKeyToAccount(privateKey).address
  }

  syncWithNetwork = async () => {
    let _web3 = new Web3(new Web3.providers.HttpProvider(url.INFURA_API_URL))

    let { cryptoType } = this.accountData

    // set eth balance
    this.accountData.ethBalance = await _web3.eth.getBalance(this.accountData.address)

    // set token balance
    if (['dai'].includes(cryptoType)) {
      this.accountData.balance = (await ERC20.getBalance(
        this.accountData.address,
        cryptoType
      )).toString()
    } else {
      // copy eth balance
      this.accountData.balance = this.accountData.ethBalance
    }
    this.accountData.balanceInStandardUnit = utils
      .toHumanReadableUnit(this.accountData.balance, getCryptoDecimals(cryptoType))
      .toString()

    this.accountData.status = accountStatus.synced
  }
}
