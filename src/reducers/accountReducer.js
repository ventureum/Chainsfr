import update from 'immutability-helper'
/*
 *  Handle accounts
 */

const initState = {
  escrowAccount: null,
  cryptoAccounts: [],
  newCryptoAccountFromWallet: null
}

/*
 * @param overwriteExisting Solving key collision using the newCryptoAccounts
 * @param remove Deleting the account if the acount is not found in newCryptoAccounts
 */
function updateCryptoAccount (state, newCryptoAccounts, remove = false, overwriteExisting = true) {
  let cryptoAccountMap = {}
  let newCryptoAccountMap = {}
  let accounts = []
  const { cryptoAccounts } = state

  const accountToId = account => {
    const { walletType, cryptoType, address } = account
    return JSON.stringify({ walletType, cryptoType, address })
  }

  if (!Array.isArray(newCryptoAccounts)) {
    const newCryptoAccount = newCryptoAccounts
    if (newCryptoAccount.walletType === 'escrow') {
      return update(state, { escrowAccount: { $set: newCryptoAccount } })
    }
    // convert to array when necessary
    newCryptoAccounts = [newCryptoAccounts]
  }

  cryptoAccounts.forEach((account, idx) => {
    cryptoAccountMap[accountToId(account)] = { idx, account }
  })

  newCryptoAccounts.forEach((account, idx) => {
    newCryptoAccountMap[accountToId(account)] = { idx, account }
  })

  cryptoAccounts.forEach((account, idx) => {
    const id = accountToId(account)
    if (id in newCryptoAccountMap) {
      if (overwriteExisting) {
        // Solving key collision using the newCryptoAccounts
        accounts.push({ ...account, ...newCryptoAccountMap[id].account })
      } else {
        accounts.push({ ...newCryptoAccountMap[id].account, ...account })
      }
    } else if (!remove) {
      // account not found in newCryptoAccounts
      // do not remove existing account
      accounts.push(account)
    }
  })

  // append new accounts
  newCryptoAccounts.forEach(account => {
    const id = accountToId(account)
    if (!(id in cryptoAccountMap)) {
      accounts.push(account)
    }
  })

  return update(state, { cryptoAccounts: { $set: accounts } })
}

export default function (state = initState, action) {
  switch (action.type) {
    // following three actions return a complete list of accounts after actions
    case 'GET_CRYPTO_ACCOUNTS_FULFILLED':
    case 'REMOVE_CRYPTO_ACCOUNT_FULFILLED':
    case 'ADD_CRYPTO_ACCOUNT_FULFILLED':
      return updateCryptoAccount(state, action.payload, true, false)
    case 'MARK_ACCOUNT_DIRTY':
    case 'SYNC_WITH_NETWORK_FULFILLED':
    case 'CHECK_WALLET_CONNECTION_FULFILLED':
    case 'VERIFY_ACCOUNT_FULFILLED':
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
