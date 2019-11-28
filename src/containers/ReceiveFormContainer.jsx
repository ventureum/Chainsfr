import React, { Component } from 'react'
import { connect } from 'react-redux'
import ReceiveFormComponent from '../components/ReceiveFormComponent'
import { verifyEscrowAccountPassword } from '../actions/accountActions'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import { goToStep } from '../actions/navigationActions'
import { updateTransferForm } from '../actions/formActions'
import { getTransfer, clearVerifyEscrowAccountPasswordError } from '../actions/transferActions'
import moment from 'moment'
import queryString from 'query-string'
import utils from '../utils'

class ReceiveFormContainer extends Component {
  componentDidMount () {
    let { location } = this.props
    const value = queryString.parse(location.search)
    this.props.getTransfer(value.id)
  }

  componentDidUpdate (prevProps) {
    const { goToStep, actionsPending, error } = this.props
    const prevActionPending = prevProps.actionsPending
    if (
      prevActionPending.verifyEscrowAccountPassword &&
      !actionsPending.verifyEscrowAccountPassword &&
      !error
    ) {
      // verified password successfully
      // go to next step
      goToStep(1)
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
    goToStep: n => dispatch(goToStep('receive', n))
  }
}

const mapStateToProps = state => {
  return {
    transfer: state.transferReducer.transfer,
    accountSelection: state.formReducer.transferForm.accountSelection,
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
