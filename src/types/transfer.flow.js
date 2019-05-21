// @flow
import BN from 'bn.js'
import LedgerNanoS from '../ledgerSigner'
import utils from '../utils'
import axios from 'axios'
import url from '../url'
import env from '../typedEnv'

const bitcoin = require('bitcoinjs-lib')
const bip32 = require('bip32')
const bip39 = require('bip39')

type txRequest = {
  fromWallet: Object,
  cryptoType: string,
  transferAmount: string,
  destinationAddress: string,
  txCost: Object
}

//submitTx

type txRequest = {
  fromWallet: Object,
  walletType: string,
  cryptoType: string,
  transferAmount: string,
  password: string,
  sender: string,
  destination: string,
  txCost: Object,
  txFeePerByte: ?number
}

// accept

type txRequest = {
  escrowWallet: Object,
  destinationAddress: string,
  cryptoType: string,
  transferAmount: string,
  txCost: Object,
  receivingId: string,
  walletType: string
}

// cancel

type txRequest = {
  escrowWallet: Object,
  sendTxHash: string,
  cryptoType: string,
  transferAmount: string,
  txCost: Object,
  sendingId: string
}

type AddressEthereum = string

type AccountEthereum = {
  balance: string,
  address: AddressEthereum,
  privateKey: ?string,
  encryptedPrivateKey: ?string
}

type Utxos = Array<{
  value: number,
  script: string,
  outputIndex: number,
  txHash: string
}>


export type TxHash = string

export type TxFee = {
  price: string,
  gas: string,
  costInBasicUnit: string,
  costInStandardUnit: string,

  // ERC20 transfer requires
  // multiple transactions
  costByType?: {
    txCostEth: TxFee,
    txCostERC20: TxFee,
    ethTransfer: string
  }
}
