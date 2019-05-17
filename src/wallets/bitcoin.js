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
  AddressBitcoin,
  TxFee,
  TxHash
} from '../types/wallet.flow'

export class WalletBitcoin implements IWallet<WalletDataBitcoin, AccountBitcoin> {
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

  // interface functions
  createAccount = (): AccountBitcoin => {
    const network =
      env.REACT_APP_BTC_NETWORK === 'mainnet' ? bitcoin.networks.bitcoin : bitcoin.networks.testnet
    const seed = bip39.mnemonicToSeed(bip39.generateMnemonic())
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
        lastUpdate: 0,
        xpub: xpub
      }
    }

    return account
  }

  getPrivateKey = (accountIdx?: number = 0): ?string => {
    if (this.walletData.walletType === 'drive') {
      return this.getAccount(accountIdx).privateKey
    }
    // no private keys avaiable
    return null
  }

  // get account (default first account)
  getAccount = (accountIdx?: number): AccountBitcoin => {
    if (!accountIdx) accountIdx = 0
    return this.walletData.accounts[accountIdx]
  }

  getTxFee = async ({ to, value }: { to: string, value: string }): Promise<TxFee> => {
    let account = this.getAccount()
    let txFeePerByte = await utils.getBtcTxFeePerByte()
    const satoshiValue = parseFloat(value) * 100000000 // 1 btc = 100,000,000 satoshi
    const { size, fee } = this.collectUtxos(
      account.hdWalletVariables.addresses,
      satoshiValue,
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
    to: string,
    value: string,
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
