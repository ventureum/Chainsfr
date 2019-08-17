// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import Receipt from '../components/ReceiptComponent'
import { goToStep, backToHome } from '../actions/navigationActions'
import moment from 'moment'
import utils from '../utils'

type Props = {
  goToStep: Function,
  cryptoSelection: string,
  wallet: Object,
  txFee: Object,
  receipt: Object,
  password: string,
  cryptoPrice: Object,
  currency: string
}

class ReceiptContainer extends Component<Props> {
  render () {
    const { receipt, cryptoPrice, cryptoSelection, currency, txFee } = this.props
    const sendTime = moment.unix(receipt.sendTimestamp).format('MMM Do YYYY, HH:mm:ss')
    const toCurrencyAmount = (cryptoAmount) => 
      utils.toCurrencyAmount(cryptoAmount, cryptoPrice[cryptoSelection], currency)
    return (
      <Receipt
        {...this.props}
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
    cryptoSelection: state.formReducer.cryptoSelection,
    wallet: state.walletReducer.wallet[state.formReducer.walletSelection],
    txFee: state.transferReducer.txFee,
    receipt: {...state.formReducer.transferForm, ...state.transferReducer.receipt},
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
