import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import LinearProgress from '@material-ui/core/LinearProgress'
import update from 'immutability-helper'
import AccountDropdownContainer from '../containers/AccountDropdownContainer'

class ReceiveFormComponent extends Component {
  state = {
    password: ''
  }

  componentDidMount () {
    this.clearError()
  }

  onChange = event => {
    this.clearError()
    this.setState({ password: event.target.value })
  }

  handleNext = () => {
    let { verifyEscrowAccountPassword, escrowAccount } = this.props
    let { password } = this.state
    verifyEscrowAccountPassword({
      transferId: null,
      account: escrowAccount,
      password: password
    })
  }

  clearError = () => {
    const { error, clearVerifyEscrowAccountPasswordError } = this.props
    if (error) {
      clearVerifyEscrowAccountPasswordError()
    }
  }

  onAccountChange = event => {
    const { transferForm, updateTransferForm } = this.props
    updateTransferForm(update(transferForm, { accountSelection: { $set: event.target.value } }))
  }

  render () {
    const { classes, accountSelection, transfer, error, actionsPending } = this.props
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
        {actionsPending.verifyEscrowAccountPassword && (
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
        <AccountDropdownContainer
          onChange={this.onAccountChange}
          filterCriteria={accountData => accountData.cryptoType === transfer.cryptoType}
        />
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
                disabled={actionsPending.verifyEscrowAccountPassword}
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
                disabled={actionsPending.verifyEscrowAccountPassword || !accountSelection}
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

export default withStyles(styles)(ReceiveFormComponent)
