import React, { Component } from 'react'
import { connect } from 'react-redux'
import ReceiveFormComponent from '../components/ReceiveFormComponent'
import { onEscrowPasswordEntered } from '../actions/accountActions'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import { updateTransferForm } from '../actions/formActions'
import { syncWithNetwork } from '../actions/accountActions'
import {
  getTransfer,
  clearVerifyEscrowAccountPasswordError,
  getTxFee,
  acceptTransfer
} from '../actions/transferActions'
import moment from 'moment'
import utils from '../utils'
import { push } from 'connected-react-router'
import path from '../Paths.js'
class ReceiveFormContainer extends Component {
  componentDidUpdate (prevProps) {
    if (
      prevProps.actionsPending.acceptTransfer &&
      !this.props.actionsPending.acceptTransfer &&
      !this.props.error
    ) {
      this.props.push(`${path.receive}?step=2&id=${this.props.id}`)
    }
  }

  onDeposit = () => {
    const { accountSelection, transfer, escrowAccount, txFee } = this.props
    const { receivingId, transferAmount, walletId } = transfer
    this.props.acceptTransfer({
      receivingId: receivingId,
      escrowAccount: escrowAccount,
      destinationAccount: accountSelection,
      transferAmount: transferAmount,
      txFee: txFee,
      walletId: walletId
    })
  }

  render () {
    const { transfer, cryptoPrice, currency, escrowAccount, txFee } = this.props
    let sendTime, receiveTime, cancelTime
    if (transfer) {
      const { sendTimestamp, receiveTimestamp, cancelTimestamp } = transfer
      sendTime = moment.unix(sendTimestamp).format('MMM Do YYYY, HH:mm:ss')
      if (receiveTimestamp) {
        receiveTime = moment.unix(receiveTimestamp).format('MMM Do YYYY, HH:mm:ss')
      }
      if (cancelTimestamp) cancelTime = moment.unix(cancelTimestamp).format('MMM Do YYYY, HH:mm:ss')
      var toCurrencyAmount = cryptoAmount =>
        utils.toCurrencyAmount(cryptoAmount, cryptoPrice[transfer.cryptoType], currency)
      var currencyAmount = {
        transferAmount: toCurrencyAmount(transfer.transferAmount),
        txFee: txFee && toCurrencyAmount(txFee.costInStandardUnit)
      }
    }
    const passwordValidated = escrowAccount && !!escrowAccount.privateKey
    return (
      <ReceiveFormComponent
        {...this.props}
        sendTime={sendTime}
        receiveTime={receiveTime}
        cancelTime={cancelTime}
        currencyAmount={currencyAmount}
        passwordValidated={passwordValidated}
        onDeposit={this.onDeposit}
      />
    )
  }
}

const getTransferSelector = createLoadingSelector(['GET_TRANSFER'])
const verifyEscrowAccountPasswordSelector = createLoadingSelector([
  'VERIFY_ESCROW_ACCOUNT_PASSWORD'
])
const acceptTransferSelector = createLoadingSelector(['ACCEPT_TRANSFER'])
const syncWithNetworkSelector = createLoadingSelector(['SYNC_WITH_NETWORK'])

const errorSelector = createErrorSelector(['VERIFY_ESCROW_ACCOUNT_PASSWORD', 'GET_TRANSFER'])

const mapDispatchToProps = dispatch => {
  return {
    getTransfer: id => dispatch(getTransfer(null, id)),
    updateTransferForm: form => dispatch(updateTransferForm(form)),
    onEscrowPasswordEntered: transferInfo =>
      dispatch(onEscrowPasswordEntered(transferInfo)),
    clearVerifyEscrowAccountPasswordError: () => dispatch(clearVerifyEscrowAccountPasswordError()),
    push: path => dispatch(push(path)),
    getTxFee: txRequest => dispatch(getTxFee(txRequest)),
    syncWithNetwork: accountData => dispatch(syncWithNetwork(accountData)),
    acceptTransfer: txRequest => dispatch(acceptTransfer(txRequest))
  }
}

const mapStateToProps = state => {
  return {
    transfer: state.transferReducer.transfer,
    accountSelection: state.accountReducer.cryptoAccounts.find(_account =>
      utils.accountsEqual(_account, { id: state.formReducer.transferForm.accountId })
    ),
    txFee: state.transferReducer.txFee,
    escrowAccount: state.accountReducer.escrowAccount,
    transferForm: state.formReducer.transferForm,
    cryptoPrice: state.cryptoPriceReducer.cryptoPrice,
    currency: state.cryptoPriceReducer.currency,
    actionsPending: {
      verifyEscrowAccountPassword: verifyEscrowAccountPasswordSelector(state),
      getTransfer: getTransferSelector(state),
      syncWithNetwork: syncWithNetworkSelector(state),
      acceptTransfer: acceptTransferSelector(state)
    },
    error: errorSelector(state)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ReceiveFormContainer)
