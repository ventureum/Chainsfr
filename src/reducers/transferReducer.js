/*
 *  Handle transfer actions amd transfer data
 *
 *  e.g. tx hash, timestamp, sender, receiver, etc
 */

const initialState = {
  // transfer data (sender, destination, encryptedWallet, etc)
  // fetched from database
  transfer: null,

  // gas related data
  gasCost: null,

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
    case 'GET_GAS_COST_FULFILLED':
      return {
        ...state,
        gasCost: action.payload
      }
    case 'TRANSACTION_HASH_RETRIEVED_FULFILLED':
      return {
        ...state,
        receipt: action.payload
      }
    case 'ACCEPT_TRANSFER_TRANSACTION_HASH_RETRIEVED_FULFILLED':
      return {
        ...state,
        receipt: action.payload
      }
    case 'CANCEL_TRANSFER_TRANSACTION_HASH_RETRIEVED_FULFILLED':
      return {
        ...state,
        receipt: action.payload
      }
    default: // need this for default case
      return state
  }
}
