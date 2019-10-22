import update from 'immutability-helper'
import { createAccount } from '../accounts/AccountFactory'

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
  cryptoAccounts: [],
  cloudWalletConnected: false,
  newCryptoAccountFromWallet: null
}

function updateCryptoAccount (state, newAccountData) {
  let { cryptoAccounts } = state
  cryptoAccounts = cryptoAccounts.map(accountData => {
    if (
      (newAccountData.address === accountData.address ||
        (newAccountData.hdWalletVariables &&
          accountData.hdWalletVariables &&
          accountData.hdWalletVariables.xpub === newAccountData.hdWalletVariables.xpub)) &&
      newAccountData.name === accountData.name &&
      newAccountData.walletType === accountData.walletType
    ) {
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
    case 'GET_CRYPTO_ACCOUNTS_FULFILLED':
    case 'ADD_CRYPTO_ACCOUNT_FULFILLED':
      return update(state, {
        cryptoAccounts: {
          $set: Array.isArray(action.payload.cryptoAccounts)
            ? action.payload.cryptoAccounts.map(cryptoAccount => {
                return createAccount(cryptoAccount).getAccountData()
              })
            : []
        }
      })
    case 'SYNC_WITH_NETWORK_FULFILLED':
      return updateCryptoAccount(state, action.payload)
    case 'SYNC_WITH_NETWORK_PENDING':
      return updateCryptoAccount(state, action.meta)
    case 'GET_CLOUD_WALLET_FULFILLED':
    case 'CREATE_CLOUD_WALLET_FULFILLED':
      return update(state, {
        cloudWalletConnected: { $set: true }
      })
    case 'NEW_CRYPTO_ACCOUNT_FROM_WALLET_FULFILLED':
      return update(state, { newCryptoAccountFromWallet: { $set: action.payload } })
    default:
      // need this for default case
      return state
  }
}
