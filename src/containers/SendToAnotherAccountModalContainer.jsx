import React, { Component } from 'react'
import { connect } from 'react-redux'

import { createLoadingSelector, createErrorSelector } from '../selectors'
import SendToAnotherAccountModal from '../components/SendToAnotherAccountModal'
import utils from '../utils'
import { decryptCloudWalletAccount, markAccountDirty } from '../actions/accountActions.js'
import { clearError } from '../actions/userActions'
import { directTransfer } from '../actions/transferActions'
import { verifyAccount, checkWalletConnection } from '../actions/walletActions'
import moment from 'moment'

class SendToAnotherAccountModalContainer extends Component {
  state = {
    step: 0,
    password: ''
  }

  next = param => {
    if (this.state.step === 1) {
      const { accountSelection, checkWalletConnection } = this.props
      checkWalletConnection(accountSelection, { password: param })
    } else if (this.state.step < 2) {
      this.setState(prevState => ({ step: prevState.step + 1 }))
    } else {
      this.props.handleClose()
    }
  }

  back = () => {
    if (this.state.step > 0) {
      this.setState(prevState => ({ step: prevState.step - 1 }))
    } else {
      this.props.handleClose()
    }
  }

  handlePasswordChange = value => {
    const { errors, clearError } = this.props
    if (errors.checkWalletConnection) {
      clearError()
    }
    this.setState({ password: value })
  }

  handleConfirm = password => {}

  componentDidUpdate (prevProps) {
    const {
      transferForm,
      txFee,
      actionsPending,
      verifyAccount,
      errors,
      markAccountDirty,
      accountSelection,
      directTransfer,
      currency,
      cryptoPrice
    } = this.props
    const { transferAmount, destination } = transferForm
    if (
      prevProps.actionsPending.checkWalletConnection &&
      !actionsPending.checkWalletConnection &&
      !errors.checkWalletConnection
    ) {
      verifyAccount(accountSelection)
    } else if (
      prevProps.actionsPending.verifyAccount &&
      !actionsPending.verifyAccount &&
      accountSelection.connected
    ) {
      // mart account dirty
      markAccountDirty(accountSelection)
      // submit tx
      directTransfer({
        fromAccount: accountSelection,
        destinationAccount: destination,
        transferAmount: transferAmount,
        transferFiatAmountSpot: utils.toCurrencyAmount(
          transferAmount,
          cryptoPrice[accountSelection.cryptoType]
        ),
        fiatType: currency,
        txFee: txFee
      })
    } else if (
      prevProps.actionsPending.directTransfer &&
      !actionsPending.directTransfer &&
      !errors.directTransfer
    ) {
      this.setState({ step: 2 })
    }
  }

  render () {
    const {
      transferForm,
      handleClose,
      open,
      accountSelection,
      txFee,
      cryptoPrice,
      currency,
      decryptCloudWalletAccount,
      actionsPending,
      errors,
      clearError,
      receipt,
      online
    } = this.props

    const { step, password } = this.state

    const toCurrencyAmount = cryptoAmount =>
      utils.toCurrencyAmount(cryptoAmount, cryptoPrice[transferForm.cryptoType], currency)
    let sendTime = ''
    if (step === 2) sendTime = moment.unix(receipt.sendTimestamp).format('MMM Do YYYY, HH:mm:ss')
    return (
      <SendToAnotherAccountModal
        open={open}
        handleClose={handleClose}
        transferForm={transferForm}
        accountSelection={accountSelection}
        txFee={txFee}
        currencyAmount={{
          transferAmount: transferForm && toCurrencyAmount(transferForm.transferAmount),
          txFee: txFee && toCurrencyAmount(txFee.costInStandardUnit)
        }}
        decryptCloudWalletAccount={decryptCloudWalletAccount}
        actionsPending={actionsPending}
        errors={errors}
        clearError={clearError}
        handleConfirm={this.handleConfirm}
        step={step}
        password={password}
        handlePasswordChange={this.handlePasswordChange}
        next={this.next}
        back={this.back}
        receipt={receipt}
        sendTime={sendTime}
        online={online}
      />
    )
  }
}

const directTransferSelector = createLoadingSelector(['DIRECT_TRANSFER'])
const verifyAccountSelector = createLoadingSelector(['VERIFY_ACCOUNT'])
const checkWalletConnectionSelector = createLoadingSelector(['CHECK_WALLET_CONNECTION'])

const directTransferErrorSelector = createErrorSelector(['DIRECT_TRANSFER'])
const checkWalletConnectionErrorSelector = createErrorSelector(['CHECK_WALLET_CONNECTION'])
const verifyAccountErrorSelector = createErrorSelector(['VERIFY_ACCOUNT'])

const mapDispatchToProps = dispatch => {
  return {
    decryptCloudWalletAccount: (accountData, password) =>
      dispatch(decryptCloudWalletAccount(accountData, password)),
    clearError: () => dispatch(clearError()),
    verifyAccount: (accountData, options) => dispatch(verifyAccount(accountData, options)),
    checkWalletConnection: (accountData, options) =>
      dispatch(checkWalletConnection(accountData, options)),
    directTransfer: txRequest => dispatch(directTransfer(txRequest)),
    markAccountDirty: accountData => dispatch(markAccountDirty(accountData))
  }
}

const mapStateToProps = state => {
  return {
    transferForm: state.formReducer.transferForm,
    accountSelection: state.accountReducer.cryptoAccounts.find(_account =>
      utils.accountsEqual(_account, state.formReducer.transferForm.accountId)
    ),
    txFee: state.transferReducer.txFee,
    cryptoPrice: state.cryptoPriceReducer.cryptoPrice,
    currency: state.cryptoPriceReducer.currency,
    actionsPending: {
      checkWalletConnection: checkWalletConnectionSelector(state),
      verifyAccount: verifyAccountSelector(state),
      directTransfer: directTransferSelector(state)
    },
    errors: {
      checkWalletConnection: checkWalletConnectionErrorSelector(state),
      verifyAccount: verifyAccountErrorSelector(state),
      directTransfer: directTransferErrorSelector(state)
    },
    receipt: state.transferReducer.receipt
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SendToAnotherAccountModalContainer)
