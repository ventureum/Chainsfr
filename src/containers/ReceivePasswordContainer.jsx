import React, { Component } from 'react'
import { connect } from 'react-redux'
import ReceivePasswordComponent from '../components/ReceivePasswordComponent'
import { verifyPassword, clearDecryptedWallet } from '../actions/walletActions'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import { goToStep } from '../actions/navigationActions'
import { clearVerifyPasswordError } from '../actions/transferActions'
class ReceivePasswordContainer extends Component {
  render () {
    return (
      <ReceivePasswordComponent
        {...this.props}
      />
    )
  }
}

const verifyPasswordSelector = createLoadingSelector(['VERIFY_PASSWORD'])
const errorSelector = createErrorSelector(['VERIFY_PASSWORD'])

const mapDispatchToProps = dispatch => {
  return {
    verifyPassword: (transferInfo) => dispatch(verifyPassword(transferInfo, { transferAction: 'receive', n: 1 })),
    clearDecryptedWallet: () => dispatch(clearDecryptedWallet()),
    goToStep: (n) => dispatch(goToStep('receive', n)),
    clearVerifyPasswordError: () => dispatch(clearVerifyPasswordError())
  }
}

const mapStateToProps = state => {
  return {
    transfer: state.transferReducer.transfer,
    escrowWallet: state.walletReducer.escrowWallet,
    actionsPending: {
      verifyPassword: verifyPasswordSelector(state)
    },
    error: errorSelector(state)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReceivePasswordContainer)
