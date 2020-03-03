// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import WalletComponent from '../components/WalletComponent'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import { getTxHistoryByAccount } from '../actions/transferActions'
import utils from '../utils'
import { push } from 'connected-react-router'
import type { AccountData } from '../types/account.flow'

type Props = {
  cloudWalletAccounts: Array<AccountData>,
  getTxHistoryByAccount: Function,
  txHistoryByAccount: Object,
  cryptoPrice: Object,
  currency: string,
  actionsPending: {
    getCryptoAccounts: boolean,
    getTransferHistory: boolean
  },
  push: Function,
  online: boolean,
  errors: {
    getCryptoAccounts: boolean,
    getTransferHistory: boolean
  }
}

class WalletContainer extends Component<Props> {
  componentDidMount () {
    let { getTxHistoryByAccount, cloudWalletAccounts } = this.props
    if (cloudWalletAccounts) {
      cloudWalletAccounts.map(account => getTxHistoryByAccount(account))
    }
  }

  componentDidUpdate (prevProps) {
    const { actionsPending } = prevProps
    let { getTxHistoryByAccount, cloudWalletAccounts } = this.props
    if (
      actionsPending.getCryptoAccounts &&
      !this.props.actionsPending.getCryptoAccounts &&
      !this.props.errors.getCryptoAccounts
    ) {
      // get history by account once accounts have been fetched
      cloudWalletAccounts.map(account => getTxHistoryByAccount(account))
    }
  }

  render () {
    let {
      cryptoPrice,
      txHistoryByAccount,
      actionsPending,
      cloudWalletAccounts,
      push,
      online
    } = this.props

    const toCurrencyAmount = (cryptoAmount, cryptoType) =>
      utils.toCurrencyAmount(cryptoAmount, cryptoPrice[cryptoType])

    return (
      <WalletComponent
        cloudWalletAccounts={cloudWalletAccounts}
        txHistoryByAccount={txHistoryByAccount}
        actionsPending={actionsPending}
        toCurrencyAmount={toCurrencyAmount}
        push={push}
        online={online}
      />
    )
  }
}

const getTxHistoryByAccountSelector = createLoadingSelector(['GET_TX_HISTORY_BY_ACCOUNT'])
const getCryptoAccountsSelector = createLoadingSelector(['GET_CRYPTO_ACCOUNTS'])

const getTxHistoryByAccountErrorSelector = createErrorSelector(['GET_TX_HISTORY_BY_ACCOUNT'])
const getCryptoAccountsErrorSelector = createErrorSelector(['GET_CRYPTO_ACCOUNTS'])

const mapStateToProps = state => {
  return {
    cloudWalletAccounts: state.accountReducer.cryptoAccounts.filter(
      account => account.walletType === 'drive'
    ),
    actionsPending: {
      getTxHistoryByAccount: getTxHistoryByAccountSelector(state),
      getCryptoAccounts: getCryptoAccountsSelector(state)
    },
    currency: state.cryptoPriceReducer.currency,
    cryptoPrice: state.cryptoPriceReducer.cryptoPrice,
    txHistoryByAccount: state.transferReducer.txHistoryByAccount,
    errors: {
      getTransferHistory: getTxHistoryByAccountErrorSelector(state),
      getCryptoAccounts: getCryptoAccountsErrorSelector(state)
    }
  }
}

const mapDispatchToProps = dispatch => {
  return {
    getTxHistoryByAccount: account =>
      dispatch(
        getTxHistoryByAccount({
          account
        })
      ),
    push: path => dispatch(push(path))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(WalletContainer)
