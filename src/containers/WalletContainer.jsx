import React, { Component } from 'react'
import { connect } from 'react-redux'
import WalletComponent from '../components/WalletComponent'
import CloudWalletUnlockContainer from './CloudWalletUnlockContainer'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import { getCloudWallet, unlockCloudWallet } from '../actions/walletActions'
import { directTransfer, getTxFee, getTransferHistory } from '../actions/transferActions'
import { push } from 'connected-react-router'
import utils from '../utils'
import { walletCryptoSupports } from '../wallet'

class WalletContainer extends Component {
  componentDidMount () {
    let { cloudWallet, getCloudWallet, getTransferHistory } = this.props
    if (!cloudWallet.connected) {
      getCloudWallet()
    }
    getTransferHistory(0)
  }

  loadMoreTransferHistory = offset => {
    this.props.getTransferHistory(offset)
  }

  render () {
    let { cryptoPrice, transferHistory, currency, actionsPending, cloudWallet } = this.props

    const toCurrencyAmount = (cryptoAmount, cryptoType) =>
      utils.toCurrencyAmount(cryptoAmount, cryptoPrice[cryptoType], currency)

    // add currency value to transferHistory
    transferHistory.history = transferHistory.history.map(transfer => {
      return {
        ...transfer,
        transferCurrencyAmount: toCurrencyAmount(transfer.transferAmount, transfer.cryptoType)
      }
    })

    return (
      <WalletComponent
        cloudWallet={cloudWallet}
        transferHistory={transferHistory}
        actionsPending={actionsPending}
        loadMoreTransferHistory={this.loadMoreTransferHistory}
      />
    )
  }
}

const getCloudWalletSelector = createLoadingSelector(['GET_CLOUD_WALLET'])
const getTransferHistorySelector = createLoadingSelector(['GET_TRANSFER_HISTORY'])
const gettxFeeSelector = createLoadingSelector(['GET_TX_COST'])
const directTransferSelector = createLoadingSelector(['DIRECT_TRANSFER'])
const errorSelector = createErrorSelector([
  'GET_CLOUD_WALLET',
  'DECRYPT_CLOUD_WALLET',
  'GET_TRANSFER_HISTORY'
])

const mapStateToProps = state => {
  return {
    cloudWallet: state.walletReducer.wallet.drive,
    txFee: state.transferReducer.txFee,
    receipt: state.transferReducer.receipt,
    actionsPending: {
      getCloudWallet: getCloudWalletSelector(state),
      getTxFee: gettxFeeSelector(state),
      directTransfer: directTransferSelector(state),
      getTransferHistory: getTransferHistorySelector(state)
    },
    currency: state.cryptoPriceReducer.currency,
    cryptoPrice: state.cryptoPriceReducer.cryptoPrice,
    transferHistory: state.transferReducer.transferHistory,
    error: errorSelector(state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    getCloudWallet: () => dispatch(getCloudWallet()),
    getTxFee: txRequest => dispatch(getTxFee(txRequest)),
    directTransfer: txRequest => dispatch(directTransfer(txRequest)),
    unlockCloudWallet: unlockRequestParams => dispatch(unlockCloudWallet(unlockRequestParams)),
    push: path => dispatch(push(path)),
    getTransferHistory: offset => dispatch(getTransferHistory(offset))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WalletContainer)
