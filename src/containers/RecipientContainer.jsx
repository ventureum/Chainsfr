import React, { Component } from 'react'
import { connect } from 'react-redux'
import Recipient from '../components/RecipientComponent'
import { updateTransferForm, generateSecurityAnswer, clearSecurityAnswer } from '../actions/formActions'
import { goToStep } from '../actions/navigationActions'
import update from 'immutability-helper'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import { gettxFee } from '../actions/transferActions'

type Props = {
  updateTransferForm: Function,
  generateSecurityAnswer: Function,
  clearSecurityAnswer: Function,
  goToStep: Function,
  cryptoSelection: string,
  walletSelection: string,
  transferForm: Object,
  txFee: any,
  wallet: Object,
  actionsPending: Object,
  error: any,
}

class RecipientContainer extends Component<Props> {
  componentDidMount () {
    let { profile, transferForm, updateTransferForm } = this.props

    if (profile.isAuthenticated) {
      // prefill sender's email address for authenticated user
      updateTransferForm(update(transferForm, { sender: { $set: profile.profileObj.email } }))
    }
  }

  render () {
    return (
      <Recipient
        {...this.props}
      />
    )
  }
}
const gettxFeeSelector = createLoadingSelector(['GET_TX_COST'])
const errorSelector = createErrorSelector(['GET_TX_COST'])

const mapDispatchToProps = dispatch => {
  return {
    updateTransferForm: (form) => dispatch(updateTransferForm(form)),
    generateSecurityAnswer: () => dispatch(generateSecurityAnswer()),
    clearSecurityAnswer: () => dispatch(clearSecurityAnswer()),
    goToStep: (n) => dispatch(goToStep('send', n)),
    gettxFee: (txRequest) => dispatch(gettxFee(txRequest))

  }
}

const mapStateToProps = state => {
  return {
    cryptoSelection: state.formReducer.cryptoSelection,
    walletSelection: state.formReducer.walletSelection,
    transferForm: state.formReducer.transferForm,
    wallet: state.walletReducer.wallet[state.formReducer.walletSelection],
    profile: state.userReducer.profile,
    txFee: state.transferReducer.txFee,
    actionsPending: {
      gettxFee: gettxFeeSelector(state)
    },
    error: errorSelector(state)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RecipientContainer)
