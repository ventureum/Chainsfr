/*
 *  Handle user profile
 */

const initState = {
  // user profile
  profile: {
    isAuthenticated: false
  }
}

export default function (state = initState, action) {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        profile: action.payload.profile
      }
    case 'LOGOUT':
      return initState
    default: // need this for default case
      return state
  }
}
