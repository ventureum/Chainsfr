// @flow
import React, { Component } from 'react'
import './App.css'

import { withStyles } from '@material-ui/core/styles'

import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import LinearProgress from '@material-ui/core/LinearProgress'

type Props = {
  open: boolean,
  cryptoType: string,
  handleClose: Function,
  handleSubmit: Function,
  actionsPending: Object,
  classes: Object,
  error:any,
  clearError: Function
}

type State = {
  password: string
}

class CloudWalletUnlockComponent extends Component<Props, State> {
  state = {
    password: ''
  }

  handleChange = prop => event => {
    const { error, clearError } = this.props
    this.setState({ [prop]: event.target.value })
    if (error) {
      clearError()
    }
  }

  render () {
    let {
      actionsPending,
      cryptoType,
      open,
      handleClose,
      handleSubmit,
      classes,
      error,
      clearError
    } = this.props
    return (
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby='form-dialog-title'
        onEnter={clearError}
      >
        <DialogTitle id='form-dialog-title'>Unlock Drive Wallet</DialogTitle>
        <DialogContent>
          <DialogContentText className={classes.marginBottom20px}>
            Unlocking { cryptoType } wallet using your
            independent password
          </DialogContentText>
          {actionsPending && actionsPending.decryptCloudWallet &&
            <LinearProgress />
          }
          {(!actionsPending || !actionsPending.decryptCloudWallet) &&
            <form noValidate autoComplete='drive-wallet-independent-password-form'>
              <TextField
                id='drive-wallet-independent-password'
                autoComplete='drive-wallet-independent-password'
                variant='outlined'
                fullWidth
                error={!!error}
                type={'password'}
                label='Password'
                value={this.state.password}
                onChange={this.handleChange('password')}
                helperText={error ? 'Incorrect password' : ''}
              />
            </form>
          }
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color='primary' id='cancel'>
            Cancel
          </Button>
          <Button
            variant='contained'
            disabled={actionsPending.decryptCloudWallet}
            onClick={() => {
              this.setState({ password: '' })
              handleSubmit(this.state.password)
            }}
            color='primary'
            id='submit'
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

const styles = theme => ({
  marginBottom20px: {
    marginBottom: '20px'
  }
})

export default withStyles(styles)(CloudWalletUnlockComponent)
