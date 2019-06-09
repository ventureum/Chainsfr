import React, { Component } from 'react'
import { connect } from 'react-redux'
import ReceiveReview from '../components/ReceiveReviewComponent'
import { acceptTransfer, gettxFee } from '../actions/transferActions'
import { sync } from '../actions/walletActions'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import { goToStep } from '../actions/navigationActions'
import WalletUtils from '../wallets/utils'

class ReceiveReviewContainer extends Component {
  componentDidMount () {
    // refresh wallet data
    this.syncWallet()
  }

  componentDidUpdate (prevProps) {
    const { transfer, escrowWallet, txFee, actionsPending, error } = this.props
    const prevActionsPending = prevProps.actionsPending
    if (!txFee &&
      !actionsPending.gettxFee &&
      (prevActionsPending.sync && !actionsPending.sync) &&
      !error) {
      this.props.gettxFee({
        fromWallet: WalletUtils.toWalletDataFromState('escrow', transfer.cryptoType, escrowWallet),
        transferAmount: transfer.transferAmount
      })
    }
  }

  syncWallet = () => {
    let { wallet, walletSelection, transfer } = this.props
    this.props.sync(
      WalletUtils.toWalletDataFromState(walletSelection, transfer.cryptoType, wallet)
    )
  }

  render () {
    const { wallet, lastUsedWallet, transfer, walletSelection } = this.props
    const { cryptoType } = transfer

    // if set to not used or no used address, use connected wallet
    let destinationAddress = (lastUsedWallet.notUsed || !lastUsedWallet[walletSelection].crypto[cryptoType])
      ? wallet.crypto[cryptoType][0].address
      : lastUsedWallet[walletSelection].crypto[cryptoType].address

    return (
      <ReceiveReview
        destinationAddress={destinationAddress}
        {...this.props}
      />
    )
  }
}

const acceptTransferSelector = createLoadingSelector(['ACCEPT_TRANSFER', 'ACCEPT_TRANSFER_TRANSACTION_HASH_RETRIEVED'])
const gettxFeeSelector = createLoadingSelector(['GET_TX_COST'])
const syncSelector = createLoadingSelector(['SYNC'])

const errorSelector = createErrorSelector(['ACCEPT_TRANSFER', 'ACCEPT_TRANSFER_TRANSACTION_HASH_RETRIEVED'])

const mapDispatchToProps = dispatch => {
  return {
    acceptTransfer: (txRequest) => dispatch(acceptTransfer(txRequest)),
    gettxFee: (txRequest) => dispatch(gettxFee(txRequest)),
    goToStep: (n) => dispatch(goToStep('receive', n)),
    sync: (txRequest) => dispatch(sync(txRequest))
  }
}

const mapStateToProps = state => {
  return {
    transfer: state.transferReducer.transfer,
    escrowWallet: state.walletReducer.wallet.escrow,
    lastUsedWallet: state.walletReducer.lastUsedWallet,
    walletSelection: state.formReducer.walletSelection,
    wallet: state.walletReducer.wallet[state.formReducer.walletSelection],
    txFee: state.transferReducer.txFee,
    actionsPending: {
      acceptTransfer: acceptTransferSelector(state),
      gettxFee: gettxFeeSelector(state),
      sync: syncSelector(state)
    },
    error: errorSelector(state)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReceiveReviewContainer)
