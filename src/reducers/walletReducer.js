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
  driveWallet: {
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
    // metamask
    case 'CHECK_METAMASK_CONNECTION_FULFILLED':
      return {
        ...state,
        metamask: action.payload
      }
    case 'UPDATE_METAMASK_ACCOUNTS':
      return update(state, { metamask: { accounts: { $set: action.payload } } })
    // ledger
    case 'CHECK_LEDGER_NANOS_CONNECTION_FULFILLED':
      return {
        ...state,
        ledgerNanoS: {
          connected: true,
          firstAddress: action.payload
        }
      }
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
