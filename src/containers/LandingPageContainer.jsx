import React, { Component } from 'react'

import { connect } from 'react-redux'
import LandingPageComponent from '../components/LandingPageComponent'
import { goToStep } from '../actions/navigationActions'
import { getTransferHistory } from '../actions/transferActions'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import { getCloudWallet, createCloudWallet } from '../actions/walletActions'
import { setNewUserTag } from '../actions/userActions'
import OnboardingComponent from '../components/OnboardingComponent'

class LandingPageContainer extends Component {
  componentDidMount () {
    const { profile, cloudWallet, getCloudWallet, getTransferHistory } = this.props
    if (profile.isAuthenticated) {
      if (!cloudWallet.connected) getCloudWallet()
      // load transfer history for logged-in users
      getTransferHistory(0)
    }
  }

  loadMoreTransferHistory = (offset) => {
    this.props.getTransferHistory(offset)
  }

  render () {
    let { profile, actionsPending, createCloudWallet, cloudWallet } = this.props
    if (cloudWallet.notFound && !actionsPending.createCloudWallet) {
      return (
        <OnboardingComponent
          createCloudWallet={createCloudWallet}
          profile={profile}
          actionsPending={actionsPending}
        />
      )
    }
    return (
      <LandingPageComponent
        {...this.props}
        loadMoreTransferHistory={this.loadMoreTransferHistory}
      />
    )
  }
}

const getTransferHistorySelector = createLoadingSelector(['GET_TRANSFER_HISTORY'])
const errorSelector = createErrorSelector(['GET_TRANSFER_HISTORY', 'GET_CLOUD_WALLET'])
const getCloudWalletSelector = createLoadingSelector(['GET_CLOUD_WALLET'])
const createCloudWalletSelector = createLoadingSelector(['CREATE_CLOUD_WALLET'])

const mapStateToProps = state => {
  return {
    transferHistory: state.transferReducer.transferHistory,
    profile: state.userReducer.profile,
    cloudWalletConnected: state.walletReducer.wallet.drive.connected,
    actionsPending: {
      getTransferHistory: getTransferHistorySelector(state),
      getCloudWallet: getCloudWalletSelector(state),
      createCloudWallet: createCloudWalletSelector(state)
    },
    cloudWallet: state.walletReducer.wallet.drive,
    error: errorSelector(state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    goToStep: (n) => dispatch(goToStep('send', n)),
    getCloudWallet: () => dispatch(getCloudWallet()),
    getTransferHistory: (offset) => dispatch(getTransferHistory(offset)),
    setNewUserTag: (isNewUser) => dispatch(setNewUserTag(isNewUser)),
    createCloudWallet: password => dispatch(createCloudWallet(password))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LandingPageContainer)
