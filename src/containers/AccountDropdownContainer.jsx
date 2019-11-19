// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import AccountDropdownComponent from '../components/AccountDropdownComponent'
import utils from '../utils'

type Props = {
  // param passed in
  prefilledAccount: {
    walletType: string,
    cryptoType: string,
    address: string
  },
  cryptoPrice: {[string]: Number},
  currency: string,
  onChange: Function,
  filterCriteria: Function,
  // redux function & states
  cryptoAccounts: Array<Object>,
  actionsPending: Object,
  error: Object
}

type State = {
  account: ?Object
}

class AccountDropdownContainer extends Component<Props, State> {
  state = { account: null }

  onChange = (event) => {
    // update internal state
    this.setState({ account: event.target.value })

    // notify changes
    this.props.onChange(event)
  }

  componentDidUpdate (prevProps) {
    const { prefilledAccount, cryptoAccounts, actionsPending } = this.props
    if (prevProps.actionsPending.getCryptoAccounts && !actionsPending.getCryptoAccounts &&
    prefilledAccount && cryptoAccounts.length > 0) {
      // set prefilled account after fetching accounts
      this.onChange({ target: { value: cryptoAccounts.find(item => {
        return utils.accountsEqual(item, prefilledAccount)
      }) || null } })
    }
  }

  render () {
    const { cryptoAccounts, actionsPending, cryptoPrice, currency, error } = this.props
    const { account } = this.state
    let { filterCriteria } = this.props
    if (!filterCriteria) {
      // default not filtering
      filterCriteria = () => true
    }
    return (
      <AccountDropdownComponent
        account={account}
        cryptoAccounts={cryptoAccounts.filter(filterCriteria)}
        onChange={this.onChange}
        toCurrencyAmount={(balanceInStandardUnit, cryptoType) => utils.toCurrencyAmount(balanceInStandardUnit, cryptoPrice[cryptoType], currency)}
        pending={actionsPending.getCryptoAccounts}
        error={error}
      />
    )
  }
}

const getCryptoAccountsSelector = createLoadingSelector(['GET_CRYPTO_ACCOUNTS'])
const errorSelector = createErrorSelector(['GET_CRYPTO_ACCOUNTS'])

const mapStateToProps = state => {
  return {
    cryptoAccounts: state.accountReducer.cryptoAccounts,
    cryptoPrice: state.cryptoPriceReducer.cryptoPrice,
    currency: state.cryptoPriceReducer.currency,
    actionsPending: {
      getCryptoAccounts: getCryptoAccountsSelector(state)
    },
    error: errorSelector(state)
  }
}


export default connect(
  mapStateToProps
)(AccountDropdownContainer)
