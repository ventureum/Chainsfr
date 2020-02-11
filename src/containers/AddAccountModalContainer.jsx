// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'

import AddAccountModalComponent from '../components/AddAccountModalComponent'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import {
  verifyAccount,
  checkWalletConnection,
  newCryptoAccountsFromWallet
} from '../actions/walletActions'
import { addCryptoAccounts } from '../actions/accountActions.js'
import { clearError } from '../actions/userActions'

type Props = {
  actionsPending: Object,
  verifyAccount: Function,
  clearError: Function,
  errors: Object,
  checkWalletConnection: Function,
  open: boolean,
  handleClose: Function,
  newCryptoAccounts: Object,
  newCryptoAccountsFromWallet: Function,
  addCryptoAccounts: Function,
  online: boolean
}

class AddAccountModalContainer extends Component<Props> {
  onSubmit = (newCryptoAccounts, name) => {
    const { addCryptoAccounts, handleClose } = this.props
    newCryptoAccounts = newCryptoAccounts.map(accountData => {
      return { ...accountData, name: name }
    })
    addCryptoAccounts(newCryptoAccounts)
    handleClose()
  }

  checkWalletConnection = ({ walletType, platformType }) => {
    this.props.checkWalletConnection({ walletType: walletType, cryptoType: platformType })
  }

  componentWillUnmount () {
    this.props.clearError()
  }

  render () {
    const {
      actionsPending,
      open,
      handleClose,
      newCryptoAccountsFromWallet,
      newCryptoAccounts,
      errors,
      online
    } = this.props
    return (
      <AddAccountModalComponent
        actionsPending={actionsPending}
        checkWalletConnection={this.checkWalletConnection}
        open={open}
        handleClose={handleClose}
        onSubmit={this.onSubmit}
        onConnect={newCryptoAccountsFromWallet}
        newCryptoAccounts={newCryptoAccounts}
        errors={errors}
        online={online}
      />
    )
  }
}

const checkWalletConnectionSelector = createLoadingSelector(['CHECK_WALLET_CONNECTION'])
const newCryptoAccountsFromWalletSelector = createLoadingSelector([
  'NEW_CRYPTO_ACCOUNTS_FROM_WALLET'
])

const checkWalletConnectionErrorSelector = createErrorSelector(['CHECK_WALLET_CONNECTION'])
const newCryptoAccountsFromWalletErrorSelector = createErrorSelector([
  'NEW_CRYPTO_ACCOUNTS_FROM_WALLET'
])

const mapDispatchToProps = dispatch => {
  return {
    verifyAccount: (accountData, options) => dispatch(verifyAccount(accountData, options)),
    checkWalletConnection: (accountData, options) =>
      dispatch(checkWalletConnection(accountData, options)),
    newCryptoAccountsFromWallet: (name, cryptoType, walletType, options) =>
      dispatch(newCryptoAccountsFromWallet(name, cryptoType, walletType, options)),
    addCryptoAccounts: accountData => dispatch(addCryptoAccounts(accountData)),
    clearError: () => dispatch(clearError())
  }
}

const mapStateToProps = state => {
  return {
    actionsPending: {
      checkWalletConnection: checkWalletConnectionSelector(state),
      newCryptoAccountsFromWallet: newCryptoAccountsFromWalletSelector(state)
    },
    errors: {
      checkWalletConnection: checkWalletConnectionErrorSelector(state),
      newCryptoAccountsFromWallet: newCryptoAccountsFromWalletErrorSelector(state)
    },
    newCryptoAccounts: state.accountReducer.newCryptoAccountsFromWallet,
    newCryptoAccountsFromWalletError: newCryptoAccountsFromWalletErrorSelector(state)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AddAccountModalContainer)
