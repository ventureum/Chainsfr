import React, { Component } from 'react'
import { connect } from 'react-redux'
import Recipient from '../components/RecipientComponent'
import { updateTransferForm, generateSecurityAnswer, clearSecurityAnswer } from '../actions/formActions'
import { goToStep } from '../actions/navigationActions'
import update from 'immutability-helper'

type Props = {
  updateTransferForm: Function,
  generateSecurityAnswer: Function,
  clearSecurityAnswer: Function,
  goToStep: Function,
  cryptoSelection: string,
  transferForm: Object,
  wallet: Object
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

const mapDispatchToProps = dispatch => {
  return {
    updateTransferForm: (form) => dispatch(updateTransferForm(form)),
    generateSecurityAnswer: () => dispatch(generateSecurityAnswer()),
    clearSecurityAnswer: () => dispatch(clearSecurityAnswer()),
    goToStep: (n) => dispatch(goToStep('send', n))
  }
}

const mapStateToProps = state => {
  return {
    cryptoSelection: state.formReducer.cryptoSelection,
    transferForm: state.formReducer.transferForm,
    wallet: state.walletReducer.wallet[state.formReducer.walletSelection],
    profile: state.userReducer.profile
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RecipientContainer)
