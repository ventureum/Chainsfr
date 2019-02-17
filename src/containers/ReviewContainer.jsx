import React, { Component } from 'react'
import { connect } from 'react-redux'
import Review from '../components/ReviewComponent'
import { submitTx, getGasCost } from '../actions/transferActions'
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
const getGasCostSelector = createLoadingSelector(['GET_GAS_COST'])

const errorSelector = createErrorSelector(['SUBMIT_TX', 'TRANSACTION_HASH_RETRIEVED'])

const mapDispatchToProps = dispatch => {
  return {
    submitTx: (txRequest) => dispatch(submitTx(txRequest)),
    getGasCost: (txRequest) => dispatch(getGasCost(txRequest))
  }
}

const mapStateToProps = state => {
  return {
    transferForm: state.formReducer.transferForm,
    cryptoSelection: state.formReducer.cryptoSelection,
    walletSelection: state.formReducer.walletSelection,
    metamask: state.walletReducer.metamask,
    gasCost: state.transferReducer.gasCost,
    actionsPending: {
      submitTx: submitTxSelector(state),
      getGasCost: getGasCostSelector(state)
    },
    error: errorSelector(state)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReviewContainer)
