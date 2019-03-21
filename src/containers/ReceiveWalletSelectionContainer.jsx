import React, { Component } from 'react'

import { connect } from 'react-redux'
import ReceiveWalletSelection from '../components/ReceiveWalletSelectionComponent'
import { checkMetamaskConnection, checkLedgerNanoSConnection, syncLedgerAccountInfo, updateBtcAccountInfo } from '../actions/walletActions'
import { selectWallet } from '../actions/formActions'
import { getBtcLastBlockHeight } from '../utils'
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
      selectWallet(walletType)
      checkLedgerNanoSConnection(cryptoType)
    } else if (walletType === 'metamask' && walletType !== walletSelection) {
      selectWallet(walletType)
      checkMetamaskConnection(cryptoType)
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
      } else if (cryptoType === 'bitcoin') {
        getBtcLastBlockHeight().then((currentBlock) => {
          if (wallet.crypto[cryptoType][0].lastBlockHeight !== currentBlock) {
            this.props.updateBtcAccountInfo()
          }
        })
      }
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
        {...other}
      />
    )
  }
}

const checkMetamaskConnectionSelector = createLoadingSelector(['CHECK_METAMASK_CONNECTION'])
const checkLedgerNanoSConnectionSelector = createLoadingSelector(['CHECK_LEDGER_NANOS_CONNECTION'])
const errorSelector = createErrorSelector(['CHECK_METAMASK_CONNECTION', 'CHECK_LEDGER_NANOS_CONNECTION', 'SYNC_LEDGER_ACCOUNT_INFO', 'UPDATE_BTC_ACCOUNT_INFO'])
const syncAccountInfoSelector = createLoadingSelector(['SYNC_LEDGER_ACCOUNT_INFO'])
const updateBtcAccountInfoSelector = createLoadingSelector(['UPDATE_BTC_ACCOUNT_INFO'])

const mapDispatchToProps = dispatch => {
  return {
    checkMetamaskConnection: (cryptoType) => dispatch(checkMetamaskConnection(cryptoType)),
    checkLedgerNanoSConnection: (cryptoType) => dispatch(checkLedgerNanoSConnection(cryptoType)),
    selectWallet: (w) => dispatch(selectWallet(w)),
    goToStep: (n) => dispatch(goToStep('receive', n)),
    syncLedgerAccountInfo: (c, accountIndex, progress) => dispatch(syncLedgerAccountInfo(c, accountIndex, progress)),
    updateBtcAccountInfo: (progress) => dispatch(updateBtcAccountInfo(progress))
  }
}

const mapStateToProps = state => {
  return {
    walletSelection: state.formReducer.walletSelection,
    wallet: state.walletReducer.wallet[state.formReducer.walletSelection],
    transfer: state.transferReducer.transfer,
    actionsPending: {
      checkMetamaskConnection: checkMetamaskConnectionSelector(state),
      checkLedgerNanoSConnection: checkLedgerNanoSConnectionSelector(state),
      syncAccountInfo: syncAccountInfoSelector(state),
      updateBtcAccountInfo: updateBtcAccountInfoSelector(state)
    },
    error: errorSelector(state)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReceiveWalletSelectionContainer)
