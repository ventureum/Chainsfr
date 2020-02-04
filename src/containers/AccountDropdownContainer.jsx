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
  purpose: string,
  inputLabel: ?string,
  cryptoPrice: { [string]: Number },
  currency: string,
  onChange: Function,
  filterCriteria: Function,
  online: Boolean,
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
    if (event.target.value === 'addCryptoAccounts') return
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

    if (prevProps.actionsPending.addCryptoAccounts && !actionsPending.addCryptoAccounts && !error) {
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
      inputLabel,
      purpose,
      online
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
          purpose={purpose}
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
