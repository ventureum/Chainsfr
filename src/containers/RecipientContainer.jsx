import React, { Component } from 'react'
import { connect } from 'react-redux'
import Recipient from '../components/RecipientComponent'
import { updateTransferForm, generateSecurityAnswer } from '../actions'

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
    generateSecurityAnswer: () => dispatch(generateSecurityAnswer())
  }
}

const mapStateToProps = state => {
  return {
    cryptoSelection: state.transferReducer.cryptoSelection,
    transferForm: state.transferReducer.transferForm
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RecipientContainer)
