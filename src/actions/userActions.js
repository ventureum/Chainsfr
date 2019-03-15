function onLogin (loginData) {
  return {
    type: 'LOGIN',
    payload: {
      profile: {
        ...loginData,
        isAuthenticated: true
      }
    }
  }
}

function onLogout () {
  return {
    type: 'LOGOUT'
  }
}

export { onLogin, onLogout }
