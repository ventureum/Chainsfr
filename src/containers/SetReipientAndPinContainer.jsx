import React, { Component } from 'react'
import { connect } from 'react-redux'
import SetReipientAndPin from '../components/SetReipientAndPinComponent'
import { updateTransferForm } from '../actions'

class SetReipientAndPinContainer extends Component {
  render () {
    return (
      <SetReipientAndPin
        {...this.props}
      />
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    updateTransferForm: (form) => dispatch(updateTransferForm(form))
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
)(SetReipientAndPinContainer)
