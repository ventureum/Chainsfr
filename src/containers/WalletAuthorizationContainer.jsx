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

type Props = {
  transferForm: Object,
  actionsPending: Object,
  verifyAccount: Function,
  submitTx: Function,
  currency: String,
  userProfile: Object,
  txFee: Object,
  accountSelection: Object,
  push: Function,
  checkWalletConnection: Function,
  decryptCloudWalletAccount: Function,
  clearError: Function,
  markAccountDirty: Function,
  errors: Object
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
      verifyAccount,
      markAccountDirty,
      accountSelection,
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
    } else if (prevProps.actionsPending.submitTx && !actionsPending.submitTx && !errors.submitTx) {
      push(`${path.transfer}?step=3`)
    }
  }

  render () {
    const { transferForm, actionsPending, clearError, accountSelection, errors, push } = this.props

    return (
      <WalletAuthorizationComponent
        accountSelection={accountSelection}
        transferForm={transferForm}
        actionsPending={actionsPending}
        checkWalletConnection={this.checkWalletConnection}
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

const submitTxErrorSelector = createErrorSelector(['SUBMIT_TX'])
const checkWalletConnectionErrorSelector = createErrorSelector(['CHECK_WALLET_CONNECTION'])
const verifyAccountErrorSelector = createErrorSelector(['VERIFY_ACCOUNT'])

const mapDispatchToProps = dispatch => {
  return {
    verifyAccount: (accountData, options) => dispatch(verifyAccount(accountData, options)),
    submitTx: txRequest => dispatch(submitTx(txRequest)),
    checkWalletConnection: (accountData, options) =>
      dispatch(checkWalletConnection(accountData, options)),
    decryptCloudWalletAccount: (accountData, password) =>
      dispatch(decryptCloudWalletAccount(accountData, password)),
    clearError: () => dispatch(clearError()),
    markAccountDirty: accountData => dispatch(markAccountDirty(accountData)),
    push: path => dispatch(push(path))
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
    errors: {
      submitTx: submitTxErrorSelector(state),
      verifyAccount: verifyAccountErrorSelector(state),
      checkWalletConnection: checkWalletConnectionErrorSelector(state)
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(WalletAuthorizationContainer)
