import React, { Component } from 'react'
import CreateAddressComponent from '../components/CreateAddressComponent'

class CreateAddressContainer extends Component {
  render () {
    const { open, onClose } = this.props
    return (
      <CreateAddressComponent
        open={open}
        onClose={onClose}
      />
    )
  }
}
export default CreateAddressContainer
