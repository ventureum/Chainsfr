import React, { Component } from 'react'
import { connect } from 'react-redux'
import LoginComponent from './LoginComponent'
import { onLogin } from './actions'

class LoginContainer extends Component {
  constructor () {
    super()
    this.state = { error: null, errorInfo: null }
  }

  componentDidCatch (error, info) {
    this.setState(
      { error: error, errorInfo: info }
    )
  }

  render () {
    let { onLogin, ...others } = this.props
    return (
      <LoginComponent
        onLogin={onLogin}
        {...others}
      />)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onLogin: loginData => dispatch(onLogin(loginData))
  }
}

export default connect(
  null,
  mapDispatchToProps
)(LoginContainer)
