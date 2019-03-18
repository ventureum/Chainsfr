import React, { Component } from 'react'
import { connect } from 'react-redux'
import CancelReceipt from '../components/CancelReceiptComponent'
import { goToStep, backToHome } from '../actions/navigationActions'

class CancelReceiptContainer extends Component {
  render () {
    return (
      <CancelReceipt
        {...this.props}
      />
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    goToStep: (n) => dispatch(goToStep('cancel', n)),
    backToHome: () => dispatch(backToHome())
  }
}

const mapStateToProps = state => {
  return {
    receipt: state.transferReducer.receipt,
    txCost: state.transferReducer.txCost
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CancelReceiptContainer)
