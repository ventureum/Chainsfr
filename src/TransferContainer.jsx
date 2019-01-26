import React, { Component } from 'react'
import { connect } from 'react-redux'
import TransferComponent from './TransferComponent'
import { transfer, checkMetamaskConnection } from './actions'

class TransferContainer extends Component {
  render () {
    const { open, onClose, transfer, checkMetamaskConnection, metamask, wallet } = this.props
    return (
      <TransferComponent
        open={open}
        onClose={onClose}
        wallet={wallet}
        metamask={metamask}
        transfer={transfer}
        checkMetamaskConnection={checkMetamaskConnection}
      />
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    transfer: (fromWallet, pin, value, destination) => dispatch(transfer(fromWallet, pin, value, destination)),
    checkMetamaskConnection: () => dispatch(checkMetamaskConnection(dispatch))
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
