// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'

import WalletAuthorizationComponent from '../components/WalletAuthorizationComponent'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import { verifyAccount, checkWalletConnection } from '../actions/walletActions'
import { decryptCloudWalletAccount, markAccountDirty } from '../actions/accountActions.js'
import { submitTx } from '../actions/transferActions'
import { goToStep } from '../actions/navigationActions'
import { clearError } from '../actions/userActions'
import utils from '../utils'

type Props = {
  transferForm: Object,
  actionsPending: Object,
  verifyAccount: Function,
  submitTx: Function,
  currency: String,
  userProfile: Object,
  txFee: Object,
  accountSelection: Object,
  goToStep: Function,
  submitTxError: string,
  decryptCloudWalletAccountError: string,
  checkWalletConnectionError: string,
  checkWalletConnection: Function,
  decryptCloudWalletAccount: Function,
  clearError: Function,
  markAccountDirty: Function
}

class WalletAuthorizationContainer extends Component<Props> {
  checkWalletConnection = additionalInfo => {
    const { accountSelection } = this.props
    this.props.checkWalletConnection(accountSelection, additionalInfo)
  }

  componentDidUpdate (prevProps) {
    const {
      transferForm,
      submitTx,
      currency,
      userProfile,
      txFee,
      actionsPending,
      goToStep,
      submitTxError,
      verifyAccount,
      checkWalletConnectionError,
      markAccountDirty,
      accountSelection
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
    if (
      prevProps.actionsPending.checkWalletConnection &&
      !actionsPending.checkWalletConnection &&
      !checkWalletConnectionError
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
    } else if (prevProps.actionsPending.submitTx && !actionsPending.submitTx && !submitTxError) {
      goToStep(1)
    }
  }

  render () {
    const {
      transferForm,
      actionsPending,
      decryptCloudWalletAccount,
      clearError,
      checkWalletConnectionError,
      decryptCloudWalletAccountError,
      accountSelection,
      goToStep
    } = this.props
    return (
      <WalletAuthorizationComponent
        goToStep={goToStep}
        accountSelection={accountSelection}
        transferForm={transferForm}
        actionsPending={actionsPending}
        checkWalletConnection={this.checkWalletConnection}
        decryptCloudWalletAccount={decryptCloudWalletAccount}
        clearError={clearError}
        checkWalletConnectionError={checkWalletConnectionError}
        decryptCloudWalletAccountError={decryptCloudWalletAccountError}
      />
    )
  }
}

const submitTxSelector = createLoadingSelector(['SUBMIT_TX', 'TRANSACTION_HASH_RETRIEVED'])
const verifyAccountSelector = createLoadingSelector(['VERIFY_ACCOUNT'])
const checkWalletConnectionSelector = createLoadingSelector(['CHECK_WALLET_CONNECTION'])

const submitTxErrorSelector = createErrorSelector(['SUBMIT_TX'])
const decryptCloudWalletAccountErrorSelector = createErrorSelector(['DECRYPT_CLOUD_WALLET_ACCOUNT'])
const checkWalletConnectionErrorSelector = createErrorSelector(['CHECK_WALLET_CONNECTION'])
const mapDispatchToProps = dispatch => {
  return {
    verifyAccount: (accountData, options) => dispatch(verifyAccount(accountData, options)),
    submitTx: txRequest => dispatch(submitTx(txRequest)),
    goToStep: n => dispatch(goToStep('send', n)),
    checkWalletConnection: (accountData, options) =>
      dispatch(checkWalletConnection(accountData, options)),
    decryptCloudWalletAccount: (accountData, password) =>
      dispatch(decryptCloudWalletAccount(accountData, password)),
    clearError: () => dispatch(clearError()),
    markAccountDirty: accountData => dispatch(markAccountDirty(accountData))
  }
}

const mapStateToProps = state => {
  return {
    userProfile: state.userReducer.profile.profileObj,
    currency: state.cryptoPriceReducer.currency,
    txFee: state.transferReducer.txFee,
    transferForm: state.formReducer.transferForm,
    accountSelection: state.accountReducer.cryptoAccounts.find(_account => {
      return utils.accountsEqual(_account, state.formReducer.transferForm.accountId)
    }),
    actionsPending: {
      submitTx: submitTxSelector(state),
      verifyAccount: verifyAccountSelector(state),
      checkWalletConnection: checkWalletConnectionSelector(state)
    },
    submitTxError: submitTxErrorSelector(state),
    checkWalletConnectionError: checkWalletConnectionErrorSelector(state),
    decryptCloudWalletAccountError: decryptCloudWalletAccountErrorSelector(state)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(WalletAuthorizationContainer)
