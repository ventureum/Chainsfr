import { Base64 } from 'js-base64'

async function _onLogin (loginData) {
  return {
    ...loginData,
    isAuthenticated: true,
    newUser: !wallet
  }
}

async function _setRecoveryPassword (password) {
  // TODO save password in appDataFolder

  return Base64.encode(password)
}

function onLogin (loginData) {
  return {
    type: 'LOGIN',
    payload: _onLogin(loginData)
  }
}

function onLogout () {
  return {
    type: 'LOGOUT'
  }
}

function setRecoveryPassword (password) {
  return {
    type: 'SET_RECOVERY_PASSWORD',
    payload: _setRecoveryPassword(password)
  }
}

export { onLogin, onLogout, setRecoveryPassword }
