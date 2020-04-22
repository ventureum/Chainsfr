import React, { Component } from 'react'
import { connect } from 'react-redux'
import ReceiveReview from '../components/ReceiveReviewComponent'
import { acceptTransfer, getTxFee } from '../actions/transferActions'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import { syncWithNetwork } from '../actions/accountActions'
import moment from 'moment'
import utils from '../utils'
import { push } from 'connected-react-router'
import path from '../Paths.js'

class ReceiveReviewContainer extends Component {
  componentDidMount () {
    const { escrowAccount, syncWithNetwork } = this.props
    syncWithNetwork(escrowAccount)
  }

  componentDidUpdate (prevProps) {
    if (
      prevProps.actionsPending.syncWithNetwork &&
      !this.props.actionsPending.syncWithNetwork &&
      !this.props.error
    ) {
      this.props.getTxFee({
        fromAccount: this.props.escrowAccount,
        transferAmount: this.props.transfer.transferAmount
      })
    } else if (
      prevProps.actionsPending.acceptTransfer &&
      !this.props.actionsPending.acceptTransfer &&
      !this.props.error
    ) {
      this.props.push(`${path.receive}?step=2&id=${this.props.id}`)
    }
  }

  render () {
    const {
      accountSelection,
      transfer,
      cryptoPrice,
      currency,
      txFee,
      actionsPending,
      error
    } = this.props
    // To prevent crash when transfer is cleared before transit to receipt page
    if (!transfer) return null

    const { sendTimestamp } = transfer
    const toCurrencyAmount = cryptoAmount =>
      utils.toCurrencyAmount(cryptoAmount, cryptoPrice[transfer.cryptoType], currency)

    let destinationAccount = accountSelection
    let sendTime = moment.unix(sendTimestamp).format('MMM Do YYYY, HH:mm:ss')

    let receiveAmount
    if (txFee && transfer) {
      receiveAmount = ['ethereum', 'bitcoin'].includes(transfer.cryptoType)
        ? parseFloat(transfer.transferAmount) - parseFloat(txFee.costInStandardUnit)
        : parseFloat(transfer.transferAmount)
    }

    return (
      <ReceiveReview
        {...this.props}
        destinationAccount={destinationAccount}
        receiveAmount={receiveAmount}
        sendTime={sendTime}
        currencyAmount={{
          // transferCurrencyAmount should not be updated by cryptoPrice
          // tracker
          transferAmount: transfer && utils.formatNumber(transfer.transferCurrencyAmount),
          txFee: txFee && toCurrencyAmount(txFee.costInStandardUnit),
          receiveAmount: receiveAmount && toCurrencyAmount(receiveAmount)
        }}
        proceedable={
          (!actionsPending.syncWithNetwork ||
            !actionsPending.getTxFee ||
            !actionsPending.acceptTransfer) &&
          !error
        }
      />
    )
  }
}

const acceptTransferSelector = createLoadingSelector(['ACCEPT_TRANSFER'])
const getTxFeeSelector = createLoadingSelector(['GET_TX_COST'])
const syncWithNetworkSelector = createLoadingSelector(['SYNC_WITH_NETWORK'])

const errorSelector = createErrorSelector(['ACCEPT_TRANSFER', 'SYNC_WITH_NETWORK'])

const mapDispatchToProps = dispatch => {
  return {
    acceptTransfer: txRequest => dispatch(acceptTransfer(txRequest)),
    getTxFee: txRequest => dispatch(getTxFee(txRequest)),
    syncWithNetwork: accountData => dispatch(syncWithNetwork(accountData)),
    push: path => dispatch(push(path))
  }
}

const mapStateToProps = state => {
  return {
    transfer: state.transferReducer.transfer,
    escrowAccount: state.accountReducer.escrowAccount,
    accountSelection: state.accountReducer.cryptoAccounts.find(_account =>
      utils.accountsEqual(_account, state.formReducer.transferForm.accountId)
    ),
    txFee: state.transferReducer.txFee,
    cryptoPrice: state.cryptoPriceReducer.cryptoPrice,
    currency: state.cryptoPriceReducer.currency,
    actionsPending: {
      acceptTransfer: acceptTransferSelector(state),
      getTxFee: getTxFeeSelector(state),
      syncWithNetwork: syncWithNetworkSelector(state)
    },
    error: errorSelector(state)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReceiveReviewContainer)
