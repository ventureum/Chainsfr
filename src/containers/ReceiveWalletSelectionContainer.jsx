import React, { Component } from 'react'

import { connect } from 'react-redux'
import ReceiveWalletSelection from '../components/ReceiveWalletSelectionComponent'
import {
  checkMetamaskConnection,
  checkCloudWalletConnection,
  checkLedgerNanoSConnection,
  syncLedgerAccountInfo,
  updateBtcAccountInfo,
  getLastUsedAddress,
  notUseLastAddress
} from '../actions/walletActions'
import { selectWallet } from '../actions/formActions'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import { goToStep } from '../actions/navigationActions'

class ReceiveWalletSelectionContainer extends Component {
  onWalletSelected = (walletType) => {
    const {
      checkMetamaskConnection,
      checkCloudWalletConnection,
      checkLedgerNanoSConnection,
      walletSelection,
      selectWallet,
      transfer,
      lastUsedWallet
    } = this.props

    let { cryptoType } = transfer
    selectWallet(walletType)
    if (walletType && !lastUsedWallet[walletType].crypto[cryptoType]) {
      if (walletType === 'ledger' && walletType !== walletSelection) {
        checkLedgerNanoSConnection(cryptoType, true)
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
    const { notUseLastAddress,
      transfer,
      walletSelection,
      checkMetamaskConnection,
      checkCloudWalletConnection,
      checkLedgerNanoSConnection
    } = this.props
    let { cryptoType } = transfer
    notUseLastAddress()
    if (walletSelection === 'ledger') {
      checkLedgerNanoSConnection(cryptoType, true)
    } else if (walletSelection === 'metamask') {
      checkMetamaskConnection(cryptoType)
    } else if (walletSelection === 'drive') {
      checkCloudWalletConnection(cryptoType)
    }
  }

  componentDidUpdate (prevProps) {
    const { wallet, actionsPending, transfer, error } = this.props
    const prevActionsPending = prevProps.actionsPending
    let { cryptoType } = transfer

    if (wallet &&
      wallet.connected &&
      (prevActionsPending.checkLedgerNanoSConnection && !actionsPending.checkLedgerNanoSConnection) &&
      !error) {
      if (!wallet.crypto[cryptoType] || cryptoType !== 'bitcoin') {
        this.onSync(cryptoType)
      }
    } else if (
      wallet && cryptoType === 'bitcoin' &&
      wallet.crypto[cryptoType] &&
      wallet.crypto[cryptoType][0].xpub &&
      prevActionsPending.checkLedgerNanoSConnection && !actionsPending.checkLedgerNanoSConnection
    ) {
      this.props.updateBtcAccountInfo(wallet.crypto[cryptoType][0].xpub)
    }
  }

  onSync = (cryptoType: string) => {
    const { syncLedgerAccountInfo } = this.props
    syncLedgerAccountInfo(cryptoType, 0, (index, change) => { this.setState({ syncProgress: { index, change } }) })
  }

  render () {
    const {
      walletSelection,
      ...other
    } = this.props
    return (
      <ReceiveWalletSelection
        walletType={walletSelection}
        onWalletSelected={this.onWalletSelected}
        useAnotherAddress={this.useAnotherAddress}
        {...other}
      />
    )
  }
}

const checkMetamaskConnectionSelector = createLoadingSelector(['CHECK_METAMASK_CONNECTION'])
const checkLedgerNanoSConnectionSelector = createLoadingSelector(['CHECK_LEDGER_NANOS_CONNECTION'])
const checkCloudWalletConnectionSelector = createLoadingSelector(['CHECK_CLOUD_WALLET_CONNECTION'])
const errorSelector = createErrorSelector([
  'CHECK_METAMASK_CONNECTION',
  'CHECK_CLOUD_WALLET_CONNECTION',
  'SYNC_LEDGER_ACCOUNT_INFO',
  'UPDATE_BTC_ACCOUNT_INFO'
])
const getLastUsedAddressSelector = createLoadingSelector(['GET_LAST_USED_ADDRESS'])
const syncAccountInfoSelector = createLoadingSelector(['SYNC_LEDGER_ACCOUNT_INFO'])
const updateBtcAccountInfoSelector = createLoadingSelector(['UPDATE_BTC_ACCOUNT_INFO'])

const mapDispatchToProps = dispatch => {
  return {
    checkMetamaskConnection: (cryptoType) => dispatch(checkMetamaskConnection(cryptoType)),
    checkCloudWalletConnection: (cryptoType) => dispatch(checkCloudWalletConnection(cryptoType)),
    checkLedgerNanoSConnection: (cryptoType, throwError) => dispatch(checkLedgerNanoSConnection(cryptoType, throwError)),
    selectWallet: (w) => dispatch(selectWallet(w)),
    goToStep: (n) => dispatch(goToStep('receive', n)),
    syncLedgerAccountInfo: (c, accountIndex, progress) => dispatch(syncLedgerAccountInfo(c, accountIndex, progress)),
    updateBtcAccountInfo: (xpub, progress) => dispatch(updateBtcAccountInfo(xpub, progress)),
    getLastUsedAddress: (idToken) => dispatch(getLastUsedAddress(idToken)),
    notUseLastAddress: () => dispatch(notUseLastAddress())
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
      checkMetamaskConnection: checkMetamaskConnectionSelector(state),
      checkLedgerNanoSConnection: checkLedgerNanoSConnectionSelector(state),
      checkCloudWalletConnection: checkCloudWalletConnectionSelector(state),
      syncAccountInfo: syncAccountInfoSelector(state),
      updateBtcAccountInfo: updateBtcAccountInfoSelector(state),
      getLastUsedAddress: getLastUsedAddressSelector(state)
    },
    error: errorSelector(state)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReceiveWalletSelectionContainer)
