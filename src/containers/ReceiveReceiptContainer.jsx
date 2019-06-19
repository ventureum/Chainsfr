import React, { Component } from 'react'
import { connect } from 'react-redux'
import ReceiveReceipt from '../components/ReceiveReceiptComponent'
import { goToStep, backToHome } from '../actions/navigationActions'
import moment from 'moment'

class ReceiveReceiptContainer extends Component {
  render () {
    const receiveTime = moment.unix(this.props.receipt.receiveTimestamp).format('MMM Do YYYY, HH:mm:ss')
    return (
      <ReceiveReceipt
        {...this.props}
        receiveTime={receiveTime}
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
    receipt: state.transferReducer.receipt
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReceiveReceiptContainer)
