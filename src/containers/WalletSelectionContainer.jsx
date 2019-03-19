// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import WalletSelection from '../components/WalletSelectionComponent'
import { checkMetamaskConnection, checkLedgerNanoSConnection, syncLedgerAccountInfo, updateBtcAccountInfo } from '../actions/walletActions'
import { selectCrypto, selectWallet } from '../actions/formActions'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import { goToStep } from '../actions/navigationActions'

type Props = {
  checkMetamaskConnection: Function,
  checkLedgerNanoSConnection: Function,
  selectCrypto: Function,
  selectWallet: Function,
  goToStep: Function,
  syncLedgerAccountInfo: Function,
  updateBtcAccountInfo: Function,
  walletSelection: string,
  cryptoSelection: string,
  wallet: Object,
  actionsPending: Object,
  error: any
}

type State = {
  syncProgress: {
    index: number,
    change: number
  }
}

class WalletSelectionContainer extends Component<Props, State> {
  state = {
    syncProgress: {
      index: 0,
      change: 0
    }
  }

  onCryptoSelected = (cryptoType) => {
    const {
      checkMetamaskConnection,
      checkLedgerNanoSConnection,
      selectCrypto,
      walletSelection,
      cryptoSelection
    } = this.props
    if (walletSelection === 'ledger' && cryptoType !== cryptoSelection) {
      checkLedgerNanoSConnection(cryptoType)
      selectCrypto(cryptoType)
    } else if (walletSelection === 'metamask' && cryptoType !== cryptoSelection) {
      checkMetamaskConnection(cryptoType)
      selectCrypto(cryptoType)
    }
  }

  componentDidUpdate (prevProps) {
    const { wallet, cryptoSelection, actionsPending, walletSelection, error } = this.props
    if (wallet &&
        wallet.connected &&
        cryptoSelection &&
      !wallet.crypto[cryptoSelection] &&
      !actionsPending.syncAccountInfo &&
        walletSelection === 'ledger' &&
        !error) {
      this.onSync(cryptoSelection)
    }
  }

  onSync = (cryptoSelection: string) => {
    const { syncLedgerAccountInfo } = this.props
    syncLedgerAccountInfo(cryptoSelection, 0, (index, change) => { this.setState({ syncProgress: { index, change } }) })
  }

  onUpdate = (cryptoSelection: string) => {
    if (cryptoSelection === 'bitcoin') {
      this.props.updateBtcAccountInfo((index, change) => { this.setState({ syncProgress: { index, change } }) })
    } else {
      this.onSync(cryptoSelection)
    }
  }

  render () {
    const {
      selectCrypto,
      walletSelection,
      cryptoSelection,
      selectWallet,
      ...other
    } = this.props
    return (
      <WalletSelection
        walletType={walletSelection}
        cryptoType={cryptoSelection}
        onCryptoSelected={this.onCryptoSelected}
        onWalletSelected={selectWallet}
        syncProgress={this.state.syncProgress}
        onUpdate={this.onUpdate}
        {...other}
      />
    )
  }
}

const checkWalletConnectionSelector = createLoadingSelector(['CHECK_METAMASK_CONNECTION', 'CHECK_LEDGER_NANOS_CONNECTION'])
const errorSelector = createErrorSelector(['CHECK_METAMASK_CONNECTION', 'SYNC_LEDGER_ACCOUNT_INFO', 'CHECK_LEDGER_NANOS_CONNECTION'])
const syncAccountInfoSelector = createLoadingSelector(['SYNC_LEDGER_ACCOUNT_INFO'])
const updateBtcAccountInfoSelector = createLoadingSelector(['UPDATE_BTC_ACCOUNT_INFO'])

const mapDispatchToProps = dispatch => {
  return {
    checkMetamaskConnection: (cryptoType) => dispatch(checkMetamaskConnection(cryptoType)),
    checkLedgerNanoSConnection: (cryptoType) => dispatch(checkLedgerNanoSConnection(cryptoType)),
    selectCrypto: (c) => dispatch(selectCrypto(c)),
    selectWallet: (w) => dispatch(selectWallet(w)),
    goToStep: (n) => dispatch(goToStep('send', n)),
    syncLedgerAccountInfo: (c, accountIndex, progress) => dispatch(syncLedgerAccountInfo(c, accountIndex, progress)),
    updateBtcAccountInfo: (progress) => dispatch(updateBtcAccountInfo(progress))
  }
}

const mapStateToProps = state => {
  return {
    walletSelection: state.formReducer.walletSelection,
    cryptoSelection: state.formReducer.cryptoSelection,
    wallet: state.walletReducer.wallet[state.formReducer.walletSelection],
    actionsPending: {
      checkWalletConnection: checkWalletConnectionSelector(state),
      syncAccountInfo: syncAccountInfoSelector(state),
      updateBtcAccountInfo: updateBtcAccountInfoSelector(state)
    },
    error: errorSelector(state)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WalletSelectionContainer)
