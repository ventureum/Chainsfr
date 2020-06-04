import React, { PureComponent } from 'react'
import { connect } from 'react-redux'
import {
  changeChainsfrWalletPassword,
  exportCloudWallet,
  clearCloudWalletExport
} from '../actions/walletActions'
import {
  getUserCloudWalletFolderMeta,
  getUserRegisterTime,
  onLogout
} from '../actions/userActions'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import { enqueueSnackbar } from '../actions/notificationActions.js'

import UserSettingComponent from '../components/UserSettingComponent'

class UserSettingContainer extends PureComponent {
  render () {
    return <UserSettingComponent {...this.props} />
  }
}

const changeChainsfrWalletPasswordSelector = createLoadingSelector([
  'CHANGE_CHAINSFR_WALLET_PASSWORD'
])
const errorSelector = createErrorSelector(['CHANGE_CHAINSFR_WALLET_PASSWORD'])

const mapDispatchToProps = dispatch => {
  return {
    changeChainsfrWalletPassword: (oldPassword, newPassword) =>
      dispatch(changeChainsfrWalletPassword(oldPassword, newPassword)),
    getUserCloudWalletFolderMeta: () => dispatch(getUserCloudWalletFolderMeta()),
    getUserRegisterTime: () => dispatch(getUserRegisterTime()),
    exportCloudWallet: () => dispatch(exportCloudWallet()),
    clearCloudWalletExport: () => dispatch(clearCloudWalletExport()),
    enqueueSnackbar: payload => dispatch(enqueueSnackbar(payload)),
    onLogout: () => dispatch(onLogout())
  }
}
const mapStateToProps = state => {
  return {
    profile: state.userReducer.profile,
    actionsPending: {
      changeChainsfrWalletPassword: changeChainsfrWalletPasswordSelector(state)
    },
    cloudWalletFolderMeta: state.userReducer.cloudWalletFolderMeta,
    registerTime: state.userReducer.registerTime,
    exportedCloundWalletData: state.userReducer.exportedCloundWalletData,
    error: errorSelector(state)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserSettingContainer)
