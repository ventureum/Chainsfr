// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import WalletSelection from '../components/WalletSelectionComponent'
import CloudWalletUnlockContainer from './CloudWalletUnlockContainer'
import {
  checkMetamaskConnection,
  getLedgerWalletData,
  checkCloudWalletConnection,
  unlockCloudWallet,
  sync,
  checkLedgerDeviceConnection,
  checkLedgerAppConnection
} from '../actions/walletActions'
import { selectCrypto, selectWallet } from '../actions/formActions'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import { goToStep } from '../actions/navigationActions'
import WalletUtils from '../wallets/utils'
import utils from '../utils'
import * as Tokens from '../tokens'

type Props = {
  checkMetamaskConnection: Function,
  getLedgerWalletData: Function,
  checkLedgerDeviceConnection: Function,
  checkCloudWalletConnection: Function,
  checkLedgerAppConnection: Function,
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
  cryptoPrice: Object,
  currency: string,
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
      checkLedgerDeviceConnection,
      checkCloudWalletConnection,
      selectCrypto,
      walletSelection,
      cryptoSelection
    } = this.props
    if (walletSelection === 'ledger' && cryptoType !== cryptoSelection) {
      selectCrypto(cryptoType)
      checkLedgerDeviceConnection()
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
      error,
      checkLedgerAppConnection,
      getLedgerWalletData
    } = this.props
    const prevActionsPending = prevProps.actionsPending
    if (
      prevActionsPending.checkLedgerDeviceConnection &&
      !actionsPending.checkLedgerDeviceConnection &&
        wallet.connected
    ) {
      checkLedgerAppConnection(cryptoSelection)
    } else if (prevActionsPending.checkLedgerAppConnection && !actionsPending.checkLedgerAppConnection) {
      getLedgerWalletData(cryptoSelection)
    } else if (
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
    const {
      selectCrypto,
      walletSelection,
      cryptoSelection,
      selectWallet,
      wallet,
      cryptoPrice,
      currency,
      ...other
    } = this.props

    // iterate through all cryptoTypes in the wallet
    // and convert the value into currency value
    let currencyAmount = {}
    if (wallet && wallet.crypto) {
      for (const cryptoType of Object.keys(wallet.crypto)) {
        currencyAmount[cryptoType] = utils.toCurrencyAmount(
          utils.toHumanReadableUnit(wallet.crypto[cryptoType][0].balance, Tokens.getCryptoDecimals(cryptoType)),
          cryptoPrice[cryptoType],
          currency
        )
      }
    }

    return (
      <>
        <WalletSelection
          walletType={walletSelection}
          cryptoType={cryptoSelection}
          onCryptoSelected={this.onCryptoSelected}
          onWalletSelected={selectWallet}
          wallet={wallet}
          syncProgress={this.state.syncProgress}
          handleNext={this.handleNext}
          currencyAmount={currencyAmount}
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
  'GET_LEDGER_WALLET_DATA',
  'CHECK_LEDGER_DEVICE_CONNECTION'
])
const errorSelector = createErrorSelector([
  'CHECK_METAMASK_CONNECTION',
  'SYNC_LEDGER_ACCOUNT_INFO',
  'GET_LEDGER_WALLET_DATA'
])
const checkLedgerDeviceConnectionSelector = createLoadingSelector(['CHECK_LEDGER_DEVICE_CONNECTION'])
const checkLedgerAppConnectionSelector = createLoadingSelector(['CHECK_LEDGER_APP_CONNECTION'])
const syncSelector = createLoadingSelector(['SYNC'])

const mapDispatchToProps = dispatch => {
  return {
    checkMetamaskConnection: cryptoType => dispatch(checkMetamaskConnection(cryptoType)),
    getLedgerWalletData: cryptoType => dispatch(getLedgerWalletData(cryptoType)),
    checkCloudWalletConnection: cryptoType => dispatch(checkCloudWalletConnection(cryptoType)),
    selectCrypto: c => dispatch(selectCrypto(c)),
    selectWallet: w => dispatch(selectWallet(w)),
    goToStep: n => dispatch(goToStep('send', n)),
    sync: (walletData, progress) => dispatch(sync(walletData, progress)),
    unlockCloudWallet: unlockRequestParams => dispatch(unlockCloudWallet(unlockRequestParams)),
    checkLedgerDeviceConnection: () => dispatch(checkLedgerDeviceConnection()),
    checkLedgerAppConnection: (cryptoType) => dispatch(checkLedgerAppConnection(cryptoType))
  }
}

const mapStateToProps = state => {
  return {
    walletSelection: state.formReducer.walletSelection,
    cryptoSelection: state.formReducer.cryptoSelection,
    wallet: state.walletReducer.wallet[state.formReducer.walletSelection],
    cryptoPrice: state.cryptoPriceReducer.cryptoPrice,
    currency: state.cryptoPriceReducer.currency,
    actionsPending: {
      checkWalletConnection: checkWalletConnectionSelector(state),
      checkLedgerDeviceConnection: checkLedgerDeviceConnectionSelector(state),
      checkLedgerAppConnection: checkLedgerAppConnectionSelector(state),
      sync: syncSelector(state)
    },
    error: errorSelector(state)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WalletSelectionContainer)
