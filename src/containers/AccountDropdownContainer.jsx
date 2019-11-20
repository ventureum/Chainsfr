// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import AccountDropdownComponent from '../components/AccountDropdownComponent'
import AddAccountModal from './AddAccountModalContainer'
import utils from '../utils'

type Props = {
  // param passed in
  prefilledAccount: {
    walletType: string,
    cryptoType: string,
    address: string
  },
  cryptoPrice: { [string]: Number },
  currency: string,
  onChange: Function,
  filterCriteria: Function,
  // redux function & states
  cryptoAccounts: Array<Object>,
  actionsPending: Object,
  error: Object
}

type State = {
  account: ?Object,
  openAddAccountModal: ?boolean
}

class AccountDropdownContainer extends Component<Props, State> {
  state = { account: null, openAddAccountModal: false }

  onChange = event => {
    if(event.target.value === 'addCryptoAccount') return
    // update internal state
    this.setState({ account: event.target.value })

    // notify changes
    this.props.onChange(event)
  }

  toggleAddAccountModal = () => {
    this.setState({
      openAddAccountModal: !this.state.openAddAccountModal
    })
  }

  componentDidUpdate (prevProps) {
    const { prefilledAccount, cryptoAccounts, actionsPending, error } = this.props
    if (
      prevProps.actionsPending.getCryptoAccounts &&
      !actionsPending.getCryptoAccounts &&
      prefilledAccount &&
      cryptoAccounts.length > 0
    ) {
      // set prefilled account after fetching accounts
      this.onChange({
        target: {
          value:
            cryptoAccounts.find(item => {
              return utils.accountsEqual(item, prefilledAccount)
            }) || null
        }
      })
    }

    if (prevProps.actionsPending.addCryptoAccount && !actionsPending.addCryptoAccount && !error) {
      // just added an account
      // use the newly added account (last item in the cryptoAccounts array)
      this.onChange({target: {value: cryptoAccounts[cryptoAccounts.length - 1]}})
    }
  }

  render () {
    const { cryptoAccounts, actionsPending, cryptoPrice, currency, error } = this.props
    const { account, openAddAccountModal } = this.state
    let { filterCriteria } = this.props
    if (!filterCriteria) {
      // default not filtering
      filterCriteria = () => true
    }
    return (
      <>
        <AccountDropdownComponent
          // only use internal account state for id matching
          // latest account data fetched from redux directly
          account={
            account ? cryptoAccounts.find(_account => utils.accountsEqual(_account, account)) : null
          }
          cryptoAccounts={cryptoAccounts.filter(filterCriteria)}
          onChange={this.onChange}
          toCurrencyAmount={(balanceInStandardUnit, cryptoType) =>
            utils.toCurrencyAmount(balanceInStandardUnit, cryptoPrice[cryptoType], currency)
          }
          addAccount={this.toggleAddAccountModal}
          pending={actionsPending.getCryptoAccounts}
          error={error}
        />
        <AddAccountModal open={openAddAccountModal} handleClose={this.toggleAddAccountModal} />
      </>
    )
  }
}

const addCryptoAccountSelector = createLoadingSelector(['ADD_CRYPTO_ACCOUNT'])
const getCryptoAccountsSelector = createLoadingSelector(['GET_CRYPTO_ACCOUNTS'])
const errorSelector = createErrorSelector(['GET_CRYPTO_ACCOUNTS'])

const mapStateToProps = state => {
  return {
    cryptoAccounts: state.accountReducer.cryptoAccounts,
    cryptoPrice: state.cryptoPriceReducer.cryptoPrice,
    currency: state.cryptoPriceReducer.currency,
    actionsPending: {
      getCryptoAccounts: getCryptoAccountsSelector(state),
      addCryptoAccount: addCryptoAccountSelector(state)
    },
    error: errorSelector(state)
  }
}

export default connect(mapStateToProps)(AccountDropdownContainer)
