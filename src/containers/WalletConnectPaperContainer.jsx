// @flow
import React, { Component } from 'react'

import { connect } from 'react-redux'
import WalletConnect from '@walletconnect/browser'
import WalletConnectQRCodeModal from '@walletconnect/qrcode-modal'
import WalletConnectPaperComponent from '../components/WalletConnectPaperComponent'
import { onWalletConnectConnected } from '../actions/walletActions'

type Props = {
  wallet: Object,
  walletSelection: string,
  onWalletConnectConnected: Function
}

type State = {
  walletConnector: ?{
    connected: boolean,
    chainId: string
  }
}

class WalletConnectPaperContainer extends Component<Props, State> {
  state = {
    walletConnector: null
  }

  componentDidMount () {
    const { wallet } = this.props
    if (window.walletConnector && window.walletConnector.connected) {
      // already connected
      if (window.walletConnector.peerId === wallet.peerId) {
        // same peerId => same session for the same wallet
        // update wallet data
        this.setWalletConnector(window.walletConnector)
      }
    }
  }

  setWalletConnector = walletConnector => {
    if (!walletConnector) {
      this.setState({ walletConnector: null })
    } else {
      const { connected, accounts, chainId, peerId } = walletConnector
      this.setState({
        walletConnector: {
          connected,
          chainId
        }
      })
      this.props.onWalletConnectConnected(this.props.walletSelection, accounts, chainId, peerId)
    }
  }

  createWalletConnect = async () => {
    const { wallet } = this.props
    // Create a walletConnector
    if (!window.walletConnector) {
      window.walletConnector = new WalletConnect({
        bridge: 'https://bridge.walletconnect.org' // Required
      })
    }

    if (window.walletConnector.connected) {
      // already connected
      if (window.walletConnector.peerId === wallet.peerId) {
        // same peerId => same session for the same wallet
        // update wallet data
        this.setWalletConnector(window.walletConnector)
      } else {
        // different session
        // reset session and reconnect
        await window.walletConnector.killSession()
        this.setWalletConnector(null)
        // re-init
        window.walletConnector = new WalletConnect({
          bridge: 'https://bridge.walletconnect.org' // Required
        })
      }
    }

    // Check if connection is already established
    if (!window.walletConnector.connected) {
      // create new session
      await window.walletConnector.createSession()
      const uri = window.walletConnector.uri
      // display QR Code modal
      WalletConnectQRCodeModal.open(uri, () => {
        console.info('QR Code Modal closed')
      })
    }

    this.subscribeToWalletConnectEvents()
  }

  reconnectWalletConnect = async () => {
    if (window.walletConnector && window.walletConnector.connected) {
      await window.walletConnector.killSession()
      await this.createWalletConnect()
    }
  }

  subscribeToWalletConnectEvents = () => {
    // Subscribe to connection events
    window.walletConnector.on('connect', (error, payload) => {
      if (error) {
        throw error
      }
      // Close QR Code Modal
      WalletConnectQRCodeModal.close()
      this.setWalletConnector(window.walletConnector)
    })

    window.walletConnector.on('session_update', (error, payload) => {
      if (error) {
        throw error
      }
      this.setWalletConnector(window.walletConnector)
    })

    window.walletConnector.on('disconnect', (error, payload) => {
      WalletConnectQRCodeModal.close()
      if (error) {
        throw error
      }
      delete window.walletConnector
      this.setWalletConnector(null)
    })
  }

  render () {
    return (
      <WalletConnectPaperComponent
        walletConnector={this.state.walletConnector}
        reconnectWalletConnect={this.reconnectWalletConnect}
        createWalletConnect={this.createWalletConnect}
        {...this.props}
      />
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onWalletConnectConnected: (walletType, accounts, network, peerId) =>
      dispatch(onWalletConnectConnected(walletType, accounts, network, peerId))
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
)(WalletConnectPaperContainer)
