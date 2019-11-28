import React, { Component } from 'react'
import { connect } from 'react-redux'
import ReceiveReceipt from '../components/ReceiveReceiptComponent'
import { goToStep, backToHome } from '../actions/navigationActions'
import moment from 'moment'
import utils from '../utils'

class ReceiveReceiptContainer extends Component {
  render () {
    const { receipt, transfer, txFee, cryptoPrice, currency } = this.props
    const receiveTime = moment.unix(this.props.receipt.receiveTimestamp).format('MMM Do YYYY, HH:mm:ss')
    const toCurrencyAmount = (cryptoAmount) =>
      utils.toCurrencyAmount(cryptoAmount, cryptoPrice[transfer.cryptoType], currency)
    let receiveAmount
    if (transfer) {
      receiveAmount = ['ethereum', 'bitcoin'].includes(transfer.cryptoType)
        ? parseFloat(transfer.transferAmount) - parseFloat(txFee.costInStandardUnit)
        : parseFloat(transfer.transferAmount)
    }

    return (
      <ReceiveReceipt
        {...this.props}
        receiveAmount={receiveAmount}
        receiveTime={receiveTime}
        currencyAmount={{
          transferAmount: receipt && toCurrencyAmount(transfer.transferAmount),
          txFee: txFee && toCurrencyAmount(txFee.costInStandardUnit),
          receiveAmount: receiveAmount && toCurrencyAmount(receiveAmount)
        }}
      />
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    goToStep: (n) => dispatch(goToStep('receive', n)),
    backToHome: () => dispatch(backToHome())
  }
}

const mapStateToProps = state => {
  return {
    cryptoSelection: state.formReducer.cryptoSelection,
    txFee: state.transferReducer.txFee,
    transfer: state.transferReducer.transfer,
    receipt: state.transferReducer.receipt,
    cryptoPrice: state.cryptoPriceReducer.cryptoPrice,
    currency: state.cryptoPriceReducer.currency
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReceiveReceiptContainer)
