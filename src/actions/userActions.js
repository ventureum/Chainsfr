// @flow
import { gapiLoad } from '../drive'
import API from '../apis.js'
import type { Recipient } from '../types/transfer.flow.js'
import type { UserProfile } from '../types/user.flow.js'
import { enqueueSnackbar } from './notificationActions.js'
import { getCryptoAccounts, getAllEthContracts } from './accountActions'
import { updateTransferForm } from '../actions/formActions'
import update from 'immutability-helper'
import env from '../typedEnv'
import { getWallet, deleteWallet } from '../drive.js'
import { createCloudWallet, clearCloudWalletCryptoAccounts } from './walletActions'
import { GOOGLE_LOGIN_AUTH_OBJ } from '../tests/e2e/mocks/user'
import moment from 'moment'

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

function onGoogleLoginReturn (loginData: any) {
  return (dispatch: Function, getState: Function) => {
    const currentTimestamp = moment().unix()
    loginData = { ...loginData, lastLoginTimestamp: currentTimestamp }
    dispatch({
      type: 'ON_GOOGLE_LOGIN_RETURN',
      payload: loginData
    })
    if (window.tokenRefreshTimer) clearInterval(window.tokenRefreshTimer)
    // refresh in 50 mins
    window.tokenRefreshTimer = setInterval(() => {
      dispatch(refreshAccessToken())
    }, 1000 * 60 * 50)
  }
}

async function _refreshAccessToken () {
  if (env.REACT_APP_ENV === 'test' && env.REACT_APP_E2E_TEST_MOCK_USER) {
    // mock login
    console.log('Mocking login')
    return GOOGLE_LOGIN_AUTH_OBJ
  }
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

async function _onLogout (disconnect?: boolean, deleteAppDataFolder?: boolean) {
  if (window.gapi && window.gapi.auth2) {
    let googleAuth = await window.gapi.auth2.getAuthInstance()
    if (googleAuth && googleAuth.isSignedIn.get()) {
      if (disconnect) {
        if (deleteAppDataFolder) await deleteWallet()
        await googleAuth.disconnect()
      }
      await googleAuth.signOut()
    }
  }
}

function onLogout (disconnect?: boolean, deleteAppDataFolder?: boolean) {
  return {
    type: 'LOGOUT',
    payload: _onLogout(disconnect, deleteAppDataFolder)
  }
}

function setNewUserTag (isNewUser: boolean) {
  return {
    type: 'SET_NEW_USER_TAG',
    payload: isNewUser
  }
}

async function _getRecipients (idToken: string) {
  let recipients = await API.getRecipients({ idToken })
  return recipients
}

function getRecipients () {
  return (dispatch: Function, getState: Function) => {
    const { idToken } = getState().userReducer.profile
    return dispatch({
      type: 'GET_RECIPIENTS',
      payload: _getRecipients(idToken)
    })
  }
}

function addRecipient (
  recipient: Recipient,
  notify?: boolean = true,
  updateForm?: boolean = false
) {
  return (dispatch: Function, getState: Function) => {
    const { idToken } = getState().userReducer.profile
    const { transferForm } = getState().formReducer
    const { recipients } = getState().userReducer
    for (let i = 0; i < recipients.length; i++) {
      const r = recipients[i]
      if (r.email === recipient.email) {
        return dispatch(
          enqueueSnackbar({
            message: 'Contact already exists.',
            key: new Date().getTime() + Math.random(),
            options: { variant: 'error', autoHideDuration: 3000 }
          })
        )
      }
    }
    return dispatch({
      type: 'ADD_RECIPIENT',
      payload: API.addRecipient({ idToken, recipient }),
      // set localErrorHandling to true so we can
      // skip enqueue sucess snackbar and enqueue
      // error snackbar
      meta: { localErrorHandling: true }
    })
      .then(() => {
        if (notify) {
          dispatch(
            enqueueSnackbar({
              message: 'Contact added successfully.',
              key: new Date().getTime() + Math.random(),
              options: { variant: 'success', autoHideDuration: 3000 }
            })
          )
        }
        if (updateForm) {
          dispatch(
            updateTransferForm(
              update(transferForm, {
                destination: { $set: recipient.email },
                receiverName: { $set: recipient.name },
                formError: { destination: { $set: null } }
              })
            )
          )
        }
      })
      .catch(error => {
        dispatch(
          enqueueSnackbar({
            message: error.message,
            key: new Date().getTime() + Math.random(),
            options: { variant: 'info', autoHideDuration: 3000 }
          })
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
      },
      // set localErrorHandling to true so we can
      // skip enqueue sucess snackbar and enqueue
      // error snackbar
      meta: { localErrorHandling: true }
    })
      .then(() => {
        dispatch(
          enqueueSnackbar({
            message: 'Contact modified successfully.',
            key: new Date().getTime() + Math.random(),
            options: { variant: 'success', autoHideDuration: 3000 }
          })
        )
      })
      .catch(error => {
        dispatch(
          enqueueSnackbar({
            message: error.message,
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
      payload: API.removeRecipient({ idToken, recipient }),
      // set localErrorHandling to true so we can
      // skip enqueue sucess snackbar and enqueue
      // error snackbar
      meta: { localErrorHandling: true }
    })
      .then(() => {
        dispatch(
          enqueueSnackbar({
            message: 'Contact removed successfully.',
            key: new Date().getTime() + Math.random(),
            options: { variant: 'success', autoHideDuration: 3000 }
          })
        )
      })
      .catch(error => {
        dispatch(
          enqueueSnackbar({
            message: error.message,
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

async function _getUserCloudWalletFolderMeta () {
  const meta = await API.getUserCloudWalletFolderMeta()
  return meta
}

function getUserCloudWalletFolderMeta () {
  return {
    type: 'GET_UESR_CLOUD_WALLET_FOLDER_META',
    payload: _getUserCloudWalletFolderMeta()
  }
}

async function _getUserRegisterTime () {
  const date = await API.getUserRegisterTime()
  return date
}

function getUserRegisterTime () {
  return {
    type: 'GET_USER_JOIN_DATE',
    payload: _getUserRegisterTime()
  }
}

function postLoginPreparation (loginData: any, progress?: Function) {
  return (dispatch: Function, getState: Function) => {
    const { idToken, profileObj } = loginData
    dispatch(onGoogleLoginReturn(loginData))
    return dispatch({
      type: 'POST_LOGIN_PREPARATION',
      payload: async () => {
        // Must try register before getWallet, getCryptoAccounts, and getRecipients
        const [registerRv] = await Promise.all([
          dispatch(register(idToken, profileObj)),
          dispatch(getAllEthContracts())
        ])
        const userMetaInfo = registerRv.value
        const rv = await getWallet()
        if (!rv) {
          // chainfrWalletFile
          const { masterKey } = userMetaInfo
          // delete old cloud wallet accounts from backend
          await dispatch(clearCloudWalletCryptoAccounts())
          // if chainfr wallet file does not exist
          // create
          await dispatch(createCloudWallet(masterKey))
          const currentTimestamp = moment().unix()
          await dispatch(
            addRecipient(
              {
                name: loginData.profileObj.name,
                email: loginData.profileObj.email,
                imageUrl: loginData.profileObj.imageUrl,
                addedAt: currentTimestamp,
                updatedAt: currentTimestamp,
                imageUrlUpdatedAt: currentTimestamp
              },
              false
            )
          )
        }
        dispatch(getCryptoAccounts())
        dispatch(getRecipients())
        return { userMetaInfo }
      }
    })
  }
}

function preLoginActions () {
  return (dispatch: Function, getState: Function) => {
    return dispatch({
      type: 'PRE_LOGIN_ACTIONS',
      payload: async () => {
        await dispatch(getAllEthContracts())
      }
    })
  }
}

export {
  clearError,
  register,
  onGoogleLoginReturn,
  refreshAccessToken,
  onLogout,
  setNewUserTag,
  getRecipients,
  addRecipient,
  removeRecipient,
  editRecipient,
  setCoinbaseAccessObject,
  getUserCloudWalletFolderMeta,
  getUserRegisterTime,
  postLoginPreparation,
  preLoginActions
}
