// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'

import AddAccountModalComponent from '../components/AddAccountModalComponent'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import {
  verifyAccount,
  checkWalletConnection,
  newCryptoAccountFromWallet
} from '../actions/walletActions'
import { addCryptoAccount } from '../actions/userActions.js'

type Props = {
  actionsPending: Object,
  verifyAccount: Function,
  checkWalletConnectionError: string,
  newCryptoAccountFromWalletError: string,
  checkWalletConnection: Function,
  open: boolean,
  handleClose: Function,
  newCryptoAccount: Object,
  newCryptoAccountFromWallet: Function,
  addCryptoAccount: Function
}

class AddAccountModalContainer extends Component<Props> {
  checkWalletConnection = () => {
    this.props.checkWalletConnection()
  }

  onSubmit = accountData => {
    const { addCryptoAccount, handleClose } = this.props
    addCryptoAccount(accountData)
    handleClose()
  }

  render () {
    const {
      actionsPending,
      open,
      handleClose,
      newCryptoAccountFromWallet,
      checkWalletConnectionError,
      checkWalletConnection,
      newCryptoAccount,
      newCryptoAccountFromWalletError
    } = this.props
    return (
      <AddAccountModalComponent
        actionsPending={actionsPending}
        checkWalletConnection={checkWalletConnection}
        open={open}
        handleClose={handleClose}
        onSubmit={this.onSubmit}
        onConnect={newCryptoAccountFromWallet}
        checkWalletConnectionError={checkWalletConnectionError}
        newCryptoAccount={newCryptoAccount}
        newCryptoAccountFromWalletError={newCryptoAccountFromWalletError}
      />
    )
  }
}

const checkWalletConnectionSelector = createLoadingSelector(['CHECK_WALLET_CONNECTION'])
const newCryptoAccountFromWalletSelector = createLoadingSelector(['NEW_CRYPTO_ACCOUNT_FROM_WALLET'])

const checkWalletConnectionErrorSelector = createErrorSelector(['CHECK_WALLET_CONNECTION'])
const newCryptoAccountFromWalletErrorSelector = createErrorSelector([
  'NEW_CRYPTO_ACCOUNT_FROM_WALLET'
])

const mapDispatchToProps = dispatch => {
  return {
    verifyAccount: (accountData, options) => dispatch(verifyAccount(accountData, options)),
    checkWalletConnection: (accountData, options) =>
      dispatch(checkWalletConnection(accountData, options)),
    newCryptoAccountFromWallet: (name, cryptoType, walletType, options) =>
      dispatch(newCryptoAccountFromWallet(name, cryptoType, walletType, options)),
    addCryptoAccount: accountData => dispatch(addCryptoAccount(accountData))
  }
}

const mapStateToProps = state => {
  return {
    actionsPending: {
      checkWalletConnection: checkWalletConnectionSelector(state),
      newCryptoAccountFromWallet: newCryptoAccountFromWalletSelector(state)
    },
    checkWalletConnectionError: checkWalletConnectionErrorSelector(state),
    newCryptoAccount: state.userReducer.newCryptoAccountFromWallet,
    newCryptoAccountFromWalletError: newCryptoAccountFromWalletErrorSelector(state)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddAccountModalContainer)
