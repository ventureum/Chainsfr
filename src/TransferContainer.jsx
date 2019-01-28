import React, { Component } from 'react'
import { connect } from 'react-redux'
import TransferComponent from './TransferComponent'
import { transfer, checkMetamaskConnection, submitTx } from './actions'

class TransferContainer extends Component {
  render () {
    const { open, onClose, transfer, submitTx, checkMetamaskConnection, metamask, wallet } = this.props
    return (
      <TransferComponent
        open={open}
        onClose={onClose}
        wallet={wallet}
        metamask={metamask}
        transfer={transfer}
        submitTx={submitTx}
        checkMetamaskConnection={checkMetamaskConnection}
      />
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    transfer: (fromWallet, pin, value, destination) => dispatch(transfer(fromWallet, pin, value, destination)),
    checkMetamaskConnection: () => dispatch(checkMetamaskConnection(dispatch)),
    submitTx: (txRequest) => dispatch(submitTx(txRequest))
  }
}

const mapStateToProps = state => {
  return {
    wallet: state.userReducer.wallet,
    metamask: state.userReducer.metamask
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TransferContainer)
