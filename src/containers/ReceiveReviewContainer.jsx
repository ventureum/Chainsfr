import React, { Component } from 'react'
import { connect } from 'react-redux'
import ReceiveReview from '../components/ReceiveReviewComponent'
import { acceptTransfer, getGasCost } from '../actions/transferActions'
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
    escrowWallet: state.walletReducer.escrowWallet,
    walletSelection: state.formReducer.walletSelection,
    wallet: state.walletReducer.wallet[state.formReducer.walletSelection],
    gasCost: state.transferReducer.gasCost,
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
