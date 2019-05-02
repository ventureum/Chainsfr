import React, { Component } from 'react'
import { connect } from 'react-redux'
import CloudWalletUnlockComponent from '../components/CloudWalletUnlockComponent'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import { decryptCloudWallet, unlockCloudWallet } from '../actions/walletActions'

/*
 *   This module is used for unlocking/decrypting drive wallet
 *   Usage:
 *   First check if the wallet is unlocked by looking at privateKey
 *   If not, dispatch redux action UNLOCK_CLOUD_WALLET with the following
 *   payload
 *   {
 *     cryptoType: string
 *     onClose: Function
 *   }
 *   It is recommanded to set onClose to be the function that dispatched the action
 *   e.g.
 *
 *   handleNext = () => {
 *      let unlocked = ... // check if privateKey exists
 *      if (!unlocked) { // this is necessary step
 *        this.props.unlockCloudWallet({cryptoType: ..., onClose: () => this.handleNext()})
 *      } else {
 *        // do something with privateKey
 *      }
 *   }
 */
class CloudWalletUnlockContainer extends Component {
  handleClose = () => {
    this.props.unlockCloudWallet(null)
  }

  handleSubmit = password => {
    let { wallet } = this.props
    if (wallet.unlockRequest) {
      let { cryptoType } = wallet.unlockRequest
      let encryptedWallet =
        cryptoType === 'bitcoin'
          ? wallet.crypto[cryptoType][0].ciphertext
          : wallet.crypto[cryptoType][0]

      this.props.decryptCloudWallet({
        encryptedWallet: encryptedWallet,
        password: password,
        cryptoType: cryptoType
      })
    }
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
    let { wallet, actionsPending } = this.props
    return (
      <CloudWalletUnlockComponent
        open={!!wallet && !!wallet.unlockRequest}
        cryptoType={
          wallet && wallet.unlockRequest && wallet.unlockRequest.cryptoType
        }
        handleClose={this.handleClose}
        handleSubmit={this.handleSubmit}
        actionsPending={actionsPending}
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
    unlockCloudWallet: (unlockRequestParams) => dispatch(unlockCloudWallet(unlockRequestParams)),
    decryptCloudWallet: (wallet) => dispatch(decryptCloudWallet(wallet))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CloudWalletUnlockContainer)
