// @flow
import type { IAccount, AccountData, BitcoinAddress, Address } from '../types/account.flow.js'
import { accountStatus } from '../types/account.flow.js'
import type { BasicTokenUnit } from '../types/token.flow'

import * as bitcoin from 'bitcoinjs-lib'
import BN from 'bn.js'
import * as bip32 from 'bip32'
import axios from 'axios'
import moment from 'moment'

import utils from '../utils'
import url from '../url'
import env from '../typedEnv'
import { getCryptoDecimals } from '../tokens'
import { getWalletTitle } from '../wallet'

const BASE_BTC_PATH = env.REACT_APP_BTC_PATH
const DEFAULT_ACCOUNT = 0
const NETWORK =
  env.REACT_APP_BTC_NETWORK === 'mainnet' ? bitcoin.networks.bitcoin : bitcoin.networks.testnet

const PLATFORM_TYPE = 'bitcoin'

function sendMessage (
  message
): Promise<{
  nextIndex: number,
  endIndex: number,
  addresses: Array<BitcoinAddress>
}> {
  return new Promise(function (resolve, reject) {
    const worker = new Worker('./accountSync.worker.js', { type: 'module' })
    worker.postMessage(message)
    worker.onmessage = function (event) {
      // $FlowFixMe
      if (event.data.error) {
        reject(event.data.error)
      } else {
        // $FlowFixMe
        resolve(event.data)
      }
    }
  })
}

export default class BitcoinAccount implements IAccount<AccountData> {
  accountData: AccountData

  constructor (accountData: AccountData) {
    if (!['bitcoin'].includes(accountData.cryptoType)) {
      throw new Error('Invalid crypto type')
    }

    let _accountData = {
      id: accountData.id,
      cryptoType: accountData.cryptoType,
      walletType: accountData.walletType,
      platformType: PLATFORM_TYPE,

      // address in hardware wallet is the next receiving address
      address: accountData.address || '0x0',
      name: accountData.name, // the name of this account set by the user.
      email: accountData.email,
      displayName: `${accountData.name} (${getWalletTitle(accountData.walletType)})`,

      balance: accountData.balance || '0',
      balanceInStandardUnit: accountData.balanceInStandardUnit || '0',

      hdWalletVariables: accountData.hdWalletVariables || {
        xpub: accountData.xpub || null,
        nextAddressIndex: 0,
        nextChangeIndex: 0,
        addresses: [],
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

    // set address
    if (accountData.xpub) {
      _accountData.address = this._getDerivedAddress(accountData.xpub, 0, 0)
    }

    // set id
    _accountData.hdWalletVariables.xpub
      ? (_accountData.id = JSON.stringify({
          walletType: _accountData.walletType,
          platformType: _accountData.platformType,
          cryptoType: _accountData.cryptoType,
          xpub: _accountData.hdWalletVariables.xpub
        }))
      : (_accountData.id = JSON.stringify({
          walletType: _accountData.walletType,
          platformType: _accountData.platformType,
          cryptoType: _accountData.cryptoType,
          address: _accountData.address
        }))

    this.accountData = _accountData
  }

  clearPrivateKey = () => {
    this.accountData.privateKey = null
    this.accountData.hdWalletVariables.xpriv = null
  }

  getAccountData = (): AccountData => {
    return this.accountData
  }

  encryptAccount = async (password: string): Promise<void> => {
    if (!this.accountData.hdWalletVariables.xpriv) {
      throw new Error('PrivateKey does not exist')
    }

    this.accountData.encryptedPrivateKey = await utils.encryptMessage(
      this.accountData.hdWalletVariables.xpriv,
      password
    )
    this.clearPrivateKey()
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

    this.accountData.privateKey = firstAddressNode.toWIF()
    this.accountData.hdWalletVariables.xpub = bip32
      .fromBase58(xpriv, NETWORK)
      .derivePath(path)
      .neutered()
      .toBase58()
    if (this.accountData.address === '0x0') {
      const { address } = bitcoin.payments.p2sh({
        redeem: bitcoin.payments.p2wpkh({
          // change = 0, addressIdx = 0
          pubkey: firstAddressNode.publicKey,
          network: NETWORK
        }),
        network: NETWORK
      })
      this.accountData.address = address
    }
  }

  syncWithNetwork = async () => {
    let { walletType, hdWalletVariables } = this.accountData
    let { xpub } = hdWalletVariables

    if (walletType === 'drive') {
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
      this.accountData.address = this._getDerivedAddress(
        xpub,
        0,
        hdWalletVariables.nextAddressIndex
      )
    } else if (walletType === 'escrow') {
      hdWalletVariables.nextAddressIndex = 0
      hdWalletVariables.nextChangeIndex = 0
      hdWalletVariables.addresses = [
        {
          // the address of an escrow wallet account is not derived from its xpub
          // it is a P2SH(P2WSH(P2MS)) address with Chainsfr's public key.
          address: this.accountData.address,
          path: env.REACT_APP_BTC_PATH + `/0'/0/0`, // default first account
          utxos: []
        }
      ]
    } else if (walletType === 'coinbaseOAuthWallet') {
      hdWalletVariables.nextAddressIndex = 0
      hdWalletVariables.nextChangeIndex = 0
      hdWalletVariables.addresses = [
        {
          // coinbaseOAuthWallet accounts does not do discover
          address: this.accountData.address,
          path: env.REACT_APP_BTC_PATH + `/0'/0/0`, // default first account
          utxos: []
        }
      ]
    } else if (walletType === 'ledger') {
      // 1. account discovery
      // use service worker for this step
      const externalAddressData = await sendMessage({
        action: '_discoverAddress',
        payload: [xpub, 0, 0, 0]
      })
      const internalAddressData = await sendMessage({
        action: '_discoverAddress',
        payload: [xpub, 0, 1, 0]
      })

      // 2. update addresses
      hdWalletVariables.nextAddressIndex = externalAddressData.nextIndex
      hdWalletVariables.endAddressIndex = externalAddressData.endIndex

      hdWalletVariables.nextChangeIndex = internalAddressData.nextIndex
      hdWalletVariables.endChangeIndex = internalAddressData.endIndex

      hdWalletVariables.addresses = [
        ...externalAddressData.addresses,
        ...internalAddressData.addresses
      ]

      this.accountData.address = this._getDerivedAddress(
        xpub,
        0,
        hdWalletVariables.nextAddressIndex
      )
    }

    if (walletType !== 'ledger') {
      // since we do not do discoverAddress, utxos are not yet fetched
      hdWalletVariables.addresses = await Promise.all(
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

          return { ...addressData, utxos, balance }
        })
      )
    }

    // sum up balance from all addresses
    let totalBalance = hdWalletVariables.addresses.reduce(
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
    this.accountData.status = accountStatus.synced
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

    const BATCH_SIZE = 50
    while (gap < 20) {
      // batch get 50 addresses
      let addrBatch = []
      let txListPromise = []
      for (let i = 0; i < BATCH_SIZE; i++) {
        const addressPath = `${BASE_BTC_PATH}/${accountIndex}'/${change}/${currentIdx + i}`
        const address = this._getDerivedAddress(xpub, change, currentIdx + i)
        addrBatch.push({ address, addressPath })
        txListPromise.push(
          axios.get(
            `${url.LEDGER_API_URL}/addresses/${address}/transactions?noToken=true&truncated=true`
          )
        )
      }

      let txList = (await Promise.all(txListPromise)).map(item => item.data.txs)

      for (let j = 0; j < txList.length; j++) {
        if (txList[j].length === 0) {
          gap++
        } else {
          lastUsedIdx = currentIdx + j
          gap = 0
        }

        // retrieve utxos
        let utxos =
          txList[j].length > 0 ? this._getUtxosFromTxs(txList[j], addrBatch[j].address) : []

        // calculate balance
        let balance = utxos.reduce((accu, utxo) => {
          return new BN(utxo.value).add(accu)
        }, new BN(0))

        addresses.push({
          address: addrBatch[j].address,
          path: addrBatch[j].addressPath,
          utxos: utxos,
          balance: balance
        })

        if (gap >= 20) {
          break
        } else {
          currentIdx++
        }
      }
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
    console.warn('Transfer amount plus fee greater than/equal to utxo values.')
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
