import React, { Component } from 'react'
import { connect } from 'react-redux'
import Receipt from '../components/ReceiptComponent'

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
    gasCost: state.transferReducer.gasCost,
    receipt: state.transferReducer.receipt,
    password: state.formReducer.transferForm.password
  }
}

export default connect(
  mapStateToProps,
  null
)(ReceiptContainer)
