// @flow
import type { IAccount, AccountData } from '../types/account.flow.js'
import { accountStatus } from '../types/account.flow.js'
import type { TxFee, TxHash } from '../types/transfer.flow'
import type { BasicTokenUnit, Address } from '../types/token.flow'

import BN from 'bn.js'
import bitcoin from 'bitcoinjs-lib'
import Web3 from 'web3'
import * as bip32 from 'bip32'
import * as bip39 from 'bip39'
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

  getTxFee = async ({
    to,
    value,
    options
  }: {
    to?: string,
    value: BasicTokenUnit,
    options?: Object
  }): Promise<TxFee> => {
    let { cryptoType } = this.accountData

    const mockFrom = '0x0f3fe948d25ddf2f7e8212145cef84ac6f20d904'
    const mockTo = '0x0f3fe948d25ddf2f7e8212145cef84ac6f20d905'

    if (cryptoType === 'ethereum') {
      return this._getGasCost({ from: mockFrom, to: mockTo, value: value })
    } else if (cryptoType === 'dai') {
      let txFeeERC20 = await this._getGasCost(
        ERC20.getTransferTxObj(mockFrom, mockTo, value, cryptoType)
      )

      // no need to prepay tx fee
      if (!options || !options.prepayTxFee) return txFeeERC20

      // special case for erc20 tokens
      // amount of eth to be transfered to the escrow wallet
      // this will be spent as tx fees for the next token transfer (from escrow wallet)
      // otherwise, the tokens in the escrow wallet cannot be transfered out
      // we use the current estimation to calculate amount of ETH to be transfered

      // eth to be transfered for paying erc20 token tx while receiving
      let ethTransfer = txFeeERC20.costInBasicUnit
      let txFeeEth = await this._getGasCost({ from: mockFrom, to: mockTo, value: value })

      // estimate total cost = eth to be transfered + eth transfer fee + erc20 transfer fee
      let totalCostInBasicUnit = new BN(txFeeEth.costInBasicUnit)
        .add(new BN(txFeeERC20.costInBasicUnit))
        .add(new BN(ethTransfer))

      let rv: TxFee = {
        // use the current estimated price
        price: txFeeERC20.price,
        // eth transfer gas + erc20 transfer gas
        gas: new BN(txFeeEth.gas).add(new BN(txFeeERC20.gas)).toString(),
        costInBasicUnit: totalCostInBasicUnit.toString(),
        costInStandardUnit: utils.toHumanReadableUnit(totalCostInBasicUnit).toString(),
        // subtotal tx cost
        // this is used for submitTx()
        costByType: { txFeeEth, txFeeERC20, ethTransfer }
      }
      return rv
    } else {
      throw new Error(`Invalid cryptoType: ${cryptoType}`)
    }
  }

  _getGasCost = async (txObj: any): Promise<TxFee> => {
    const _web3 = new Web3(new Web3.providers.HttpProvider(url.INFURA_API_URL))
    let price = await _web3.eth.getGasPrice()
    let gas = (await _web3.eth.estimateGas(txObj)).toString()
    let costInBasicUnit = new BN(price).mul(new BN(gas)).toString()
    let costInStandardUnit = utils.toHumanReadableUnit(costInBasicUnit, 18, 8).toString()

    return { price, gas, costInBasicUnit, costInStandardUnit }
  }
}
