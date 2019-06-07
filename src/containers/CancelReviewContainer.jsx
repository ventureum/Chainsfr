import React, { Component } from 'react'

import { connect } from 'react-redux'

import CancelReviewComponent from '../components/CancelReviewComponent'
import { getTransfer, cancelTransfer, getTxCost } from '../actions/transferActions'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import { goToStep } from '../actions/navigationActions'
import { verifyPassword, sync } from '../actions/walletActions'
import WalletUtils from '../wallets/utils'

class CancelReviewContainer extends Component {
  componentDidMount () {
    let { sendingId } = this.props
    if (sendingId) {
      this.props.getTransfer(sendingId)
    }
  }

  componentDidUpdate (prevProps) {
    let { transfer, actionsPending, error, escrowWallet } = this.props
    let prevActionPending = prevProps.actionsPending
    if (!error && transfer) {
      let walletData = WalletUtils.toWalletDataFromState(
        'escrow',
        transfer.cryptoType,
        escrowWallet
      )
      if (prevActionPending.getTransfer && !actionsPending.getTransfer) {
        // transfer data retrieved, now decrypt escrow wallet
        this.props.verifyPassword({
          sendingId: transfer.sendingId,
          fromWallet: walletData
        })
      } else if (prevActionPending.verifyPassword && !actionsPending.verifyPassword && !actionsPending.sync) {
        // verifyPassword completed, currently not syncing
        this.props.sync(walletData)
      } else if (prevActionPending.sync && !actionsPending.sync && !actionsPending.getTxCost) {
        // sync completed, currently not executing getTxCost action
        this.props.getTxCost({ fromWallet: walletData, transferAmount: transfer.transferAmount })
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
const syncSelector = createLoadingSelector(['SYNC'])
const errorSelector = createErrorSelector(['GET_TRANSFER', 'VERIFY_PASSWORD', 'CANCEL_TRANSFER', 'GET_PASSWORD', 'GET_TX_COST', 'GET_UTXO_FOR_ESCROW_WALLET'])

const mapDispatchToProps = dispatch => {
  return {
    getTransfer: (id) => dispatch(getTransfer(id)), // here we use sendingId
    verifyPassword: (transferInfo) => dispatch(verifyPassword(transferInfo)),
    getTxCost: (txRequest) => dispatch(getTxCost(txRequest)),
    cancelTransfer: (txRequest) => dispatch(cancelTransfer(txRequest)),
    sync: (txRequest) => dispatch(sync(txRequest)),
    goToStep: (n) => dispatch(goToStep('receive', n))
  }
}

const mapStateToProps = state => {
  return {
    transfer: state.transferReducer.transfer,
    escrowWallet: state.walletReducer.wallet.escrow,
    txCost: state.transferReducer.txCost,
    receipt: state.transferReducer.receipt,
    actionsPending: {
      getTransfer: getTransferSelector(state),
      verifyPassword: verifyPasswordSelector(state),
      getTxCost: getTxCostSelector(state),
      cancelTransfer: cancelTransferSelector(state),
      sync: syncSelector(state)
    },
    error: errorSelector(state)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CancelReviewContainer)
