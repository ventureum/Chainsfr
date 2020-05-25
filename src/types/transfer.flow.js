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
  email: string,
  imageUrl?: ?string,
  imageUrlUpdatedAt?: ?number,
  registeredUser?: boolean, // if the recipient is a chainsfr user
  validEmail?: ?boolean,
  validName?: ?boolean
}

export type Signature = string

export type AccountTxHistoryItemType = {
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
}
export type AccountTxHistoryType = {
  updated: ?number,
  confirmedTxs: Array<AccountTxHistoryItemType>,
  pendingTxs: Array<AccountTxHistoryItemType>
}

export type WalletLastUsedAddressType = {
  address: string,
  timestamp: string
}

export type WalletLastUsedAddressByWalletType = {
  // walletType -> cryptoType -> WalletLastUsedAddressType
  [key: string]: { [key: string]: WalletLastUsedAddressType }
}

export type WalletAddressDataType = {
  ...$Exact<WalletLastUsedAddressByWalletType>,
  googleId: string,
  lastUpdatedCryptoType: string,
  lastUpdatedWalletType: string
}

export type EmailAddressType = string

export type TransferDataClientType = {
  clientId: string
}

export type TransferDataIdType = {
  transferId: string,
  receivingId: string
}

export type TransferDataSenderType = {
  senderName: string,
  senderAvatar: string,
  sender: EmailAddressType,
  senderAccount: string
}

export type TransferDataReceiverType = {
  receiverName: string,
  destination: EmailAddressType,
  destinationAddress: string
}

export type TransferDataCryptoType = {
  cryptoType: string,
  cryptoSymbol: string,
  transferAmount: string,
  transferFiatAmountSpot: string,
  fiatType: string
}

export type TransferDataPrivateKeyType = {
  data: string
}

export type TxStateType = {
  txHash: string,
  txState: string,
  txTimestamp: number
}
export type TransferDataStateType = {
  transferStage: string,
  senderToChainsfer: TxStateType,
  chainsferToSender: TxStateType,
  chainsferToReceiver: TxStateType,
  reminder: {
    nextReminderTimestamp: number,
    reminderToReceiverCount: number,
    reminderToSenderCount: number
  },
  inEscrow: number,
  expired: boolean
}

export type TransferDataMessageType = {
  sendMessage?: string,
  receiveMessage?: string,
  cancelMessage?: string
}

export type TransferDataMetaType = {
  // auto generated data
  created: string,
  updated: string
}

export type MultiSigWalletType = {
  walletId: string,
  masterSig: EcdsaSigType
}

export type EcdsaSigType = string

// complete transfer data db schema
export type TransferDataType = {
  ...$Exact<TransferDataClientType>,
  ...$Exact<TransferDataIdType>,
  ...$Exact<TransferDataSenderType>,
  ...$Exact<TransferDataReceiverType>,
  ...$Exact<TransferDataCryptoType>,
  ...$Exact<TransferDataPrivateKeyType>,
  ...$Exact<TransferDataMessageType>,
  ...$Exact<TransferDataStateType>,
  ...$Exact<TransferDataMetaType>,
  ...$Exact<MultiSigWalletType>,
  receiverAccount: string,
  // testing
  mock: ?boolean
}
