// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'

import WalletAuthorizationComponent from '../components/WalletAuthorizationComponent'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import { verifyAccount, checkWalletConnection } from '../actions/walletActions'
import { decryptCloudWalletAccount, markAccountDirty } from '../actions/accountActions.js'
import { submitTx } from '../actions/transferActions'
import { clearError } from '../actions/userActions'
import utils from '../utils'
import { push } from 'connected-react-router'
import path from '../Paths.js'
import { getCryptoDecimals, isERC20 } from '../tokens'
import BN from 'bn.js'
import { setTokenAllowance } from '../actions/transferActions'

type Props = {
  transferForm: Object,
  actionsPending: Object,
  verifyAccount: Function,
  submitTx: Function,
  currency: String,
  userProfile: Object,
  txFee: Object,
  setTokenAllowanceTxHash: string,
  accountSelection: Object,
  push: Function,
  checkWalletConnection: Function,
  decryptCloudWalletAccount: Function,
  clearError: Function,
  markAccountDirty: Function,
  setTokenAllowance: Function,
  errors: Object
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
    const { accountSelection, transferForm } = this.props
    if (!isERC20(accountSelection.cryptoType)) return false
    const { transferAmount } = transferForm
    const transferAmountBasicTokenUnit = utils
      .toBasicTokenUnit(transferAmount, getCryptoDecimals(accountSelection.cryptoType))
      .toString()
    
    return new BN(transferAmountBasicTokenUnit).gt(new BN(accountSelection.multiSigAllowance))
  }

  componentDidUpdate (prevProps) {
    const {
      transferForm,
      submitTx,
      currency,
      userProfile,
      txFee,
      actionsPending,
      verifyAccount,
      markAccountDirty,
      accountSelection,
      setTokenAllowance,
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
      // mart account dirty
      markAccountDirty(accountSelection)
      // submit tx
      submitTx({
        fromAccount: accountSelection,
        transferAmount: transferAmount,
        transferFiatAmountSpot: transferCurrencyAmount,
        fiatType: currency,
        // receiver
        destination: destination,
        receiverName: receiverName,
        // sender
        senderName: senderName,
        senderAvatar: userProfile.imageUrl,
        sender: sender,
        password: password,
        sendMessage: sendMessage,
        txFee: txFee
      })
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
      push(`${path.transfer}?step=3`)
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
      push
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
      />
    )
  }
}

const submitTxSelector = createLoadingSelector(['SUBMIT_TX', 'TRANSACTION_HASH_RETRIEVED'])
const verifyAccountSelector = createLoadingSelector(['VERIFY_ACCOUNT'])
const checkWalletConnectionSelector = createLoadingSelector(['CHECK_WALLET_CONNECTION'])
const setTokenAllowanceSelector = createLoadingSelector([
  'SET_TOKEN_ALLOWANCE'
])
const setTokenAllowanceWaitForConfirmationSelector = createLoadingSelector(['SET_TOKEN_ALLOWANCE_WAIT_FOR_CONFIRMATION'])

const submitTxErrorSelector = createErrorSelector(['SUBMIT_TX'])
const checkWalletConnectionErrorSelector = createErrorSelector(['CHECK_WALLET_CONNECTION'])
const verifyAccountErrorSelector = createErrorSelector(['VERIFY_ACCOUNT'])
const setTokenAllowanceErrorSelector = createErrorSelector([
  'SET_TOKEN_ALLOWANCE'
])
const setTokenAllowanceWaitForConfirmationErrorSelector = createErrorSelector(['SET_TOKEN_ALLOWANCE_WAIT_FOR_CONFIRMATION'])

const mapDispatchToProps = dispatch => {
  return {
    verifyAccount: (accountData, options) => dispatch(verifyAccount(accountData, options)),
    submitTx: txRequest => dispatch(submitTx(txRequest)),
    checkWalletConnection: (accountData, options) =>
      dispatch(checkWalletConnection(accountData, options)),
    decryptCloudWalletAccount: (accountData, password) =>
      dispatch(decryptCloudWalletAccount(accountData, password)),
    clearError: () => dispatch(clearError()),
    setTokenAllowance: (amount, accountData) => dispatch(setTokenAllowance(amount, accountData)),
    markAccountDirty: accountData => dispatch(markAccountDirty(accountData)),
    push: path => dispatch(push(path))
  }
}

const mapStateToProps = state => {
  return {
    userProfile: state.userReducer.profile.profileObj,
    currency: state.cryptoPriceReducer.currency,
    txFee: state.transferReducer.txFee,
    setTokenAllowanceTxHash: state.transferReducer.setTokenAllowanceTxHash,
    transferForm: state.formReducer.transferForm,
    accountSelection: state.accountReducer.cryptoAccounts.find(_account => {
      return utils.accountsEqual(_account, state.formReducer.transferForm.accountId)
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
