// @flow
import { gapiLoad } from '../drive'
import API from '../apis.js'
import type { Recipient } from '../types/transfer.flow.js'
import type { UserProfile } from '../types/user.flow.js'
import { enqueueSnackbar } from './notificationActions.js'
import { getCryptoAccounts } from './accountActions'
import { updateTransferForm } from '../actions/formActions'
import update from 'immutability-helper'

function onLogin (loginData: any) {
  return (dispatch: Function, getState: Function) => {
    dispatch({
      type: 'LOGIN',
      payload: loginData
    })
    if (window.tokenRefreshTimer) clearTimeout(window.tokenRefreshTimer)
    // refresh in 50 mins
    window.tokenRefreshTimer = setTimeout(() => {
      this.refreshLoginSession()
    }, 1000 * 60 * 50)
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
    })
      .catch(error => {
        console.warn('Refresh login session failed')
        console.warn(error)
        // logout user
        dispatch(onLogout())
      })
      .then(() => {
        dispatch(getCryptoAccounts())
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

function register (idToken: string, userProfile: UserProfile) {
  return {
    type: 'REGISTER',
    payload: API.register(idToken, userProfile)
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

function setCoinbaseAccessObject (accessObject: Object) {
  return {
    type: 'SET_COINBASE_ACCESS_OBJECT',
    payload: accessObject
  }
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
  setCoinbaseAccessObject
}
