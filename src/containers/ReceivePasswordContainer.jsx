import React, { Component } from 'react'
import { connect } from 'react-redux'
import ReceivePasswordComponent from '../components/ReceivePasswordComponent'
import { verifyPassword, clearDecryptedWallet } from '../actions'
import { createLoadingSelector, createErrorSelector } from '../selectors'

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
    verifyPassword: (encriptedWallet, password) => dispatch(verifyPassword(encriptedWallet, password)),
    clearDecryptedWallet: () => dispatch(clearDecryptedWallet())
  }
}

const mapStateToProps = state => {
  return {
    transfer: state.transferReducer.transfer,
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
