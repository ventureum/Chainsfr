/*
 *  Handle wallet actions amd wallet data
 */

import update from 'immutability-helper'
import { REHYDRATE } from 'redux-persist/lib/constants'

const initState = {
  /*
   * escrow wallet
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
      crypto: {}
    },
    metamask: {
      connected: false,
      network: null,
      crypto: {}
    }
  }
}

export default function (state = initState, action) {
  switch (action.type) {
    // metamask
    case 'CHECK_METAMASK_CONNECTION_FULFILLED':
      return update(state, { wallet: { metamask: { $merge: action.payload } } })
    case 'UPDATE_METAMASK_ACCOUNTS':
      return update(state, { wallet: { metamask: { accounts: { $set: action.payload } } } })
    // ledger
    case 'CHECK_LEDGER_NANOS_CONNECTION_FULFILLED':
      return update(state, { wallet: { ledger: { $merge: action.payload } } })
    case 'CHECK_LEDGER_NANOS_CONNECTION_PENDING':
      return update(state, { wallet: { ledger: { $merge: { connected: false } } } })
    case 'CHECK_LEDGER_NANOS_CONNECTION_REJECTED':
      return update(state, { wallet: { ledger: { $merge: {
        connected: false,
        network: null
      } } } })
    // escrow wallet actions
    case 'VERIFY_PASSWORD_FULFILLED':
    // store decrypted wallet
      return update(state, { escrowWallet: { decryptedWallet: { $set: action.payload } } })
    case 'CLEAR_DECRYPTED_WALLET':
      return update(state, { escrowWallet: { decryptedWallet: { $set: null } } })
    case 'SYNC_LEDGER_ACCOUNT_INFO_FULFILLED':
      return update(state, { wallet: { ledger: { crypto: { $merge: action.payload } } } })
    case REHYDRATE:
      if (action.payload) {
        var incoming = action.payload.walletReducer.wallet.ledger
        if (incoming) return update(state, { wallet: { ledger: { $merge: incoming } } })
      }
      return state
    default: // need this for default case
      return state
  }
}
