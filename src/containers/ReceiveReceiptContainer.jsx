import React, { Component } from 'react'
import { connect } from 'react-redux'
import ReceiveReceipt from '../components/ReceiveReceiptComponent'

class ReceiveReceiptContainer extends Component {
  render () {
    return (
      <ReceiveReceipt
        {...this.props}
      />
    )
  }
}

const mapStateToProps = state => {
  return {
    cryptoSelection: state.formReducer.cryptoSelection,
    wallet: state.walletReducer.wallet[state.formReducer.walletSelection],
    gasCost: state.transferReducer.gasCost,
    receipt: state.transferReducer.receipt
  }
}

export default connect(
  mapStateToProps,
  null
)(ReceiveReceiptContainer)
