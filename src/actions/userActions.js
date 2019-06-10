// @flow
import { gapiLoad } from '../drive'
function onLogin (loginData: any) {
  return {
    type: 'LOGIN',
    payload: loginData
  }
}

function refreshAccessToken () {
  return {
    type: 'REFRESH_ACCESS_TOKEN',
    payload: _refreshAccessToken()
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

async function _onLogout () {
  let googleAuth = await window.gapi.auth2.getAuthInstance()
  if (googleAuth && googleAuth.isSignedIn.get()) {
    await googleAuth.signOut()
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

export { onLogin, onLogout, setNewUserTag, refreshAccessToken }
