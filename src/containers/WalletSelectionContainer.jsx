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
  checkLedgerAppConnection,
  checkWalletConnectConnection,
  checkWalletLinkConnection,
  checkReferralWalletConnection
} from '../actions/walletActions'
import { selectCrypto, selectWallet } from '../actions/formActions'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import { goToStep } from '../actions/navigationActions'
// import WalletUtils from '../wallets/utils'
import utils from '../utils'
import * as Tokens from '../tokens'
import WalletLink from 'walletlink'
type Props = {
  checkWalletConnectConnection: Function,
  checkWalletLinkConnection: Function,
  checkMetamaskConnection: Function,
  getLedgerWalletData: Function,
  checkLedgerDeviceConnection: Function,
  checkCloudWalletConnection: Function,
  checkLedgerAppConnection: Function,
  checkReferralWalletConnection: Function,
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

const walletErrorUserInstructionList = {
  ledger: {
    'No device selected.':
      'Please connect your Ledger device and select the corresponding device from the popup window.'
  },
  metamask: {
    'Incorrect Metamask network': 'Please check your metamask network and try again.',
    'Internal JSON-RPC error.':
      'Please allow Chainsfr to connect to your Metamask wallet in the popup window.',
    'Metamask not found': 'Please make the Metamask extension is installed and enabled.'
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

    window.walletLink = new WalletLink({
      appName: 'Chainsfr',
      appLogoUrl:
        'https://ci6.googleusercontent.com/proxy/9qKr8MjuV_S5ii99FgfInXXzQcYl8Hi0ruZkWMugNt7Roc8WtUhWo5iagZZqdzX5rFF7ezuCoupLgrOCNwZjrANvE_k0-CCEPbnrGynEiWQlk6o3piV8=s0-d-e1-ft#https://chainsfr-public.s3.amazonaws.com/chainsfr_demo_white_300.png'
    })
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
      checkWalletLinkConnection,
      checkLedgerDeviceConnection,
      checkCloudWalletConnection,
      checkWalletConnectConnection,
      checkReferralWalletConnection,
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
    } else if (walletSelection.endsWith('WalletConnect') && cryptoType !== cryptoSelection) {
      selectCrypto(cryptoType)
      checkWalletConnectConnection(walletSelection, cryptoType)
    } else if (walletSelection.endsWith('WalletLink') && cryptoType !== cryptoSelection) {
      selectCrypto(cryptoType)
      checkWalletLinkConnection(walletSelection, cryptoType)
    } else if (walletSelection === 'referralWallet' && cryptoType !== cryptoSelection) {
      selectCrypto(cryptoType)
      checkReferralWalletConnection()
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
    } else if (
      prevActionsPending.checkLedgerAppConnection &&
      !actionsPending.checkLedgerAppConnection
    ) {
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
    // this.props.sync(
    //   WalletUtils.toWalletData(walletSelection, cryptoSelection, accounts),
    //   (index, change) => {
    //     this.setState({ syncProgress: { index, change } })
    //   }
    // )
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

    let address
    if (wallet) {
      if (wallet.accounts) {
        address = wallet.accounts[0]
      } else if (wallet.crypto[cryptoSelection]) {
        address = wallet.crypto[cryptoSelection][0].address
      }
    }

    // iterate through all cryptoTypes in the wallet
    // and convert the value into currency value
    let currencyAmount = {}
    if (wallet && wallet.crypto) {
      for (const cryptoType of Object.keys(wallet.crypto)) {
        currencyAmount[cryptoType] = utils.toCurrencyAmount(
          utils.toHumanReadableUnit(
            wallet.crypto[cryptoType][0].balance,
            Tokens.getCryptoDecimals(cryptoType)
          ),
          cryptoPrice[cryptoType],
          currency
        )
      }
    }

    let walletErrorUserInstruction
    if (other.error && wallet) {
      walletErrorUserInstruction = walletErrorUserInstructionList[walletSelection][other.error]
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
          address={address}
          walletErrorUserInstruction={walletErrorUserInstruction}
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
  'CHECK_LEDGER_DEVICE_CONNECTION',
  'CHECK_WALLETCONNECT_CONNECTION',
  'CHECK_WALLETLINK_CONNECTION',
  'CHECK_REFERRAL_WALLET_CONNECTION'
])
const errorSelector = createErrorSelector([
  'CHECK_METAMASK_CONNECTION',
  'SYNC_LEDGER_ACCOUNT_INFO',
  'GET_LEDGER_WALLET_DATA',
  'CHECK_WALLETCONNECT_CONNECTION',
  'CHECK_WALLETLINK_CONNECTION',
  'CHECK_REFERRAL_WALLET_CONNECTION',
  'CHECK_LEDGER_DEVICE_CONNECTION'
])
const checkLedgerDeviceConnectionSelector = createLoadingSelector([
  'CHECK_LEDGER_DEVICE_CONNECTION'
])
const checkLedgerAppConnectionSelector = createLoadingSelector(['CHECK_LEDGER_APP_CONNECTION'])
const checkWalletConnectConnectionSelector = createLoadingSelector([
  'CHECK_WALLETCONNECT_CONNECTION'
])
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
    checkLedgerAppConnection: cryptoType => dispatch(checkLedgerAppConnection(cryptoType)),
    checkWalletConnectConnection: (walletType, cryptoType) =>
      dispatch(checkWalletConnectConnection(walletType, cryptoType)),
    checkWalletLinkConnection: (walletType, cryptoType) =>
      dispatch(checkWalletLinkConnection(walletType, cryptoType)),
    checkReferralWalletConnection: () => dispatch(checkReferralWalletConnection())
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
      checkWalletConnectConnection: checkWalletConnectConnectionSelector(state),
      sync: syncSelector(state)
    },
    error: errorSelector(state)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WalletSelectionContainer)
