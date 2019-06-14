// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import WalletSelection from '../components/WalletSelectionComponent'
import CloudWalletUnlockContainer from './CloudWalletUnlockContainer'
import {
  checkMetamaskConnection,
  checkLedgerNanoSConnection,
  checkCloudWalletConnection,
  unlockCloudWallet,
  sync
} from '../actions/walletActions'
import { selectCrypto, selectWallet } from '../actions/formActions'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import { goToStep } from '../actions/navigationActions'
import WalletUtils from '../wallets/utils'

type Props = {
  checkMetamaskConnection: Function,
  checkLedgerNanoSConnection: Function,
  checkCloudWalletConnection: Function,
  selectCrypto: Function,
  selectWallet: Function,
  goToStep: Function,
  sync: Function,
  unlockCloudWallet: Function,
  walletSelection: string,
  cryptoSelection: string,
  walletSelectionPrefilled: string,
  cryptoSelectionPrefilled: string,
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

  componentDidMount () {
    let { selectWallet, walletSelection, walletSelectionPrefilled } = this.props

    if (walletSelection !== walletSelectionPrefilled && walletSelectionPrefilled) {
      // do not override wallet selection if they
      // have been set to the same value. Otherwise, selections will
      // be reset to null, see formReducer.js for details
      //
      // prefill wallet selections with url parameters
      selectWallet(walletSelectionPrefilled)
    }
  }

  handleNext = () => {
    let { walletSelection, cryptoSelection } = this.props
    let unlocked = !!this.props.wallet.crypto[cryptoSelection][0].privateKey
    // if the cloud wallet is locked, do nothing and wait till it is unlcoked
    if (walletSelection === 'drive' && !unlocked) {
      this.props.unlockCloudWallet({
        cryptoType: cryptoSelection,
        onClose: () => this.handleNext()
      })
    } else {
      // already unlocked, go to next step
      this.props.goToStep(1)
    }
  }

  onCryptoSelected = cryptoType => {
    const {
      wallet,
      checkMetamaskConnection,
      checkLedgerNanoSConnection,
      checkCloudWalletConnection,
      selectCrypto,
      walletSelection,
      cryptoSelection
    } = this.props
    if (walletSelection === 'ledger' && cryptoType !== cryptoSelection) {
      selectCrypto(cryptoType)
      checkLedgerNanoSConnection(cryptoType)
    } else if (walletSelection === 'metamask' && cryptoType !== cryptoSelection) {
      selectCrypto(cryptoType)
      checkMetamaskConnection(cryptoType)
    } else if (walletSelection === 'drive' && cryptoType !== cryptoSelection) {
      selectCrypto(cryptoType)
      if (!wallet.connected) {
        checkCloudWalletConnection(cryptoType)
      }
    }
  }

  componentDidUpdate (prevProps) {
    const {
      goToStep,
      wallet,
      walletSelectionPrefilled,
      cryptoSelectionPrefilled,
      walletSelection,
      cryptoSelection,
      actionsPending,
      error
    } = this.props

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

    if (walletSelectionPrefilled && cryptoSelectionPrefilled) {
      // prefilled, special case
      if (walletSelection) {
        if (!cryptoSelection) {
          // wallet has been filled, crypto waiting to be filled
          this.onCryptoSelected(cryptoSelectionPrefilled)
        } else if (wallet.connected) {
          // wallet and crypto are filled
          // wallet is ready
          // auto-jump to the next page
          goToStep(1)
        }
      }
    }
  }

  onSync = () => {
    let { wallet, walletSelection, cryptoSelection } = this.props
    let accounts = wallet.crypto[cryptoSelection]
    this.props.sync(
      WalletUtils.toWalletData(walletSelection, cryptoSelection, accounts),
      (index, change) => {
        this.setState({ syncProgress: { index, change } })
      }
    )
  }

  render () {
    const { selectCrypto, walletSelection, cryptoSelection, selectWallet, ...other } = this.props
    return (
      <>
        <WalletSelection
          walletType={walletSelection}
          cryptoType={cryptoSelection}
          onCryptoSelected={this.onCryptoSelected}
          onWalletSelected={selectWallet}
          syncProgress={this.state.syncProgress}
          handleNext={this.handleNext}
          {...other}
        />
        <CloudWalletUnlockContainer />
      </>
    )
  }
}

const checkWalletConnectionSelector = createLoadingSelector([
  'CHECK_CLOUD_WALLET_CONNECTION',
  'CHECK_METAMASK_CONNECTION',
  'CHECK_LEDGER_NANOS_CONNECTION'
])
const errorSelector = createErrorSelector([
  'CHECK_METAMASK_CONNECTION',
  'SYNC_LEDGER_ACCOUNT_INFO',
  'CHECK_LEDGER_NANOS_CONNECTION'
])
const syncSelector = createLoadingSelector(['SYNC'])

const mapDispatchToProps = dispatch => {
  return {
    checkMetamaskConnection: cryptoType => dispatch(checkMetamaskConnection(cryptoType)),
    checkLedgerNanoSConnection: cryptoType => dispatch(checkLedgerNanoSConnection(cryptoType)),
    checkCloudWalletConnection: cryptoType => dispatch(checkCloudWalletConnection(cryptoType)),
    selectCrypto: c => dispatch(selectCrypto(c)),
    selectWallet: w => dispatch(selectWallet(w)),
    goToStep: n => dispatch(goToStep('send', n)),
    sync: (walletData, progress) => dispatch(sync(walletData, progress)),
    unlockCloudWallet: unlockRequestParams => dispatch(unlockCloudWallet(unlockRequestParams))
  }
}

const mapStateToProps = state => {
  return {
    walletSelection: state.formReducer.walletSelection,
    cryptoSelection: state.formReducer.cryptoSelection,
    wallet: state.walletReducer.wallet[state.formReducer.walletSelection],
    actionsPending: {
      checkWalletConnection: checkWalletConnectionSelector(state),
      sync: syncSelector(state)
    },
    error: errorSelector(state)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WalletSelectionContainer)
