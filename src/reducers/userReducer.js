import update from 'immutability-helper'

/*
 *  Handle user profile
 */

const initState = {
  // user profile
  profile: {
    isAuthenticated: false,
    newUser: null
  },
  recipients: []
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
      return update(state, {
        recipients: {
          $set: action.payload.sort((itemA, itemB) => (itemA.name <= itemB.name ? -1 : 1))
        }
      })
    default:
      // need this for default case
      return state
  }
}
