import React, { Component } from 'react'
import { connect } from 'react-redux'
import Recipient from '../components/RecipientComponent'
import { updateTransferForm, generateSecurityAnswer, clearSecurityAnswer } from '../actions'

class RecipientContainer extends Component {
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
    clearSecurityAnswer: () => dispatch(clearSecurityAnswer())
  }
}

const mapStateToProps = state => {
  return {
    cryptoSelection: state.transferReducer.cryptoSelection,
    transferForm: state.transferReducer.transferForm,
    metamask: state.userReducer.metamask
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RecipientContainer)
