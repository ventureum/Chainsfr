// @flow

function onLogin (loginData: any) {
  return {
    type: 'LOGIN',
    payload: loginData
  }
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

export { onLogin, onLogout, setNewUserTag }
