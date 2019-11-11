import update from 'immutability-helper'
import { createAccount } from '../accounts/AccountFactory'
import utils from '../utils.js'
/*
 *  Handle accounts
 */

const initState = {
  escrowAccount: null,
  cryptoAccounts: [],
  newCryptoAccountFromWallet: null
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
    case 'GET_CRYPTO_ACCOUNTS_FULFILLED':
    case 'REMOVE_CRYPTO_ACCOUNT_FULFILLED':
    case 'ADD_CRYPTO_ACCOUNT_FULFILLED':
      return update(state, {
        cryptoAccounts: {
          $set: action.payload
        }
      })

    case 'MARK_ACCOUNT_DIRTY':
    case 'SYNC_WITH_NETWORK_FULFILLED':
      return updateCryptoAccount(state, action.payload)
    case 'SYNC_WITH_NETWORK_PENDING':
      return updateCryptoAccount(state, action.meta)
    case 'GET_TRANSFER_FULFILLED':
      return updateCryptoAccount(state, action.payload.escrowAccount)
    case 'NEW_CRYPTO_ACCOUNT_FROM_WALLET_FULFILLED':
      return update(state, { newCryptoAccountFromWallet: { $set: action.payload } })
    case 'VERIFY_ESCROW_ACCOUNT_PASSWORD_FULFILLED':
      return updateCryptoAccount(state, action.payload)
    default:
      // need this for default case
      return state
  }
}
