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
import { addCryptoAccount } from '../actions/accountActions.js'
import { clearError } from '../actions/userActions'

type Props = {
  actionsPending: Object,
  verifyAccount: Function,
  clearError: Function,
  errors: Object,
  checkWalletConnection: Function,
  open: boolean,
  handleClose: Function,
  newCryptoAccount: Object,
  newCryptoAccountFromWallet: Function,
  addCryptoAccount: Function,
  online: boolean
}

class AddAccountModalContainer extends Component<Props> {
  onSubmit = accountData => {
    const { addCryptoAccount, handleClose } = this.props
    addCryptoAccount(accountData)
    handleClose()
  }

  componentWillUnmount () {
    this.props.clearError()
  }

  render () {
    const {
      actionsPending,
      open,
      handleClose,
      newCryptoAccountFromWallet,
      checkWalletConnection,
      newCryptoAccount,
      errors,
      online
    } = this.props
    return (
      <AddAccountModalComponent
        actionsPending={actionsPending}
        checkWalletConnection={checkWalletConnection}
        open={open}
        handleClose={handleClose}
        onSubmit={this.onSubmit}
        onConnect={newCryptoAccountFromWallet}
        newCryptoAccount={newCryptoAccount}
        errors={errors}
        online={online}
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
    addCryptoAccount: accountData => dispatch(addCryptoAccount(accountData)),
    clearError: () => dispatch(clearError())
  }
}

const mapStateToProps = state => {
  return {
    actionsPending: {
      checkWalletConnection: checkWalletConnectionSelector(state),
      newCryptoAccountFromWallet: newCryptoAccountFromWalletSelector(state)
    },
    errors: {
      checkWalletConnection: checkWalletConnectionErrorSelector(state),
      newCryptoAccountFromWallet: newCryptoAccountFromWalletErrorSelector(state)
    },
    newCryptoAccount: state.accountReducer.newCryptoAccountFromWallet,
    newCryptoAccountFromWalletError: newCryptoAccountFromWalletErrorSelector(state)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AddAccountModalContainer)
