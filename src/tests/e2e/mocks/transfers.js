// @flow
import { TRANSFER_ID_LIST, RECEIVING_ID_LIST } from './ids'

const ACCOUNTS = {
  METAMASK_ETH:
    '{"walletType":"metamask","platformType":"ethereum","cryptoType":"ethereum","address":"0xd3ced3b16c8977ed0e345d162d982b899e978588"}',
  METAMASK_DAI:
    '{"walletType":"metamask","platformType":"ethereum","cryptoType":"dai","address":"0xd3ced3b16c8977ed0e345d162d982b899e978588"}'
  // TODO: support more accounts
}

const ENCRYPTED_PRIVATE_KEYS = {
  ethereum: {
    data:
      'IntcImhhc2hcIjpcIiQyYSQxMCQucEVTdkdSUlh4R1dFUmZsVUdNbC9lVEJJaHd0TFVDWDI0MDk2M1FnT3NLUjhpa2JGQi4vdVwiLFwiZW5jcnlwdGVkTWVzc2FnZVwiOlwiMGZiMWI5YjhlN2NkNjY2NDM4Njk3NmE2ZWZmNDBmOWE0MjE1YjcyNzZmYjM1NWVjOGU5MTU5YjBkYjJhYTFjYTJhMmMxZTgxZDVhNjg5MDYwZWZkYjE5ZTBiMzMxZDM2N2E5YjMyYzY4YzBiYzA2NWI1NGNmN2VlYmZjY2YwM2JkOWU4NWQ4NTEwYzcxMzkxZTA3ZmZmYzk3OWFiMWZhMjRjN2JcIn0i',
    // password: 123456
    password: 'MTIzNDU2'
  }
  // TODO: Add btc keys
}

const TRANSFER_AMOUNT = '1.345'
const TRANSFER_FIAT_AMOUNT_SPOT = '23.45'

const TRANSFER_DATA_BASE = {
  // must set to true to avoid tx tracking
  mock: true,

  // params to be set
  chainsferToReceiver: {
    txHash: null,
    txState: 'NotInitiated',
    txTimestamp: 0
  },
  chainsferToSender: {
    txHash: null,
    txState: 'NotInitiated',
    txTimestamp: 0
  },
  senderToChainsfer: {
    txHash: null,
    txState: 'NotInitiated',
    txTimestamp: 0
  },

  transferId: null,
  receivingId: null,

  cryptoType: null,
  expired: null,
  inEscrow: null,

  transferStage: null,

  sendTxHash: undefined,
  receiveTxHash: undefined,
  cancelTxHash: undefined,

  senderAccount: undefined,
  receiverAccount: undefined,

  // constants, do not change them
  created: 1584994884,
  sendMessage: 'Send Message',
  receiveMessage: 'Receive Message',
  cancelMessage: 'Cancel Message',

  transferAmount: TRANSFER_AMOUNT,
  transferFiatAmountSpot: TRANSFER_FIAT_AMOUNT_SPOT,
  data:
    'IntcImhhc2hcIjpcIiQyYSQxMCRkQzA2cktLTlE2Z2dIN1Q5WEI1VlJ1NUpydW03OHJXemVzMkVMdDNBMEVXeTdKNVFtWWdxV1wiLFwiZW5jcnlwdGVkTWVzc2FnZVwiOlwiMWUxNGVkNjkwYWI1MTI5NGI4ZTU5MDViNTUzODEzMzg4YzJjMWY4NmFhOWU0N2ZkNGZiOTdjZTE4MjcwNzRkOGUzMTcxN2FmZGUxMGJhMTE5NmIwMjYxNTU3MzM3ZjhhMzQyODA0OWUxODJkMGY1ZDBhNDVkNjA1ZGEyZmI5NDIyY2QxMTI5OTk3ZDQzYzIzMmNjMDFkY2NiZTllODY2ODU0N2ZcIn0i',
  destination: 'timothy@ventureum.io',
  fiatType: 'USD',
  reminder: {
    nextReminderTimestamp: 0,
    reminderToReceiverCount: 0,
    reminderToSenderCount: 0
  },
  sender: 'chainsfre2etest@gmail.com',
  senderName: 'e2e test',
  receiverName: 'timothy',
  senderAvatar:
    'https://lh4.googleusercontent.com/-23NNcYMLB9I/AAAAAAAAAAI/AAAAAAAAAAA/AKF05nAyjqK1EWJEGo5qD1lL8s0vZ77hEQ/s96-c/photo.jpg',
  receiverAvatar:
    'https://lh6.googleusercontent.com/-WMURVoUdqZI/AAAAAAAAAAI/AAAAAAAAAAA/AKF05nCdGteZf4gKxzVgAdJVDuUMyIBVGw/s96-c/photo.jpg',
  updated: 1584994884,
  walletId: '0xde25b1306d4311eaa2a5d50e6714fe18de25b1316d4311eaa2a5d50e6714fe18'
}

const TX_HASH = {
  ethereum: {
    txHash: '0x475614685999f8612a015733ab63e50f5c8a234e0e36229084eb7426ae3acb1f',
    txTimestamp: 1584994889
  },
  dai: {
    txHash: '0x53c701ba5bd1bae8cf7c6d9ac2cf8aa9b73f6794571ed178f31a587fb3a2ae03',
    txTimestamp: 1584999153
  }
  // TODO: add btc tx hash
}

type TransferMockSpecType = {
  cryptoType: string,

  // ACCOUNTS constant for details
  senderAccountType: string,
  receiverAccountType?: string,

  // a state from transferStates
  state: string
}

function generateData (
  transferOut: Array<TransferMockSpecType> = [],
  transferIn: Array<TransferMockSpecType> = []
) {
  let transferDataList = []
  let driveTransferHistory = {}
  for (let [idx, transfer] of transferOut.entries()) {
    // deep copy
    let transferData = JSON.parse(JSON.stringify(TRANSFER_DATA_BASE))

    // set ids
    transferData.transferId = TRANSFER_ID_LIST[idx]
    transferData.receivingId = RECEIVING_ID_LIST[idx]

    // set basic transfer info
    transferData.cryptoType = transfer.cryptoType
    transferData.senderAccount = ACCOUNTS[transfer.senderAccountType]
    if (transfer.receiverAccountType) {
      transferData.receiverAccount = ACCOUNTS[transfer.receiverAccountType]
    }

    // set state-dependent vars
    switch (transfer.state) {
      case 'SEND_PENDING':
        transferData.sendTxHash = TX_HASH[transfer.cryptoType].txHash
        transferData.transferStage = 'SenderToChainsfer'
        transferData.senderToChainsfer = {
          ...TX_HASH[transfer.cryptoType],
          txState: 'Pending'
        }
        transferData.inEscrow = 0
        transferData.expired = false
        break
      case 'SEND_CONFIRMED_RECEIVE_NOT_INITIATED':
        transferData.sendTxHash = TX_HASH[transfer.cryptoType].txHash
        transferData.transferStage = 'SenderToChainsfer'
        transferData.senderToChainsfer = {
          ...TX_HASH[transfer.cryptoType],
          txState: 'Confirmed'
        }
        transferData.inEscrow = 1
        transferData.expired = false
        break
      case 'SEND_CONFIRMED_RECEIVE_PENDING':
        transferData.sendTxHash = TX_HASH[transfer.cryptoType].txHash
        transferData.transferStage = 'ChainsferToReceiver'
        transferData.senderToChainsfer = {
          ...TX_HASH[transfer.cryptoType],
          txState: 'Confirmed'
        }
        transferData.chainsferToReceiver = {
          ...TX_HASH[transfer.cryptoType],
          txState: 'Pending'
        }
        transferData.inEscrow = 1
        transferData.expired = false
        break
      case 'SEND_CONFIRMED_RECEIVE_FAILURE':
        transferData.sendTxHash = TX_HASH[transfer.cryptoType].txHash
        transferData.transferStage = 'ChainsferToReceiver'
        transferData.senderToChainsfer = {
          ...TX_HASH[transfer.cryptoType],
          txState: 'Confirmed'
        }
        transferData.chainsferToReceiver = {
          ...TX_HASH[transfer.cryptoType],
          txState: 'Failed'
        }
        transferData.inEscrow = 1
        transferData.expired = false
        break
      case 'SEND_CONFIRMED_RECEIVE_CONFIRMED':
        transferData.sendTxHash = TX_HASH[transfer.cryptoType].txHash
        transferData.transferStage = 'ChainsferToReceiver'
        transferData.senderToChainsfer = {
          ...TX_HASH[transfer.cryptoType],
          txState: 'Confirmed'
        }
        transferData.chainsferToReceiver = {
          ...TX_HASH[transfer.cryptoType],
          txState: 'Confirmed'
        }
        transferData.inEscrow = 0
        transferData.expired = false
        break

      // cancellation
      case 'SEND_CONFIRMED_CANCEL_PENDING':
        transferData.sendTxHash = TX_HASH[transfer.cryptoType].txHash
        transferData.transferStage = 'ChainsferToSender'
        transferData.senderToChainsfer = {
          ...TX_HASH[transfer.cryptoType],
          txState: 'Confirmed'
        }
        transferData.chainsferToSender = {
          ...TX_HASH[transfer.cryptoType],
          txState: 'Pending'
        }
        transferData.inEscrow = 1
        transferData.expired = false
        break
      case 'SEND_CONFIRMED_CANCEL_CONFIRMED':
        transferData.sendTxHash = TX_HASH[transfer.cryptoType].txHash
        transferData.transferStage = 'ChainsferToSender'
        transferData.senderToChainsfer = {
          ...TX_HASH[transfer.cryptoType],
          txState: 'Confirmed'
        }
        transferData.chainsferToSender = {
          ...TX_HASH[transfer.cryptoType],
          txState: 'Confirmed'
        }
        transferData.inEscrow = 0
        transferData.expired = false
        break
      case 'SEND_CONFIRMED_CANCEL_FAILURE':
        transferData.sendTxHash = TX_HASH[transfer.cryptoType].txHash
        transferData.transferStage = 'ChainsferToSender'
        transferData.senderToChainsfer = {
          ...TX_HASH[transfer.cryptoType],
          txState: 'Confirmed'
        }
        transferData.chainsferToSender = {
          ...TX_HASH[transfer.cryptoType],
          txState: 'Failed'
        }
        transferData.inEscrow = 1
        transferData.expired = false
        break

      case 'SEND_CONFIRMED_EXPIRED_RECEIVE_NOT_INITIATED':
        transferData.sendTxHash = TX_HASH[transfer.cryptoType].txHash
        transferData.transferStage = 'SenderToChainsfer'
        transferData.senderToChainsfer = {
          ...TX_HASH[transfer.cryptoType],
          txState: 'Confirmed'
        }
        transferData.inEscrow = 1
        transferData.expired = true
        break
      case 'SEND_CONFIRMED_EXPIRED_RECEIVE_PENDING':
        transferData.sendTxHash = TX_HASH[transfer.cryptoType].txHash
        transferData.transferStage = 'ChainsferToReceiver'
        transferData.senderToChainsfer = {
          ...TX_HASH[transfer.cryptoType],
          txState: 'Confirmed'
        }
        transferData.chainsferToReceiver = {
          ...TX_HASH[transfer.cryptoType],
          txState: 'Pending'
        }
        transferData.inEscrow = 1
        transferData.expired = true
        break
      case 'SEND_CONFIRMED_EXPIRED_RECEIVE_FAILURE':
        transferData.sendTxHash = TX_HASH[transfer.cryptoType].txHash
        transferData.transferStage = 'ChainsferToReceiver'
        transferData.senderToChainsfer = {
          ...TX_HASH[transfer.cryptoType],
          txState: 'Confirmed'
        }
        transferData.chainsferToReceiver = {
          ...TX_HASH[transfer.cryptoType],
          txState: 'Failed'
        }
        transferData.inEscrow = 1
        transferData.expired = true
        break
      case 'SEND_CONFIRMED_EXPIRED_RECEIVE_CONFIRMED':
        transferData.sendTxHash = TX_HASH[transfer.cryptoType].txHash
        transferData.transferStage = 'ChainsferToReceiver'
        transferData.senderToChainsfer = {
          ...TX_HASH[transfer.cryptoType],
          txState: 'Confirmed'
        }
        transferData.chainsferToReceiver = {
          ...TX_HASH[transfer.cryptoType],
          txState: 'Confirmed'
        }
        transferData.inEscrow = 0
        transferData.expired = true
        break
      // TODO: support more states
      default:
        throw new Error(`Transfer state ${transfer.state} not supported`)
    }

    transferDataList.push(transferData)
    driveTransferHistory[transferData.transferId] = {
      ...ENCRYPTED_PRIVATE_KEYS[transferData.cryptoType],
      transferId: transferData.transferId,
      senderAccountId: transferData.senderAccount,
      sendTimestamp: TX_HASH[transferData.cryptoType].txTimestamp,
      sendTxHash: TX_HASH[transferData.cryptoType].txHash
    }
  }
  // TODO: support transferIn

  return { transferDataList, driveTransferHistory }
}

const DEFAULT_TRANSFER_DATA = {
  ...generateData([
    // before expiration
    {
      state: 'SEND_PENDING',
      cryptoType: 'ethereum',
      senderAccountType: 'METAMASK_ETH'
    },
    {
      state: 'SEND_CONFIRMED_RECEIVE_NOT_INITIATED',
      cryptoType: 'ethereum',
      senderAccountType: 'METAMASK_ETH'
    },
    {
      state: 'SEND_CONFIRMED_RECEIVE_PENDING',
      cryptoType: 'ethereum',
      senderAccountType: 'METAMASK_ETH'
    },
    {
      state: 'SEND_CONFIRMED_RECEIVE_FAILURE',
      cryptoType: 'ethereum',
      senderAccountType: 'METAMASK_ETH',
      receiverAccountType: 'METAMASK_ETH'
    },
    {
      state: 'SEND_CONFIRMED_RECEIVE_CONFIRMED',
      cryptoType: 'ethereum',
      senderAccountType: 'METAMASK_ETH',
      receiverAccountType: 'METAMASK_ETH'
    },

    // before expiration, cancellation
    {
      state: 'SEND_CONFIRMED_CANCEL_PENDING',
      cryptoType: 'ethereum',
      senderAccountType: 'METAMASK_ETH'
    },
    {
      state: 'SEND_CONFIRMED_CANCEL_CONFIRMED',
      cryptoType: 'ethereum',
      senderAccountType: 'METAMASK_ETH',
      receiverAccountType: 'METAMASK_ETH'
    },
    {
      state: 'SEND_CONFIRMED_CANCEL_FAILURE',
      cryptoType: 'ethereum',
      senderAccountType: 'METAMASK_ETH',
      receiverAccountType: 'METAMASK_ETH'
    },

    // after expiration
    {
      state: 'SEND_CONFIRMED_EXPIRED_RECEIVE_NOT_INITIATED',
      cryptoType: 'ethereum',
      senderAccountType: 'METAMASK_ETH'
    },
    {
      state: 'SEND_CONFIRMED_EXPIRED_RECEIVE_PENDING',
      cryptoType: 'ethereum',
      senderAccountType: 'METAMASK_ETH'
    },
    {
      state: 'SEND_CONFIRMED_EXPIRED_RECEIVE_FAILURE',
      cryptoType: 'ethereum',
      senderAccountType: 'METAMASK_ETH',
      receiverAccountType: 'METAMASK_ETH'
    },
    {
      state: 'SEND_CONFIRMED_EXPIRED_RECEIVE_CONFIRMED',
      cryptoType: 'ethereum',
      senderAccountType: 'METAMASK_ETH',
      receiverAccountType: 'METAMASK_ETH'
    }
  ])
}

export { generateData, DEFAULT_TRANSFER_DATA }
