// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import AccountDropdownComponent from '../components/AccountDropdownComponent'
import { getCryptoAccounts } from '../actions/userActions'
import utils from '../utils'

type Props = {
  // param passed in
  prefilledAccount: {
    walletType: string,
    cryptoType: string,
    address: string
  },
  onChange: Function,
  filterCriteria: Function,
  // redux function & states
  cryptoAccounts: Array<Object>,
  getCryptoAccounts: Function,
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

  componentDidMount () {
    this.props.getCryptoAccounts()
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
    const { cryptoAccounts, actionsPending, error } = this.props
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
        pending={actionsPending.getCryptoAccounts}
        error={error}
      />
    )
  }
}

const getCryptoAccountsSelector = createLoadingSelector(['GET_CRYPTO_ACCOUNTS'])

const errorSelector = createErrorSelector(['GET_CRYPTO_ACCOUNTS', 'ADD_CRYPTO_ACCOUNT'])

const mapStateToProps = state => {
  return {
    cryptoAccounts: state.accountReducer.cryptoAccounts,
    actionsPending: {
      getCryptoAccounts: getCryptoAccountsSelector(state)
    },
    error: errorSelector(state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    getCryptoAccounts: () => dispatch(getCryptoAccounts())
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AccountDropdownContainer)
