import React, { Component } from 'react'
import { connect } from 'react-redux'
import ReceiveReview from '../components/ReceiveReviewComponent'
import { acceptTransfer, getGasCost } from '../actions'
import { createLoadingSelector, createErrorSelector } from '../selectors'

class ReceiveReviewContainer extends Component {
  render () {
    return (
      <ReceiveReview
        {...this.props}
      />
    )
  }
}

const acceptTransferSelector = createLoadingSelector(['ACCEPT_TRANSFER', 'ACCEPT_TRANSFER_TRANSACTION_HASH_RETRIEVED'])
const getGasCostSelector = createLoadingSelector(['GET_GAS_COST'])

const errorSelector = createErrorSelector(['ACCEPT_TRANSFER', 'ACCEPT_TRANSFER_TRANSACTION_HASH_RETRIEVED'])

const mapDispatchToProps = dispatch => {
  return {
    acceptTransfer: (txRequest) => dispatch(acceptTransfer(txRequest)),
    getGasCost: (txRequest) => dispatch(getGasCost(txRequest))
  }
}

const mapStateToProps = state => {
  return {
    transfer: state.transferReducer.transfer,
    cryptoSelection: state.transferReducer.cryptoSelection,
    walletSelection: state.transferReducer.walletSelection,
    metamask: state.userReducer.metamask,
    receipt: state.userReducer.receipt,
    gasCost: state.userReducer.gasCost,
    actionsPending: {
      acceptTransfer: acceptTransferSelector(state),
      getGasCost: getGasCostSelector(state)
    },
    error: errorSelector(state)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReceiveReviewContainer)
