// @flow
import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
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
  classes: Object,
  recipient: Object
}

class RemoveRecipientDialog extends Component<Props> {
  state = this.props.recipient

  render () {
    let { loading, open, classes, handleSubmit, recipient, handleClose } = this.props
    return (
      <Dialog
        open={open}
        onClose={() => {
          handleClose()
        }}
        aria-labelledby='form-dialog-title'
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
            <Typography className={classes.title}>Edit Recipient</Typography>
          </Grid>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <Typography className={classes.deleteText}>
            Are you sure you want to delete recipient {recipient.name}?
          </Typography>
          {loading && <LinearProgress />}
        </DialogContent>
        <DialogActions className={classes.dialogAction}>
          <Box mr={2}>
            <Button
              disabled={loading}
              onClick={() => {
                handleClose()
              }}
              id='cancel'
              variant='outlined'
              color='secondary'
            >
              Cancel
            </Button>
          </Box>
          <Button
            disabled={loading}
            onClick={() => {
              handleSubmit(this.state)
            }}
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
