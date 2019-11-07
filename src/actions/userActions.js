// @flow
import { gapiLoad } from '../drive'
import API from '../apis.js'
import type { Recipient } from '../types/transfer.flow.js'
import type { AccountData } from '../types/account.flow.js'

import { createAccount } from '../accounts/AccountFactory.js'
import { enqueueSnackbar } from './notificationActions.js'
import { updateTransferForm } from '../actions/formActions'
import update from 'immutability-helper'

function onLogin (loginData: any) {
  return {
    type: 'LOGIN',
    payload: loginData
  }
}

function clearError () {
  return { type: 'CLEAR_ERROR' }
}

function refreshAccessToken () {
  return (dispatch: Function, getState: Function) => {
    return dispatch({
      type: 'REFRESH_ACCESS_TOKEN',
      payload: _refreshAccessToken()
    }).catch(error => {
      console.warn('Refresh login session failed')
      console.warn(error)
      // logout user
      dispatch(onLogout())
    })
  }
}

async function _refreshAccessToken () {
  if (!window.gapi || !window.gapi.auth2) {
    await gapiLoad()
  }
  await window.gapi.auth2.init({
    clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
    scope: process.env.REACT_APP_GOOGLE_API_SCOPE,
    discoveryDocs: process.env.REACT_APP_GOOGLE_API_DISCOVERY_DOCS
  })
  let instance = await window.gapi.auth2.getAuthInstance()
  const googleUser = instance.currentUser.get()
  const basicProfile = googleUser.getBasicProfile()
  const authResponse = await googleUser.reloadAuthResponse()
  googleUser.googleId = basicProfile.getId()
  googleUser.tokenObj = authResponse
  googleUser.idToken = authResponse.id_token
  googleUser.accessToken = authResponse.access_token
  googleUser.profileObj = {
    googleId: basicProfile.getId(),
    imageUrl: basicProfile.getImageUrl(),
    email: basicProfile.getEmail(),
    name: basicProfile.getName(),
    givenName: basicProfile.getGivenName(),
    familyName: basicProfile.getFamilyName()
  }
  return googleUser
}

function register (idToken: string) {
  return {
    type: 'REGISTER',
    payload: API.register({ idToken })
  }
}

async function _onLogout () {
  if (window.gapi && window.gapi.auth2) {
    let googleAuth = await window.gapi.auth2.getAuthInstance()
    if (googleAuth && googleAuth.isSignedIn.get()) {
      await googleAuth.signOut()
    }
  }
}

function onLogout () {
  return {
    type: 'LOGOUT',
    payload: _onLogout()
  }
}

function setNewUserTag (isNewUser: boolean) {
  return {
    type: 'SET_NEW_USER_TAG',
    payload: isNewUser
  }
}

function getRecipients () {
  return (dispatch: Function, getState: Function) => {
    const { idToken } = getState().userReducer.profile
    return dispatch({
      type: 'GET_RECIPIENTS',
      payload: API.getRecipients({ idToken })
    })
  }
}

function addRecipient (recipient: Recipient) {
  return (dispatch: Function, getState: Function) => {
    const { idToken } = getState().userReducer.profile
    const { transferForm } = getState().formReducer
    return dispatch({
      type: 'ADD_RECIPIENT',
      payload: API.addRecipient({ idToken, recipient })
    }).then(() => {
      dispatch(
        enqueueSnackbar({
          message: 'Recipient added successfully.',
          key: new Date().getTime() + Math.random(),
          options: { variant: 'info', autoHideDuration: 3000 }
        })
      )
      dispatch(
        updateTransferForm(
          update(transferForm, {
            destination: { $set: recipient.email },
            receiverName: { $set: recipient.name },
            formError: { destination: { $set: null } }
          })
        )
      )
    })
  }
}

function editRecipient (oldRecipient: Recipient, newRecipient: Recipient) {
  return (dispatch: Function, getState: Function) => {
    const { idToken } = getState().userReducer.profile
    return dispatch({
      type: 'EDIT_RECIPIENT',
      payload: async () => {
        await API.removeRecipient({ idToken, recipient: oldRecipient })
        const result = await API.addRecipient({ idToken, recipient: newRecipient })
        return result
      }
    }).then(() => {
      dispatch(
        enqueueSnackbar({
          message: 'Recipient modified successfully.',
          key: new Date().getTime() + Math.random(),
          options: { variant: 'info', autoHideDuration: 3000 }
        })
      )
    })
  }
}

function removeRecipient (recipient: Recipient) {
  return (dispatch: Function, getState: Function) => {
    const { idToken } = getState().userReducer.profile
    return dispatch({
      type: 'REMOVE_RECIPIENT',
      payload: API.removeRecipient({ idToken, recipient })
    }).then(() => {
      dispatch(
        enqueueSnackbar({
          message: 'Recipient removed successfully.',
          key: new Date().getTime() + Math.random(),
          options: { variant: 'info', autoHideDuration: 3000 }
        })
      )
    })
  }
}

async function _addCryptoAccount (accountData: AccountData): Promise<Array<AccountData>> {
  let cryptoAccounts = (await API.addCryptoAccount(accountData)).cryptoAccounts
  // transform to front-end accountData type
  cryptoAccounts = cryptoAccounts.map(cryptoAccount =>
    createAccount(cryptoAccount).getAccountData()
  )
  return cryptoAccounts
}

function addCryptoAccount (accountData: AccountData) {
  return (dispatch: Function, getState: Function) => {
    return dispatch({
      type: 'ADD_CRYPTO_ACCOUNT',
      payload: _addCryptoAccount(accountData)
    }).then(() => {
      dispatch(
        enqueueSnackbar({
          message: 'Account added successfully.',
          key: new Date().getTime() + Math.random(),
          options: { variant: 'info', autoHideDuration: 3000 }
        })
      )
    })
  }
}

function getCryptoAccounts () {
  return {
    type: 'GET_CRYPTO_ACCOUNTS',
    payload: _getCryptoAccounts()
  }
}

async function _getCryptoAccounts (accountData: AccountData): Promise<Array<AccountData>> {
  let cryptoAccounts = (await API.getCryptoAccounts()).cryptoAccounts
  // transform to front-end accountData type
  cryptoAccounts = cryptoAccounts.map(cryptoAccount =>
    createAccount(cryptoAccount).getAccountData()
  )
  return cryptoAccounts
}

function removeCryptoAccount (accountData: AccountData) {
  return {
    type: 'REMOVE_CRYPTO_ACCOUNT',
    payload: _removeCryptoAccount(accountData)
  }
}

async function _removeCryptoAccount (accountData: AccountData): Promise<Array<AccountData>> {
  let cryptoAccounts = (await API.removeCryptoAccount(accountData)).cryptoAccounts
  // transform to front-end accountData type
  cryptoAccounts = cryptoAccounts.map(cryptoAccount =>
    createAccount(cryptoAccount).getAccountData()
  )
  return cryptoAccounts
}

export {
  clearError,
  register,
  onLogin,
  onLogout,
  setNewUserTag,
  refreshAccessToken,
  getRecipients,
  addRecipient,
  removeRecipient,
  editRecipient,
  getCryptoAccounts,
  addCryptoAccount,
  removeCryptoAccount
}
