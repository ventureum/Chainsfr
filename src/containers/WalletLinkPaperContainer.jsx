// @flow
import React, { Component } from 'react'

import { connect } from 'react-redux'
import WalletLinkPaperComponent from '../components/WalletLinkPaperComponent'
import { onWalletLinkConnected } from '../actions/walletActions'
import WalletLink from 'walletlink'

type Props = {
  wallet: Object,
  walletSelection: string,
  onWalletLinkConnected: Function
}

const APP_LOGO = 'https://chainsfr-logo.s3.amazonaws.com/logo_wide.png'
const APP_NAME ='Chainsfr'

class WalletLinkPaperContainer extends Component<Props> {
  componentDidMount () {
    window.walletLink = new WalletLink({
        appName: APP_NAME,
        appLogoUrl: APP_LOGO
    })
  }

  createWalletLink = () => {
      this.props.onWalletLinkConnected(this.props.walletSelection)
  }

  reconnectWalletLink = async () => {
    delete window.walletLink
    localStorage.removeItem('__WalletLink__:https://www.walletlink.org:Addresses')
    window.walletLink = new WalletLink({
        appName: APP_NAME,
        appLogoUrl: APP_LOGO
    })
    this.props.onWalletLinkConnected(this.props.walletSelection)
  }

  render () {
    return (
      <WalletLinkPaperComponent
        walletConnector={window.walletLinkProvider}
        reconnectWalletLink={this.reconnectWalletLink}
        createWalletLink={this.createWalletLink}
        {...this.props}
      />
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onWalletLinkConnected: (walletType) =>
      dispatch(onWalletLinkConnected(walletType))
  }
}

const mapStateToProps = state => {
  return {
    walletSelection: state.formReducer.walletSelection,
    wallet: state.walletReducer.wallet[state.formReducer.walletSelection]
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WalletLinkPaperContainer)
