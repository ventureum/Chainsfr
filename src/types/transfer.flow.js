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
