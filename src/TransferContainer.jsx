import React, { Component } from 'react'
import { connect } from 'react-redux'
import TransferComponent from './TransferComponent'
import { transfer } from './actions'

class TransferContainer extends Component {
  render () {
    const { open, onClose, transfer, wallet } = this.props
    return (
      <TransferComponent
        open={open}
        onClose={onClose}
        wallet={wallet}
        transfer={transfer} />
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    transfer: (fromWallet, pin, value, destination) => dispatch(transfer(fromWallet, pin, value, destination))
  }
}

const mapStateToProps = state => {
  return {
    wallet: state.userReducer.wallet
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TransferContainer)
