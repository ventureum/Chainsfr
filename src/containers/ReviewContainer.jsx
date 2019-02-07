import React, { Component } from 'react'
import { connect } from 'react-redux'
import Review from '../components/ReviewComponent'
import { submitTx } from '../actions'
import { createLoadingSelector, createErrorSelector } from '../selectors'

class ReviewContainer extends Component {
  render () {
    return (
      <Review
        {...this.props}
      />
    )
  }
}

const submitTxSelector = createLoadingSelector(['SUBMIT_TX', 'TRANSACTION_HASH_RETRIEVED'])
const errorSelector = createErrorSelector(['SUBMIT_TX', 'TRANSACTION_HASH_RETRIEVED'])

const mapDispatchToProps = dispatch => {
  return {
    submitTx: (txRequest) => dispatch(submitTx(txRequest))
  }
}

const mapStateToProps = state => {
  return {
    transferForm: state.transferReducer.transferForm,
    cryptoSelection: state.transferReducer.cryptoSelection,
    walletSelection: state.transferReducer.walletSelection,
    metamask: state.userReducer.metamask,
    receipt: state.userReducer.receipt,
    actionsPending: {
      submitTx: submitTxSelector(state)
    },
    error: errorSelector(state)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReviewContainer)
