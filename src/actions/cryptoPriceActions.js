// @flow
import CoinGecko from 'coingecko-api'
const CoinGeckoClient = new CoinGecko()

async function _getCryptoPrice (cryptoTypes: Array<string>, currency: string) {
  // api only accepts lowercase currency symbol
  currency = currency.toLowerCase()
  let resp = await CoinGeckoClient.simple.price({
    ids: cryptoTypes,
    vs_currencies: [currency]
  })
  if (resp.code === 200) {
    let rv = {}
    for (let cryptoType of cryptoTypes) {
      rv[cryptoType] = resp.data[cryptoType][currency]
    }
    return rv
  } else {
    throw new Error('Get crypto price failed.')
  }
}

function getCryptoPrice (cryptoTypes: Array<string>) {
  return (dispatch: Function, getState: Function) => {
    const { currency } = getState().cryptoPriceReducer
    return dispatch({
      type: 'GET_CRYPTO_PRICE',
      payload: _getCryptoPrice(cryptoTypes, currency)
    })
  }
}

function setCurrency (currency: string) {
  return {
    type: 'SET_CURRENCY',
    payload: currency
  }
}

export { getCryptoPrice, setCurrency }
