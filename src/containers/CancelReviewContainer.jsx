import React, { Component } from 'react'

import { connect } from 'react-redux'

import CancelReviewComponent from '../components/CancelReviewComponent'
import { getTransfer, cancelTransfer, getTxCost } from '../actions/transferActions'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import { goToStep } from '../actions/navigationActions'
import { verifyPassword, getUtxoForEscrowWallet } from '../actions/walletActions'

class CancelReviewContainer extends Component {
  componentDidMount () {
    let { sendingId } = this.props
    if (sendingId) {
      this.props.getTransfer(sendingId)
    }
  }

  componentDidUpdate (prevProps) {
    let { transfer, actionsPending, error, getUtxoForEscrowWallet, escrowWallet } = this.props
    let prevActionPending = prevProps.actionsPending
    if (!error && transfer) {
      if (prevActionPending.getTransfer && !actionsPending.getTransfer) {
        this.props.verifyPassword({
          sendingId: transfer.sendingId,
          encryptedWallet: transfer.data,
          cryptoType: transfer.cryptoType
        })
      } else if (
        (prevActionPending.verifyPassword && !actionsPending.verifyPassword) ||
        (prevActionPending.getUtxoForEscrowWallet && !actionsPending.getUtxoForEscrowWallet)
      ) {
        if (transfer.cryptoType === 'bitcoin' && !prevActionPending.getUtxoForEscrowWallet) {
          getUtxoForEscrowWallet()
        } else if (transfer.cryptoType !== 'bitcoin' || prevActionPending.getUtxoForEscrowWallet) {
          // get gas cost
          this.props.getTxCost({
            cryptoType: transfer.cryptoType,
            transferAmount: transfer.transferAmount,
            escrowWallet: escrowWallet
          })
        }
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
const getUtxoForEscrowWalletSelector = createLoadingSelector(['GET_UTXO_FOR_ESCROW_WALLET'])
const cancelTransferSelector = createLoadingSelector(['CANCEL_TRANSFER', 'CANCEL_TRANSFER_TRANSACTION_HASH_RETRIEVED'])
const errorSelector = createErrorSelector(['GET_TRANSFER', 'VERIFY_PASSWORD', 'CANCEL_TRANSFER', 'GET_PASSWORD', 'GET_TX_COST', 'GET_UTXO_FOR_ESCROW_WALLET'])

const mapDispatchToProps = dispatch => {
  return {
    getTransfer: (id) => dispatch(getTransfer(id)), // here we use sendingId
    verifyPassword: (transferInfo) => dispatch(verifyPassword(transferInfo)),
    getTxCost: (txRequest) => dispatch(getTxCost(txRequest)),
    cancelTransfer: (txRequest) => dispatch(cancelTransfer(txRequest)),
    goToStep: (n) => dispatch(goToStep('receive', n)),
    getUtxoForEscrowWallet: () => dispatch(getUtxoForEscrowWallet())
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
      cancelTransfer: cancelTransferSelector(state),
      getUtxoForEscrowWallet: getUtxoForEscrowWalletSelector(state)
    },
    error: errorSelector(state)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CancelReviewContainer)
