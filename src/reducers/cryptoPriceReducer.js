import update from 'immutability-helper'
const initState = {
  cryptoPrice: {},
  currency: 'USD'
}

export default function (state = initState, action) {
  switch (action.type) {
    case 'GET_CRYPTO_PRICE_FULFILLED':
      return action.payload ? update(state, { cryptoPrice: { $merge: action.payload } }) : state
    case 'SET_CURRENCY':
      return {
        ...state,
        currency: action.payload
      }
    default:
      // need this for default case
      return state
  }
}
