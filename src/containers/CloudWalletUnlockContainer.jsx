import React, { Component } from 'react'
import { connect } from 'react-redux'
import CloudWalletUnlockComponent from '../components/CloudWalletUnlockComponent'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import {
  decryptCloudWallet,
  unlockCloudWallet,
  clearDecryptCloudWalletError
} from '../actions/walletActions'
class CloudWalletUnlockContainer extends Component {
  handleClose = () => {
    this.props.unlockCloudWallet(null)
  }

  handleSubmit = password => {
    let { wallet } = this.props
    // if (wallet.unlockRequest) {
    //   let { cryptoType } = wallet.unlockRequest
    //   this.props.decryptCloudWallet({
    //     encryptedWallet: WalletUtils.toWalletDataFromState('drive', cryptoType, wallet),
    //     password: password
    //   })
    // }
  }

  clearError = () => {
    this.props.clearDecryptCloudWalletError()
  }

  componentDidUpdate (prevProps) {
    let { wallet } = this.props
    let { unlockRequest } = wallet

    if (
      prevProps.actionsPending &&
      prevProps.actionsPending.decryptCloudWallet &&
      !this.props.actionsPending.decryptCloudWallet &&
      !this.props.error
    ) {
      // successfully decrypted the wallet
      // first invoke onClose() passed by other components
      if (unlockRequest.onClose) {
        unlockRequest.onClose()
      }
      // then clear the unlock request
      // by setting it to null
      this.props.unlockCloudWallet(null)
    }
  }

  render () {
    let { wallet, actionsPending, error } = this.props
    return (
      <CloudWalletUnlockComponent
        open={!!wallet && !!wallet.unlockRequest}
        cryptoType={wallet && wallet.unlockRequest && wallet.unlockRequest.cryptoType}
        handleClose={this.handleClose}
        handleSubmit={this.handleSubmit}
        actionsPending={actionsPending}
        error={error}
        clearError={this.clearError}
      />
    )
  }
}

const decryptCloudWalletSelector = createLoadingSelector(['DECRYPT_CLOUD_WALLET'])
const errorSelector = createErrorSelector(['DECRYPT_CLOUD_WALLET'])

const mapStateToProps = state => {
  return {
    wallet: state.walletReducer.wallet.drive,
    actionsPending: {
      decryptCloudWallet: decryptCloudWalletSelector(state)
    },
    error: errorSelector(state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    unlockCloudWallet: unlockRequestParams => dispatch(unlockCloudWallet(unlockRequestParams)),
    decryptCloudWallet: wallet => dispatch(decryptCloudWallet(wallet)),
    clearDecryptCloudWalletError: () => dispatch(clearDecryptCloudWalletError())
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CloudWalletUnlockContainer)
