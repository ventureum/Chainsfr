// @flow
import type { BasicTokenUnit } from './token.flow.js'
export type TxHash = string

export type TxFee = {
  price: string,
  gas: string,
  costInBasicUnit: string,
  costInStandardUnit: string
}

export type TxEthereum = {
  from: string,
  nonce?: number,
  gasPrice?: string,
  gasLimit?: string,
  to: string,
  value: BasicTokenUnit,
  data?: string
}

export type Recipient = {
  name: string,
  email: string
}

export type Signature = string


export type AccountTxHistoryType = {
  updated: ?number,
  history: Array<{
    // common
    txHash: string,
    timestamp: number,
    blockNumber?: number,
    //for eth
    nonce?: number,
    gasPrice?: number,
    cumulativeGasUsed?: number,
    // for btc
    txFees?: number,
    // transferData which matches the txHash
    transferData?: Object,
    // no transferData matches the txHash
    // interprete it as a regular tx
    standaloneTx?: {
      from: string,
      to: string,
      amount: string,
      cryptoType: string
    }
  }>
}