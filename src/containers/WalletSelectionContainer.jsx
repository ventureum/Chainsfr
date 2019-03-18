import React, { Component } from 'react'
import { connect } from 'react-redux'
import WalletSelection from '../components/WalletSelectionComponent'
import { checkMetamaskConnection, checkLedgerNanoSConnection, syncLedgerAccountInfo } from '../actions/walletActions'
import { selectCrypto, selectWallet } from '../actions/formActions'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import { goToStep } from '../actions/navigationActions'

class WalletSelectionContainer extends Component {
  state = {
    syncProgress: 0
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

  onSync= (cryptoSelection) => {
    const { syncLedgerAccountInfo } = this.props
    syncLedgerAccountInfo(cryptoSelection, 0, (index) => { this.setState({ syncProgress: index }) })
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
        onSync={this.onSync}
        {...other}
      />
    )
  }
}

const checkWalletConnectionSelector = createLoadingSelector(['CHECK_METAMASK_CONNECTION', 'CHECK_LEDGER_NANOS_CONNECTION'])
const errorSelector = createErrorSelector(['CHECK_METAMASK_CONNECTION', 'SYNC_LEDGER_ACCOUNT_INFO', 'CHECK_LEDGER_NANOS_CONNECTION'])
const syncAccountInfoSelector = createLoadingSelector(['SYNC_LEDGER_ACCOUNT_INFO'])

const mapDispatchToProps = dispatch => {
  return {
    checkMetamaskConnection: (cryptoType) => dispatch(checkMetamaskConnection(cryptoType)),
    checkLedgerNanoSConnection: (cryptoType) => dispatch(checkLedgerNanoSConnection(cryptoType)),
    selectCrypto: (c) => dispatch(selectCrypto(c)),
    selectWallet: (w) => dispatch(selectWallet(w)),
    goToStep: (n) => dispatch(goToStep('send', n)),
    syncLedgerAccountInfo: (c, accountIndex, progress) => dispatch(syncLedgerAccountInfo(c, accountIndex, progress))
  }
}

const mapStateToProps = state => {
  return {
    walletSelection: state.formReducer.walletSelection,
    cryptoSelection: state.formReducer.cryptoSelection,
    wallet: state.walletReducer.wallet[state.formReducer.walletSelection],
    actionsPending: {
      checkWalletConnection: checkWalletConnectionSelector(state),
      syncAccountInfo: syncAccountInfoSelector(state)
    },
    error: errorSelector(state)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WalletSelectionContainer)
