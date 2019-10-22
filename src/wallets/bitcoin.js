// @flow
import BN from 'bn.js'
import LedgerNanoS from '../ledgerSigner'
import utils from '../utils'
import axios from 'axios'
import url from '../url'
import env from '../typedEnv'
import moment from 'moment'
import bitcoin from 'bitcoinjs-lib'
import * as bip32 from 'bip32'
import * as bip39 from 'bip39'
import type {
  IWallet
  // WalletDataBitcoin,
  // AccountBitcoin,
  // AddressBitcoin
} from '../types/wallet.flow'
import type { TxFee, TxHash } from '../types/transfer.flow'
import type { BasicTokenUnit, Address } from '../types/token.flow'
// import WalletUtils from './utils'
import { getCryptoDecimals } from '../tokens'

const BASE_BTC_PATH = env.REACT_APP_BTC_PATH
const DEFAULT_ACCOUNT = 0
const NETWORK =
  env.REACT_APP_BTC_NETWORK === 'mainnet' ? bitcoin.networks.bitcoin : bitcoin.networks.testnet
export default class WalletBitcoin implements IWallet<WalletDataBitcoin, AccountBitcoin> {
  ledger: any
  walletData: WalletDataBitcoin

  constructor (walletData?: WalletDataBitcoin) {
    if (walletData) {
      if (!['drive', 'ledger', 'escrow'].includes(walletData.walletType)) {
        throw new Error(`Invalid walletType: ${walletData.walletType}`)
      }
      this.walletData = walletData
      if (this.walletData.walletType === 'ledger') {
        this.ledger = new LedgerNanoS()
      }
    }
  }

  getWalletData = (): WalletDataBitcoin => {
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
    const seed = bip39.mnemonicToSeedSync(bip39.generateMnemonic())
    const root = bip32.fromSeed(seed, NETWORK)
    let xpriv = root.toBase58()
    this.walletData = {
      walletType: walletType,
      cryptoType: cryptoType,
      accounts: [await this.createAccount({ xpriv: xpriv, accountIdx: 0 })]
    }
    if (this.walletData.walletType === 'ledger') {
      this.ledger = new LedgerNanoS()
    }
  }

  createAccount = async ({
    xpriv,
    accountIdx
  }: {
    xpriv: string,
    accountIdx: number
  }): Promise<AccountBitcoin> => {
    const path = `m/${BASE_BTC_PATH}/${accountIdx}'`
    const root = bip32.fromBase58(xpriv, NETWORK)
    const child = root.derivePath(path)
    const accountXPub = child.neutered().toBase58()
    const firstAddressNode = child.derive(0).derive(0)
    const firstAddressNodePrivateKey = firstAddressNode.toWIF()
    const { address } = bitcoin.payments.p2sh({
      redeem: bitcoin.payments.p2wpkh({
        // change = 0, addressIdx = 0
        pubkey: firstAddressNode.publicKey,
        network: NETWORK
      }),
      network: NETWORK
    })

    let account = {
      balance: '0',
      balanceInStandardUnit: '0',
      address: address,
      privateKey: firstAddressNodePrivateKey,
      hdWalletVariables: {
        xpriv: xpriv,
        xpub: accountXPub,
        nextAddressIndex: 0,
        nextChangeIndex: 0,
        changeAddress: address,
        addresses: [
          {
            address: address,
            path: env.REACT_APP_BTC_PATH + `/${accountIdx}'/0/0`,
            utxos: []
          }
        ],
        lastBlockHeight: 0,
        lastUpdate: 0,
        endAddressIndex: 0,
        endChangeIndex: 0
      }
    }

    return account
  }

  // get account (default first account)
  getAccount = (accountIdx?: number): AccountBitcoin => {
    const walletData = this.getWalletData()
    if (accountIdx === undefined) {
      return walletData.accounts[DEFAULT_ACCOUNT]
    }
    return walletData.accounts[accountIdx]
  }

  encryptAccount = async (password: string) => {
    let account = this.getAccount(DEFAULT_ACCOUNT)
    if (!account.hdWalletVariables.xpriv) {
      throw new Error('PrivateKey does not exist')
    }
    // shouldn't we delete privKey here?
    account.encryptedPrivateKey = await utils.encryptMessage(
      account.hdWalletVariables.xpriv,
      password
    )
  }

  decryptAccount = async (password: string): Promise<void> => {
    let account = this.getAccount(DEFAULT_ACCOUNT)
    if (!account.encryptedPrivateKey) {
      throw new Error('EncryptedPrivateKey does not exist')
    }
    // xpriv
    let xpriv = await utils.decryptMessage(account.encryptedPrivateKey, password)
    if (!xpriv) throw new Error('Incorrect password')
    account.hdWalletVariables.xpriv = xpriv
    const path = `m/${BASE_BTC_PATH}/${DEFAULT_ACCOUNT}'`
    const firstAddressNode = bip32.fromBase58(xpriv, NETWORK).derivePath(path + '/0/0')
    const { address } = bitcoin.payments.p2sh({
      redeem: bitcoin.payments.p2wpkh({
        // change = 0, addressIdx = 0
        pubkey: firstAddressNode.publicKey,
        network: NETWORK
      }),
      network: NETWORK
    })
    account.privateKey = bip32
      .fromBase58(xpriv, NETWORK)
      .derivePath(path + '/0/0')
      .toWIF()
    account.hdWalletVariables.xpub = bip32
      .fromBase58(xpriv, NETWORK)
      .derivePath(path)
      .neutered()
      .toBase58()
    account.address = address
  }

  clearPrivateKey = (): void => {
    this.walletData.accounts[DEFAULT_ACCOUNT].privateKey = undefined
    this.walletData.accounts[DEFAULT_ACCOUNT].hdWalletVariables.xpriv = undefined
  }

  retrieveAddress = async (): Promise<void> => {
    let { walletType } = this.getWalletData()
    if (walletType === 'ledger') {
      // retrieve the first address from ledger
      let account = this.getAccount(DEFAULT_ACCOUNT)
      let { address, xpub } = await this.ledger.getBtcAddresss(DEFAULT_ACCOUNT)
      if (account.hdWalletVariables.xpub !== xpub) {
        // if xpub does not match, reset watllet data
        // $FlowFixMe
        let newWalletData
        // let newWalletData: WalletDataBitcoin = WalletUtils.toWalletData(walletType, 'bitcoin', [])
        this.walletData = newWalletData
        this.walletData.accounts[DEFAULT_ACCOUNT].address = address
        this.walletData.accounts[DEFAULT_ACCOUNT].hdWalletVariables.xpub = xpub
      } else {
        account.address = address
        account.hdWalletVariables.xpub = xpub
      }
    } else {
      throw new Error(`Cannot retrieve address for ${walletType}`)
    }
  }

  sync = async (progress?: Function) => {
    let account = this.getAccount()
    let { walletType } = this.getWalletData()
    let { hdWalletVariables } = account
    let { xpub } = hdWalletVariables
    let addressPool = []

    if (['drive', 'escrow'].includes(walletType)) {
      // only use the first derived address
      hdWalletVariables.nextAddressIndex = 0
      hdWalletVariables.nextChangeIndex = 0
      hdWalletVariables.addresses = [
        {
          // use default address if xpub is not provided
          address: xpub !== '0x0' ? this.getDerivedAddress(xpub, 0, 0) : account.address,
          path: env.REACT_APP_BTC_PATH + `/0'/0/0`, // default first account
          utxos: []
        }
      ]
    } else if (walletType === 'ledger') {
      // 1. account discovery
      const externalAddressData = await this._discoverAddress(
        xpub,
        0,
        0,
        hdWalletVariables.nextAddressIndex,
        progress
      )
      const internalAddressData = await this._discoverAddress(
        xpub,
        0,
        1,
        hdWalletVariables.nextChangeIndex,
        progress
      )

      // 2. update addresses
      const firstSync = hdWalletVariables.addresses.length === 0

      hdWalletVariables.nextAddressIndex = externalAddressData.nextIndex
      hdWalletVariables.endAddressIndex = externalAddressData.endIndex

      hdWalletVariables.nextChangeIndex = internalAddressData.nextIndex
      hdWalletVariables.endChangeIndex = internalAddressData.endIndex

      addressPool = [
        ...externalAddressData.addresses.slice(
          externalAddressData.endIndex - externalAddressData.nextIndex - (firstSync ? 20 : 0)
        ),
        ...internalAddressData.addresses.slice(
          internalAddressData.endIndex - internalAddressData.nextIndex - (firstSync ? 20 : 0)
        )
      ]

      // append discovered addresses to the old address pool
      hdWalletVariables.addresses.push(...addressPool)
    }

    // retrieve utxos and calcualte balance for each address
    let utxoData = await Promise.all(
      hdWalletVariables.addresses.map(async addressData => {
        let response = await axios.get(
          `${url.LEDGER_API_URL}/addresses/${addressData.address}/transactions?noToken=true&truncated=true`
        )
        const { txs } = response.data
        const { address } = addressData

        // retrieve utxos
        let utxos = this._getUtxosFromTxs(txs, address)

        // calculate balance
        let balance = utxos.reduce((accu, utxo) => {
          return new BN(utxo.value).add(accu)
        }, new BN(0))

        return { utxos, balance }
      })
    )
    // update utxos
    hdWalletVariables.addresses.forEach((addressData, i) => {
      addressData.utxos = utxoData[i].utxos
    })

    // sum up balance from all addresses
    let totalBalance = utxoData.reduce(
      (accu: any, { balance }) => accu.add(new BN(balance)),
      new BN(0)
    )

    // update balance
    account.balance = totalBalance.toString()
    account.balanceInStandardUnit = utils
      .toHumanReadableUnit(totalBalance.toString(), getCryptoDecimals('bitcoin'))
      .toString()

    // update timestamp and block height
    hdWalletVariables.lastUpdate = moment().unix()
    hdWalletVariables.lastBlockHeight = await this._getBtcLastBlockHeight()
  }

  getTxFee = async ({ to, value }: { to?: string, value: string }): Promise<TxFee> => {
    let account = this.getAccount()
    let txFeePerByte = await utils.getBtcTxFeePerByte()
    const { size, fee } = this.collectUtxos(
      account.hdWalletVariables.addresses,
      value,
      txFeePerByte
    )
    let price = txFeePerByte.toString()
    let gas = size.toString()
    let costInBasicUnit = fee
    let costInStandardUnit = utils.toHumanReadableUnit(costInBasicUnit, 8, 8).toString()
    return { price, gas, costInBasicUnit, costInStandardUnit }
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
    let account = this.getAccount()
    const addressPool = account.hdWalletVariables.addresses

    if (!txFee) txFee = await this.getTxFee({ to, value })

    const { fee, utxosCollected } = this.collectUtxos(addressPool, value, Number(txFee.price))

    let signer = null
    if (this.walletData.walletType === 'ledger') {
      // using ledger signer
      signer = this.ledger.createNewBtcPaymentTransaction
    } else if (['drive', 'escrow'].includes(this.walletData.walletType)) {
      // using xPriv signer
      signer = this.xPrivSigner
    }

    if (signer) {
      let signedTxRaw = await signer(
        utxosCollected,
        to,
        Number(value), // actual value to be sent
        Number(fee),
        account.hdWalletVariables.nextChangeIndex
      )
      return this.broadcastBtcRawTx(signedTxRaw)
    } else {
      throw new Error('Invalid Signer')
    }
  }

  // bitcoin specific functions
  _getBtcLastBlockHeight = async () => {
    const rv = (await axios.get(url.BLOCKCYPHER_API_URL)).data
    return rv.height
  }

  _getUtxosFromTxs = (txs: Array<Object>, address: string) => {
    let utxos = []
    let spent = {}
    txs.forEach(tx => {
      tx.inputs.forEach(input => {
        if (input.address === address) {
          if (!spent[input.output_hash]) {
            spent[input.output_hash] = {}
          }
          spent[input.output_hash][input.output_index] = true
        }
      })
    })
    txs.forEach(tx => {
      tx.outputs.forEach(output => {
        if (output.address === address) {
          if (!spent[tx.hash]) {
            spent[tx.hash] = {}
          }
          if (!spent[tx.hash][output.output_index]) {
            utxos.push({
              txHash: tx.hash,
              outputIndex: output.output_index,
              value: output.value,
              script: output.script_hex
            })
          }
        }
      })
    })
    return utxos
  }

  getDerivedAddress = (xpub: string, change: number, addressIdx: number) => {
    const root = bip32.fromBase58(xpub, NETWORK)
    const child = root.derive(change).derive(addressIdx)
    const { address } = bitcoin.payments.p2sh({
      redeem: bitcoin.payments.p2wpkh({
        pubkey: child.publicKey,
        network: NETWORK
      }),
      network: NETWORK
    })
    return address
  }

  xPrivSigner = (
    inputs: Array<Object>,
    to: string,
    // value to be sent
    satoshiValue: number,
    // total fee in satoshi
    fee: number,
    changeIndex: number
  ) => {
    // use the first account
    let account = this.getAccount()
    const keyPair = bitcoin.ECPair.fromWIF(account.privateKey, NETWORK)
    const p2wpkh = bitcoin.payments.p2wpkh({
      pubkey: keyPair.publicKey,
      network: NETWORK
    })

    const { address } = bitcoin.payments.p2sh({
      redeem: p2wpkh,
      network: NETWORK
    })

    const p2sh = bitcoin.payments.p2sh({ redeem: p2wpkh, network: NETWORK })
    const txb = new bitcoin.TransactionBuilder(NETWORK)

    // add all inputs
    inputs.map(input => txb.addInput(input.txHash, input.outputIndex))

    // the actual "spend"
    txb.addOutput(to, satoshiValue)

    // change
    const inputValueTotal = inputs.reduce((total, input) => total + input.value, 0)
    const change = inputValueTotal - satoshiValue - fee
    txb.addOutput(address, change)

    // sign with first address's privateKey
    for (let i = 0; i < inputs.length; i++) {
      txb.sign(i, keyPair, p2sh.redeem.output, null, inputs[i].value)
    }

    const tx = txb.build()

    // return raw tx in hex
    return tx.toHex()
  }

  broadcastBtcRawTx = async (txRaw: string) => {
    const rv = await axios.post(`${url.LEDGER_API_URL}/transactions/send`, {
      tx: txRaw
    })
    return rv.data.result
  }

  collectUtxos = (
    addressPool: Array<AddressBitcoin>,
    value: BasicTokenUnit = '0',
    txFeePerByte: number = 15
  ) => {
    let utxosCollected = []
    let valueCollected = new BN(0)
    let i = 0
    let size = 0
    let fee = new BN(0)
    while (i < addressPool.length) {
      let utxos = addressPool[i].utxos
      for (let j = 0; j < utxos.length; j++) {
        const utxo = utxos[j]
        utxosCollected.push({
          ...utxo,
          keyPath: addressPool[i].path
        })
        size = this._estimateTransactionSize(utxosCollected.length, 2, true).max
        fee = new BN(size).mul(new BN(txFeePerByte))
        valueCollected = valueCollected.add(new BN(utxo.value))
        if (valueCollected.gte(new BN(value).add(fee))) {
          return {
            fee: fee.toString(),
            size,
            utxosCollected
          }
        }
      }
      i += 1
    }
    console.warn('Transfer amount greater and fee than utxo values.')
    return {
      fee: fee.toString(),
      size,
      utxosCollected
    }
  }

  _discoverAddress = async (
    xpub: string,
    accountIndex: number,
    change: number,
    offset: number,
    progress: ?Function
  ): Promise<{ nextIndex: number, addresses: Array<Address>, endIndex: number }> => {
    let gap = 0
    let addresses: Array<AddressBitcoin> = []
    let currentIdx = offset
    let lastUsedIdx = offset - 1
    while (gap < 20) {
      const addressPath = `${BASE_BTC_PATH}/${accountIndex}'/${change}/${currentIdx}`
      const address = this.getDerivedAddress(xpub, change, currentIdx)

      const response = (await axios.get(
        `${url.LEDGER_API_URL}/addresses/${address}/transactions?noToken=true&truncated=true`
      )).data

      if (response.txs.length === 0) {
        gap++
      } else {
        lastUsedIdx = currentIdx
        gap = 0
      }
      addresses.push({ address: address, path: addressPath, utxos: [] })
      currentIdx++

      if (progress) progress(lastUsedIdx, change)
    }
    return {
      nextIndex: lastUsedIdx + 1,
      addresses,
      endIndex: currentIdx
    }
  }

  // Function to estimate Tx size
  // Referrenced from
  // https://github.com/LedgerHQ/ledger-wallet-webtool/blob/094d3741527e181a626d929d56ab4a515403e4a0/src/TransactionUtils.js#L10
  _estimateTransactionSize = (inputsCount: number, outputsCount: number, handleSegwit: boolean) => {
    var maxNoWitness, maxSize, maxWitness, minNoWitness, minSize, minWitness, varintLength
    if (inputsCount < 0xfd) {
      varintLength = 1
    } else if (inputsCount < 0xffff) {
      varintLength = 3
    } else {
      varintLength = 5
    }
    if (handleSegwit) {
      minNoWitness = varintLength + 4 + 2 + 59 * inputsCount + 1 + 31 * outputsCount + 4
      maxNoWitness = varintLength + 4 + 2 + 59 * inputsCount + 1 + 33 * outputsCount + 4
      minWitness =
        varintLength + 4 + 2 + 59 * inputsCount + 1 + 31 * outputsCount + 4 + 106 * inputsCount
      maxWitness =
        varintLength + 4 + 2 + 59 * inputsCount + 1 + 33 * outputsCount + 4 + 108 * inputsCount
      minSize = (minNoWitness * 3 + minWitness) / 4
      maxSize = (maxNoWitness * 3 + maxWitness) / 4
    } else {
      minSize = varintLength + 4 + 146 * inputsCount + 1 + 31 * outputsCount + 4
      maxSize = varintLength + 4 + 148 * inputsCount + 1 + 33 * outputsCount + 4
    }
    return {
      min: minSize,
      max: maxSize
    }
  }
}
