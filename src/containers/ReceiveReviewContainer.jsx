import React, { Component } from 'react'
import { connect } from 'react-redux'
import ReceiveReview from '../components/ReceiveReviewComponent'
import { acceptTransfer, getTxFee } from '../actions/transferActions'
import { sync } from '../actions/walletActions'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import { goToStep } from '../actions/navigationActions'
import WalletUtils from '../wallets/utils'
import moment from 'moment'
import utils from '../utils'

class ReceiveReviewContainer extends Component {
  componentDidMount () {
    // refresh wallet data
    this.syncWallet()
  }

  componentDidUpdate (prevProps) {
    const { transfer, escrowWallet, txFee, actionsPending, error } = this.props
    const prevActionsPending = prevProps.actionsPending
    if (
      !txFee &&
      !actionsPending.getTxFee &&
      (prevActionsPending.sync && !actionsPending.sync) &&
      !error
    ) {
      this.props.getTxFee({
        fromWallet: WalletUtils.toWalletDataFromState('escrow', transfer.cryptoType, escrowWallet),
        transferAmount: transfer.transferAmount
      })
    }
  }

  syncWallet = () => {
    let { wallet, lastUsedWallet, walletSelection, transfer } = this.props
    this.props.sync(
      WalletUtils.toWalletDataFromState(
        walletSelection,
        transfer.cryptoType,
        lastUsedWallet || wallet
      )
    )
  }

  render () {
    const { wallet, lastUsedWallet, transfer, cryptoPrice, currency, txFee } = this.props
    const { cryptoType, sendTimestamp } = transfer
    const toCurrencyAmount = cryptoAmount =>
      utils.toCurrencyAmount(cryptoAmount, cryptoPrice[transfer.cryptoType], currency)
    // if set to not used or no used address, use connected wallet
    let destinationAddress = lastUsedWallet
      ? lastUsedWallet.crypto[cryptoType][0].address
      : wallet.crypto[cryptoType][0].address
    let sendTime = moment.unix(sendTimestamp).format('MMM Do YYYY, HH:mm:ss')

    let receiveAmount
    if (txFee && transfer) {
      receiveAmount = ['ethereum', 'bitcoin'].includes(transfer.cryptoType)
        ? parseFloat(transfer.transferAmount) - parseFloat(txFee.costInStandardUnit)
        : parseFloat(transfer.transferAmount)
    }

    return (
      <ReceiveReview
        destinationAddress={destinationAddress}
        {...this.props}
        receiveAmount={receiveAmount}
        sendTime={sendTime}
        currencyAmount={{
          transferAmount: transfer && toCurrencyAmount(transfer.transferAmount),
          txFee: txFee && toCurrencyAmount(txFee.costInStandardUnit),
          receiveAmount: receiveAmount && toCurrencyAmount(receiveAmount)
        }}
      />
    )
  }
}

const acceptTransferSelector = createLoadingSelector([
  'ACCEPT_TRANSFER',
  'ACCEPT_TRANSFER_TRANSACTION_HASH_RETRIEVED'
])
const gettxFeeSelector = createLoadingSelector(['GET_TX_COST'])
const syncSelector = createLoadingSelector(['SYNC'])

const errorSelector = createErrorSelector([
  'ACCEPT_TRANSFER',
  'ACCEPT_TRANSFER_TRANSACTION_HASH_RETRIEVED'
])

const mapDispatchToProps = dispatch => {
  return {
    acceptTransfer: txRequest => dispatch(acceptTransfer(txRequest)),
    getTxFee: txRequest => dispatch(getTxFee(txRequest)),
    goToStep: n => dispatch(goToStep('receive', n)),
    sync: txRequest => dispatch(sync(txRequest))
  }
}

const mapStateToProps = state => {
  const _transfer = state.transferReducer.transfer
  const _lastUsedWallet = state.walletReducer.lastUsedWallet
  const _walletSelection = state.formReducer.walletSelection
  const _lastUsedWalletExist =
    !_lastUsedWallet.notUsed &&
    _lastUsedWallet[_walletSelection] &&
    _lastUsedWallet[_walletSelection].crypto[_transfer.cryptoType]
  const _lastUsedWalletByWalletType = _lastUsedWalletExist
    ? _lastUsedWallet[_walletSelection]
    : null

  return {
    transfer: state.transferReducer.transfer,
    escrowWallet: state.walletReducer.wallet.escrow,
    lastUsedWallet: _lastUsedWalletByWalletType,
    walletSelection: state.formReducer.walletSelection,
    wallet: state.walletReducer.wallet[state.formReducer.walletSelection],
    txFee: state.transferReducer.txFee,
    cryptoPrice: state.cryptoPriceReducer.cryptoPrice,
    currency: state.cryptoPriceReducer.currency,
    actionsPending: {
      acceptTransfer: acceptTransferSelector(state),
      getTxFee: gettxFeeSelector(state),
      sync: syncSelector(state)
    },
    error: errorSelector(state)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReceiveReviewContainer)
