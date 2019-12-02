// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import AccountDropdownComponent from '../components/AccountDropdownComponent'
import AddAccountModal from './AddAccountModalContainer'
import utils from '../utils'

type Props = {
  // param passed in
  accountId: {
    walletType: string,
    cryptoType: string,
    address: string
  },
  inputLabel: ?string,
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
  openAddAccountModal: ?boolean
}

class AccountDropdownContainer extends Component<Props, State> {
  state = { openAddAccountModal: false }

  onChange = event => {
    if (event.target.value === 'addCryptoAccount') return
    // notify changes
    this.props.onChange(event)
  }

  toggleAddAccountModal = () => {
    this.setState({
      openAddAccountModal: !this.state.openAddAccountModal
    })
  }

  componentDidUpdate (prevProps) {
    const { cryptoAccounts, actionsPending, error } = this.props

    if (prevProps.actionsPending.addCryptoAccount && !actionsPending.addCryptoAccount && !error) {
      // just added an account
      // use the newly added account (last item in the cryptoAccounts array)
      this.onChange({ target: { value: cryptoAccounts[cryptoAccounts.length - 1] } })
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
      inputLabel
    } = this.props
    const { openAddAccountModal } = this.state
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
            accountId
              ? cryptoAccounts.find(_account => utils.accountsEqual(_account, accountId))
              : null
          }
          cryptoAccounts={cryptoAccounts.filter(filterCriteria)}
          onChange={this.onChange}
          toCurrencyAmount={(balanceInStandardUnit, cryptoType) =>
            utils.toCurrencyAmount(balanceInStandardUnit, cryptoPrice[cryptoType], currency)
          }
          addAccount={this.toggleAddAccountModal}
          pending={actionsPending.getCryptoAccounts}
          error={error}
          inputLabel={inputLabel ? inputLabel : 'Select Account'}
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
