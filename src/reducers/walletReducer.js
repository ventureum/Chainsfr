/*
 *  Handle wallet actions amd wallet data
 */

import update from 'immutability-helper'
import { REHYDRATE } from 'redux-persist/lib/constants'

const initState = {
  wallet: {
    escrow: {
      crypto: {}
    },
    drive: {
      unlockRequest: null,
      connected: false,
      crypto: {}
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
  },
  lastUsedWallet: {
    notUsed: false,
    drive: {
      crypto: {}
    },
    metamask: {
      crypto: {}
    },
    ledger: {
      crypto: {}
    }
  }
}

function updateWalletState (state, walletDataList, extra) {
  let _state = state

  // de-duplicated walletType list
  let walletTypeList = walletDataList
    .map(walletData => walletData.walletType)
    .filter((value, index, self) => self.indexOf(value) === index)

  walletTypeList.forEach(walletType => {
    // aggregate crypto list for a given walletType
    let cryptoList = walletDataList
      .filter(walletData => walletData.walletType === walletType)
      .reduce((accum, walletData) => {
        accum[walletData.cryptoType] = walletData.accounts
        return accum
      }, {})
    if (!_state.wallet[walletType]) {
      _state = update(_state, { wallet: { [walletType]: { $set: {} } } })
    }
    _state = update(_state, { wallet: { [walletType]: { $merge: extra || {} } } })
    _state = update(_state, { wallet: { [walletType]: { crypto: { $merge: cryptoList } } } })
  })
  return _state
}

export default function (state = initState, action) {
  switch (action.type) {
    // metamask
    case 'CHECK_METAMASK_CONNECTION_FULFILLED':
      return updateWalletState(state, [action.payload], { connected: true })
    case 'UPDATE_METAMASK_ACCOUNTS':
      return updateWalletState(state, [action.payload], { connected: true })
    // ledger
    case 'CHECK_LEDGER_NANOS_CONNECTION_FULFILLED':
      return updateWalletState(state, [action.payload], { connected: true })
    case 'CHECK_LEDGER_NANOS_CONNECTION_PENDING':
      return updateWalletState(state, [action.payload], { connected: false })
    case 'CHECK_LEDGER_NANOS_CONNECTION_REJECTED':
      return updateWalletState(state, [action.payload], { connected: false })
    case 'SYNC_FULFILLED':
      return updateWalletState(state, [action.payload])
    case 'CHECK_CLOUD_WALLET_CONNECTION_FULFILLED':
      return updateWalletState(state, action.payload, { connected: true })
    // escrow wallet actions
    case 'VERIFY_PASSWORD_FULFILLED':
      return updateWalletState(state, action.payload)
    case 'CLEAR_DECRYPTED_WALLET':
      return update(state, {
        escrowWallet: { decryptedWallet: { $set: null } }
      })
    case 'SYNC_LEDGER_ACCOUNT_INFO_FULFILLED':
      return update(state, {
        wallet: { ledger: { crypto: { $merge: action.payload } } }
      })
    case 'UPDATE_BTC_ACCOUNT_INFO_FULFILLED':
      return update(state, {
        wallet: { ledger: { crypto: { $merge: action.payload } } }
      })
    case 'GET_UTXO_FOR_ESCROW_WALLET_FULFILLED':
      return update(state, {
        escrowWallet: { decryptedWallet: { $merge: action.payload } }
      })
    case 'GET_CLOUD_WALLET_FULFILLED':
    case 'CREATE_CLOUD_WALLET_FULFILLED':
      return updateWalletState(state, action.payload, { connected: true })
    case 'DECRYPT_CLOUD_WALLET_FULFILLED':
      return updateWalletState(state, [action.payload])
    case 'UNLOCK_CLOUD_WALLET':
      return update(state, {
        wallet: {
          drive: {
            unlockRequest: {
              $set: action.payload
            }
          }
        }
      })
    case 'GET_LAST_USED_ADDRESS_FULFILLED':
      return update(state, {
        lastUsedWallet: {
          $merge: { ...action.payload }
        }
      })
    case 'NOT_USED_LAST_ADDRESS':
      return update(state, {
        lastUsedWallet: {
          notUsed: { $set: true }
        }
      })
    case REHYDRATE:
      if (action.payload) {
        var incoming = action.payload.walletReducer.wallet.ledger
        if (incoming) return update(state, { wallet: { ledger: { $merge: incoming } } })
      }
      return state
    default:
      // need this for default case
      return state
  }
}
