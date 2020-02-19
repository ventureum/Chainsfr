// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import AccountDropdownComponent from '../components/AccountDropdownComponent'
import AddAccountModal from './AddAccountModalContainer'
import utils from '../utils'

import type { AccountData } from '../types/account.flow'

type Props = {
  // param passed in
  accountId: {
    walletType: string,
    cryptoType: string,
    address: string
  },
  purpose: string,
  inputLabel: ?string,
  cryptoPrice: { [string]: number },
  currency: string,
  onChange: Function,
  filterCriteria: Function,
  online: Boolean,
  // ad-hoc hide crypto dropdown
  // may be used in receive page
  hideCryptoDropdown: boolean,
  // redux function & states
  cryptoAccounts: Array<Object>,
  actionsPending: Object,
  error: Object,
  online: boolean
}

type State = {
  openAddAccountModal: ?boolean,
  newlyAddedAccount: ?AccountData,
  accountsFetchStarted: boolean
}

class AccountDropdownContainer extends Component<Props, State> {
  state = {
    openAddAccountModal: false,
    newlyAddedAccount: null,
    accountsFetchStarted: false
  }

  accountToGroupedAccount = account => {
    return account
      ? {
          name: account.name,
          walletType: account.walletType,
          platformType: account.platformType,
          accounts: [account]
        }
      : null
  }

  groupedAccountToAccount = groupedAccount => {
    return groupedAccount ? groupedAccount.accounts[0] : null
  }

  // output final account selected
  // account: AccountData
  onChange = event => {
    if (event.target.value === 'addCryptoAccounts') return
    // notify changes
    this.props.onChange(event.target.value)
  }

  toggleAddAccountModal = () => {
    this.setState({
      openAddAccountModal: !this.state.openAddAccountModal
    })
  }

  componentDidUpdate (prevProps) {
    const { cryptoAccounts, actionsPending, error } = this.props

    if (prevProps.actionsPending.addCryptoAccounts && !actionsPending.addCryptoAccounts && !error) {
      // just added an account
      // use the newly added account (last item in the cryptoAccounts array)
      this.setState({ newlyAddedAccount: cryptoAccounts[cryptoAccounts.length - 1] })
    }

    if ((actionsPending.getCryptoAccounts || cryptoAccounts) && !this.state.accountsFetchStarted) {
      // case 1. fetch accounts after mount
      // use actionsPending to check fetch status
      //
      // case 2. accounts already fetched on other page
      // use !!cryptoAccounts to determine fetch status
      this.setState({ accountsFetchStarted: true })
    }
  }

  render () {
    const {
      cryptoAccounts,
      actionsPending,
      cryptoPrice,
      currency,
      error,
      accountId,
      inputLabel,
      purpose,
      online,
      hideCryptoDropdown
    } = this.props
    const { openAddAccountModal, accountsFetchStarted } = this.state
    let { filterCriteria } = this.props
    if (!filterCriteria) {
      // default not filtering
      filterCriteria = () => true
    }

    let filteredCryptoAccounts = cryptoAccounts.filter(filterCriteria)

    // group accounts by walletType, platformType
    let groupedCryptoAccounts = filteredCryptoAccounts.reduce((rv, account) => {
      let key
      if (account.walletType === 'coinbaseOAuthWallet') {
        key = JSON.stringify({ walletType: account.walletType, email: account.email })
      } else {
        key = JSON.stringify({ walletType: account.walletType, platformType: account.platformType })
      }
      rv[key] = rv[key] ? [...rv[key], account] : [account]
      return rv
    }, {})

    // convert obj to array
    groupedCryptoAccounts = Object.entries(groupedCryptoAccounts).map(([key, value]) => {
      const { walletType, platformType } = JSON.parse(key)

      return {
        // use the first name of the account list
        // since all accounts in this group share the same name
        // $FlowFixMe
        name: value.length > 0 ? value[0].name : '',
        walletType,
        platformType,
        accounts: value
      }
    })

    // accountId is specified
    // find the corresponding account selection
    const account = accountId
      ? cryptoAccounts.find(_account => utils.accountsEqual(_account, accountId))
      : null

    // a new account was added, pre-select the new account
    const { newlyAddedAccount } = this.state
    if (newlyAddedAccount) this.setState({ newlyAddedAccount: null })
    const { walletType, platformType, email } = newlyAddedAccount
      ? newlyAddedAccount
      : account || {}

    const groupedAccount =
      // must have non-null account passed-in
      // otherwise set groupedAccount to null
      (account || newlyAddedAccount) &&
      groupedCryptoAccounts.find(
        groupedAccount =>
          (!walletType || walletType === groupedAccount.walletType) &&
          (!platformType || platformType === groupedAccount.platformType) &&
          (!email || (groupedAccount.email && email === groupedAccount.email))
      )

    return (
      <>
        <AccountDropdownComponent
          purpose={purpose}
          // final account selected
          account={account}
          // find groupedAccount which matches account.[walletType, platformType/email]
          // for showing crypto list in the second dropdown
          groupedAccount={groupedAccount}
          // grouped account list, shown in the first dropdown
          groupedCryptoAccounts={groupedCryptoAccounts}
          onChange={this.onChange}
          toCurrencyAmount={(balanceInStandardUnit, cryptoType) =>
            utils.toCurrencyAmount(balanceInStandardUnit, cryptoPrice[cryptoType], currency)
          }
          addAccount={this.toggleAddAccountModal}
          pending={actionsPending.getCryptoAccounts || !accountsFetchStarted}
          error={error}
          inputLabel={inputLabel ? inputLabel : 'Select Account'}
          hideCryptoDropdown={hideCryptoDropdown}
        />
        {openAddAccountModal && (
          <AddAccountModal
            open={openAddAccountModal}
            handleClose={this.toggleAddAccountModal}
            online={online}
          />
        )}
      </>
    )
  }
}

const addCryptoAccountsSelector = createLoadingSelector(['ADD_CRYPTO_ACCOUNTS'])
const getCryptoAccountsSelector = createLoadingSelector(['GET_CRYPTO_ACCOUNTS'])
const errorSelector = createErrorSelector(['GET_CRYPTO_ACCOUNTS'])

const mapStateToProps = state => {
  return {
    cryptoAccounts: state.accountReducer.cryptoAccounts,
    cryptoPrice: state.cryptoPriceReducer.cryptoPrice,
    currency: state.cryptoPriceReducer.currency,
    actionsPending: {
      getCryptoAccounts: getCryptoAccountsSelector(state),
      addCryptoAccounts: addCryptoAccountsSelector(state)
    },
    error: errorSelector(state)
  }
}

export default connect(mapStateToProps)(AccountDropdownContainer)
