// @flow
import React, { Component } from 'react'
import './App.css'

import { withStyles } from '@material-ui/core/styles'

import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import validator from 'validator'
import Divider from '@material-ui/core/Divider'
import LinearProgress from '@material-ui/core/LinearProgress'

type Props = {
  open: boolean,
  handleClose: Function,
  handleSubmit: Function,
  actionsPending: Object,
  classes: Object,
  error: any,
  clearError: Function
}

type State = {
  name: string,
  email: string,
  validEmail: boolean
}

const defaultState = {
  name: '',
  email: '',
  validEmail: true
}
class AddRecipientDialogComponent extends Component<Props, State> {
  state = defaultState

  handleChange = prop => event => {
    if (prop === 'email') {
      this.setState({
        [prop]: event.target.value,
        validEmail: validator.isEmail(event.target.value)
      })
    } else {
      this.setState({ [prop]: event.target.value })
    }
  }

  render () {
    let { actionsPending, open, handleClose, handleSubmit, classes, error, clearError } = this.props
    const { name, email, validEmail } = this.state
    return (
      <Dialog
        open={open}
        onClose={() => {
          this.setState(defaultState)
          handleClose()
        }}
        aria-labelledby='form-dialog-title'
        onEnter={clearError}
      >
        <DialogTitle id='form-dialog-title'>Add a recipient</DialogTitle>
        <Divider />
        <DialogContent>
          <form noValidate>
            <TextField
              id='name'
              variant='outlined'
              fullWidth
              error={!!error}
              className={classes.textField}
              label='Name'
              value={name}
              onChange={this.handleChange('name')}
              disabled={actionsPending.addRecipient}
            />
            <TextField
              id='email'
              variant='outlined'
              fullWidth
              disabled={actionsPending.addRecipient}
              error={!validEmail}
              className={classes.textField}
              label='Email'
              value={email}
              onChange={this.handleChange('email')}
              helperText={!validEmail ? 'Invalid Email format' : ''}
            />
          </form>
          {actionsPending.addRecipient && <LinearProgress />}
        </DialogContent>
        <DialogActions>
          <Button
            variant='contained'
            disabled={actionsPending.addRecipient || !name || !email || !validEmail}
            onClick={() => {
              this.setState(defaultState)
              handleSubmit(this.state)
            }}
            color='primary'
            id='Add'
            className={classes.submitBtn}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

const styles = theme => ({
  textField: {
    margin: '10px 0px 10px 0px'
  },
  submitBtn: {
    margin: '0px 16px 10px 16px',
    width: '100%',
    textTransform: 'none'
  }
})

export default withStyles(styles)(AddRecipientDialogComponent)
