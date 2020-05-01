// @flow
import axios from 'axios'
import { bufferToInt } from 'ethereumjs-util'
import BN from 'bn.js'

import utils from '../utils'
import url from '../url'
import SimpleMultiSig from '../SimpleMultiSig'
import { isERC20 } from '../tokens'
import ERC20 from '../ERC20'
import { metamaskController } from '../metamaskController'
import Web3 from 'web3'

import type { TxHash } from '../types/transfer.flow'
import type { BasicTokenUnit, Address } from '../types/token.flow'
import type { BitcoinAddress } from '../types/account.flow.js'
import type { TxFee } from '../types/transfer.flow'

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

async function web3SendTransactionsWithMetamaskController (accountData: Object, txObj: Object) {
  const account = metamaskController.web3.eth.accounts.wallet.add(accountData.privateKey)
  metamaskController.web3.eth.defaultAccount = accountData.address
  metamaskController.txController.signEthTx = async txParams => account.signTransaction(txParams)
  metamaskController.txController.getWeb3Account = () => account

  // txObj.[value, gas, gasPrice] must be hex
  txObj.value = Web3.utils.toHex(txObj.value)

  // due to unknown reason, setting gas to the exact estimated value
  // causing out of gas error
  // see https://rinkeby.etherscan.io/tx/0x6d1bad13b0809bdc5f7dbbecb3dc70ffd0f21221a516b2cdfb39a71c6538b5a2
  // even if gas 133,134 is not needed for txs which executed successfully
  // e.g. https://rinkeby.etherscan.io/tx/0x84352dca2dad5f799fa3f3fb4e5c71903967eb5b582304ace626a7c54965d4b5
  // which only uses gas 118,146 (44.37%)
  //
  // as a temporary solution, 1.5x the gas estimation to
  // avoid out-of-gas error
  txObj.gas = Web3.utils.toHex(Math.floor(Number(txObj.gas) * 1.5))

  txObj.gasPrice = Web3.utils.toHex(txObj.gasPrice)

  return metamaskController.txController.newUnapprovedTransactionAndApprove(txObj)
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

async function getUtxoDetails (txHash: TxHash, hex: ?boolean) {
  if (hex) {
    const details = await axios.get(`${url.LEDGER_API_URL}/transactions/${txHash}/hex`)
    return details.data[0].hex
  } else {
    const details = await axios.get(`${url.LEDGER_API_URL}/transactions/${txHash}`)
    return details.data[0]
  }
}

const networkIdMap = {
  mainnet: 1,
  ropsten: 3,
  rinkeby: 4,
  kovan: 42
}

async function getGasCost (txObj: any, gas: ?string): Promise<TxFee> {
  const Web3 = require('web3')
  const _web3 = new Web3(new Web3.providers.HttpProvider(url.INFURA_API_URL))
  let price = await _web3.eth.getGasPrice()
  if (!gas) {
    // if preset gas not provided, estimate gas using web3
    gas = (await _web3.eth.estimateGas(txObj)).toString()
  }
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

  var gasCost
  try {
    gasCost = await getGasCost(txObj)
  } catch (e) {
    if (e.message && e.message.includes('gas required exceeds allowance')) {
      // 133134 covers contract interaction (createErc20Wallet) cost
      gasCost = await getGasCost(txObj, '133134')
    } else {
      throw e
    }
  }

  return gasCost
}

function collectUtxos (
  addressPool: Array<BitcoinAddress>,
  value: BasicTokenUnit = '0',
  txFeePerByte: number = 15
) {
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
      size = estimateTransactionSize(utxosCollected.length, 2, true).max
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

function estimateTransactionSize (
  inputsCount: number,
  outputsCount: number,
  handleSegwit: boolean
) {
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

async function getBtcTxFee ({
  value,
  addressesPool
}: {
  value: BasicTokenUnit,
  addressesPool: Array<BitcoinAddress>
}): Promise<TxFee> {
  let txFeePerByte = await utils.getBtcTxFeePerByte()
  const { size, fee } = collectUtxos(addressesPool, value, txFeePerByte)
  let price = txFeePerByte.toString()
  let gas = size.toString()
  let costInBasicUnit = fee
  let costInStandardUnit = utils.toHumanReadableUnit(costInBasicUnit, 8, 8).toString()
  return { price, gas, costInBasicUnit, costInStandardUnit }
}

// ethereum-based coins transfer tx obj
async function getDirectTransferTxObj (
  from: Address,
  to: Address,
  value: BasicTokenUnit,
  cryptoType: string
) {
  if (isERC20(cryptoType)) {
    return ERC20.getTransferTxObj(from, to, value, cryptoType)
  } else if (cryptoType === 'ethereum') {
    // eth transfer
    return {
      from,
      to,
      value
    }
  } else {
    throw new Error(`Invalid cryptoType ${cryptoType}`)
  }
}

export default {
  broadcastBtcRawTx,
  networkIdMap,
  web3SendTransactions,
  web3SendTransactionsWithMetamaskController,
  getUtxoDetails,
  getSignTransactionObject,
  calculateChainIdFromV,
  bufferToHex,
  getBufferFromHex,
  getGasCost,
  getTxFee,
  getBtcTxFee,
  getDirectTransferTxObj
}
