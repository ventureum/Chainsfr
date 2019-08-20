import React, { Component } from 'react'
import { connect } from 'react-redux'
import CancelReceipt from '../components/CancelReceiptComponent'
import { goToStep, backToHome } from '../actions/navigationActions'
import moment from 'moment'
import utils from '../utils'

class CancelReceiptContainer extends Component {
  render () {
    const { receipt, cryptoPrice, currency } = this.props
    const cancelTime = moment.unix(receipt.cancelTimestamp).format('MMM Do YYYY, HH:mm:ss')
    return (
      <CancelReceipt
        {...this.props}
        cancelTime={cancelTime}
        toCurrencyAmount={cryptoAmount =>
          utils.toCurrencyAmount(cryptoAmount, cryptoPrice[receipt.cryptoType], currency)
        }
      />
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    goToStep: n => dispatch(goToStep('cancel', n)),
    backToHome: () => dispatch(backToHome())
  }
}

const mapStateToProps = state => {
  return {
    receipt: {...state.transferReducer.transfer, ...state.transferReducer.receipt},
    txFee: state.transferReducer.txFee,
    cryptoPrice: state.cryptoPriceReducer.cryptoPrice,
    currency: state.cryptoPriceReducer.currency
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CancelReceiptContainer)
