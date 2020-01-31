import React, { Component } from 'react'
import { connect } from 'react-redux'
import ReceiveFormComponent from '../components/ReceiveFormComponent'
import { verifyEscrowAccountPassword } from '../actions/accountActions'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import { updateTransferForm } from '../actions/formActions'
import { getTransfer, clearVerifyEscrowAccountPasswordError } from '../actions/transferActions'
import moment from 'moment'
import utils from '../utils'
import { push } from 'connected-react-router'
import path from '../Paths.js'

class ReceiveFormContainer extends Component {
  componentDidUpdate (prevProps) {
    const { actionsPending, error, push, id } = this.props
    const prevActionPending = prevProps.actionsPending
    if (
      prevActionPending.verifyEscrowAccountPassword &&
      !actionsPending.verifyEscrowAccountPassword &&
      !error
    ) {
      // verified password successfully
      // go to next step
      push(`${path.receive}?step=1&id=${id}`)
    }
  }

  render () {
    const { transfer, cryptoPrice, currency } = this.props
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
        transferAmount: toCurrencyAmount(transfer.transferAmount)
      }
    }
    return (
      <ReceiveFormComponent
        {...this.props}
        sendTime={sendTime}
        receiveTime={receiveTime}
        cancelTime={cancelTime}
        currencyAmount={currencyAmount}
      />
    )
  }
}

const getTransferSelector = createLoadingSelector(['GET_TRANSFER'])
const verifyEscrowAccountPasswordSelector = createLoadingSelector([
  'VERIFY_ESCROW_ACCOUNT_PASSWORD'
])
const errorSelector = createErrorSelector(['VERIFY_ESCROW_ACCOUNT_PASSWORD', 'GET_TRANSFER'])

const mapDispatchToProps = dispatch => {
  return {
    getTransfer: id => dispatch(getTransfer(null, id)),
    updateTransferForm: form => dispatch(updateTransferForm(form)),
    verifyEscrowAccountPassword: transferInfo =>
      dispatch(verifyEscrowAccountPassword(transferInfo)),
    clearVerifyEscrowAccountPasswordError: () => dispatch(clearVerifyEscrowAccountPasswordError()),
    push: path => dispatch(push(path))
  }
}

const mapStateToProps = state => {
  return {
    transfer: state.transferReducer.transfer,
    accountSelection: state.accountReducer.cryptoAccounts.find(_account =>
      utils.accountsEqual(_account, state.formReducer.transferForm.accountId)
    ),
    escrowAccount: state.accountReducer.escrowAccount,
    transferForm: state.formReducer.transferForm,
    cryptoPrice: state.cryptoPriceReducer.cryptoPrice,
    currency: state.cryptoPriceReducer.currency,
    actionsPending: {
      verifyEscrowAccountPassword: verifyEscrowAccountPasswordSelector(state),
      getTransfer: getTransferSelector(state)
    },
    error: errorSelector(state)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ReceiveFormContainer)
