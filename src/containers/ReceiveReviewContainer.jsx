import React, { Component } from 'react'
import { connect } from 'react-redux'
import ReceiveReview from '../components/ReceiveReviewComponent'
import { acceptTransfer, getTxFee } from '../actions/transferActions'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import { goToStep } from '../actions/navigationActions'
// import WalletUtils from '../wallets/utils'
import moment from 'moment'
import utils from '../utils'

class ReceiveReviewContainer extends Component {
  componentDidMount () {
    const { transfer, escrowAccount } = this.props
    this.props.getTxFee({
      fromAccount: escrowAccount,
      transferAmount: transfer.transferAmount
    })
  }

  render () {
    const { accountSelection, transfer, cryptoPrice, currency, txFee } = this.props
    const { sendTimestamp } = transfer
    const toCurrencyAmount = cryptoAmount =>
      utils.toCurrencyAmount(cryptoAmount, cryptoPrice[transfer.cryptoType], currency)

    let destinationAddress = accountSelection.address
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
        destinationAddress={destinationAddress}
        receiveAmount={receiveAmount}
        sendTime={sendTime}
        currencyAmount={{
          transferAmount: transfer && toCurrencyAmount(transfer.transferAmount),
          txFee: txFee && toCurrencyAmount(txFee.costInStandardUnit),
          receiveAmount: receiveAmount && toCurrencyAmount(receiveAmount)
        }}
      />
    )
  }
}

const acceptTransferSelector = createLoadingSelector(['ACCEPT_TRANSFER'])
const getTxFeeSelector = createLoadingSelector(['GET_TX_COST'])

const errorSelector = createErrorSelector(['ACCEPT_TRANSFER'])

const mapDispatchToProps = dispatch => {
  return {
    acceptTransfer: txRequest => dispatch(acceptTransfer(txRequest)),
    getTxFee: txRequest => dispatch(getTxFee(txRequest)),
    goToStep: n => dispatch(goToStep('receive', n))
  }
}

const mapStateToProps = state => {
  return {
    transfer: state.transferReducer.transfer,
    escrowAccount: state.accountReducer.escrowAccount,
    accountSelection: state.formReducer.transferForm.accountSelection,
    txFee: state.transferReducer.txFee,
    cryptoPrice: state.cryptoPriceReducer.cryptoPrice,
    currency: state.cryptoPriceReducer.currency,
    actionsPending: {
      acceptTransfer: acceptTransferSelector(state),
      getTxFee: getTxFeeSelector(state)
    },
    error: errorSelector(state)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ReceiveReviewContainer)
