import React, { Component } from 'react'
import { connect } from 'react-redux'
import ReceiveFormComponent from '../components/ReceiveFormComponent'
import { verifyEscrowAccountPassword } from '../actions/accountActions'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import { goToStep } from '../actions/navigationActions'
import { updateTransferForm } from '../actions/formActions'
class ReceiveFormContainer extends Component {
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
    return <ReceiveFormComponent {...this.props} />
  }
}

const verifyEscrowAccountPasswordSelector = createLoadingSelector([
  'VERIFY_ESCROW_ACCOUNT_PASSWORD'
])
const errorSelector = createErrorSelector(['VERIFY_ESCROW_ACCOUNT_PASSWORD'])

const mapDispatchToProps = dispatch => {
  return {
    updateTransferForm: form => dispatch(updateTransferForm(form)),
    verifyEscrowAccountPassword: transferInfo =>
      dispatch(verifyEscrowAccountPassword(transferInfo)),
    goToStep: n => dispatch(goToStep('receive', n))
  }
}

const mapStateToProps = state => {
  return {
    transfer: state.transferReducer.transfer,
    accountSelection: state.formReducer.transferForm.accountSelection,
    escrowAccount: state.accountReducer.escrowAccount,
    transferForm: state.formReducer.transferForm,
    actionsPending: {
      verifyEscrowAccountPassword: verifyEscrowAccountPasswordSelector(state)
    },
    error: errorSelector(state)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ReceiveFormContainer)
