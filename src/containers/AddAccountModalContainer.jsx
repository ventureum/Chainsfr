// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import AddAccountModalComponent from '../components/AddAccountModalComponent'
import { newCryptoAccountsFromWallet } from '../actions/walletActions'
import { addCryptoAccounts } from '../actions/accountActions.js'
import { clearError } from '../actions/userActions'

type Props = {
  clearError: Function,
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

  componentWillUnmount () {
    this.props.clearError()
  }

  render () {
    const { open, handleClose, newCryptoAccountsFromWallet, newCryptoAccounts, online } = this.props
    return (
      <AddAccountModalComponent
        open={open}
        handleClose={handleClose}
        onSubmit={this.onSubmit}
        onConnect={newCryptoAccountsFromWallet}
        newCryptoAccounts={newCryptoAccounts}
        online={online}
      />
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    newCryptoAccountsFromWallet: (name, cryptoType, walletType, platformType) =>
      dispatch(newCryptoAccountsFromWallet(name, cryptoType, walletType, platformType)),
    addCryptoAccounts: accountData => dispatch(addCryptoAccounts(accountData)),
    clearError: () => dispatch(clearError())
  }
}

const mapStateToProps = state => {
  return {
    newCryptoAccounts: state.accountReducer.newCryptoAccountsFromWallet
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AddAccountModalContainer)
