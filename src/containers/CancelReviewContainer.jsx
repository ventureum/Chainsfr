import React, { Component } from 'react'

import { connect } from 'react-redux'
import moment from 'moment'
import CancelReviewComponent from '../components/CancelReviewComponent'
import { getTransfer, cancelTransfer, getTxFee } from '../actions/transferActions'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import { goToStep } from '../actions/navigationActions'
import { onEscrowPasswordEntered, syncWithNetwork } from '../actions/accountActions'
import utils from '../utils'

class CancelReviewContainer extends Component {
  componentDidMount () {
    let { transferId } = this.props
    if (transferId) {
      this.props.getTransfer(transferId)
    }
  }

  componentDidUpdate (prevProps) {
    let { transfer, actionsPending, error, escrowAccount } = this.props
    let prevActionPending = prevProps.actionsPending
    if (!error && transfer) {
      if (prevActionPending.getTransfer && !actionsPending.getTransfer) {
        // transfer data retrieved, now decrypt escrow account
        this.props.onEscrowPasswordEntered({
          transferId: transfer.transferId,
          account: escrowAccount
        })
      }
    }
  }

  render () {
    const { transfer, cryptoPrice, currency } = this.props
    let sendTime, receiveTime, cancelTime
    if (transfer) sendTime = moment.unix(transfer.sendTimestamp).format('MMM Do YYYY, HH:mm:ss')
    if (transfer && transfer.receiveTxHash)
      receiveTime = moment.unix(transfer.receiveTimestamp).format('MMM Do YYYY, HH:mm:ss')
    if (transfer && transfer.cancelTxHash)
      cancelTime = moment.unix(transfer.cancelTimestamp).format('MMM Do YYYY, HH:mm:ss')
    return (
      <CancelReviewComponent
        {...this.props}
        sendTime={sendTime}
        receiveTime={receiveTime}
        cancelTime={cancelTime}
        toCurrencyAmount={cryptoAmount =>
          utils.toCurrencyAmount(cryptoAmount, cryptoPrice[transfer.cryptoType], currency)
        }
      />
    )
  }
}

const getTransferSelector = createLoadingSelector(['GET_TRANSFER'])
const verifyEscrowAccountPasswordSelector = createLoadingSelector([
  'VERIFY_ESCROW_ACCOUNT_PASSWORD'
])
const gettxFeeSelector = createLoadingSelector(['GET_TX_COST'])
const cancelTransferSelector = createLoadingSelector([
  'CANCEL_TRANSFER',
  'CANCEL_TRANSFER_TRANSACTION_HASH_RETRIEVED'
])
const syncWithNetworkSelector = createLoadingSelector(['SYNC_WITH_NETWORK'])
const errorSelector = createErrorSelector([
  'GET_TRANSFER',
  'VERIFY_ESCROW_ACCOUNT_PASSWORD',
  'CANCEL_TRANSFER',
  'GET_PASSWORD',
  'GET_TX_COST',
  'GET_UTXO_FOR_ESCROW_WALLET'
])

const mapDispatchToProps = dispatch => {
  return {
    getTransfer: id => dispatch(getTransfer(id)), // here we use transferId
    onEscrowPasswordEntered: transferInfo =>
      dispatch(onEscrowPasswordEntered(transferInfo)),
    getTxFee: txRequest => dispatch(getTxFee(txRequest)),
    cancelTransfer: txRequest => dispatch(cancelTransfer(txRequest)),
    syncWithNetwork: txRequest => dispatch(syncWithNetwork(txRequest)),
    goToStep: n => dispatch(goToStep('receive', n))
  }
}

const mapStateToProps = state => {
  return {
    transfer: state.transferReducer.transfer,
    escrowAccount: state.accountReducer.escrowAccount,
    txFee: state.transferReducer.txFee,
    receipt: state.transferReducer.receipt,
    cryptoPrice: state.cryptoPriceReducer.cryptoPrice,
    currency: state.cryptoPriceReducer.currency,
    actionsPending: {
      getTransfer: getTransferSelector(state),
      verifyEscrowAccountPassword: verifyEscrowAccountPasswordSelector(state),
      getTxFee: gettxFeeSelector(state),
      cancelTransfer: cancelTransferSelector(state),
      syncWithNetwork: syncWithNetworkSelector(state)
    },
    error: errorSelector(state)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CancelReviewContainer)
