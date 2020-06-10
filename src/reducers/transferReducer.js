/*
 *  Handle transfer actions amd transfer data
 *
 *  e.g. tx hash, timestamp, sender, receiver, etc
 */
import update from 'immutability-helper'
const initialState = {
  // transfer data (sender, destination, encryptedWallet, etc)
  // fetched from database
  transfer: null,

  // tx related data
  txFee: null,

  // transaction receipt
  receipt: null,

  transferHistory: {
    hasMore: true,
    history: [],
    senderLastEvaluatedKey: null,
    destinationLastEvaluatedKey: null
  },

  txHistoryByAccount: {}
}

function updateTransferPassword (state, action) {
  const { type, payload, meta } = action
  let transferId, password
  if (payload && type !== 'GET_TRANSFER_PASSWORD_REJECTED') {
    transferId = payload.transferId
    password = payload.password
  } else {
    transferId = meta.transferId
  }
  const { transfer, transferHistory } = state
  const { history } = transferHistory

  if (transfer && transfer.transferId === transferId) {
    if (action.type === 'GET_TRANSFER_PASSWORD_PENDING') {
      state.transfer.passwordLoading = true
    } else {
      state.transfer.passwordLoading = false
      if (password) {
        state.transfer.password = password
      }
    }
  }
  let index = history.findIndex(transferData => {
    return transferData.transferId === transferId
  })
  if (index >= 0) {
    if (action.type === 'GET_TRANSFER_PASSWORD_PENDING') {
      history[index].passwordLoading = true
    } else {
      history[index].passwordLoading = false
      if (password) {
        history[index].password = password
      }
    }
  }
  return state
}

export default function (state = initialState, action) {
  switch (action.type) {
    case 'GET_TRANSFER_FULFILLED':
      return {
        ...state,
        transfer: action.payload.transferData
      }
    case 'GET_TRANSFER_PASSWORD_FULFILLED':
    case 'GET_TRANSFER_PASSWORD_PENDING':
    case 'GET_TRANSFER_PASSWORD_REJECTED':
      return updateTransferPassword(state, action)
    case 'GET_TX_COST_FULFILLED':
      return {
        ...state,
        txFee: action.payload
      }
    case 'SUBMIT_TX_FULFILLED':
      return {
        ...state,
        receipt: action.payload
      }
    case 'DIRECT_TRANSFER_FULFILLED':
      return {
        ...state,
        receipt: action.payload
      }
    case 'ACCEPT_TRANSFER_FULFILLED':
      return {
        ...state,
        receipt: action.payload,
        transfer: null
      }
    case 'CANCEL_TRANSFER_FULFILLED':
      return {
        ...state,
        receipt: action.payload
      }
    case 'GET_EMAIL_TRANSFER_HISTORY_FULFILLED':
      return {
        ...state,
        transferHistory: {
          hasMore: action.payload.hasMore,
          history:
            state.transferHistory.history.length === 0
              ? action.payload.transferData
              : [...state.transferHistory.history, ...action.payload.transferData],
          senderLastEvaluatedKey: action.payload.senderLastEvaluatedKey,
          destinationLastEvaluatedKey: action.payload.destinationLastEvaluatedKey
        }
      }
    case 'GET_TX_HISTORY_BY_ACCOUNT_FULFILLED':
      return update(state, {
        txHistoryByAccount: {
          [action.payload.account.id]: { $set: action.payload.accountTxHistory }
        }
      })
    case 'SET_TOKEN_ALLOWANCE_FULFILLED':
      return {
        ...state,
        setTokenAllowanceTxHash: action.payload
      }
    default:
      // need this for default case
      return state
  }
}
