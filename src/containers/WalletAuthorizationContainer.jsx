// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'

import WalletAuthorizationComponent from '../components/WalletAuthorizationComponent'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import { verifyAccount, checkWalletConnection } from '../actions/walletActions'
import { decryptCloudWalletAccount } from '../actions/accountActions.js'
import { submitTx, submitDirectTransferTx } from '../actions/transferActions'
import { clearError } from '../actions/userActions'
import utils from '../utils'
import { push } from 'connected-react-router'
import path from '../Paths.js'
import { getCryptoDecimals, isERC20 } from '../tokens'
import BN from 'bn.js'
import { setTokenAllowance } from '../actions/transferActions'
import type { Recipient } from '../types/transfer.flow'

type Props = {
  recipients: Array<Recipient>,
  transferForm: Object,
  actionsPending: Object,
  verifyAccount: Function,
  submitTx: Function,
  submitDirectTransferTx: Function,
  currency: String,
  userProfile: Object,
  txFee: Object,
  setTokenAllowanceTxHash: string,
  accountSelection: Object,
  receiveAccountSelection: Object,
  push: Function,
  checkWalletConnection: Function,
  decryptCloudWalletAccount: Function,
  clearError: Function,
  setTokenAllowance: Function,
  directTransfer: boolean,
  errors: Object,
  online: boolean
}

type State = {
  tokenAllowanceAmount: ?string
}

class WalletAuthorizationContainer extends Component<Props, State> {
  state = {
    tokenAllowanceAmount: '0'
  }

  checkWalletConnection = additionalInfo => {
    const { accountSelection } = this.props
    this.props.checkWalletConnection(accountSelection, additionalInfo)
  }

  setTokenAllowanceAmount = amount => {
    this.setState({ tokenAllowanceAmount: amount })
  }

  insufficientAllowance = () => {
    const { accountSelection, transferForm, directTransfer } = this.props
    if (directTransfer) return false
    if (!isERC20(accountSelection.cryptoType)) return false
    const { transferAmount } = transferForm
    const transferAmountBasicTokenUnit = utils
      .toBasicTokenUnit(transferAmount, getCryptoDecimals(accountSelection.cryptoType))
      .toString()

    return new BN(transferAmountBasicTokenUnit).gt(new BN(accountSelection.multiSigAllowance))
  }

  componentDidUpdate (prevProps) {
    const {
      recipients,
      transferForm,
      submitTx,
      currency,
      userProfile,
      txFee,
      actionsPending,
      verifyAccount,
      accountSelection,
      receiveAccountSelection,
      setTokenAllowance,
      directTransfer,
      submitDirectTransferTx,
      errors,
      push
    } = this.props
    const {
      transferAmount,
      transferCurrencyAmount,
      sender,
      senderName,
      destination,
      receiverName,
      password,
      sendMessage
    } = transferForm

    const submit = () => {
      if (directTransfer) {
        submitDirectTransferTx({
          fromAccount: accountSelection,
          destinationAccount: receiveAccountSelection,
          transferAmount: transferAmount,
          transferFiatAmountSpot: transferCurrencyAmount,
          fiatType: currency,
          sendMessage: sendMessage,
          txFee: txFee
        })
      } else {
        // submit tx

        // find recipient data
        const _recipient = recipients.find(r => r.email === destination)
        submitTx({
          fromAccount: accountSelection,
          transferAmount: transferAmount,
          transferFiatAmountSpot: transferCurrencyAmount,
          fiatType: currency,
          // receiver
          destination: destination,
          receiverName: receiverName,
          receiverAvatar: _recipient ? _recipient.imageUrl: null,
          // sender
          senderName: senderName,
          senderAvatar: userProfile.imageUrl,
          sender: sender,
          password: password,
          sendMessage: sendMessage,
          txFee: txFee
        })
      }
    }

    if (
      prevProps.actionsPending.checkWalletConnection &&
      !actionsPending.checkWalletConnection &&
      !errors.checkWalletConnection
    ) {
      verifyAccount(accountSelection)
    } else if (
      !errors.verifyAccount &&
      prevProps.actionsPending.verifyAccount &&
      !actionsPending.verifyAccount &&
      accountSelection.connected
    ) {
      if (this.insufficientAllowance()) {
        // need to approve token allowance first
        setTokenAllowance(accountSelection, this.state.tokenAllowanceAmount)
      } else {
        submit()
      }
    } else if (
      prevProps.actionsPending.setTokenAllowanceWaitForConfirmation &&
      !actionsPending.setTokenAllowanceWaitForConfirmation &&
      !errors.setTokenAllowanceWaitForConfirmation &&
      !errors.setTokenAllowance
    ) {
      // finished setting allowance
      // now we can submit tx
      submit()
    } else if (prevProps.actionsPending.submitTx && !actionsPending.submitTx && !errors.submitTx) {
      push(`${directTransfer ? path.directTransfer : path.transfer}?step=3`)
    }
  }

  render () {
    const {
      transferForm,
      setTokenAllowanceTxHash,
      actionsPending,
      clearError,
      accountSelection,
      errors,
      push,
      online,
      directTransfer
    } = this.props

    return (
      <WalletAuthorizationComponent
        accountSelection={accountSelection}
        transferForm={transferForm}
        actionsPending={actionsPending}
        checkWalletConnection={this.checkWalletConnection}
        setTokenAllowanceAmount={this.setTokenAllowanceAmount}
        setTokenAllowanceTxHash={setTokenAllowanceTxHash}
        insufficientAllowance={this.insufficientAllowance()}
        clearError={clearError}
        errors={errors}
        push={push}
        online={online}
        directTransfer={directTransfer}
      />
    )
  }
}

const submitTxSelector = createLoadingSelector([
  'SUBMIT_TX',
  'DIRECT_TRANSFER',
  'TRANSACTION_HASH_RETRIEVED'
])
const verifyAccountSelector = createLoadingSelector(['VERIFY_ACCOUNT'])
const checkWalletConnectionSelector = createLoadingSelector(['CHECK_WALLET_CONNECTION'])
const setTokenAllowanceSelector = createLoadingSelector(['SET_TOKEN_ALLOWANCE'])
const setTokenAllowanceWaitForConfirmationSelector = createLoadingSelector([
  'SET_TOKEN_ALLOWANCE_WAIT_FOR_CONFIRMATION'
])

const submitTxErrorSelector = createErrorSelector(['SUBMIT_TX', 'DIRECT_TRANSFER'])
const checkWalletConnectionErrorSelector = createErrorSelector(['CHECK_WALLET_CONNECTION'])
const verifyAccountErrorSelector = createErrorSelector(['VERIFY_ACCOUNT'])
const setTokenAllowanceErrorSelector = createErrorSelector(['SET_TOKEN_ALLOWANCE'])
const setTokenAllowanceWaitForConfirmationErrorSelector = createErrorSelector([
  'SET_TOKEN_ALLOWANCE_WAIT_FOR_CONFIRMATION'
])

const mapDispatchToProps = dispatch => {
  return {
    verifyAccount: (accountData, options) => dispatch(verifyAccount(accountData, options)),
    submitTx: txRequest => dispatch(submitTx(txRequest)),
    submitDirectTransferTx: txRequest => dispatch(submitDirectTransferTx(txRequest)),
    checkWalletConnection: (accountData, options) =>
      dispatch(checkWalletConnection(accountData, options)),
    decryptCloudWalletAccount: (accountData, password) =>
      dispatch(decryptCloudWalletAccount(accountData, password)),
    clearError: () => dispatch(clearError()),
    setTokenAllowance: (amount, accountData) => dispatch(setTokenAllowance(amount, accountData)),
    push: path => dispatch(push(path))
  }
}

const mapStateToProps = state => {
  return {
    userProfile: state.userReducer.profile.profileObj,
    recipients: state.userReducer.recipients,
    currency: state.cryptoPriceReducer.currency,
    txFee: state.transferReducer.txFee,
    setTokenAllowanceTxHash: state.transferReducer.setTokenAllowanceTxHash,
    transferForm: state.formReducer.transferForm,
    accountSelection: state.accountReducer.cryptoAccounts.find(_account => {
      return utils.accountsEqual(_account, { id: state.formReducer.transferForm.accountId })
    }),
    receiveAccountSelection: state.accountReducer.cryptoAccounts.find(_account => {
      return utils.accountsEqual(_account, { id: state.formReducer.transferForm.receiveAccountId })
    }),
    actionsPending: {
      submitTx: submitTxSelector(state),
      verifyAccount: verifyAccountSelector(state),
      checkWalletConnection: checkWalletConnectionSelector(state),
      setTokenAllowance: setTokenAllowanceSelector(state),
      setTokenAllowanceWaitForConfirmation: setTokenAllowanceWaitForConfirmationSelector(state)
    },
    errors: {
      submitTx: submitTxErrorSelector(state),
      verifyAccount: verifyAccountErrorSelector(state),
      checkWalletConnection: checkWalletConnectionErrorSelector(state),
      setTokenAllowance: setTokenAllowanceErrorSelector(state),
      setTokenAllowanceWaitForConfirmation: setTokenAllowanceWaitForConfirmationErrorSelector(state)
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(WalletAuthorizationContainer)
