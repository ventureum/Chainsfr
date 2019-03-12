import React, { Component } from 'react'
import { connect } from 'react-redux'
import ReceiveReceipt from '../components/ReceiveReceiptComponent'
import { goToStep } from '../actions/navigationActions'

class ReceiveReceiptContainer extends Component {
  render () {
    return (
      <ReceiveReceipt
        {...this.props}
      />
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    goToStep: (n) => dispatch(goToStep('receive', n))
  }
}

const mapStateToProps = state => {
  return {
    cryptoSelection: state.formReducer.cryptoSelection,
    wallet: state.walletReducer.wallet[state.formReducer.walletSelection],
    txCost: state.transferReducer.txCost,
    receipt: state.transferReducer.receipt
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReceiveReceiptContainer)
