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
    cryptoSelection: state.transferReducer.cryptoSelection,
    metamask: state.userReducer.metamask,
    gasCost: state.userReducer.gasCost,
    receipt: state.userReducer.receipt
  }
}

export default connect(
  mapStateToProps,
  null
)(ReceiptContainer)
