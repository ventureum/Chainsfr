import React, { Component } from 'react'
import { connect } from 'react-redux'
import ReceivePasswordComponent from '../components/ReceivePasswordComponent'
import { verifyPassword, clearDecryptedWallet } from '../actions/walletActions'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import { goToStep } from '../actions/navigationActions'

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
    verifyPassword: (encriptedWallet, password) => dispatch(verifyPassword(null, encriptedWallet, password, { transferAction: 'receive', n: 1 })),
    clearDecryptedWallet: () => dispatch(clearDecryptedWallet()),
    goToStep: (n) => dispatch(goToStep('receive', n))
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
