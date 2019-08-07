import React, { Component } from 'react'
import { connect } from 'react-redux'
import AddRecipientDialogComponent from '../components/AddRecipientDialogComponent'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import { addRecipient } from '../actions/userActions.js'

class AddRecipientDialogContainer extends Component {
  handleSubmit = newRecipient => {
    this.props.addRecipient(newRecipient)
  }

  componentDidUpdate (prevProps) {
    if (
      prevProps.actionsPending.addRecipient &&
      !this.props.actionsPending.addRecipient &&
      !this.props.error &&
      this.props.onClose
    ) {
      this.props.onClose()
    }
  }

  render () {
    let { actionsPending, error, open, onClose } = this.props
    return (
      <AddRecipientDialogComponent
        open={open}
        handleSubmit={this.handleSubmit}
        actionsPending={actionsPending}
        error={error}
        clearError={this.clearError}
        handleClose={onClose}
      />
    )
  }
}

const addRecipientSelector = createLoadingSelector(['ADD_RECIPIENT'])
const errorSelector = createErrorSelector(['ADD_RECIPIENT'])

const mapStateToProps = state => {
  return {
    actionsPending: {
      addRecipient: addRecipientSelector(state)
    },
    error: errorSelector(state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    addRecipient: recipient => dispatch(addRecipient(recipient))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddRecipientDialogContainer)
