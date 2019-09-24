// @flow
import React, { Component } from 'react'

import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'

type Props = {
  classes: Object,
  wallet: Object,
  actionsPending: Object,
  onWalletLinkConnected: Function,
  createWalletLink: Function,
  reconnectWalletLink: Function
}

class WalletLinkPaperComponent extends Component<Props> {
  render () {
    const { classes, wallet, createWalletLink, reconnectWalletLink, actionsPending } = this.props
    const connected = wallet.connected
    return (
      <Grid container direction='row' alignItems='center' spacing={1}>
        <Grid item>
          <Paper className={classes.paper}>
            <Typography variant='body2'>Connect your wallet via WalletLink</Typography>
          </Paper>
        </Grid>
        <Grid item>
          {!connected && (
            <Button
              variant='contained'
              color='primary'
              onClick={createWalletLink}
              disabled={actionsPending.checkWalletConnection}
            >
              Connect
            </Button>
          )}
          {connected && (
            <Button
              variant='contained'
              color='primary'
              onClick={reconnectWalletLink}
              disabled={actionsPending.checkWalletConnection}
            >
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
    padding: '20px'
  },
  connectorLogo: {
    width: '48px',
    height: '48px'
  }
})

export default withStyles(styles)(WalletLinkPaperComponent)
