import React, { Component } from 'react'
import { connect } from 'react-redux'
import WalletComponent from '../components/WalletComponent'
import CloudWalletUnlockContainer from './CloudWalletUnlockContainer'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import { getCloudWallet, unlockCloudWallet } from '../actions/walletActions'
import { directTransfer, gettxFee } from '../actions/transferActions'
import { push } from 'connected-react-router'

class WalletContainer extends Component {
  componentDidMount () {
    let { wallet, getCloudWallet } = this.props
    if (!wallet.connected) {
      getCloudWallet()
    }
  }

  render () {
    let { ...others } = this.props
    return (
      <>
        <WalletComponent
          {...others}
        />
        <CloudWalletUnlockContainer />
      </>
    )
  }
}

const getCloudWalletSelector = createLoadingSelector(['GET_CLOUD_WALLET'])
const gettxFeeSelector = createLoadingSelector(['GET_TX_COST'])
const directTransferSelector = createLoadingSelector(['DIRECT_TRANSFER'])
const errorSelector = createErrorSelector(['GET_CLOUD_WALLET', 'DECRYPT_CLOUD_WALLET'])

const mapStateToProps = state => {
  return {
    wallet: state.walletReducer.wallet.drive,
    txFee: state.transferReducer.txFee,
    receipt: state.transferReducer.receipt,
    actionsPending: {
      getCloudWallet: getCloudWalletSelector(state),
      gettxFee: gettxFeeSelector(state),
      directTransfer: directTransferSelector(state)
    },
    error: errorSelector(state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    getCloudWallet: () => dispatch(getCloudWallet()),
    gettxFee: (txRequest) => dispatch(gettxFee(txRequest)),
    directTransfer: (txRequest) => dispatch(directTransfer(txRequest)),
    unlockCloudWallet: (unlockRequestParams) => dispatch(unlockCloudWallet(unlockRequestParams)),
    push: (path) => dispatch(push(path))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WalletContainer)
