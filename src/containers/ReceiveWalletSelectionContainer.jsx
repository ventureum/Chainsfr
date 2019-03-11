import React, { Component } from 'react'

import { connect } from 'react-redux'
import ReceiveWalletSelection from '../components/ReceiveWalletSelectionComponent'
import { checkMetamaskConnection, checkLedgerNanoSConnection } from '../actions/walletActions'
import { selectWallet } from '../actions/formActions'

import { createLoadingSelector, createErrorSelector } from '../selectors'
import { goToStep } from '../actions/navigationActions'

class ReceiveWalletSelectionContainer extends Component {
  onWalletSelected = (walletType) => {
    const {
      checkMetamaskConnection,
      checkLedgerNanoSConnection,
      walletSelection,
      selectWallet,
      transfer
    } = this.props

    let { cryptoType } = transfer

    if (walletType === 'ledger' && walletType !== walletSelection) {
      checkLedgerNanoSConnection(cryptoType)
    } else if (walletType === 'metamask' && walletType !== walletSelection) {
      checkMetamaskConnection(cryptoType)
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
    checkMetamaskConnection: (cryptoType) => dispatch(checkMetamaskConnection(cryptoType)),
    checkLedgerNanoSConnection: () => dispatch(checkLedgerNanoSConnection()),
    selectWallet: (w) => dispatch(selectWallet(w)),
    goToStep: (n) => dispatch(goToStep('receive', n))
  }
}

const mapStateToProps = state => {
  return {
    walletSelection: state.formReducer.walletSelection,
    wallet: state.walletReducer.wallet[state.formReducer.walletSelection],
    transfer: state.transferReducer.transfer,
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
