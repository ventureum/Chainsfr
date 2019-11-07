// @flow
import url from '../url'
import env from '../typedEnv'
import API from '../apis'
import Web3 from 'web3'
import BN from 'bn.js'
import ERC20 from '../ERC20'
import LedgerNanoS from '../ledgerSigner'
import { getCryptoDecimals } from '../tokens'
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
      if (walletData.accounts.length === 0) {
        walletData.accounts.push({
          balance: '0',
          ethBalance: '0',
          address: '',
          balanceInStandardUnit: '0'
        })
      }
      this.walletData = walletData
      if (this.walletData.walletType === 'ledger') {
        this.ledger = new LedgerNanoS()
      }
    }
  }

  getWalletData = (): WalletDataEthereum => {
    if (!this.walletData) {
      throw new Error('walletData does not exist')
    }
    return this.walletData
  }

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
    if (this.walletData.walletType === 'ledger') {
      this.ledger = new LedgerNanoS()
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
      privateKey: web3Account.privateKey,
      balanceInStandardUnit: '0'
    }

    return account
  }

  // get account (default first account)
  getAccount = (accountIdx?: number): AccountEthereum => {
    if (accountIdx === undefined) {
      accountIdx = 0
    }
    const walletData = this.getWalletData()
    return walletData.accounts[accountIdx]
  }

  encryptAccount = async (password: string) => {
    let accountIdx = 0
    const walletData = this.getWalletData()
    if (!walletData.accounts[accountIdx].privateKey) {
      throw new Error('PrivateKey does not exist')
    }
    this.walletData.accounts[accountIdx].encryptedPrivateKey = await utils.encryptMessage(
      walletData.accounts[accountIdx].privateKey,
      password
    )
    this.walletData = walletData
  }

  decryptAccount = async (password: string) => {
    let accountIdx = 0
    const walletData = this.getWalletData()
    if (!walletData.accounts[accountIdx].encryptedPrivateKey) {
      throw new Error('EncryptedPrivateKey does not exist')
    }
    let privateKey = await utils.decryptMessage(
      walletData.accounts[accountIdx].encryptedPrivateKey,
      password
    )
    if (!privateKey) throw new Error('Incorrect password')
    this.walletData.accounts[accountIdx].privateKey = privateKey

    const _web3 = new Web3(new Web3.providers.HttpProvider(url.INFURA_API_URL))
    this.walletData.accounts[accountIdx].address = _web3.eth.accounts.privateKeyToAccount(
      privateKey
    ).address
  }

  clearPrivateKey = (): void => {
    let accountIdx = 0
    this.walletData.accounts[accountIdx].privateKey = undefined
  }

  retrieveAddress = async () => {
    let accountIdx = 0
    const walletData = this.getWalletData()
    let { walletType } = walletData
    if (walletType === 'ledger') {
      // retrieve the first address from ledger
      this.walletData.accounts[accountIdx].address = await this.ledger.getEthAddress(accountIdx)
    } else if (walletType === 'metamask') {
      // retrieve the first address from metamask
      if (typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask) {
        if (
          window.ethereum.networkVersion !== networkIdMap[env.REACT_APP_ETHEREUM_NETWORK].toString()
        ) {
          throw new Error('Incorrect MetaMask network') // eslint-disable-line
        }
        let addresses = await window.ethereum.enable()
        this.walletData.accounts[accountIdx].address = addresses[0]
      } else {
        throw new Error('MetaMask not found')
      }
    } else if (walletType.endsWith('WalletLink')) {
      // retrieve the first address from metamask
      if (typeof window.walletLinkProvider !== 'undefined') {
        if (
          window.walletLinkProvider.networkVersion !==
          networkIdMap[env.REACT_APP_ETHEREUM_NETWORK].toString()
        ) {
          throw new Error('Incorrect WalletLink network') // eslint-disable-line
        }
        let addresses = await window.walletLinkProvider.enable()
        this.walletData.accounts[accountIdx].address = addresses[0]
      } else {
        throw new Error('WalletLink Web3 instance not found')
      }
    } else {
      throw new Error(`Cannot retrieve address for walletType ${walletType}`)
    }
  }

  sync = async (progress: any) => {
    let _web3 = new Web3(new Web3.providers.HttpProvider(url.INFURA_API_URL))

    const walletData = this.getWalletData()
    let { cryptoType } = walletData

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
    account.balanceInStandardUnit = utils
      .toHumanReadableUnit(account.balance, getCryptoDecimals(cryptoType))
      .toString()
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
    let walletData = this.getWalletData()
    let { cryptoType } = walletData

    const mockFrom = '0x0f3fe948d25ddf2f7e8212145cef84ac6f20d904'
    const mockTo = '0x0f3fe948d25ddf2f7e8212145cef84ac6f20d905'

    if (cryptoType === 'ethereum') {
      return this.getGasCost({ from: mockFrom, to: mockTo, value: value })
    } else if (cryptoType === 'dai') {
      let txFeeERC20 = await this.getGasCost(
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
      let txFeeEth = await this.getGasCost({ from: mockFrom, to: mockTo, value: value })

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
  }): Promise<TxHash> => {
    // helper function
    function web3SendTransactionPromise (web3Function: Function, txObj: Object) {
      return new Promise((resolve, reject) => {
        web3Function(txObj)
          .on('transactionHash', hash => resolve(hash))
          .on('error', error => reject(error))
      })
    }
    async function web3SendTransactions (web3Function: Function, txObj: Object) {
      return web3SendTransactionPromise(web3Function, txObj)
    }

    async function walletConnectSendTransactions (txObj: Object) {
      let web3 = new Web3(new Web3.providers.HttpProvider(url.INFURA_API_URL))
      const _txObj = {
        from: txObj.from,
        to: txObj.to,
        data: txObj.data ? txObj.data : '0x',
        gasPrice: web3.utils.numberToHex(txObj.gasPrice),
        gasLimit: web3.utils.numberToHex(txObj.gasLimit),
        value: web3.utils.numberToHex(txObj.value),
        nonce: txObj.nonce ? web3.utils.numberToHex(txObj.nonce) : undefined
      }
      return window.walletConnector.sendTransaction(_txObj)
    }

    const _web3 = new Web3(new Web3.providers.HttpProvider(url.INFURA_API_URL))
    const account = this.getAccount()
    const { walletType, cryptoType } = this.walletData
    let txObj: any

    if (!txFee) txFee = await this.getTxFee({ to, value, options: options })

    // init a new multisig instance

    // set walletId
    if (!options) throw new Error('Options must not be null for escrow wallet')

    // get tx obj
    if (walletType === 'escrow') {
      let { multisig } = options
      // send from escrow
      if (!account.privateKey) throw new Error('privateKey does not exist')
      return multisig.sendFromEscrow(account.privateKey, to)
    } else {
      if (options.directTransfer) {
        txObj = {
          from: account.address,
          to: to,
          value: value
        }
      } else {
        // send to escrow
        let { multisig } = options
        txObj = multisig.getSendToEscrowTxObj(account.address, to, value, cryptoType)
      }

      // estimate gas
      const _txFee = await this.getGasCost(txObj)

      // $FlowFixMe
      txObj.gasLimit = _txFee.gas
      // $FlowFixMe
      txObj.gasPrice = _txFee.price

      if (walletType === 'metamask') {
        return web3SendTransactions(window._web3.eth.sendTransaction, txObj)
      } else if (walletType === 'drive') {
        // add privateKey to web3
        _web3.eth.accounts.wallet.add(account.privateKey)
        return web3SendTransactions(_web3.eth.sendTransaction, txObj)
      } else if (walletType === 'ledger') {
        const ledgerNanoS = new LedgerNanoS()
        return web3SendTransactions(
          _web3.eth.sendSignedTransaction,
          (await ledgerNanoS.signSendTransaction(txObj)).rawTransaction
        )
      } else if (walletType.endsWith('WalletLink')) {
        return web3SendTransactions(window._walletLinkWeb3.eth.sendTransaction, txObj)
      } else if (walletType.endsWith('WalletConnect')) {
        return walletConnectSendTransactions(txObj)
      } else {
        throw new Error(`Invalid walletType: ${walletType}`)
      }
    }
  }

  getGasCost = async (txObj: any): Promise<TxFee> => {
    const _web3 = new Web3(new Web3.providers.HttpProvider(url.INFURA_API_URL))
    let price = await _web3.eth.getGasPrice()
    let gas = (await _web3.eth.estimateGas(txObj)).toString()
    let costInBasicUnit = new BN(price).mul(new BN(gas)).toString()
    let costInStandardUnit = utils.toHumanReadableUnit(costInBasicUnit, 18, 8).toString()

    return { price, gas, costInBasicUnit, costInStandardUnit }
  }
}
