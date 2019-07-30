import React, { Component } from 'react'
import { connect } from 'react-redux'
import ReceiveReceipt from '../components/ReceiveReceiptComponent'
import { goToStep, backToHome } from '../actions/navigationActions'
import moment from 'moment'
import utils from '../utils'

class ReceiveReceiptContainer extends Component {
  render () {
    const { receipt, txFee, cryptoPrice, currency } = this.props
    const receiveTime = moment.unix(this.props.receipt.receiveTimestamp).format('MMM Do YYYY, HH:mm:ss')
    const toCurrencyAmount = (cryptoAmount) => 
      utils.toCurrencyAmount(cryptoAmount, cryptoPrice[receipt.cryptoType], currency)
    let receiveAmount
    if (receipt) {
      receiveAmount = ['ethereum', 'bitcoin'].includes(receipt.cryptoType)
        ? parseFloat(receipt.transferAmount) - parseFloat(txFee.costInStandardUnit)
        : parseFloat(receipt.transferAmount)
    }

    return (
      <ReceiveReceipt
        {...this.props}
        receiveAmount={receiveAmount}
        receiveTime={receiveTime}
        currencyAmount={{
          transferAmount: receipt && toCurrencyAmount(receipt.transferAmount),
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
    wallet: state.walletReducer.wallet[state.formReducer.walletSelection],
    txFee: state.transferReducer.txFee,
    receipt: state.transferReducer.receipt,
    cryptoPrice: state.cryptoPriceReducer.cryptoPrice,
    currency: state.cryptoPriceReducer.currency
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReceiveReceiptContainer)
