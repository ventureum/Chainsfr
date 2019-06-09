// @flow
import type { BasicTokenUnit } from './token.flow.js'
export type TxHash = string

export type TxFee = {
  price: string,
  gas: string,
  costInBasicUnit: string,
  costInStandardUnit: string,
  // for erc20 tx
  costByType?: {
    txFeeEth: TxFee,
    txFeeERC20: TxFee,
    ethTransfer: string
  }
}

export type TxEthereum = {
  from: string,
  nonce?: number,
  gasPrice: string,
  gas: number,
  to: string,
  value: BasicTokenUnit,
  data?: string
}
