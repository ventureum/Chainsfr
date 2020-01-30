import queryString from 'query-string'
import env from '../typedEnv'
import axios from 'axios'
import { store } from '../configureStore'
import { setCoinbaseAccessObject } from '../actions/userActions'
import API from '../apis'
import paths from '../Paths'
import walletErrors from './walletErrors'
import { getCryptoSymbol } from '../tokens'
const NAME = 'Coinbase_Login'
const AUTH_ENDPOINT = 'https://www.coinbase.com/oauth/authorize'
const API_ENDPOINT = 'https://api.coinbase.com/v2'
const SCOPE = 'wallet:accounts:read,wallet:addresses:read,wallet:user:email'
const RESPONSE_TYPE = 'code'
const authUrl =
  `${AUTH_ENDPOINT}?` +
  `client_id=${env.REACT_APP_COINBASE_CLIENT_ID}` +
  `&scope=${SCOPE}&response_type=${RESPONSE_TYPE}` +
  `&redirect_uri=https://${window.location.hostname}${paths.OAuthRedirect}`
let windowObjectReference = null
const errors = walletErrors.coinbaseOAuthWallet
let previousCallback = null

export type CoinBaseAccessObject = {
  access_token: string,
  token_type: string, // "bearer"
  expires_in: number, // unix timestamp 7200s
  refresh_token: string,
  scope: string,
  created_at: number // unix timestam
}

export async function getCyrptoAddress (cryptoType) {
  let accessObject = await getAccessObject(cryptoType)

  // get user email
  const userResponse = (
    await axios.get(`${API_ENDPOINT}/user`, {
      headers: {
        Authorization: `Bearer ${accessObject.access_token}`
      }
    })
  ).data

  const { email } = userResponse.data

  let accountListResponse = (
    await axios.get(`${API_ENDPOINT}/accounts`, {
      headers: {
        Authorization: `Bearer ${accessObject.access_token}`
      }
    })
  ).data

  if (accountListResponse && accountListResponse.data) {
    const targetCryptoAccount = accountListResponse.data[0]
    if (!targetCryptoAccount) {
      throw new Error(errors.accountNotFound)
    }

    // old struct: currency type of string
    let currency = targetCryptoAccount.currency

    if (currency instanceof Object) {
      // new data struct
      currency = currency.code
    }

    if (currency !== getCryptoSymbol(cryptoType)) {
      throw new Error(walletErrors.coinbaseOAuthWallet.cryptoTypeNotMatched)
    }

    const accountAddressResponse = (
      await axios.get(`${API_ENDPOINT}/accounts/${targetCryptoAccount.id}/addresses`, {
        headers: {
          Authorization: `Bearer ${accessObject.access_token}`
        }
      })
    ).data

    if (accountAddressResponse && accountAddressResponse.data.length === 0) {
      throw new Error(errors.noAddress)
    }
    // return the first addresss
    return { address: accountAddressResponse.data[0].address, email }
  }
}

export async function getAccessObject (cryptoType) {
  // storing the access object causing users unable to switch cryptoType
  // pop up oauth window everytime while adding a new account
  const accessObject = await new Promise((resolve, reject) => {
    const callback = async event => {
      if (event.data && event.data.type === 'coinbase_auth') {
        const urlParams = queryString.parse(event.data.params)
        const rv = await API.getCoinbaseAccessObject(urlParams.code)
        resolve(rv)
      }
    }
    openSignInWindow(callback)
  })
  if (accessObject.error) throw new Error(accessObject.error_description)
  store.dispatch(setCoinbaseAccessObject({ cryptoType: cryptoType, ...accessObject }))

  return accessObject
}

const openSignInWindow = callback => {
  const strWindowFeatures = 'toolbar=no, menubar=no, width=600, height=700, top=100, left=100'
  // remove old callback function to avoid double-trigger
  if (previousCallback) window.removeEventListener('message', previousCallback)

  if (windowObjectReference === null || windowObjectReference.closed) {
    /* if the pointer to the window object in memory does not exist
     or if such pointer exists but the window was closed */
    windowObjectReference = window.open(authUrl, NAME, strWindowFeatures)
  }
  /* else the window reference must exist and the window
     is not closed; therefore, we can bring it back on top of any other
     window with the focus() method. There would be no need to re-create
     the window or to reload the referenced resource. */
  if (windowObjectReference) windowObjectReference.focus()
  window.addEventListener('message', callback)
  // save the reference to the callback function
  previousCallback = callback
}
