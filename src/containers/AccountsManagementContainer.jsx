import React, { Component } from 'react'
import { connect } from 'react-redux'
import AccountsManagementComponent from '../components/AccountsManagementComponent'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import { getCryptoAccounts, addCryptoAccount } from '../actions/userActions'
import { accountStatus } from '../types/account.flow'
import { syncWithNetwork } from '../actions/accountAction'
// import { push } from 'connected-react-router'
// import path from '../Paths.js'
// import {
//   AddRecipientDialog,
//   EditRecipientDialog,
//   RemoveRecipientDialog
// } from '../components/RecipientActionComponents'

class AccountsManagementContainer extends Component {
  // state = {
  //   openAddRecipientDialog: false,
  //   openEditRecipientDialog: false,
  //   openRemoveRecipientDialog: false,
  //   chosenRecipient: null
  // }

  componentDidMount () {
    // if (this.props.cryptoAccounts.length === 0) {
    this.props.getCryptoAccounts()
    // }
  }

  componentDidUpdate (prevProps) {
    const { cryptoAccounts, syncWithNetwork, actionsPending } = this.props
    if (prevProps.actionsPending.getCryptoAccounts && !actionsPending.getCryptoAccounts) {
      cryptoAccounts.forEach(cryptoAccount => {
        if (cryptoAccount.status === accountStatus.initialized) {
          syncWithNetwork(cryptoAccount)
        }
      })
    }
  }

  // componentDidUpdate (prevProps) {
  //   if (
  //     prevProps.actionsPending.addRecipient &&
  //     !this.props.actionsPending.addRecipient &&
  //     !this.props.error
  //   ) {
  //     this.toggleAddRecipientDialog()
  //   } else if (
  //     prevProps.actionsPending.editRecipient &&
  //     !this.props.actionsPending.editRecipient &&
  //     !this.props.error
  //   ) {
  //     this.toggleEditRecipientDialog()
  //   } else if (
  //     prevProps.actionsPending.removeRecipient &&
  //     !this.props.actionsPending.removeRecipient &&
  //     !this.props.error
  //   ) {
  //     this.toggleRemoveRecipientDialog()
  //   }
  // }

  // onSend = recipient => {
  //   this.props.push(`${path.transfer}?destination=${recipient.email}`)
  // }

  // toggleAddRecipientDialog = () => {
  //   this.setState(prevState => {
  //     return {
  //       openAddRecipientDialog: !prevState.openAddRecipientDialog
  //     }
  //   })
  // }

  // toggleEditRecipientDialog = recipient => {
  //   this.setState(prevState => {
  //     return {
  //       openEditRecipientDialog: !prevState.openEditRecipientDialog,
  //       chosenRecipient: recipient
  //     }
  //   })
  // }

  // toggleRemoveRecipientDialog = recipient => {
  //   this.setState(prevState => {
  //     return {
  //       openRemoveRecipientDialog: !prevState.openRemoveRecipientDialog,
  //       chosenRecipient: recipient
  //     }
  //   })
  // }

  render () {
    const { addCryptoAccount, actionsPending, cryptoAccounts } = this.props
    return (
      <AccountsManagementComponent
        cryptoAccounts={cryptoAccounts}
        addCryptoAccount={addCryptoAccount}
        actionsPending={actionsPending}
      />
    )

    // const {
    //   chosenRecipient,
    //   openAddRecipientDialog,
    //   openEditRecipientDialog,
    //   openRemoveRecipientDialog
    // } = this.state
    // return (
    //   <>
    //     <RecipientsComponent
    //       onSend={this.onSend}
    //       {...others}
    //       addRecipient={this.toggleAddRecipientDialog}
    //       editRecipient={recipient => {
    //         this.toggleEditRecipientDialog(recipient)
    //       }}
    //       removeRecipient={recipient => {
    //         this.toggleRemoveRecipientDialog(recipient)
    //       }}
    //       actionsPending={actionsPending}
    //     />
    //     {openAddRecipientDialog && (
    //       <AddRecipientDialog
    //         open={openAddRecipientDialog}
    //         handleClose={() => this.toggleAddRecipientDialog(null)}
    //         handleSubmit={addRecipient}
    //         loading={actionsPending.addRecipient}
    //       />
    //     )}
    //     {openEditRecipientDialog && (
    //       <EditRecipientDialog
    //         open={openEditRecipientDialog}
    //         handleClose={() => this.toggleEditRecipientDialog(null)}
    //         handleSubmit={editRecipient}
    //         loading={actionsPending.editRecipient}
    //         recipient={chosenRecipient}
    //       />
    //     )}
    //     {openRemoveRecipientDialog && (
    //       <RemoveRecipientDialog
    //         open={openRemoveRecipientDialog}
    //         handleClose={() => this.toggleRemoveRecipientDialog(null)}
    //         handleSubmit={removeRecipient}
    //         loading={actionsPending.removeRecipient}
    //         recipient={chosenRecipient}
    //       />
    //     )}
    //   </>
    // )
  }
}

const getCryptoAccountsSelector = createLoadingSelector(['GET_CRYPTO_ACCOUNTS'])
const addCryptoAccountSelector = createLoadingSelector(['ADD_CRYPTO_ACCOUNT'])

// const removeRecipientSelector = createLoadingSelector(['REMOVE_RECIPIENT'])
// const editRecipientSelector = createLoadingSelector(['EDIT_RECIPIENT'])

const errorSelector = createErrorSelector(['GET_CRYPTO_ACCOUNTS', 'ADD_CRYPTO_ACCOUNT'])

const mapStateToProps = state => {
  return {
    cryptoAccounts: state.userReducer.cryptoAccounts,
    actionsPending: {
      addCryptoAccount: addCryptoAccountSelector(state),
      getCryptoAccounts: getCryptoAccountsSelector(state)
    },
    error: errorSelector(state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    getCryptoAccounts: () => dispatch(getCryptoAccounts()),
    addCryptoAccount: accountData => dispatch(addCryptoAccount(accountData)),
    syncWithNetwork: accountData => dispatch(syncWithNetwork(accountData))
    // removeRecipient: recipient => dispatch(removeRecipient(recipient)),
    // editRecipient: (oldRecipient, newRecipient) =>
    //   dispatch(editRecipient(oldRecipient, newRecipient)),
    // push: path => dispatch(push(path))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AccountsManagementContainer)
