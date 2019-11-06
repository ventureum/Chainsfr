// @flow
import type {
  IAccount,
  AccountData,
  HDWalletVariables,
  BitcoinAddress,
  Address
} from '../types/account.flow.js'
import { accountStatus } from '../types/account.flow.js'
import type { BasicTokenUnit } from '../types/token.flow'
import type { TxFee, TxHash } from '../types/transfer.flow'

import bitcoin from 'bitcoinjs-lib'
import BN from 'bn.js'
import Web3 from 'web3'
import * as bip32 from 'bip32'
import * as bip39 from 'bip39'
import axios from 'axios'
import moment from 'moment'

import utils from '../utils'
import url from '../url'
import env from '../typedEnv'
import { getCryptoDecimals } from '../tokens'

const BASE_BTC_PATH = env.REACT_APP_BTC_PATH
const DEFAULT_ACCOUNT = 0
const NETWORK =
  env.REACT_APP_BTC_NETWORK === 'mainnet' ? bitcoin.networks.bitcoin : bitcoin.networks.testnet

export default class BitcoinAccount implements IAccount<AccountData> {
  accountData: AccountData

  constructor (accountData: AccountData) {
    if (!['bitcoin'].includes(accountData.cryptoType)) {
      throw new Error('Invalid crypto type')
    }

    let _accountData = {
      cryptoType: accountData.cryptoType,
      walletType: accountData.walletType,
      // address in hardware wallet is the next receiving address
      address: accountData.Address || '0x0',
      name: accountData.name, // the name of this account set by the user.

      balance: accountData.balance || '0',
      balanceInStandardUnit: accountData.balanceInStandardUnit || '0',

      hdWalletVariables: accountData.hdWalletVariables || {
        xpub: accountData.xpub || '0x0',
        nextAddressIndex: 0,
        nextChangeIndex: 0,
        addresses: [],
        lastBlockHeight: 0,
        lastUpdate: 0,
        endAddressIndex: 0,
        endChangeIndex: 0
      },

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
    if (!this.accountData.hdWalletVariables.xpriv) {
      throw new Error('PrivateKey does not exist')
    }
    // shouldn't we delete privKey here?
    this.accountData.encryptedPrivateKey = await utils.encryptMessage(
      this.accountData.hdWalletVariables.xpriv,
      password
    )
    this.accountData.privateKey = null
  }

  decryptAccount = async (password: string) => {
    if (!this.accountData.encryptedPrivateKey) {
      throw new Error('EncryptedPrivateKey does not exist')
    }
    // xpriv
    let xpriv = await utils.decryptMessage(this.accountData.encryptedPrivateKey, password)
    if (!xpriv) throw new Error('Incorrect password')
    this.accountData.hdWalletVariables.xpriv = xpriv
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
    this.accountData.privateKey = bip32
      .fromBase58(xpriv, NETWORK)
      .derivePath(path + '/0/0')
      .toWIF()
    this.accountData.hdWalletVariables.xpub = bip32
      .fromBase58(xpriv, NETWORK)
      .derivePath(path)
      .neutered()
      .toBase58()
    this.accountData.address = address
  }

  syncWithNetwork = async () => {
    let { walletType, hdWalletVariables } = this.accountData
    let { xpub } = hdWalletVariables
    let addressPool = []

    if (['drive', 'escrow'].includes(walletType)) {
      // only use the first derived address
      hdWalletVariables.nextAddressIndex = 0
      hdWalletVariables.nextChangeIndex = 0
      hdWalletVariables.addresses = [
        {
          // use default address if xpub is not provided
          address: this._getDerivedAddress(xpub, 0, 0),
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
        hdWalletVariables.nextAddressIndex
      )
      const internalAddressData = await this._discoverAddress(
        xpub,
        0,
        1,
        hdWalletVariables.nextChangeIndex
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
    this.accountData.address = this._getDerivedAddress(xpub, 0, hdWalletVariables.nextAddressIndex)

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
    this.accountData.balance = totalBalance.toString()
    this.accountData.balanceInStandardUnit = utils
      .toHumanReadableUnit(totalBalance.toString(), getCryptoDecimals('bitcoin'))
      .toString()

    // update timestamp and block height
    hdWalletVariables.lastUpdate = moment().unix()
    hdWalletVariables.lastBlockHeight = await this._getBtcLastBlockHeight()
    this.accountData.status = accountStatus.synced
  }

  getTxFee = async ({ to, value }: { to?: string, value: string }): Promise<TxFee> => {
    let txFeePerByte = await utils.getBtcTxFeePerByte()
    const { size, fee } = this._collectUtxos(
      this.accountData.hdWalletVariables.addresses,
      value,
      txFeePerByte
    )
    let price = txFeePerByte.toString()
    let gas = size.toString()
    let costInBasicUnit = fee
    let costInStandardUnit = utils.toHumanReadableUnit(costInBasicUnit, 8, 8).toString()
    return { price, gas, costInBasicUnit, costInStandardUnit }
  }

  _getDerivedAddress = (xpub: string, change: number, addressIdx: number) => {
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

  _discoverAddress = async (
    xpub: string,
    accountIndex: number,
    change: number,
    offset: number
  ): Promise<{ nextIndex: number, addresses: Array<Address>, endIndex: number }> => {
    let gap = 0
    let addresses: Array<BitcoinAddress> = []
    let currentIdx = offset
    let lastUsedIdx = offset - 1
    while (gap < 20) {
      const addressPath = `${BASE_BTC_PATH}/${accountIndex}'/${change}/${currentIdx}`
      const address = this._getDerivedAddress(xpub, change, currentIdx)

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
    }
    return {
      nextIndex: lastUsedIdx + 1,
      addresses,
      endIndex: currentIdx
    }
  }

  _collectUtxos = (
    addressPool: Array<BitcoinAddress>,
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
