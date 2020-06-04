import update from 'immutability-helper'
/*
 *  Handle user profile
 */

const initState = {
  // user profile
  profile: {
    isAuthenticated: false,
    newUser: null,
    lastLoginTimestamp: null
  },
  recipients: [],
  cloudWalletConnected: false,
  coinbaseAccessObject: null,
  cloudWalletFolderMeta: null,
  exportedCloundWalletData: null
}

export default function (state = initState, action) {
  switch (action.type) {
    case 'ON_GOOGLE_LOGIN_RETURN':
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
    case 'POST_LOGIN_PREPARATION_FULFILLED':
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
    case 'SET_COINBASE_ACCESS_OBJECT':
      return { ...state, coinbaseAccessObject: action.payload }
    case 'GET_UESR_CLOUD_WALLET_FOLDER_META_FULFILLED':
      return { ...state, cloudWalletFolderMeta: action.payload }
    case 'GET_USER_JOIN_DATE_FULFILLED':
      return { ...state, registerTime: action.payload }
    case 'EXPORT_CLOUD_WALLET_FULFILLED':
      return { ...state, exportedCloundWalletData: action.payload }
    case 'CLEAR_CLOUD_WALLET_EXPORT':
      return { ...state, exportedCloundWalletData: null }
    default:
      // need this for default case
      return state
  }
}
