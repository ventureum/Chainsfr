// @flow
import CoinGecko from 'coingecko-api'
const CoinGeckoClient = new CoinGecko()

function getCryptoPrice (cryptoTypes: Array<string>) {
  return (dispatch: Function, getState: Function) => {
    // api only accepts lowercase currency symbol
    const currency = getState().cryptoPriceReducer.currency.toLowerCase()
    return dispatch({
      type: 'GET_CRYPTO_PRICE',
      payload: async (): Promise<{ [cryptoType: string]: number }> => {
        let rv = {}
        try {
          // get price for crypto in cryptoTypes
          const idResp = await CoinGeckoClient.simple.price({
            ids: cryptoTypes,
            vs_currencies: [currency]
          })
          if (idResp && idResp.code === 200) {
            for (let cryptoType of cryptoTypes) {
              if (idResp.data[cryptoType]) {
                rv[cryptoType] = idResp.data[cryptoType][currency]
              } else {
                rv[cryptoType] = 0
              }
            }
          }
        } catch (e) {
          console.warn(e)
        }
        return rv
      }
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
