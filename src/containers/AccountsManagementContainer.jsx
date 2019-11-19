import React, { Component } from 'react'
import { connect } from 'react-redux'
import AccountsManagementComponent from '../components/AccountsManagementComponent'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import { addCryptoAccount, removeCryptoAccount } from '../actions/accountActions'
import { push } from 'connected-react-router'
import path from '../Paths.js'

class AccountsManagementContainer extends Component {
  handleTransferFrom = accountData => {
    const { push } = this.props
    push(
      `${path.transfer}?walletSelection=${accountData.walletType}&address=${accountData.address}&cryptoType=${accountData.cryptoType}`
    )
  }

  render () {
    const { addCryptoAccount, actionsPending, cryptoAccounts, removeCryptoAccount } = this.props
    return (
      <AccountsManagementComponent
        cryptoAccounts={cryptoAccounts}
        addCryptoAccount={addCryptoAccount}
        actionsPending={actionsPending}
        removeCryptoAccount={removeCryptoAccount}
        handleTransferFrom={this.handleTransferFrom}
      />
    )
  }
}

const addCryptoAccountSelector = createLoadingSelector(['ADD_CRYPTO_ACCOUNT'])
const removeCryptoAccountSelector = createLoadingSelector(['REMOVE_CRYPTO_ACCOUNT'])

const errorSelector = createErrorSelector(['ADD_CRYPTO_ACCOUNT', 'REMOVE_CRYPTO_ACCOUNT'])

const mapStateToProps = state => {
  return {
    cryptoAccounts: state.accountReducer.cryptoAccounts,
    actionsPending: {
      addCryptoAccount: addCryptoAccountSelector(state),
      removeCryptoAccount: removeCryptoAccountSelector(state)
    },
    error: errorSelector(state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    addCryptoAccount: accountData => dispatch(addCryptoAccount(accountData)),
    removeCryptoAccount: accountData => dispatch(removeCryptoAccount(accountData)),
    push: path => dispatch(push(path))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AccountsManagementContainer)
