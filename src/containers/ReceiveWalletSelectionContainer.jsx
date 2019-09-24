import React, { Component } from 'react'

import { connect } from 'react-redux'
import ReceiveWalletSelection from '../components/ReceiveWalletSelectionComponent'
import {
  checkMetamaskConnection,
  checkCloudWalletConnection,
  getLedgerWalletData,
  getLastUsedAddress,
  notUseLastAddress,
  sync,
  checkLedgerDeviceConnection,
  checkLedgerAppConnection,
  checkWalletConnectConnection,
  checkWalletLinkConnection
} from '../actions/walletActions'
import { selectWallet } from '../actions/formActions'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import { goToStep } from '../actions/navigationActions'
import WalletUtils from '../wallets/utils'
import { getWalletStatus } from '../wallet'

class ReceiveWalletSelectionContainer extends Component {
  getLastUsedAddressByWalletType = walletType => {
    const { transfer, lastUsedWallet } = this.props
    const _lastUsedWalletExist =
      !lastUsedWallet.notUsed &&
      lastUsedWallet[walletType] &&
      lastUsedWallet[walletType].crypto[transfer.cryptoType]
    const lastUsedWalletByWalletType = _lastUsedWalletExist ? lastUsedWallet[walletType] : null
    return lastUsedWalletByWalletType
  }

  onWalletSelected = walletType => {
    const {
      checkMetamaskConnection,
      checkCloudWalletConnection,
      checkLedgerDeviceConnection,
      walletSelection,
      selectWallet,
      transfer
    } = this.props
    let { cryptoType } = transfer
    selectWallet(walletType)
    const lastUsedWalletByWalletType = this.getLastUsedAddressByWalletType(walletType)
    if (walletType && !lastUsedWalletByWalletType) {
      if (walletType === 'ledger' && walletType !== walletSelection) {
        checkLedgerDeviceConnection()
      } else if (walletType === 'metamask' && walletType !== walletSelection) {
        checkMetamaskConnection(cryptoType)
      } else if (walletType === 'drive') {
        checkCloudWalletConnection(cryptoType)
      }
    }
  }

  componentDidMount () {
    const { profile } = this.props
    if (profile.isAuthenticated && profile.idToken) {
      this.props.getLastUsedAddress(profile.idToken)
    }
  }

  useAnotherAddress = () => {
    const {
      notUseLastAddress,
      transfer,
      walletSelection,
      checkMetamaskConnection,
      checkCloudWalletConnection,
      checkLedgerDeviceConnection
    } = this.props
    let { cryptoType } = transfer
    notUseLastAddress()
    if (walletSelection === 'ledger') {
      checkLedgerDeviceConnection()
    } else if (walletSelection === 'metamask') {
      checkMetamaskConnection(cryptoType)
    } else if (walletSelection === 'drive') {
      checkCloudWalletConnection(cryptoType)
    }
  }

  componentDidUpdate (prevProps) {
    const {
      wallet,
      walletSelection,
      actionsPending,
      error,
      transfer,
      checkLedgerAppConnection,
      getLedgerWalletData,
      checkWalletConnectConnection,
      checkWalletLinkConnection
    } = this.props
    let { cryptoType } = transfer
    const prevActionsPending = prevProps.actionsPending
    if (
      prevActionsPending.checkLedgerDeviceConnection &&
      !actionsPending.checkLedgerDeviceConnection &&
      wallet.connected
    ) {
      checkLedgerAppConnection(cryptoType)
    } else if (
      prevActionsPending.checkLedgerAppConnection &&
      !actionsPending.checkLedgerAppConnection
    ) {
      getLedgerWalletData(cryptoType)
    } else if (
      prevActionsPending.onWalletConnectConnected &&
      !actionsPending.onWalletConnectConnected &&
      wallet.connected
    ) {
      // retrieve wallet data once connected
      checkWalletConnectConnection(walletSelection, cryptoType)
    } else if (
      prevActionsPending.onWalletLinkConnected &&
      !actionsPending.onWalletLinkConnected &&
      wallet.connected
    ) {
      // retrieve wallet data once connected
      checkWalletLinkConnection(walletSelection, cryptoType)
    } else if (
      wallet &&
      wallet.connected &&
      (prevActionsPending.checkWalletConnection && !actionsPending.checkWalletConnection) &&
      !error
    ) {
      // wallet connected, sync wallet data
      this.onSync()
    }
  }

  onSync = () => {
    let { wallet, walletSelection, transfer } = this.props
    const lastUsedWalletByWalletType = this.getLastUsedAddressByWalletType(walletSelection)
    this.props.sync(
      WalletUtils.toWalletDataFromState(
        walletSelection,
        transfer.cryptoType,
        lastUsedWalletByWalletType || wallet
      ),
      (index, change) => {
        this.setState({ syncProgress: { index, change } })
      }
    )
  }

  render () {
    const { walletSelection, transfer, wallet, ...other } = this.props
    const walletStatus = getWalletStatus(walletSelection)

    let address
    if (wallet) {
      if (wallet.accounts) {
        address = wallet.accounts[0]
      } else if (wallet.crypto[transfer.cryptoType]) {
        address = wallet.crypto[transfer.cryptoType][0].address
      }
    }

    return (
      <ReceiveWalletSelection
        walletType={walletSelection}
        onWalletSelected={this.onWalletSelected}
        useAnotherAddress={this.useAnotherAddress}
        lastUsedAddressByWalletType={this.getLastUsedAddressByWalletType(walletSelection)}
        walletStatus={walletStatus}
        wallet={wallet}
        address={address}
        transfer={transfer}
        {...other}
      />
    )
  }
}
const checkWalletConnectionSelector = createLoadingSelector([
  'CHECK_CLOUD_WALLET_CONNECTION',
  'CHECK_METAMASK_CONNECTION',
  'GET_LEDGER_WALLET_DATA',
  'CHECK_WALLETCONNECT_CONNECTION',
  'CHECK_WALLETLINK_CONNECTION'
])

const syncSelector = createLoadingSelector(['SYNC'])
const checkLedgerDeviceConnectionSelector = createLoadingSelector([
  'CHECK_LEDGER_DEVICE_CONNECTION'
])
const checkLedgerAppConnectionSelector = createLoadingSelector(['CHECK_LEDGER_APP_CONNECTION'])
const checkWalletConnectConnectionSelector = createLoadingSelector([
  'CHECK_WALLETCONNECT_CONNECTION'
])
const onWalletConnectConnectedSelector = createLoadingSelector(['ON_WALLETCONNECT_CONNECTED'])
const checkWalletLinkConnectionSelector = createLoadingSelector(['CHECK_WALLETLINK_CONNECTION'])
const onWalletLinkConnectedSelector = createLoadingSelector(['ON_WALLETLINK_CONNECTED'])

const errorSelector = createErrorSelector([
  'CHECK_METAMASK_CONNECTION',
  'CHECK_CLOUD_WALLET_CONNECTION',
  'SYNC_LEDGER_ACCOUNT_INFO',
  'UPDATE_BTC_ACCOUNT_INFO',
  'CHECK_WALLETCONNECT_CONNECTION',
  'CHECK_WALLETLINK_CONNECTION'
])
const getLastUsedAddressSelector = createLoadingSelector(['GET_LAST_USED_ADDRESS'])

const mapDispatchToProps = dispatch => {
  return {
    checkMetamaskConnection: cryptoType => dispatch(checkMetamaskConnection(cryptoType)),
    checkCloudWalletConnection: cryptoType => dispatch(checkCloudWalletConnection(cryptoType)),
    getLedgerWalletData: cryptoType => dispatch(getLedgerWalletData(cryptoType)),
    selectWallet: w => dispatch(selectWallet(w)),
    goToStep: n => dispatch(goToStep('receive', n)),
    sync: (walletData, progress) => dispatch(sync(walletData, progress)),
    getLastUsedAddress: googleId => dispatch(getLastUsedAddress(googleId)),
    notUseLastAddress: () => dispatch(notUseLastAddress()),
    checkLedgerDeviceConnection: () => dispatch(checkLedgerDeviceConnection()),
    checkLedgerAppConnection: cryptoType => dispatch(checkLedgerAppConnection(cryptoType)),
    checkWalletConnectConnection: (walletType, cryptoType) =>
      dispatch(checkWalletConnectConnection(walletType, cryptoType)),
    checkWalletLinkConnection: (walletType, cryptoType) =>
      dispatch(checkWalletLinkConnection(walletType, cryptoType))
  }
}

const mapStateToProps = state => {
  return {
    walletSelection: state.formReducer.walletSelection,
    wallet: state.walletReducer.wallet[state.formReducer.walletSelection],
    lastUsedWallet: state.walletReducer.lastUsedWallet,
    transfer: state.transferReducer.transfer,
    profile: state.userReducer.profile,
    actionsPending: {
      checkWalletConnection: checkWalletConnectionSelector(state),
      sync: syncSelector(state),
      getLastUsedAddress: getLastUsedAddressSelector(state),
      checkLedgerDeviceConnection: checkLedgerDeviceConnectionSelector(state),
      checkLedgerAppConnection: checkLedgerAppConnectionSelector(state),
      checkWalletConnectConnection: checkWalletConnectConnectionSelector(state),
      onWalletConnectConnected: onWalletConnectConnectedSelector(state),
      checkWalletLinkConnection: checkWalletLinkConnectionSelector(state),
      onWalletLinkConnected: onWalletLinkConnectedSelector(state)
    },
    error: errorSelector(state)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReceiveWalletSelectionContainer)
