import update from 'immutability-helper'

const initState = {
  profile: {
    isAuthenticated: false
  },
  wallet: {
    fileId: null,
    content: []
  },
  ledgerNanoS: {
    connected: false,
    firstAddress: null
  },
  metamask: {
    connected: false
  }
}

export default function (state = initState, action) {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        profile: action.payload.profile
      }
    case 'CREATE_ADDRESS_FULFILLED':
      return {
        ...state,
        wallet: action.payload
      }
    case 'GET_ADDRESSES_FULFILLED':
      return {
        ...state,
        wallet: action.payload
      }
    case 'CHECK_METAMASK_CONNECTION_FULFILLED':
      return {
        ...state,
        metamask: action.payload
      }
    case 'UPDATE_METAMASK_ACCOUNTS':
      return update(state, { metamask: { accounts: { $set: action.payload } } })
    case 'CHECK_LEDGER_NANOS_CONNECTION_FULFILLED':
      return {
        ...state,
        ledgerNanoS: {
          connected: true,
          firstAddress: action.payload
        }
      }
    case 'CHECK_LEDGER_NANOS_CONNECTION_PENDING':
    case 'CHECK_LEDGER_NANOS_CONNECTION_REJECTED':
      return {
        ...state,
        ledgerNanoS: {
          connected: false,
          firstAddress: null
        }
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
    default: // need this for default case
      return state
  }
}
