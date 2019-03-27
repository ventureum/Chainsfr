function onLogin (loginData) {
  return {
    type: 'LOGIN',
    payload: loginData
  }
}

function onLogout () {
  return {
    type: 'LOGOUT'
  }
}

function setNewUserTag (isNewUser) {
  return {
    type: 'SET_NEW_USER_TAG',
    payload: isNewUser
  }
}

export { onLogin, onLogout, setNewUserTag }
