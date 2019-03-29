import React, { Component } from 'react'
import { connect } from 'react-redux'
import WalletComponent from '../components/WalletComponent'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import { getCloudWallet } from '../actions/walletActions'

class WalletContainer extends Component {
  componentDidMount () {
    let { wallet, getCloudWallet } = this.props
    if (!wallet.connected) {
      getCloudWallet()
    }
  }

  render () {
    let { ...others } = this.props
    return (
      <WalletComponent
        {...others}
      />
    )
  }
}

const getCloudWalletSelector = createLoadingSelector(['GET_CLOUD_WALLET'])
const errorSelector = createErrorSelector(['GET_CLOUD_WALLET'])

const mapStateToProps = state => {
  return {
    wallet: state.walletReducer.wallet.drive,
    actionsPending: {
      getCloudWallet: getCloudWalletSelector(state)
    },
    error: errorSelector(state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    getCloudWallet: () => dispatch(getCloudWallet())
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WalletContainer)
