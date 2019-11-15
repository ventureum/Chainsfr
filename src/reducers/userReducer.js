import update from 'immutability-helper'
import { createAccount } from '../accounts/AccountFactory'
import utils from '../utils.js'
/*
 *  Handle user profile
 */

const initState = {
  // user profile
  profile: {
    isAuthenticated: false,
    newUser: null
  },
  recipients: [],
  cloudWalletConnected: false
}

function updateCryptoAccount (state, newAccountData) {
  if (newAccountData.walletType === 'escrow') {
    return update(state, { escrowAccount: { $set: newAccountData } })
  }
  let { cryptoAccounts } = state
  cryptoAccounts = cryptoAccounts.map(accountData => {
    if (utils.accountsEqual(newAccountData, accountData)) {
      return { ...accountData, ...newAccountData }
    }
    return accountData
  })
  return update(state, { cryptoAccounts: { $set: cryptoAccounts } })
}

export default function (state = initState, action) {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        profile: {
          ...state.profile,
          ...action.payload,
          isAuthenticated: true
        }
      }
    case 'REFRESH_ACCESS_TOKEN_FULFILLED':
      return {
        ...state,
        profile: {
          ...state.profile,
          ...action.payload,
          isAuthenticated: true
        }
      }
    case 'LOGOUT_FULFILLED':
      return initState
    case 'GET_CLOUD_WALLET_FULFILLED':
    case 'CREATE_CLOUD_WALLET_FULFILLED':
      return {
        ...state,
        cloudWalletConnected: true
      }
    case 'SET_NEW_USER_TAG':
      return update(state, { profile: { newUser: { $set: action.payload } } })
    case 'GET_RECIPIENTS_FULFILLED':
    case 'ADD_RECIPIENT_FULFILLED':
    case 'REMOVE_RECIPIENT_FULFILLED':
    case 'EDIT_RECIPIENT_FULFILLED':
      return update(state, {
        recipients: {
          $set: Array.isArray(action.payload)
            ? action.payload.sort((itemA, itemB) => (itemA.name <= itemB.name ? -1 : 1))
            : []
        }
      })
    default:
      // need this for default case
      return state
  }
}
