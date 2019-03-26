import update from 'immutability-helper'

/*
 *  Handle user profile
 */

const initState = {
  // user profile
  profile: {
    isAuthenticated: false,
    newUser: true
  }
}

export default function (state = initState, action) {
  switch (action.type) {
    case 'LOGIN_FULFILLED':
      return {
        ...state,
        profile: action.payload
      }
    case 'LOGOUT':
      return initState
    case 'SET_RECOVERY_PASSWORD_FULFILLED':
      let _state = update(state, { profile: { recoveryPassword: { $set: action.payload } } })
      return update(_state, { profile: { newUser: { $set: false } } })
    default: // need this for default case
      return state
  }
}
