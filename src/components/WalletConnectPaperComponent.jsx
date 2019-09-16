// @flow
import React, { Component } from 'react'

import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import WalletConnectLogo from '../images/walletconnect.png'

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
    const connected = walletConnector && walletConnector.connected
    return (
      <Grid container direction='row' alignItems='center' spacing={1}>
        <Grid item>
          <Paper className={classes.paper}>
            <Grid container direction='row' alignItems='center'>
              <img
                src={WalletConnectLogo}
                alt='wallet-connect-logo'
                className={classes.connectorLogo}
              />
              <Typography variant='body2'>Connect your wallet via WalletConnect</Typography>
            </Grid>
          </Paper>
        </Grid>
        <Grid item>
          {!connected && (
            <Button variant='contained' color='primary' onClick={createWalletConnect}>
              Connect
            </Button>
          )}
          {connected && (
            <Button variant='contained' color='primary' onClick={reconnectWalletConnect}>
              Reconnect
            </Button>
          )}
        </Grid>
      </Grid>
    )
  }
}

const styles = theme => ({
  paper: {
    paddingLeft: '20px',
    paddingRight: '20px',
    paddingTop: '6px',
    paddingBottom: '6px'
  },
  connectorLogo: {
    width: '48px',
    height: '48px'
  }
})

export default withStyles(styles)(WalletConnectPaperComponent)
