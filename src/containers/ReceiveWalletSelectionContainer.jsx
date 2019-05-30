import React, { Component } from 'react'

import { connect } from 'react-redux'
import ReceiveWalletSelection from '../components/ReceiveWalletSelectionComponent'
import {
  checkMetamaskConnection,
  checkCloudWalletConnection,
  checkLedgerNanoSConnection,
  getLastUsedAddress,
  notUseLastAddress,
  sync
} from '../actions/walletActions'
import { selectWallet } from '../actions/formActions'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import { goToStep } from '../actions/navigationActions'
import WalletUtils from '../wallets/utils'

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
    if (profile.isAuthenticated && profile.googleId) {
      this.props.getLastUsedAddress(profile.googleId)
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

    if (
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
    let { wallet, walletSelection, cryptoSelection } = this.props
    let accounts = wallet.crypto[cryptoSelection].accounts
    this.props.sync(
      WalletUtils.toWalletData(walletSelection, cryptoSelection, accounts),
      (index, change) => {
        this.setState({ syncProgress: { index, change } })
      }
    )
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
const checkWalletConnectionSelector = createLoadingSelector([
  'CHECK_CLOUD_WALLET_CONNECTION',
  'CHECK_METAMASK_CONNECTION',
  'CHECK_LEDGER_NANOS_CONNECTION'
])

const syncSelector = createLoadingSelector(['SYNC'])

const errorSelector = createErrorSelector([
  'CHECK_METAMASK_CONNECTION',
  'CHECK_CLOUD_WALLET_CONNECTION',
  'SYNC_LEDGER_ACCOUNT_INFO',
  'UPDATE_BTC_ACCOUNT_INFO'
])
const getLastUsedAddressSelector = createLoadingSelector(['GET_LAST_USED_ADDRESS'])

const mapDispatchToProps = dispatch => {
  return {
    checkMetamaskConnection: (cryptoType) => dispatch(checkMetamaskConnection(cryptoType)),
    checkCloudWalletConnection: (cryptoType) => dispatch(checkCloudWalletConnection(cryptoType)),
    checkLedgerNanoSConnection: (cryptoType, throwError) => dispatch(checkLedgerNanoSConnection(cryptoType, throwError)),
    selectWallet: (w) => dispatch(selectWallet(w)),
    goToStep: (n) => dispatch(goToStep('receive', n)),
    sync: (walletData, progress) => dispatch(sync(walletData, progress)),
    getLastUsedAddress: (googleId) => dispatch(getLastUsedAddress(googleId)),
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
      checkWalletConnection: checkWalletConnectionSelector(state),
      sync: syncSelector(state),
      getLastUsedAddress: getLastUsedAddressSelector(state)
    },
    error: errorSelector(state)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReceiveWalletSelectionContainer)
