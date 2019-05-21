// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import Receipt from '../components/ReceiptComponent'
import { goToStep, backToHome } from '../actions/navigationActions'
import moment from 'moment'

type Props = {
  goToStep: Function,
  cryptoSelection: string,
  wallet: Object,
  txCost: Object,
  receipt: Object,
  password: string
}

class ReceiptContainer extends Component<Props> {
  render () {
    const { receipt } = this.props
    const sendTime = moment.unix(receipt.sendTimestamp).format('MMM Do YYYY, HH:mm:ss')
    return (
      <Receipt
        {...this.props}
        sendTime={sendTime}
      />
    )
  }
}

const mapStateToProps = state => {
  return {
    cryptoSelection: state.formReducer.cryptoSelection,
    wallet: state.walletReducer.wallet[state.formReducer.walletSelection],
    txCost: state.transferReducer.txCost,
    receipt: state.transferReducer.receipt,
    password: state.formReducer.transferForm.password
  }
}

const mapDispatchToProps = dispatch => {
  return {
    goToStep: (n) => dispatch(goToStep('send', n)),
    backToHome: () => dispatch(backToHome())
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReceiptContainer)
