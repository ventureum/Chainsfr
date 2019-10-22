// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import Receipt from '../components/ReceiptComponent'
import { goToStep, backToHome } from '../actions/navigationActions'
import moment from 'moment'
import utils from '../utils'

type Props = {
  wallet: Object,
  txFee: Object,
  receipt: Object,
  password: string,
  cryptoPrice: Object,
  currency: string,
  backToHome: Function
}

class ReceiptContainer extends Component<Props> {
  render () {
    const { receipt, cryptoPrice, currency, txFee, backToHome, password } = this.props
    const { accountSelection } = receipt
    const sendTime = moment.unix(receipt.sendTimestamp).format('MMM Do YYYY, HH:mm:ss')
    const toCurrencyAmount = cryptoAmount =>
      utils.toCurrencyAmount(cryptoAmount, cryptoPrice[accountSelection.cryptoType], currency)
    return (
      <Receipt
        backToHome={backToHome}
        txFee={txFee}
        password={password}
        receipt={receipt}
        sendTime={sendTime}
        currencyAmount={{
          transferAmount: receipt && toCurrencyAmount(receipt.transferAmount),
          txFee: txFee && toCurrencyAmount(txFee.costInStandardUnit)
        }}
      />
    )
  }
}

const mapStateToProps = state => {
  return {
    txFee: state.transferReducer.txFee,
    receipt: { ...state.formReducer.transferForm, ...state.transferReducer.receipt },
    password: state.formReducer.transferForm.password,
    cryptoPrice: state.cryptoPriceReducer.cryptoPrice,
    currency: state.cryptoPriceReducer.currency
  }
}

const mapDispatchToProps = dispatch => {
  return {
    goToStep: n => dispatch(goToStep('send', n)),
    backToHome: () => dispatch(backToHome())
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReceiptContainer)
