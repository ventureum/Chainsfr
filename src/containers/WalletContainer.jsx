import React, { Component } from 'react'
import { connect } from 'react-redux'
import WalletComponent from '../components/WalletComponent'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import { getCloudWallet } from '../actions/walletActions'
import { directTransfer, getTxCost } from '../actions/transferActions'

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
      <WalletComponent
        {...others}
      />
    )
  }
}

const getCloudWalletSelector = createLoadingSelector(['GET_CLOUD_WALLET'])
const getTxCostSelector = createLoadingSelector(['GET_TX_COST'])
const directTransferSelector = createLoadingSelector(['DIRECT_TRANSFER'])
const errorSelector = createErrorSelector(['GET_CLOUD_WALLET'])

const mapStateToProps = state => {
  return {
    wallet: state.walletReducer.wallet.drive,
    txCost: state.transferReducer.txCost,
    receipt: state.transferReducer.receipt,
    actionsPending: {
      getCloudWallet: getCloudWalletSelector(state),
      getTxCost: getTxCostSelector(state),
      directTransfer: directTransferSelector(state)
    },
    error: errorSelector(state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    getCloudWallet: () => dispatch(getCloudWallet()),
    getTxCost: (txRequest) => dispatch(getTxCost(txRequest)),
    directTransfer: (txRequest) => dispatch(directTransfer(txRequest))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WalletContainer)
