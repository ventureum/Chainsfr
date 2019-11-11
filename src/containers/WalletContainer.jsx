import React, { Component } from 'react'
import { connect } from 'react-redux'
import WalletComponent from '../components/WalletComponent'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import { getTransferHistory } from '../actions/transferActions'
import { push } from 'connected-react-router'
import utils from '../utils'

class WalletContainer extends Component {
  componentDidMount () {
    let { getTransferHistory } = this.props
    getTransferHistory(0)
  }

  loadMoreTransferHistory = offset => {
    this.props.getTransferHistory(offset)
  }

  render () {
    let { cryptoPrice, transferHistory, currency, actionsPending, cloudWallet } = this.props

    const toCurrencyAmount = (cryptoAmount, cryptoType) =>
      utils.toCurrencyAmount(cryptoAmount, cryptoPrice[cryptoType], currency)

    // add currency value to transferHistory
    transferHistory.history = transferHistory.history.map(transfer => {
      return {
        ...transfer,
        transferCurrencyAmount: toCurrencyAmount(transfer.transferAmount, transfer.cryptoType)
      }
    })

    return (
      <WalletComponent
        cloudWallet={cloudWallet}
        transferHistory={transferHistory}
        actionsPending={actionsPending}
        loadMoreTransferHistory={this.loadMoreTransferHistory}
      />
    )
  }
}

const getTransferHistorySelector = createLoadingSelector(['GET_TRANSFER_HISTORY'])
const errorSelector = createErrorSelector(['GET_TRANSFER_HISTORY'])

const mapStateToProps = state => {
  return {
    cloudWalletAccounts: state.accountReducer.cryptoAccounts.filter(
      account => account.walletType === 'drive'
    ),
    actionsPending: {
      getTransferHistory: getTransferHistorySelector(state)
    },
    currency: state.cryptoPriceReducer.currency,
    cryptoPrice: state.cryptoPriceReducer.cryptoPrice,
    transferHistory: state.transferReducer.transferHistory,
    error: errorSelector(state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    push: path => dispatch(push(path)),
    getTransferHistory: offset => dispatch(getTransferHistory(offset))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WalletContainer)
