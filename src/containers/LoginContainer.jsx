import React, { Component } from 'react'
import { connect } from 'react-redux'
import LoginComponent from '../components/LoginComponent'
import OnboardingComponent from '../components/OnboardingComponent'
import { onLogin, setNewUserTag } from '../actions/userActions'
import { createCloudWallet, getCloudWallet } from '../actions/walletActions'
import { createLoadingSelector, createErrorSelector } from '../selectors'

class LoginContainer extends Component {
  state = {
    loginData: null
  }

  componentDidUpdate (prevProps) {
    let { error, profile, actionsPending, cloudWalletConnected, onLogin } = this.props

    if (cloudWalletConnected && this.state.loginData) {
      // we have logged in and wallet has been retrieved from drive
      // now invoke onLogin() to register loginData in redux
      onLogin(this.state.loginData)
    }

    if (!error) {
      if (this.state.loginData) {
        // logged in
        if (!cloudWalletConnected && !actionsPending.getCloudWallet) {
          // try to fetch wallet from drive
          this.props.getCloudWallet()
        } else if (cloudWalletConnected) {
          // we have retrieved wallet from drive sucessfully
          // the user is an existing user
          this.props.setNewUserTag(false)
        }
      }
    } else if (error === 'WALLET_NOT_EXIST') {
      if (!profile.newUser) { this.props.setNewUserTag(true) }
    }
  }

  onLogin = (loginData) => {
    this.setState({ loginData: loginData })
  }

  render () {
    let { loginData } = this.state
    let { profile, actionsPending, createCloudWallet } = this.props

    if (loginData &&
        profile.newUser &&
        (!actionsPending.getCloudWallet || actionsPending.createCloudWallet)
    ) {
      return (
        <OnboardingComponent
          createCloudWallet={createCloudWallet}
          profile={loginData}
          actionsPending={actionsPending}
        />)
    }
    return (
      <LoginComponent
        onLogin={this.onLogin}
        actionsPending={actionsPending}
      />)
  }
}

const createCloudWalletSelector = createLoadingSelector(['CREATE_CLOUD_WALLET'])
const getCloudWalletSelector = createLoadingSelector(['GET_CLOUD_WALLET'])
const errorSelector = createErrorSelector(['CREATE_CLOUD_WALLET', 'GET_CLOUD_WALLET'])

const mapStateToProps = state => {
  return {
    profile: state.userReducer.profile,
    cloudWalletConnected: state.walletReducer.wallet.drive.connected,
    actionsPending: {
      createCloudWallet: createCloudWalletSelector(state),
      getCloudWallet: getCloudWalletSelector(state)
    },
    error: errorSelector(state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onLogin: loginData => dispatch(onLogin(loginData)),
    createCloudWallet: password => dispatch(createCloudWallet(password)),
    getCloudWallet: () => dispatch(getCloudWallet()),
    setNewUserTag: (isNewUser) => dispatch(setNewUserTag(isNewUser))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginContainer)
