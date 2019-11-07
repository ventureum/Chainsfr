// @flow
import axios from 'axios'
import Web3 from 'web3'
import { bufferToInt } from 'ethereumjs-util'
import BN from 'bn.js'

import utils from '../utils'
import url from '../url'
import ERC20 from '../ERC20'

import type { TxHash } from '../types/transfer.flow'
import type { BasicTokenUnit, Address } from '../types/token.flow'
import type { TxFee } from '../types/transfer.flow'
import SimpleMultiSig from '../SimpleMultiSig'

async function broadcastBtcRawTx (signedTxRaw: string) {
  const rv = await axios.post(`${url.LEDGER_API_URL}/transactions/send`, {
    tx: signedTxRaw
  })
  return rv.data.result
}

async function _web3SendTransactionPromise (web3Function: Function, txObj: Object): Promise<any> {
  return new Promise((resolve, reject) => {
    web3Function(txObj)
      .on('transactionHash', hash => resolve(hash))
      .on('error', error => reject(error))
  })
}

async function web3SendTransactions (web3Function: Function, txObj: Object) {
  return _web3SendTransactionPromise(web3Function, txObj)
}

async function buildEthereumTxObjs ({
  cryptoType,
  from,
  to,
  value,
  txFee,
  options
}: {
  cryptoType: string,
  from: Address,
  to: Address,
  value: BasicTokenUnit,
  txFee: TxFee,
  options?: Object
}): Promise<Array<any>> {
  let txObjs = []
  const _web3 = new Web3(new Web3.providers.HttpProvider(url.INFURA_API_URL))

  if (cryptoType === 'ethereum') {
    txObjs.push({
      from: from,
      to: to,
      value: value,
      gas: txFee.gas,
      gasPrice: txFee.price
    })
  } else if (cryptoType === 'dai') {
    let ERC20TxObj = await ERC20.getTransferTxObj(from, to, value, cryptoType)
    ERC20TxObj.gas = txFee.gas
    ERC20TxObj.gasPrice = txFee.price

    if (options && options.prepayTxFee) {
      // need to prepay tx fee, tx fees are classified by tx type: ERC20 and ETH
      // set ERC20 type tx gas
      if (txFee.costByType && txFee.costByType.txFeeERC20) {
        ERC20TxObj.gas = txFee.costByType.txFeeERC20.gas
        ERC20TxObj.gasPrice = txFee.costByType.txFeeERC20.price
      } else {
        throw new Error('txFeeERC20 not found in txFee')
      }
      // send eth as prepaid tx fee
      var txFeeEthTxObj = {
        from: from,
        to: to,
        value: txFee.costByType && txFee.costByType.ethTransfer,
        gas: txFee.costByType && txFee.costByType.txFeeEth.gas,
        gasPrice: txFee.costByType && txFee.costByType.txFeeEth.price,
        nonce: await _web3.eth.getTransactionCount(from)
      }
      // consecutive tx, need to set nonce manually
      ERC20TxObj.nonce = txFeeEthTxObj.nonce + 1
      txObjs.push(txFeeEthTxObj)
    }
    txObjs.push(ERC20TxObj)
  }
  return txObjs
}

const getBufferFromHex = (hex: string) => {
  const _hex = hex.toLowerCase().replace('0x', '')
  return Buffer.from(_hex, 'hex')
}

const bufferToHex = (buffer: Buffer) => {
  return '0x' + buffer.toString('hex')
}

const calculateChainIdFromV = (v: Buffer) => {
  const sigV = bufferToInt(v)
  let chainId = Math.floor((sigV - 35) / 2)
  if (chainId < 0) chainId = 0
  return chainId
}

const getSignTransactionObject = (tx: Object) => {
  return {
    rawTransaction: bufferToHex(tx.serialize()),
    tx: {
      nonce: bufferToHex(tx.nonce),
      gasPrice: bufferToHex(tx.gasPrice),
      gas: tx.gasLimit ? bufferToHex(tx.gasLimit) : bufferToHex(tx.gas),
      to: bufferToHex(tx.to),
      value: bufferToHex(tx.value),
      input: bufferToHex(tx.data),
      v: bufferToHex(tx.v),
      r: bufferToHex(tx.r),
      s: bufferToHex(tx.s),
      hash: bufferToHex(tx.hash())
    }
  }
}

async function getUtxoDetails (txHash: string) {
  const details = await axios.get(`${url.LEDGER_API_URL}/transactions/${txHash}/hex`)
  return details.data[0].hex
}

const networkIdMap = {
  mainnet: 1,
  ropsten: 3,
  rinkeby: 4,
  kovan: 42
}

async function getGasCost (txObj: any): Promise<TxFee> {
  const _web3 = new Web3(new Web3.providers.HttpProvider(url.INFURA_API_URL))
  let price = await _web3.eth.getGasPrice()
  let gas = (await _web3.eth.estimateGas(txObj)).toString()
  let costInBasicUnit = new BN(price).mul(new BN(gas)).toString()
  let costInStandardUnit = utils.toHumanReadableUnit(costInBasicUnit, 18, 8).toString()

  return { price, gas, costInBasicUnit, costInStandardUnit }
}

async function getTxFee ({
  value,
  cryptoType,
  directTransfer = false
}: {
  value: BasicTokenUnit,
  cryptoType: string,
  directTransfer: boolean
}): Promise<TxFee> {
  const mockFrom = '0x8df5f2e0cc3b7a5cb2082403bcd72df66bd384e3'
  const mockTo = '0x8df5f2e0cc3b7a5cb2082403bcd72df66bd384e4'
  let txObj
  if (directTransfer) {
    txObj = {
      from: mockFrom,
      to: mockTo,
      value: value
    }
  } else {
    // send to multiSig Wallet
    txObj = new SimpleMultiSig().getSendToEscrowTxObj(mockFrom, mockTo, value, cryptoType)
  }
  return getGasCost(txObj)
}

export default {
  broadcastBtcRawTx,
  networkIdMap,
  web3SendTransactions,
  buildEthereumTxObjs,
  getUtxoDetails,
  getSignTransactionObject,
  calculateChainIdFromV,
  bufferToHex,
  getBufferFromHex,
  getGasCost,
  getTxFee
}
