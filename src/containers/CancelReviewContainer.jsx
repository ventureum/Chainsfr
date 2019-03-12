import React, { Component } from 'react'

import { connect } from 'react-redux'

import CancelReviewComponent from '../components/CancelReviewComponent'
import { getTransfer, cancelTransfer, getTxCost } from '../actions/transferActions'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import { goToStep } from '../actions/navigationActions'
import { verifyPassword } from '../actions/walletActions'

class CancelReviewContainer extends Component {
  componentDidMount () {
    let { sendingId } = this.props
    if (sendingId) {
      this.props.getTransfer(sendingId)
    }
  }

  componentDidUpdate () {
    let { transfer, txCost, actionsPending, error } = this.props
    if (!error && transfer) {
      if (!txCost && !actionsPending.getTxCost) {
        // get gas cost
        this.props.getTxCost({ cryptoType: transfer.cryptoType, transferAmount: transfer.transferAmount })
      }
    }
  }

  render () {
    return (
      <CancelReviewComponent
        {...this.props}
      />
    )
  }
}

const getTransferSelector = createLoadingSelector(['GET_TRANSFER'])
const verifyPasswordSelector = createLoadingSelector(['VERIFY_PASSWORD'])
const getTxCostSelector = createLoadingSelector(['GET_TX_COST'])
const cancelTransferSelector = createLoadingSelector(['CANCEL_TRANSFER', 'CANCEL_TRANSFER_TRANSACTION_HASH_RETRIEVED'])
const errorSelector = createErrorSelector(['GET_TRANSFER', 'VERIFY_PASSWORD', 'CANCEL_TRANSFER', 'GET_PASSWORD'])

const mapDispatchToProps = dispatch => {
  return {
    getTransfer: (id) => dispatch(getTransfer(id)), // here we use sendingId
    verifyPassword: (encriptedWallet, password) => dispatch(verifyPassword(encriptedWallet, password)),
    getTxCost: (txRequest) => dispatch(getTxCost(txRequest)),
    cancelTransfer: (txRequest) => dispatch(cancelTransfer(txRequest)),
    goToStep: (n) => dispatch(goToStep('receive', n))
  }
}

const mapStateToProps = state => {
  return {
    transfer: state.transferReducer.transfer,
    escrowWallet: state.walletReducer.escrowWallet,
    txCost: state.transferReducer.txCost,
    receipt: state.transferReducer.receipt,
    actionsPending: {
      getTransfer: getTransferSelector(state),
      verifyPassword: verifyPasswordSelector(state),
      getTxCost: getTxCostSelector(state),
      cancelTransfer: cancelTransferSelector(state)
    },
    error: errorSelector(state)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CancelReviewContainer)
