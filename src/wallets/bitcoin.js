// @flow
import BN from 'bn.js'
import LedgerNanoS from '../ledgerSigner'
import utils from '../utils'
import axios from 'axios'
import url from '../url'
import env from '../typedEnv'
import bitcoin from 'bitcoinjs-lib'
import bip32 from 'bip32'
import bip39 from 'bip39'
import type {
  IWallet,
  WalletDataBitcoin,
  AccountBitcoin,
  AddressBitcoin
} from '../types/wallet.flow'
import type { TxFee, TxHash } from '../types/transfer.flow'
import type { BasicTokenUnit, Address } from '../types/token.flow'

export default class WalletBitcoin implements IWallet<WalletDataBitcoin, AccountBitcoin> {
  ledger: any
  walletData: WalletDataBitcoin

  constructor (walletData?: WalletDataBitcoin) {
    if (walletData) {
      this.walletData = walletData
      if (this.walletData.walletType === 'ledger') {
        this.ledger = new LedgerNanoS()
      }
    }
  }

  getWalletData = (): WalletDataBitcoin => this.walletData
  // interface functions
  createAccount = async (): Promise<AccountBitcoin> => {
    const network =
      env.REACT_APP_BTC_NETWORK === 'mainnet' ? bitcoin.networks.bitcoin : bitcoin.networks.testnet
    const seed = await bip39.mnemonicToSeed(bip39.generateMnemonic())
    const root = bip32.fromSeed(seed)
    let xpriv = root.toBase58()
    let xpub = root.neutered().toBase58()

    const path = `m/49'/${env.REACT_APP_BTC_NETWORK === 'mainnet' ? '0' : '1'}'/0'/0/0`
    const child = root.derivePath(path)

    // we use the first address as the sending/change address
    const { address } = bitcoin.payments.p2sh({
      redeem: bitcoin.payments.p2wpkh({
        pubkey: child.publicKey,
        network: network
      }),
      network: network
    })

    let account = {
      balance: '0',
      address: address,
      privateKey: xpriv,
      encryptedPrivateKey: null,
      hdWalletVariables: {
        nextAddressIndex: 0,
        nextChangeIndex: 0,
        changeAddress: address,
        addresses: [
          {
            address: address,
            path: path,
            utxos: []
          }
        ],
        lastBlockHeight: 0,
        lastUpdate: 0
      }
    }

    return account
  }

  // get account (default first account)
  getAccount = (accountIdx?: number): AccountBitcoin => {
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
    this.walletData.accounts[accountIdx].privateKey = await utils.decryptMessage(
      this.walletData.accounts[accountIdx].encryptedPrivateKey,
      password
    )
  }

  sync = async () => {
    let { walletType } = this.walletData

    if (walletType === 'drive') {
      // only use the first derived address
    }
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
    let costInStandardUnit = utils.toHumanReadableUnit(costInBasicUnit, 8, 3).toString()
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
    const satoshiValue = parseFloat(value) * 100000000 // 1 btc = 100,000,000 satoshi
    const addressPool = account.hdWalletVariables.addresses

    if (!txFee) txFee = await this.getTxFee({ to, value })

    const { fee, utxosCollected } = this.collectUtxos(
      addressPool,
      satoshiValue,
      Number(txFee.price)
    )

    let signer = null
    if (this.walletData.walletType === 'ledger') {
      // using ledger signer
      signer = this.ledger.createNewBtcPaymentTransaction
    } else if (this.walletData.walletType === 'drive') {
      // using xPriv signer
      signer = this.xPrivSigner
    }

    if (signer) {
      let signedTxRaw = await signer(
        utxosCollected,
        to,
        satoshiValue,
        fee,
        account.hdWalletVariables.nextChangeIndex
      )
      return this.broadcastBtcRawTx(signedTxRaw)
    } else {
      throw new Error('Invalid Signer')
    }
  }

  // bitcoin specific functions

  getDerivedAddress = (accountIdx: number, change: number, addressIdx: number) => {
    let xpub = this.walletData.xpub

    const network =
      env.REACT_APP_BTC_NETWORK === 'mainnet' ? bitcoin.networks.bitcoin : bitcoin.networks.testnet

    const root = bip32.fromBase58(xpub, network)
    const path = `m/49'/${env.REACT_APP_BTC_NETWORK === 'mainnet' ? '0' : '1'}'/${accountIdx}'/${change}/${addressIdx}`
    const child = root.derivePath(path)
    const { address } = bitcoin.payments.p2sh({
      redeem: bitcoin.payments.p2wpkh({ pubkey: child.publicKey, network: network }),
      network: network
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
    // TODO: sign inputs with associated keysets from hdWalletVariables.addresses
    //
    // Currently, we only use the first address

    const network =
      env.REACT_APP_BTC_NETWORK === 'mainnet' ? bitcoin.networks.bitcoin : bitcoin.networks.testnet
    // use the first account
    let account = this.getAccount()

    // get the privateKey of the first address
    const root = bip32.fromBase58(account.privateKey, network)
    const path = `m/49'/${env.REACT_APP_BTC_NETWORK === 'mainnet' ? '0' : '1'}'/0'/0/0`
    const child = root.derivePath(path)

    // we use the first address as the sending/change address
    const { from } = bitcoin.payments.p2sh({
      redeem: bitcoin.payments.p2wpkh({
        pubkey: child.publicKey,
        network: network
      }),
      network: network
    })

    const keyPair = bitcoin.ECPair.fromPrivateKey(child.privateKey)
    const p2wpkh = bitcoin.payments.p2wpkh({
      pubkey: keyPair.publicKey,
      network: network
    })
    const p2sh = bitcoin.payments.p2sh({ redeem: p2wpkh, network: network })
    const txb = new bitcoin.TransactionBuilder(network)

    // add all inputs
    inputs.map(input => txb.addInput(input.txHash, input.outputIndex))

    // the actual "spend"
    txb.addOutput(to)

    // change
    const inputValueTotal = inputs.reduce((total, input) => total + input.value)
    const change = inputValueTotal - satoshiValue - fee
    txb.addOutput(from, change)

    // sign with first address's privateKey
    txb.sign(0, keyPair, p2sh.redeem.output, null, inputValueTotal)

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
    addressPool: Array<AddressBitcoin> = [],
    satoshiValue: number = 0,
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
        size = this.estimateTransactionSize(utxosCollected.length, 2, true).max
        fee = new BN(size).mul(new BN(txFeePerByte))
        valueCollected = valueCollected.add(new BN(utxo.value))
        if (valueCollected.gte(new BN(satoshiValue).add(fee))) {
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

  discoverAddress = async (
    xpub: string,
    accountIndex: number,
    change: number,
    offset: number,
    progress: ?Function
  ): Object => {
    let gap = 0
    let addresses = []
    let balance = new BN(0)
    let nextAddress
    let i = offset
    let cuurentIndex = offset === 0 ? 0 : offset - 1
    while (gap < 5) {
      let address
      const addressPath = `${baseBtcPath}/${accountIndex}'/${change}/${i}`
      const bitcoinAddress = await findAddress(addressPath, true, xpub)

      const addressData = (await axios.get(
        `${url.LEDGER_API_URL}/addresses/${bitcoinAddress}/transactions?noToken=true&truncated=true`
      )).data
      if (addressData.txs.length === 0) {
        if (!nextAddress) nextAddress = bitcoinAddress
        gap += 1
      } else {
        cuurentIndex = i
        gap = 0
        let utxos = this.getUtxosFromTxs(addressData.txs, bitcoinAddress)
        let value = utxos.reduce((accu, utxo) => {
          return new BN(utxo.value).add(accu)
        }, new BN(0))
        balance = balance.add(value)
        address = {
          path: addressPath,
          publicKeyInfo: { bitcoinAddress },
          utxos: utxos
        }
        addresses.push(address)
      }
      if (progress) {
        progress(i, change)
      }
      i += 1
    }
    return {
      balance: balance.toString(),
      nextIndex: cuurentIndex + 1,
      addresses,
      nextAddress
    }
  }

  syncBtcAccountInfo = async (accountIndex: number, progress: ?Function): Object => {
    const btcLedger = await this.getBtcLedger()
    const xpub = await getAccountXPub(btcLedger, baseBtcPath, `${accountIndex}'`, true)

    const externalAddressData = await this.discoverAddress(xpub, accountIndex, 0, 0, progress)
    const internalAddressData = await this.discoverAddress(xpub, accountIndex, 1, 0, progress)

    let accountData = {
      balance: new BN(externalAddressData.balance)
        .add(new BN(internalAddressData.balance))
        .toString(),
      nextAddressIndex: externalAddressData.nextIndex,
      address: externalAddressData.nextAddress, // address for receiving
      nextChangeIndex: internalAddressData.nextIndex,
      changeAddress: internalAddressData.nextAddress,
      addresses: [...externalAddressData.addresses, ...internalAddressData.addresses],
      lastBlockHeight: await getBtcLastBlockHeight(),
      lastUpdate: moment().unix(),
      xpub
    }
    return accountData
  }

  updateBtcAccountInfo = async (
    accountIndex: number = 0,
    accountInfo: Object,
    xpub: string,
    progress: ?Function
  ) => {
    const targetAccountInfo = accountInfo[accountIndex]
    let { nextAddressIndex, nextChangeIndex, addresses } = targetAccountInfo

    // update previous addresses
    if (progress) {
      progress(0)
    }
    const addressesData = await Promise.all(
      addresses.map(address => {
        const bitcoinAddress = address.publicKeyInfo.bitcoinAddress
        return axios.get(
          `${
            url.LEDGER_API_URL
          }/addresses/${bitcoinAddress}/transactions?noToken=true&truncated=true`
        )
      })
    )

    const addressesUtxos = addressesData.map((rv, i) => {
      return this.getUtxosFromTxs(rv.data.txs, addresses[i].publicKeyInfo.bitcoinAddress)
    })

    let newBalance = new BN(0)
    let updatedAddresses = []
    addressesUtxos.forEach((utxos, i) => {
      let value = utxos.reduce((accu, utxo) => {
        return new BN(utxo.value).add(accu)
      }, new BN(0))
      newBalance = newBalance.add(value)
      const address = {
        path: addresses[i].path,
        publicKeyInfo: addresses[i].publicKeyInfo,
        utxos: utxos
      }
      updatedAddresses.push(address)
    })

    // discover new address
    const externalAddressData = await this.discoverAddress(
      xpub,
      accountIndex,
      0,
      nextAddressIndex,
      progress
    )
    const internalAddressData = await this.discoverAddress(
      xpub,
      accountIndex,
      1,
      nextChangeIndex,
      progress
    )

    let accountData = {
      balance: newBalance
        .add(new BN(externalAddressData.balance))
        .add(new BN(internalAddressData.balance))
        .toString(),
      nextAddressIndex: externalAddressData.nextIndex,
      address: externalAddressData.nextAddress, // address for receiving; match name with ethereum[accountIndex].address
      nextChangeIndex: internalAddressData.nextIndex,
      changeAddress: internalAddressData.nextAddress,
      addresses: [
        ...updatedAddresses,
        ...externalAddressData.addresses,
        ...internalAddressData.addresses
      ],
      lastBlockHeight: await getBtcLastBlockHeight(),
      lastUpdate: moment().unix(),
      xpub
    }
    return {
      bitcoin: {
        [accountIndex]: accountData
      }
    }
  }
  // Function to estimate Tx size
  // Referrenced from
  // https://github.com/LedgerHQ/ledger-wallet-webtool/blob/094d3741527e181a626d929d56ab4a515403e4a0/src/TransactionUtils.js#L10
  estimateTransactionSize = (inputsCount: number, outputsCount: number, handleSegwit: boolean) => {
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
