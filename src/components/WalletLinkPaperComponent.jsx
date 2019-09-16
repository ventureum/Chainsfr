// @flow
import React, { Component } from 'react'

import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'

type Props = {
  classes: Object,
  wallet: Object,
  onWalletLinkConnected: Function,
  createWalletLink: Function,
  reconnectWalletLink: Function
}

const ETH_NETWORK_ID = {
  '1': 'Mainnet',
  '3': 'Ropsten',
  '4': 'Rinkeby'
}

class WalletLinkPaperComponent extends Component<Props> {
  render () {
    const { classes, wallet, createWalletLink, reconnectWalletLink } = this.props
    if (!wallet.connected) {
      return (
        <Paper className={classes.paper}>
          <Typography variant='body2'>Connect using WalletLink</Typography>
          <Button variant='contained' color='primary' onClick={createWalletLink}>
            Connect
          </Button>
        </Paper>
      )
    } else {
      const { network } = wallet
      return (
        <Paper className={classes.paper}>
          <Typography variant='body2'>Connected to Ethereum {ETH_NETWORK_ID[network]}</Typography>
          <Button variant='contained' color='primary' onClick={reconnectWalletLink}>
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

export default withStyles(styles)(WalletLinkPaperComponent)
