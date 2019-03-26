import React, { Component } from 'react'
import { connect } from 'react-redux'
import LoginComponent from '../components/LoginComponent'
import { onLogin, setRecoveryPassword } from '../actions/userActions'

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

const mapStateToProps = state => {
  return {
    profile: state.userReducer.profile
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onLogin: loginData => dispatch(onLogin(loginData)),
    setRecoveryPassword: password => dispatch(setRecoveryPassword(password))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginContainer)
