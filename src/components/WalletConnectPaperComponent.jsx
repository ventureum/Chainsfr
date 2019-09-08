// @flow
import React, { Component } from 'react'

import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'

const ETH_NETWORK_ID = {
  '1': 'Mainnet',
  '3': 'Ropsten',
  '4': 'Rinkeby'
}

type Props = {
  classes: Object,
  walletConnector: Object,
  onWalletConnectConnected: Function,
  createWalletConnect: Function,
  reconnectWalletConnect: Function
}

class WalletConnectPaperComponent extends Component<Props> {
  render () {
    const { classes, walletConnector, createWalletConnect, reconnectWalletConnect } = this.props
    console.log(walletConnector)
    if (!walletConnector || !walletConnector.connected) {
      return (
        <Paper className={classes.paper}>
          <Typography variant="body2">Connect using WalletConnect</Typography>
          <Button variant="contained" color="primary" onClick={createWalletConnect}>
            Connect
          </Button>
        </Paper>
      )
    } else {
      // connected, show reconnect btn to user
      const { chainId } = walletConnector

      return (
        <Paper className={classes.paper}>
          <Typography variant="body2">Connected to Ethereum {ETH_NETWORK_ID[chainId]}</Typography>
          <Button variant="contained" color="primary" onClick={reconnectWalletConnect}>
            Reconnect
          </Button>
        </Paper>
      )
    }
  }
}

const styles = theme => ({
  paper: {
    padding: '10px',
    marginTop: '10px'
  }
})

export default withStyles(styles)(WalletConnectPaperComponent)
