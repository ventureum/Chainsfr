import React, { Component } from 'react'
import { connect } from 'react-redux'
import WalletSelection from '../components/WalletSelectionComponent'
import { checkMetamaskConnection, checkLedgerNanoSConnection, loadLedgerAccountInfo } from '../actions/walletActions'
import { selectCrypto, selectWallet } from '../actions/formActions'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import { goToStep } from '../actions/navigationActions'

class WalletSelectionContainer extends Component {
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
    } else if (walletSelection === 'metamask' && cryptoType !== cryptoSelection) {
      checkMetamaskConnection(cryptoType)
    }

    selectCrypto(cryptoType)
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
        {...other}
      />
    )
  }
}

const checkWalletConnectionSelector = createLoadingSelector(['CHECK_METAMASK_CONNECTION', 'CHECK_LEDGER_NANOS_CONNECTION'])
const errorSelector = createErrorSelector(['CHECK_METAMASK_CONNECTION'])
const loadAccountInfoSelector = createLoadingSelector(['SYNC_LEDGER_ACCOUNT_INFO', 'LOAD_LEDGER_ACCOUNT_INFO'])

const mapDispatchToProps = dispatch => {
  return {
    checkMetamaskConnection: (cryptoType) => dispatch(checkMetamaskConnection(cryptoType)),
    checkLedgerNanoSConnection: (cryptoType) => dispatch(checkLedgerNanoSConnection(cryptoType)),
    selectCrypto: (c) => dispatch(selectCrypto(c)),
    selectWallet: (w) => dispatch(selectWallet(w)),
    goToStep: (n) => dispatch(goToStep('send', n)),
    loadLedgerAccountInfo: (cryptoType, accountIndex) => dispatch(loadLedgerAccountInfo(cryptoType, accountIndex))
  }
}

const mapStateToProps = state => {
  return {
    walletSelection: state.formReducer.walletSelection,
    cryptoSelection: state.formReducer.cryptoSelection,
    wallet: state.walletReducer.wallet[state.formReducer.walletSelection],
    actionsPending: {
      checkWalletConnection: checkWalletConnectionSelector(state),
      loadAccountInfo: loadAccountInfoSelector(state)
    },
    error: errorSelector(state)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WalletSelectionContainer)
