import React, { Component } from 'react'

import { connect } from 'react-redux'
import ReceiveWalletSelection from '../components/ReceiveWalletSelectionComponent'
import { checkMetamaskConnection, checkLedgerNanoSConnection, selectWallet } from '../actions'
import { createLoadingSelector, createErrorSelector } from '../selectors'

class ReceiveWalletSelectionContainer extends Component {
  onWalletSelected = (walletType) => {
    const {
      checkMetamaskConnection,
      checkLedgerNanoSConnection,
      cryptoSelection,
      selectWallet
    } = this.props
    if (walletType === 'ledger' && walletType !== cryptoSelection) {
      checkLedgerNanoSConnection()
    } else if (walletType === 'metamask' && walletType !== cryptoSelection) {
      checkMetamaskConnection()
    }

    selectWallet(walletType)
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
        {...other}
      />
    )
  }
}

const checkMetamaskConnectionSelector = createLoadingSelector(['CHECK_METAMASK_CONNECTION'])
const checkLedgerNanoSConnectionSelector = createLoadingSelector(['CHECK_LEDGER_NANOS_CONNECTION'])
const errorSelector = createErrorSelector(['CHECK_METAMASK_CONNECTION'])

const mapDispatchToProps = dispatch => {
  return {
    checkMetamaskConnection: () => dispatch(checkMetamaskConnection(dispatch)),
    checkLedgerNanoSConnection: () => dispatch(checkLedgerNanoSConnection()),
    selectWallet: (w) => dispatch(selectWallet(w))
  }
}

const mapStateToProps = state => {
  return {
    walletSelection: state.transferReducer.walletSelection,
    metamask: state.userReducer.metamask,
    ledgerNanoS: state.userReducer.ledgerNanoS,
    actionsPending: {
      checkMetamaskConnection: checkMetamaskConnectionSelector(state),
      checkLedgerNanoSConnection: checkLedgerNanoSConnectionSelector(state)
    },
    error: errorSelector(state)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReceiveWalletSelectionContainer)
