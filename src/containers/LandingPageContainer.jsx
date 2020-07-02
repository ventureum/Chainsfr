import React, { Component } from 'react'

import { connect } from 'react-redux'
import LandingPageComponent from '../components/LandingPageComponent'
import { getEmailTransferHisotry, getTransferPassword } from '../actions/transferActions'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import utils from '../utils'
import { push } from 'connected-react-router'
import { enqueueSnackbar } from '../actions/notificationActions.js'

class LandingPageContainer extends Component {
  componentDidMount () {
    const { getEmailTransferHisotry } = this.props
    // load transfer history for logged-in users
    getEmailTransferHisotry(true)
  }

  loadMoreTransferHistory = () => {
    this.props.getEmailTransferHisotry(false)
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

const getEmailTransferHistorySelector = createLoadingSelector(['GET_EMAIL_TRANSFER_HISTORY'])
const errorSelector = createErrorSelector(['GET_EMAIL_TRANSFER_HISTORY'])

const mapStateToProps = state => {
  return {
    transferHistory: state.transferReducer.transferHistory,
    actionsPending: {
      getEmailTransferHistory: getEmailTransferHistorySelector(state)
    },
    cryptoPrice: state.cryptoPriceReducer.cryptoPrice,
    currency: state.cryptoPriceReducer.currency,
    error: errorSelector(state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    getEmailTransferHisotry: fromStart => dispatch(getEmailTransferHisotry(fromStart)),
    getTransferPassword: transferId => dispatch(getTransferPassword(transferId)),
    enqueueSnackbar: payload => dispatch(enqueueSnackbar(payload)),
    push: path => dispatch(push(path))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LandingPageContainer)
