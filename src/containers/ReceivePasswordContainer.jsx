import React, { Component } from 'react'
import { connect } from 'react-redux'
import ReceivePasswordComponent from '../components/ReceivePasswordComponent'
import { clearDecryptedWallet } from '../actions/walletActions'
import { verifyEscrowAccountPassword } from '../actions/accountActions'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import { goToStep } from '../actions/navigationActions'
import { clearVerifyEscrowAccountPasswordError } from '../actions/transferActions'
class ReceivePasswordContainer extends Component {
  render () {
    return (
      <ReceivePasswordComponent
        {...this.props}
      />
    )
  }
}

const verifyEscrowAccountPasswordSelector = createLoadingSelector(['VERIFY_ESCROW_ACCOUNT_PASSWORD'])
const errorSelector = createErrorSelector(['VERIFY_ESCROW_ACCOUNT_PASSWORD'])

const mapDispatchToProps = dispatch => {
  return {
    verifyEscrowAccountPassword: (transferInfo) => dispatch(verifyEscrowAccountPassword(transferInfo, { transferAction: 'receive', n: 1 })),
    clearDecryptedWallet: (wallet) => dispatch(clearDecryptedWallet(wallet)),
    goToStep: (n) => dispatch(goToStep('receive', n)),
    clearVerifyEscrowAccountPasswordError: () => dispatch(clearVerifyEscrowAccountPasswordError())
  }
}

const mapStateToProps = state => {
  return {
    transfer: state.transferReducer.transfer,
    escrowWallet: state.walletReducer.wallet.escrow,
    actionsPending: {
      verifyEscrowAccountPassword: verifyEscrowAccountPasswordSelector(state)
    },
    error: errorSelector(state)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReceivePasswordContainer)
