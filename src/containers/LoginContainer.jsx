import React, { Component } from 'react'
import { connect } from 'react-redux'
import LoginComponent from '../components/LoginComponent'
import OnboardingComponent from '../components/OnboardingComponent'
import { onLogin, setNewUserTag, register } from '../actions/userActions'
import { createCloudWallet, getCloudWallet } from '../actions/walletActions'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import env from '../typedEnv'

class LoginContainer extends Component {
  componentDidUpdate (prevProps) {
    let { actionsPending } = this.props

    // if (cloudWalletConnected && this.state.loginData) {
    //   // we have logged in and wallet has been retrieved from drive
    //   // now invoke onLogin() to register loginData in redux
    //   onLogin(this.state.loginData)
    // }

    if (prevProps.actionsPending.register && !actionsPending.register) {
      // try to fetch user's cloud wallet after registration
      this.props.getCloudWallet()
    }
  }

  onLogin = loginData => {
    // this is what happens after Google login successfully
    // store loginData into redux
    this.props.onLogin(loginData)
    // register user
    this.props.register(loginData.idToken)
  }

  render () {
    let { profile, actionsPending, createCloudWallet, error } = this.props

    if (error === 'WALLET_NOT_EXIST') {
      return (
        <OnboardingComponent
          createCloudWallet={createCloudWallet}
          profile={profile}
          actionsPending={actionsPending}
        />
      )
    }

    // if (
    //   profile.idToken &&
    //   profile.newUser &&
    //   (!actionsPending.getCloudWallet || actionsPending.createCloudWallet)
    // ) {
    //   return (
    //     <OnboardingComponent
    //       createCloudWallet={createCloudWallet}
    //       profile={profile}
    //       actionsPending={actionsPending}
    //     />
    //   )
    // }
    return (
      <LoginComponent
        onLogin={this.onLogin}
        actionsPending={actionsPending}
        isMainNet={env.REACT_APP_ENV === 'prod'}
      />
    )
  }
}

const registerSelector = createLoadingSelector(['REGISTER'])
const createCloudWalletSelector = createLoadingSelector(['CREATE_CLOUD_WALLET'])
const getCloudWalletSelector = createLoadingSelector(['GET_CLOUD_WALLET'])
const errorSelector = createErrorSelector(['CREATE_CLOUD_WALLET', 'GET_CLOUD_WALLET', 'REGISTER'])

const mapStateToProps = state => {
  return {
    profile: state.userReducer.profile,
    cloudWalletConnected: state.userReducer.cloudWalletConnected,
    actionsPending: {
      register: registerSelector(state),
      createCloudWallet: createCloudWalletSelector(state),
      getCloudWallet: getCloudWalletSelector(state)
    },
    error: errorSelector(state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onLogin: loginData => dispatch(onLogin(loginData)),
    register: idToken => dispatch(register(idToken)),
    createCloudWallet: (password, progress) => dispatch(createCloudWallet(password, progress)),
    getCloudWallet: () => dispatch(getCloudWallet()),
    setNewUserTag: isNewUser => dispatch(setNewUserTag(isNewUser))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginContainer)
