// @flow
/* eslint-disable */
// must disable eslint since we are using addEventListener and self
// cannot import BitcoinAccount.js due to circular import, not permitted
// for worker-plugin, manually import all dependencies
import * as bitcoin from 'bitcoinjs-lib'
import BN from 'bn.js'
import * as bip32 from 'bip32'
import axios from 'axios'
import env from '../typedEnv'
import url from '../url'
import type { IAccount, AccountData, BitcoinAddress, Address } from '../types/account.flow.js'

const BASE_BTC_PATH = env.REACT_APP_BTC_PATH
const DEFAULT_ACCOUNT = 0
const NETWORK =
  env.REACT_APP_BTC_NETWORK === 'mainnet' ? bitcoin.networks.bitcoin : bitcoin.networks.testnet

const PLATFORM_TYPE = 'bitcoin'

const _getDerivedAddress = (xpub: string, change: number, addressIdx: number) => {
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

const _getUtxosFromTxs = (txs: Array<Object>, address: string) => {
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

const _discoverAddress = async (
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
      const address = _getDerivedAddress(xpub, change, currentIdx + i)
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
      let utxos = txList[j].length > 0 ? _getUtxosFromTxs(txList[j], addrBatch[j].address) : []

      // calculate balance
      let balance = utxos.reduce((accu, utxo) => {
        return new BN(utxo.value).add(accu)
      }, new BN(0))

      addresses.push({
        address: addrBatch[j].address,
        path: addrBatch[j].addressPath,
        utxos: utxos,
        balance: balance.toString()
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

// $FlowFixMe
addEventListener('message', async event => {
  const { action, payload } = event.data
  if (action === '_discoverAddress') {
    const params = payload
    const rv = await _discoverAddress(...params)
    self.postMessage(rv)
  } else {
    self.postMessage(new Error('Invalid action'))
  }
})
