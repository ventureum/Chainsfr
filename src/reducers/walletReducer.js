/*
 *  Handle wallet actions amd wallet data
 */

import update from 'immutability-helper'

const initState = {
  /*
   * wallets
   *
   * TODO consistent wallet interface
   */
  escrowWallet: {
    encryptedWallet: null,
    decryptedWallet: null
  },
  wallet: {
    driveWallet: {
      fileId: null,
      content: []
    },
    ledger: {
      connected: false,
      network: null,
      accounts: null
    },
    metamask: {
      connected: false,
      network: null,
      accounts: null
    }
  }
}

export default function (state = initState, action) {
  switch (action.type) {
    // metamask
    case 'CHECK_METAMASK_CONNECTION_FULFILLED':
      return update(state, { wallet: { metamask: { $set: action.payload } } })
    case 'UPDATE_METAMASK_ACCOUNTS':
      return update(state, { wallet: { metamask: { accounts: { $set: action.payload } } } })
    // ledger
    case 'CHECK_LEDGER_NANOS_CONNECTION_FULFILLED':
      return update(state, { wallet: { ledger: { $set: action.payload } } })
    case 'CHECK_LEDGER_NANOS_CONNECTION_REJECTED':
      return update(state, { wallet: { ledger: { $set: {
        connected: false,
        network: null,
        accounts: null
      } } } })
    // escrow wallet actions
    case 'VERIFY_PASSWORD_FULFILLED':
    // store decrypted wallet
      return update(state, { escrowWallet: { decryptedWallet: { $set: action.payload } } })
    case 'CLEAR_DECRYPTED_WALLET':
      return update(state, { escrowWallet: { decryptedWallet: { $set: null } } })
    default: // need this for default case
      return state
  }
}
