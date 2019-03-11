import React, { Component } from 'react'
import { connect } from 'react-redux'
import Receipt from '../components/ReceiptComponent'
import { goToStep } from '../actions/navigationActions'

class ReceiptContainer extends Component {
  render () {
    return (
      <Receipt
        {...this.props}
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
    goToStep: (n) => dispatch(goToStep('send', n))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReceiptContainer)
