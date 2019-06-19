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
  if (!Array.isArray(walletDataList)) walletDataList = [walletDataList]
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
    case 'UPDATE_METAMASK_ACCOUNTS':
    case 'CHECK_LEDGER_NANOS_CONNECTION_FULFILLED':
    case 'CHECK_CLOUD_WALLET_CONNECTION_FULFILLED':
    case 'CREATE_CLOUD_WALLET_FULFILLED':
    case 'GET_CLOUD_WALLET_FULFILLED':
      return updateWalletState(state, action.payload, { connected: true })
    case 'CHECK_LEDGER_NANOS_CONNECTION_PENDING':
    case 'CHECK_LEDGER_NANOS_CONNECTION_REJECTED':
      return updateWalletState(state, [], { connected: false })
    case 'SYNC_FULFILLED':
    case 'VERIFY_PASSWORD_FULFILLED':
    case 'CLEAR_DECRYPTED_WALLET':
    case 'DECRYPT_CLOUD_WALLET_FULFILLED':
      return updateWalletState(state, action.payload)
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
    case 'GET_TRANSFER_FULFILLED':
      return updateWalletState(state, [action.payload.walletData], { connected: true })
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
