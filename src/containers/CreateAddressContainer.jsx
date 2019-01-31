import React, { Component } from 'react'
import { connect } from 'react-redux'
import CreateAddressComponent from '../components/CreateAddressComponent'
import { createAddress } from '../actions'

class CreateAddressContainer extends Component {
  render () {
    const { open, onClose, createAddress } = this.props
    return (
      <CreateAddressComponent
        open={open}
        onClose={onClose}
        createAddress={createAddress} />
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    createAddress: alias => dispatch(createAddress(alias))
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
)(CreateAddressContainer)
