import React, { Component } from 'react'
import { connect } from 'react-redux'
import TransferComponent from '../components/TransferComponent'
import { transfer } from '../actions'

class TransferContainer extends Component {
  render () {
    return (
      <TransferComponent
        {...this.props}
      />
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    transfer: (fromWallet, pin, value, destination) => dispatch(transfer(fromWallet, pin, value, destination))
  }
}

export default connect(
  null,
  mapDispatchToProps
)(TransferContainer)
