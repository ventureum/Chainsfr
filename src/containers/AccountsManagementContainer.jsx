import React, { Component } from 'react'
import { connect } from 'react-redux'
import AccountsManagementComponent from '../components/AccountsManagementComponent'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import { getCryptoAccounts, addCryptoAccount, removeCryptoAccount } from '../actions/userActions'
import { accountStatus } from '../types/account.flow'
import { syncWithNetwork } from '../actions/accountAction'
import { push } from 'connected-react-router'
import path from '../Paths.js'

class AccountsManagementContainer extends Component {
  componentDidMount () {
    this.props.getCryptoAccounts()
  }

  componentDidUpdate (prevProps) {
    const { cryptoAccounts, syncWithNetwork, actionsPending } = this.props
    if (
      (prevProps.actionsPending.getCryptoAccounts && !actionsPending.getCryptoAccounts) ||
      (prevProps.actionsPending.removeCryptoAccount && !actionsPending.removeCryptoAccount) ||
      (prevProps.actionsPending.addCryptoAccount && !actionsPending.addCryptoAccount)
    ) {
      cryptoAccounts.forEach(cryptoAccount => {
        if (cryptoAccount.status === accountStatus.initialized) {
          syncWithNetwork(cryptoAccount)
        }
      })
    }
  }

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

const getCryptoAccountsSelector = createLoadingSelector(['GET_CRYPTO_ACCOUNTS'])
const addCryptoAccountSelector = createLoadingSelector(['ADD_CRYPTO_ACCOUNT'])
const removeCryptoAccountSelector = createLoadingSelector(['REMOVE_CRYPTO_ACCOUNT'])

const errorSelector = createErrorSelector(['GET_CRYPTO_ACCOUNTS', 'ADD_CRYPTO_ACCOUNT'])

const mapStateToProps = state => {
  return {
    cryptoAccounts: state.userReducer.cryptoAccounts,
    actionsPending: {
      addCryptoAccount: addCryptoAccountSelector(state),
      getCryptoAccounts: getCryptoAccountsSelector(state),
      removeCryptoAccount: removeCryptoAccountSelector(state)
    },
    error: errorSelector(state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    getCryptoAccounts: () => dispatch(getCryptoAccounts()),
    addCryptoAccount: accountData => dispatch(addCryptoAccount(accountData)),
    syncWithNetwork: accountData => dispatch(syncWithNetwork(accountData)),
    removeCryptoAccount: accountData => dispatch(removeCryptoAccount(accountData)),
    push: path => dispatch(push(path))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AccountsManagementContainer)
