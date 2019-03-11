import React, { Component } from 'react'
import { connect } from 'react-redux'
import ReceiveReview from '../components/ReceiveReviewComponent'
import { acceptTransfer, getTxCost } from '../actions/transferActions'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import { goToStep } from '../actions/navigationActions'

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
const getTxCostSelector = createLoadingSelector(['GET_TX_COST'])

const errorSelector = createErrorSelector(['ACCEPT_TRANSFER', 'ACCEPT_TRANSFER_TRANSACTION_HASH_RETRIEVED'])

const mapDispatchToProps = dispatch => {
  return {
    acceptTransfer: (txRequest) => dispatch(acceptTransfer(txRequest)),
    getTxCost: (txRequest) => dispatch(getTxCost(txRequest)),
    goToStep: (n) => dispatch(goToStep('receive', n))
  }
}

const mapStateToProps = state => {
  return {
    transfer: state.transferReducer.transfer,
    escrowWallet: state.walletReducer.escrowWallet,
    walletSelection: state.formReducer.walletSelection,
    wallet: state.walletReducer.wallet[state.formReducer.walletSelection],
    txCost: state.transferReducer.txCost,
    actionsPending: {
      acceptTransfer: acceptTransferSelector(state),
      getTxCost: getTxCostSelector(state)
    },
    error: errorSelector(state)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReceiveReviewContainer)
