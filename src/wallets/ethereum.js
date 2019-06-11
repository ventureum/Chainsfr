// @flow
import url from '../url'
import env from '../typedEnv'
import API from '../apis'
import Web3 from 'web3'
import ERC20 from '../ERC20'
import LedgerNanoS from '../ledgerSigner'
import { networkIdMap } from '../ledgerSigner/utils'
import utils from '../utils'
import type { IWallet, WalletDataEthereum, AccountEthereum } from '../types/wallet.flow'
import type { TxFee, TxHash } from '../types/transfer.flow'
import type { BasicTokenUnit, Address } from '../types/token.flow'

export default class WalletEthereum implements IWallet<WalletDataEthereum, AccountEthereum> {
  ledger: any
  walletData: WalletDataEthereum

  constructor (walletData?: WalletDataEthereum) {
    if (walletData) {
      this.walletData = walletData
      if (this.walletData.walletType === 'ledger') {
        this.ledger = new LedgerNanoS()
      }
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
    // we use the first address as the sending/change address
    let _web3 = new Web3(new Web3.providers.HttpProvider(url.INFURA_API_URL))
    let web3Account
    if (env.REACT_APP_PREFILLED_ACCOUNT_ENDPOINT) {
      const privateKey = await API.getPrefilledAccount()
      web3Account = privateKey
        ? _web3.eth.accounts.privateKeyToAccount(privateKey)
        : _web3.eth.accounts.create()
    } else {
      web3Account = _web3.eth.accounts.create()
    }

    let account = {
      balance: '0',
      ethBalance: '0',
      address: web3Account.address,
      privateKey: web3Account.privateKey
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
    this.walletData.accounts[accountIdx].privateKey = privateKey

    const _web3 = new Web3(new Web3.providers.HttpProvider(url.INFURA_API_URL))
    this.walletData.accounts[accountIdx].address = _web3.eth.accounts.privateKeyToAccount(privateKey).address
  }

  clearPrivateKey = (): void => {
    let accountIdx = 0
    this.walletData.accounts[accountIdx].privateKey = undefined
  }

  retrieveAddress = async (): Promise<void> => {
    let accountIdx = 0
    let { walletType } = this.walletData
    if (this.walletData.accounts.length === 0) {
      this.walletData.accounts.push({
        balance: '0',
        ethBalance: '0',
        address: '0x0'
      })
    }
    if (walletType === 'ledger') {
      // retrieve the first address from ledger
      this.walletData.accounts[accountIdx].address = await this.ledger.getEthAddress(accountIdx)
    } else if (walletType === 'metamask') {
      // retrieve the first address from metamask
      if (typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask) {
        if (
          window.ethereum.networkVersion !== networkIdMap[env.REACT_APP_ETHEREUM_NETWORK].toString()
        ) {
          throw 'Incorrect Metamask network' // eslint-disable-line
        }
        let addresses = await window.ethereum.enable()
        this.walletData.accounts[accountIdx].address = addresses[0]
      } else {
        throw new Error('Metamask not found')
      }
    } else {
      throw new Error(`Cannot retrieve address for walletType ${walletType}`)
    }
  }

  sync = async (progress: any) => {
    let _web3 = new Web3(new Web3.providers.HttpProvider(url.INFURA_API_URL))

    let { cryptoType } = this.walletData

    // use the first account only
    let account = this.walletData.accounts[0]

    // set eth balance
    account.ethBalance = await _web3.eth.getBalance(account.address)

    // set token balance
    if (['dai'].includes(cryptoType)) {
      account.balance = (await ERC20.getBalance(account.address, cryptoType)).toString()
    } else {
      // copy eth balance
      account.balance = account.ethBalance
    }
  }

  getTxFee = async ({ to, value }: { to?: string, value: BasicTokenUnit }): Promise<TxFee> => {
    let { cryptoType } = this.walletData

    const mockFrom = '0x0f3fe948d25ddf2f7e8212145cef84ac6f20d904'
    const mockTo = '0x0f3fe948d25ddf2f7e8212145cef84ac6f20d905'

    if (cryptoType === 'ethereum') {
      return utils.getGasCost({ from: mockFrom, to: mockTo, value: value })
    } else if (cryptoType === 'dai') {
      return utils.getGasCost(ERC20.getTransferTxObj(mockFrom, mockTo, value, cryptoType))
    } else {
      throw new Error(`Invalid cryptoType: ${cryptoType}`)
    }
  }

  sendTransaction = async ({
    to,
    value,
    txFee
  }: {
    to: Address,
    value: BasicTokenUnit,
    txFee?: TxFee
  }): Promise<TxHash> => {
    // helper function
    function web3EthSendTransactionPromise (web3Function: Function, txObj: Object) {
      return new Promise((resolve, reject) => {
        web3Function(txObj)
          .on('transactionHash', hash => resolve(hash))
          .on('error', error => reject(error))
      })
    }

    const account = this.getAccount()
    const { walletType, cryptoType } = this.walletData
    let txObj: any = {}
    // setup tx obj
    if (cryptoType === 'ethereum') {
      txObj = { from: account.address, to: to, value: value }
    } else if (cryptoType === 'dai') {
      txObj = await ERC20.getTransferTxObj(account.address, to, value, cryptoType)
    }

    if (!txFee) {
      txFee = await this.getTxFee({ to, value })
    }

    // setup tx fees
    txObj.gas = txFee.gas
    txObj.gasPrice = txFee.price

    const _web3 = new Web3(new Web3.providers.HttpProvider(url.INFURA_API_URL))

    if (walletType === 'metamask') {
      return web3EthSendTransactionPromise(window._web3.eth.sendTransaction, txObj)
    } else if (['drive', 'escrow'].includes(walletType)) {
      // add privateKey to web3
      _web3.eth.accounts.wallet.add(account.privateKey)
      return web3EthSendTransactionPromise(_web3.eth.sendTransaction, txObj)
    } else if (walletType === 'ledger') {
      const ledgerNanoS = new LedgerNanoS()
      const signedTransactionObject = await ledgerNanoS.signSendTransaction(txObj)
      return web3EthSendTransactionPromise(
        _web3.eth.sendSignedTransaction,
        signedTransactionObject.rawTransaction
      )
    } else {
      throw new Error(`Invalid walletType: ${walletType}`)
    }
  }
}
