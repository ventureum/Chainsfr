import React, { Component } from 'react'

import { connect } from 'react-redux'
import LandingPageComponent from '../components/LandingPageComponent'
import { goToStep } from '../actions/navigationActions'
import { getTransferHistory } from '../actions/transferActions'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import { getCloudWallet } from '../actions/walletActions'

class LandingPageContainer extends Component {
  componentDidMount () {
    if (this.props.profile.isAuthenticated) {
      if (!this.props.cloudWallet.connected) this.props.getCloudWallet()
      // load transfer history for logged-in users
      this.props.getTransferHistory()
    }
  }

  render () {
    return (
      <LandingPageComponent
        {...this.props}
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
    cloudWalletConnected: state.walletReducer.wallet.cloudWallet.connected,
    actionsPending: {
      getTransferHistory: getTransferHistorySelector(state),
      getCloudWallet: getCloudWalletSelector(state)
    },
    cloudWallet: state.walletReducer.wallet.cloudWallet,
    error: errorSelector(state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    goToStep: (n) => dispatch(goToStep('send', n)),
    getCloudWallet: () => dispatch(getCloudWallet()),
    getTransferHistory: () => dispatch(getTransferHistory())
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LandingPageContainer)
