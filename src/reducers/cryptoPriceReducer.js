import update from 'immutability-helper'
const initState = {
  cryptoPrice: {
    libra: 1
  },
  currency: 'USD'
}

export default function (state = initState, action) {
  switch (action.type) {
    case 'GET_CRYPTO_PRICE_FULFILLED':
      return update(state, {cryptoPrice: {$merge: action.payload}})
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
