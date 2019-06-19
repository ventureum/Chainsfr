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
    if (walletType && !lastUsedWallet) {
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
    const { wallet, actionsPending, error } = this.props
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
    let { wallet, lastUsedWallet, walletSelection, transfer } = this.props
    this.props.sync(
      WalletUtils.toWalletDataFromState(walletSelection, transfer.cryptoType, lastUsedWallet || wallet),
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
  const _transfer = state.transferReducer.transfer
  const _lastUsedWallet = state.walletReducer.lastUsedWallet
  const _walletSelection = state.formReducer.walletSelection
  const _lastUsedWalletExist = !_lastUsedWallet.notUsed &&
  _lastUsedWallet[_walletSelection] &&
  _lastUsedWallet[_walletSelection].crypto[_transfer.cryptoType]
  const _lastUsedWalletByWalletType = _lastUsedWalletExist ? _lastUsedWallet[_walletSelection] : null

  return {
    walletSelection: state.formReducer.walletSelection,
    wallet: state.walletReducer.wallet[state.formReducer.walletSelection],
    lastUsedWallet: _lastUsedWalletByWalletType,
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
