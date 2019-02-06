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
    transferForm: state.transferReducer.transferForm,
    metamask: state.userReducer.metamask
  }
}

export default connect(
  mapStateToProps,
  null
)(ReceiptContainer)
