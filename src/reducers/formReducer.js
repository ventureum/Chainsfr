/*
 *  Handle UI and form states
 */

import update from 'immutability-helper'
import Utils from '../utils'

const initialState = {
  walletSelection: null,
  cryptoSelection: null,
  transferForm: {
    accountSelection: null,
    transferAmount: '',
    transferCurrencyAmount: '',
    password: '',
    destination: '',
    sender: '',
    sendMessage: '',
    formError: {
      sender: null,
      senderName: null,
      destination: null,
      transferAmount: null,
      password: null,
      sendMessage: null
    }
  }
}

export default function (state = initialState, action) {
  switch (action.type) {
    case 'VERIFY_ACCOUNT_FULFILLED':
    case 'CHECK_WALLET_CONNECTION_FULFILLED':
    case 'SYNC_WITH_NETWORK_FULFILLED': {
      if (
        state.transferForm.accountSelection &&
        Utils.accountsEqual(action.payload, state.transferForm.accountSelection)
      ) {
        return update(state, { transferForm: { accountSelection: { $set: action.payload } } })
      }
    }
    case 'SYNC_WITH_NETWORK_PENDING': {
      if (
        state.transferForm.accountSelection &&
        Utils.accountsEqual(action.meta, state.transferForm.accountSelection)
      ) {
        return update(state, { transferForm: { accountSelection: { $set: action.meta } } })
      }
    }
    case 'SELECT_CRYPTO':
      return {
        ...state,
        cryptoSelection: state.cryptoSelection === action.payload ? null : action.payload,
        transferForm: initialState.transferForm
      }
    case 'SELECT_WALLET':
      return {
        ...state,
        walletSelection: state.walletSelection === action.payload ? null : action.payload,
        cryptoSelection: null
      }
    case 'UPDATE_TRANSFER_FORM':
      return {
        ...state,
        transferForm: action.payload
      }
    case 'GENERATE_SECURITY_ANSWER':
      return update(state, { transferForm: { password: { $set: action.payload } } })
    case 'CLEAR_TRANSFER_FORM':
    case 'BACK_TO_HOME':
      return initialState
    default:
      // need this for default case
      return state
  }
}
