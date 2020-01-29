import React, { Component } from 'react'
import { connect } from 'react-redux'
import RecipientsComponent from '../components/RecipientsComponent'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import { getRecipients, addRecipient, removeRecipient, editRecipient } from '../actions/userActions'
import { push } from 'connected-react-router'
import path from '../Paths.js'
import {
  AddRecipientDialog,
  EditRecipientDialog,
  RemoveRecipientDialog
} from '../components/RecipientActionComponents'

class RecipientsContainer extends Component {
  state = {
    openAddRecipientDialog: false,
    openEditRecipientDialog: false,
    openRemoveRecipientDialog: false,
    chosenRecipient: null
  }

  componentDidMount () {
    this.props.getRecipients()
  }

  componentDidUpdate (prevProps) {
    if (
      prevProps.actionsPending.addRecipient &&
      !this.props.actionsPending.addRecipient &&
      !this.props.error
    ) {
      this.toggleAddRecipientDialog()
    } else if (
      prevProps.actionsPending.editRecipient &&
      !this.props.actionsPending.editRecipient &&
      !this.props.error
    ) {
      this.toggleEditRecipientDialog()
    } else if (
      prevProps.actionsPending.removeRecipient &&
      !this.props.actionsPending.removeRecipient &&
      !this.props.error
    ) {
      this.toggleRemoveRecipientDialog()
    }
  }

  onSend = recipient => {
    this.props.push(`${path.transfer}?destination=${recipient.email}&&receiverName=${recipient.name}`)
  }

  toggleAddRecipientDialog = () => {
    this.setState(prevState => {
      return {
        openAddRecipientDialog: !prevState.openAddRecipientDialog
      }
    })
  }

  toggleEditRecipientDialog = recipient => {
    this.setState(prevState => {
      return {
        openEditRecipientDialog: !prevState.openEditRecipientDialog,
        chosenRecipient: recipient
      }
    })
  }

  toggleRemoveRecipientDialog = recipient => {
    this.setState(prevState => {
      return {
        openRemoveRecipientDialog: !prevState.openRemoveRecipientDialog,
        chosenRecipient: recipient
      }
    })
  }

  render () {
    let { actionsPending, addRecipient, removeRecipient, editRecipient, online, ...others } = this.props
    const {
      chosenRecipient,
      openAddRecipientDialog,
      openEditRecipientDialog,
      openRemoveRecipientDialog
    } = this.state
    return (
      <>
        <RecipientsComponent
          onSend={this.onSend}
          {...others}
          addRecipient={this.toggleAddRecipientDialog}
          editRecipient={recipient => {
            this.toggleEditRecipientDialog(recipient)
          }}
          removeRecipient={recipient => {
            this.toggleRemoveRecipientDialog(recipient)
          }}
          actionsPending={actionsPending}
        />
        {openAddRecipientDialog && (
          <AddRecipientDialog
            open={openAddRecipientDialog}
            handleClose={() => this.toggleAddRecipientDialog(null)}
            handleSubmit={addRecipient}
            loading={actionsPending.addRecipient}
            online={online}
          />
        )}
        {openEditRecipientDialog && (
          <EditRecipientDialog
            open={openEditRecipientDialog}
            handleClose={() => this.toggleEditRecipientDialog(null)}
            handleSubmit={editRecipient}
            loading={actionsPending.editRecipient}
            recipient={chosenRecipient}
            online={online}
          />
        )}
        {openRemoveRecipientDialog && (
          <RemoveRecipientDialog
            open={openRemoveRecipientDialog}
            handleClose={() => this.toggleRemoveRecipientDialog(null)}
            handleSubmit={removeRecipient}
            loading={actionsPending.removeRecipient}
            recipient={chosenRecipient}
            online={online}
          />
        )}
      </>
    )
  }
}

const getRecipientsSelector = createLoadingSelector(['GET_RECIPIENTS'])
const addRecipientSelector = createLoadingSelector(['ADD_RECIPIENT'])
const removeRecipientSelector = createLoadingSelector(['REMOVE_RECIPIENT'])
const editRecipientSelector = createLoadingSelector(['EDIT_RECIPIENT'])

const errorSelector = createErrorSelector([
  'GET_RECIPIENTS',
  'ADD_RECIPIENT',
  'REMOVE_RECIPIENT',
  'EDIT_RECIPIENT'
])

const mapStateToProps = state => {
  return {
    recipients: state.userReducer.recipients,
    actionsPending: {
      addRecipient: addRecipientSelector(state),
      removeRecipient: removeRecipientSelector(state),
      getRecipients: getRecipientsSelector(state),
      editRecipient: editRecipientSelector(state)
    },
    error: errorSelector(state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    getRecipients: () => dispatch(getRecipients()),
    addRecipient: recipient => dispatch(addRecipient(recipient)),
    removeRecipient: recipient => dispatch(removeRecipient(recipient)),
    editRecipient: (oldRecipient, newRecipient) =>
      dispatch(editRecipient(oldRecipient, newRecipient)),
    push: path => dispatch(push(path))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RecipientsContainer)
