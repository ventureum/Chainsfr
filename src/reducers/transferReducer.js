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
  txCost: null,

  // transaction receipt
  receipt: null
}

export default function (state = initialState, action) {
  switch (action.type) {
    case 'GET_TRANSFER_FULFILLED':
      return {
        ...state,
        transfer: action.payload
      }
    case 'GET_TX_COST_FULFILLED':
      return {
        ...state,
        txCost: action.payload
      }
    case 'SUBMIT_TX_FULFILLED':
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
        transferHistory: action.payload
      }
    default: // need this for default case
      return state
  }
}
