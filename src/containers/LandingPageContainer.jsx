import React, { Component } from 'react'

import { connect } from 'react-redux'
import LandingPageComponent from '../components/LandingPageComponent'
import { goToStep } from '../actions/navigationActions'
import { getTransferHistory } from '../actions/transferActions'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import { getCloudWallet } from '../actions/walletActions'
import { setNewUserTag } from '../actions/userActions'

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

const mapStateToProps = state => {
  return {
    transferHistory: state.transferReducer.transferHistory,
    profile: state.userReducer.profile,
    cloudWalletConnected: state.walletReducer.wallet.drive.connected,
    actionsPending: {
      getTransferHistory: getTransferHistorySelector(state),
      getCloudWallet: getCloudWalletSelector(state)
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
    setNewUserTag: (isNewUser) => dispatch(setNewUserTag(isNewUser))

  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LandingPageContainer)
