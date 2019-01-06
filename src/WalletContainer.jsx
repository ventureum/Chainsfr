import React, { Component } from 'react'
import { connect } from 'react-redux'
import WalletComponent from './WalletComponent'
import { getWallet } from './actions'

class WalletContainer extends Component {
  constructor () {
    super()
    this.state = { error: null, errorInfo: null }
  }

  componentDidCatch (error, info) {
    this.setState(
      { error: error, errorInfo: info }
    )
  }

  componentDidMount () {
    if (!this.props.wallet) {
      this.props.getWallet()
    }
  }

  render () {
    let { addresses, ...others } = this.props
    return (
      <WalletComponent
        addresses={addresses}
        {...others}
      />)
  }
}

const mapStateToProps = state => {
  return {
    addresses: state.userReducer.addresses
  }
}

const mapDispatchToProps = dispatch => {
  return {
    getWallet: () => dispatch(getWallet()),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WalletContainer)
