// @flow
import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import validator from 'validator'
import Typography from '@material-ui/core/Typography'
import LinearProgress from '@material-ui/core/LinearProgress'
import CloseIcon from '@material-ui/icons/Close'
import styles from './styles'
import IconButton from '@material-ui/core/IconButton'

type Props = {
  open: boolean,
  handleClose: Function,
  handleSubmit: Function,
  loading: boolean,
  recipient: Object,
  online: boolean
}

type State = {
  name: string,
  email: string,
  validEmail: boolean,
  validName: boolean
}

class EditRecipientDialog extends Component<Props, State> {
  state = {
    validEmail: true,
    validName: true,
    ...this.props.recipient
  }

  handleChange = prop => event => {
    if (prop === 'email') {
      this.setState({
        email: event.target.value,
        validEmail: validator.isEmail(event.target.value)
      })
    } else if (prop === 'name') {
      this.setState({
        name: event.target.value,
        validName: !!event.target.value && event.target.value === event.target.value.trim()
      })
    }
  }

  render () {
    let { loading, open, handleSubmit, recipient, handleClose, online } = this.props
    const { name, email, validEmail, validName } = this.state
    return (
      <Dialog
        open={open}
        onClose={() => {
          handleClose()
        }}
        aria-labelledby='form-dialog-title'
      >
        <DialogTitle id='form-dialog-title'>
          <Box display='flex' justifyContent='space-between' alignItems='flex-end'>
            <Typography variant='h3'>Edit Contact</Typography>
            <IconButton
              onClick={() => {
                handleClose()
              }}
            >
              <CloseIcon fontSize='small' color='secondary' />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent className='dialog-form'>
          <form noValidate data-test-id='edit_recipient_form'>
            <TextField
              id='name'
              variant='outlined'
              fullWidth
              margin='normal'
              label='Name'
              value={name}
              onChange={this.handleChange('name')}
              error={!validName}
              disabled={loading}
              helperText={!validName ? 'Invalid contact name' : ''}
              name='name'
            />
            <TextField
              id='email'
              variant='outlined'
              fullWidth
              margin='normal'
              disabled={loading}
              error={!validEmail}
              label='Email'
              value={email}
              onChange={this.handleChange('email')}
              helperText={!validEmail ? 'Invalid Email format' : ''}
              name='email'
            />
          </form>
          {loading && <LinearProgress />}
        </DialogContent>
        <DialogActions>
          <Box mr={2}>
            <Button
              disabled={loading}
              onClick={() => {
                handleClose()
              }}
              variant='outlined'
              color='secondary'
              id='cancel'
            >
              Cancel
            </Button>
          </Box>
          <Button
            variant='contained'
            disabled={loading || !name || !email || !validEmail || !online}
            onClick={() => {
              handleSubmit(recipient, this.state)
            }}
            color='primary'
            id='save'
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default withStyles(styles)(EditRecipientDialog)
