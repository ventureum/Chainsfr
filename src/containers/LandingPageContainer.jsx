import React, { Component } from 'react'

import { connect } from 'react-redux'
import LandingPageComponent from '../components/LandingPageComponent'
import { getTransferHistory } from '../actions/transferActions'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import utils from '../utils'
import { push } from 'connected-react-router'

class LandingPageContainer extends Component {
  componentDidMount () {
    const { getTransferHistory } = this.props
    // load transfer history for logged-in users
    getTransferHistory(0)
  }

  loadMoreTransferHistory = offset => {
    this.props.getTransferHistory(offset)
  }

  render () {
    let { cryptoPrice, transferHistory, currency } = this.props

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
      <LandingPageComponent
        {...this.props}
        loadMoreTransferHistory={this.loadMoreTransferHistory}
      />
    )
  }
}

const getTransferHistorySelector = createLoadingSelector(['GET_TRANSFER_HISTORY'])
const errorSelector = createErrorSelector(['GET_TRANSFER_HISTORY'])

const mapStateToProps = state => {
  return {
    transferHistory: state.transferReducer.transferHistory,
    actionsPending: {
      getTransferHistory: getTransferHistorySelector(state)
    },
    cryptoPrice: state.cryptoPriceReducer.cryptoPrice,
    currency: state.cryptoPriceReducer.currency,
    error: errorSelector(state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    getTransferHistory: offset => dispatch(getTransferHistory(offset, 'EMAIL_TRANSFER')),
    push: path => dispatch(push(path))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LandingPageContainer)
