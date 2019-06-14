import React, { Component } from 'react'
import { connect } from 'react-redux'
import CancelReceipt from '../components/CancelReceiptComponent'
import { goToStep, backToHome } from '../actions/navigationActions'
import moment from 'moment'

class CancelReceiptContainer extends Component {
  render () {
    const { receipt } = this.props
    const cancelTime = moment.unix(receipt.cancelTimestamp).format('MMM Do YYYY, HH:mm:ss')
    return (
      <CancelReceipt
        {...this.props}
        cancelTime={cancelTime}
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
    txFee: state.transferReducer.txFee
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CancelReceiptContainer)
