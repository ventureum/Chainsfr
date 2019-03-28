import update from 'immutability-helper'

/*
 *  Handle user profile
 */

const initState = {
  // user profile
  profile: {
    isAuthenticated: false,
    newUser: null
  }
}

export default function (state = initState, action) {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        profile: {
          ...action.payload,
          isAuthenticated: true,
          newUser: false
        }
      }
    case 'LOGOUT_FULFILLED':
      return initState
    case 'SET_NEW_USER_TAG':
      return update(state, { profile: { newUser: { $set: action.payload } } })
    default: // need this for default case
      return state
  }
}
