/*
 *  Handle transfer actions amd transfer data
 *
 *  e.g. tx hash, timestamp, sender, receiver, etc
 */

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
    history: []
  }
}

export default function (state = initialState, action) {
  switch (action.type) {
    case 'GET_TRANSFER_FULFILLED':
      return {
        ...state,
        transfer: action.payload.transferData
      }
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
        receipt: action.payload
      }
    case 'CANCEL_TRANSFER_FULFILLED':
      return {
        ...state,
        receipt: action.payload
      }
    case 'GET_TRANSFER_HISTORY_FULFILLED':
      return {
        ...state,
        transferHistory: {
          hasMore: action.payload.hasMore,
          history: action.payload.offset === 0
            ? action.payload.transferData
            : [...state.transferHistory.history, ...action.payload.transferData]
        }
      }
    default: // need this for default case
      return state
  }
}
