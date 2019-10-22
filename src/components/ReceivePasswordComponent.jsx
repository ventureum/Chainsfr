import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import LinearProgress from '@material-ui/core/LinearProgress'
// import WalletUtils from '../wallets/utils'

class ReceivePasswordComponent extends Component {
  state = {
    password: ''
  }

  componentDidMount () {
    let { transfer, escrowWallet } = this.props
    // if (escrowWallet.crypto[transfer.cryptoType]) {
    //   this.props.clearDecryptedWallet(
    //     WalletUtils.toWalletDataFromState('escrow', transfer.cryptoType, escrowWallet)
    //   )
    // }
  }

  onChange = event => {
    this.clearError()
    this.setState({ password: event.target.value })
  }

  handleNext = () => {
    let { verifyPassword, transfer, escrowWallet } = this.props
    let { password } = this.state
    // verifyPassword({
    //   fromWallet: WalletUtils.toWalletDataFromState('escrow', transfer.cryptoType, escrowWallet),
    //   password: password
    // })
  }

  clearError = () => {
    const { error, clearVerifyPasswordError } = this.props
    if (error) {
      clearVerifyPasswordError()
    }
  }

  render () {
    const { classes, error, actionsPending } = this.props
    const { password } = this.state
    return (
      <Grid container direction='column' className={classes.root}>
        <Grid item>
          <Typography variant='h2' align='left'>
            Enter Security Answer
          </Typography>
        </Grid>
        <Grid item>
          <TextField
            fullWidth
            autoFocus
            id='password'
            label='Security Answer'
            margin='normal'
            variant='outlined'
            error={!!error}
            helperText={
              error ? 'Incorrect security answer' : 'Please enter security answer set by the sender'
            }
            onChange={this.onChange}
            value={password || ''}
            onKeyPress={ev => {
              if (ev.key === 'Enter') {
                this.handleNext()
              }
            }}
          />
        </Grid>
        {actionsPending.verifyPassword && (
          <Grid item>
            <Grid
              container
              direction='column'
              className={classes.linearProgressContainer}
              spacing={2}
            >
              <Grid item>
                <Typography variant='body2'>Checking password...</Typography>
              </Grid>
              <Grid item>
                <LinearProgress className={classes.linearProgress} />
              </Grid>
            </Grid>
          </Grid>
        )}
        <Grid item className={classes.btnSection}>
          <Grid container direction='row' justify='center'>
            <Grid item>
              <Button
                id='cancel'
                color='primary'
                size='large'
                onClick={() => {
                  this.clearError()
                  this.props.goToStep(-1)
                }}
                disabled={actionsPending.verifyPassword}
              >
                Cancel
              </Button>
            </Grid>
            <Grid item>
              <Button
                id='continue'
                fullWidth
                variant='contained'
                color='primary'
                size='large'
                onClick={this.handleNext}
                disabled={actionsPending.verifyPassword}
              >
                Continue
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    )
  }
}

const styles = theme => ({
  root: {
    padding: '0px 20px 0px 20px',
    margin: '60px 0px 60px 0px'
  },
  btnSection: {
    marginTop: '60px'
  },
  linearProgressContainer: {
    backgroundColor: 'rgba(66,133,244,0.05)',
    borderRadius: '4px',
    padding: '10px 20px 10px 20px',
    marginTop: '30px'
  },
  linearProgress: {
    marginTop: '8px'
  }
})

export default withStyles(styles)(ReceivePasswordComponent)
