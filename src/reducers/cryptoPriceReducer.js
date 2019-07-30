const initState = {
  cryptoPrice: {},
  currency: 'USD'
}

export default function (state = initState, action) {
  switch (action.type) {
    case 'GET_CRYPTO_PRICE_FULFILLED':
      return {
        ...state,
        cryptoPrice: action.payload
      }
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
