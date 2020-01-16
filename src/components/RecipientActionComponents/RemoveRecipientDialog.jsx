// @flow
import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
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
  recipient: Object
}

class RemoveRecipientDialog extends Component<Props> {
  state = this.props.recipient

  render () {
    let { loading, open, handleSubmit, recipient, handleClose } = this.props
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
            <Typography variant='h3'>Delete Recipient</Typography>
            <IconButton
              onClick={() => {
                handleClose()
              }}
            >
              <CloseIcon fontSize='small' color='secondary' />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent className='dialog-content'>
          <Typography variant='body2'>
            Are you sure you want to delete the recipient {recipient.name}?
          </Typography>
          {loading && <LinearProgress />}
        </DialogContent>
        <DialogActions>
          <Box mr={1}>
            <Button
              disabled={loading}
              onClick={() => {
                handleClose()
              }}
              id='cancel'
              variant='outlined'
              color='secondary'
              size='small'
            >
              Cancel
            </Button>
          </Box>
          <Button
            disabled={loading}
            onClick={() => {
              handleSubmit(this.state)
            }}
            size='small'
            variant='contained'
            className='warning'
            id='delete'
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default withStyles(styles)(RemoveRecipientDialog)
