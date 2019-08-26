// @flow
import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import validator from 'validator'
import Grid from '@material-ui/core/Grid'
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
  classes: Object
}

type State = {
  name: string,
  email: string,
  validEmail: boolean,
  validName: boolean
}

const defaultState = {
  name: '',
  email: '',
  validEmail: true,
  validName: true
}

class AddRecipientDialog extends Component<Props, State> {
  state = defaultState

  handleChange = prop => event => {
    if (prop === 'email') {
      this.setState({
        [prop]: event.target.value,
        validEmail: validator.isEmail(event.target.value)
      })
    } else if (prop === 'name') {
      this.setState({
        [prop]: event.target.value,
        validName: !!event.target.value && event.target.value === event.target.value.trim()
      })
    }
  }

  render () {
    let { loading, open, classes, handleSubmit, handleClose } = this.props
    const { name, email, validEmail, validName } = this.state
    return (
      <Dialog
        open={open}
        onClose={() => {
          handleClose()
        }}
        aria-labelledby='form-dialog-title'
        className={classes.dialog}
      >
        <DialogTitle id='form-dialog-title' className={classes.dialogTitle}>
          <Grid container direction='column' alignItems='flex-start'>
            <IconButton
              onClick={() => {
                handleClose()
              }}
              className={classes.closeBtn}
            >
              <CloseIcon className={classes.closeIcon} />
            </IconButton>
            <Typography className={classes.title}>Add Recipient</Typography>
          </Grid>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <form noValidate className={classes.form}>
            <TextField
              id='name'
              variant='outlined'
              fullWidth
              className={classes.textField}
              label='Name'
              value={name}
              onChange={this.handleChange('name')}
              error={!validName}
              disabled={loading}
              helperText={!validName ? 'Invalid recipient name' : ''}
            />
            <TextField
              id='email'
              variant='outlined'
              fullWidth
              disabled={loading}
              error={!validEmail}
              className={classes.textField}
              label='Email'
              value={email}
              onChange={this.handleChange('email')}
              helperText={!validEmail ? 'Invalid Email format' : ''}
            />
          </form>
          {loading && <LinearProgress />}
        </DialogContent>
        <DialogActions className={classes.dialogAction}>
          <Button
            disabled={loading}
            onClick={() => {
              handleClose()
            }}
            color='primary'
            id='cancel'
            className={classes.cancelBtn}
          >
            Cancel
          </Button>
          <Button
            variant='contained'
            disabled={loading || !name || !email || !validEmail}
            onClick={() => {
              handleSubmit(this.state)
            }}
            color='primary'
            id='add'
            className={classes.saveBtn}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default withStyles(styles)(AddRecipientDialog)
