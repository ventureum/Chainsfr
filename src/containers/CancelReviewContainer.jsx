import React, { Component } from 'react'

import { connect } from 'react-redux'

import CancelReviewComponent from '../components/CancelReviewComponent'
import { getTransfer, cancelTransfer, getGasCost } from '../actions/transferActions'
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
    let { transfer, gasCost, actionsPending, error } = this.props
    if (!error && transfer) {
      if (!gasCost && !actionsPending.getGasCost) {
        // get gas cost
        this.props.getGasCost({ cryptoType: transfer.cryptoType })
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
const getGasCostSelector = createLoadingSelector(['GET_GAS_COST'])
const cancelTransferSelector = createLoadingSelector(['CANCEL_TRANSFER', 'CANCEL_TRANSFER_TRANSACTION_HASH_RETRIEVED'])
const errorSelector = createErrorSelector(['GET_TRANSFER', 'VERIFY_PASSWORD', 'CANCEL_TRANSFER'])

const mapDispatchToProps = dispatch => {
  return {
    getTransfer: (id) => dispatch(getTransfer(id)), // here we use sendingId
    verifyPassword: (encriptedWallet, password) => dispatch(verifyPassword(encriptedWallet, password)),
    getGasCost: (txRequest) => dispatch(getGasCost(txRequest)),
    cancelTransfer: (txRequest) => dispatch(cancelTransfer(txRequest)),
    goToStep: (n) => dispatch(goToStep('receive', n))
  }
}

const mapStateToProps = state => {
  return {
    transfer: state.transferReducer.transfer,
    escrowWallet: state.walletReducer.escrowWallet,
    gasCost: state.transferReducer.gasCost,
    receipt: state.transferReducer.receipt,
    actionsPending: {
      getTransfer: getTransferSelector(state),
      verifyPassword: verifyPasswordSelector(state),
      getGasCost: getGasCostSelector(state),
      cancelTransfer: cancelTransferSelector(state)
    },
    error: errorSelector(state)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CancelReviewContainer)
