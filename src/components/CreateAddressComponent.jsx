import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'

class CreateAddressComponent extends Component {
  createAddressOnClick = () => {
    this.props.createAddress('test')
  }

  render () {
    const { classes, open, onClose } = this.props

    return (
      <Dialog
        disableBackdropClick
        disableEscapeKeyDown
        maxWidth='md'
        aria-labelledby='transaction-progress-dialog'
        open={open}
        onClose={onClose}
      >
        <DialogContent>
          <Grid container direction='row' justify='center' className={classes.modalWrapper}>
            <Grid item>
              <Typography className={classes.title} variant='display1'>
                Add Address
              </Typography>
            </Grid>
            <Grid item>
              <Typography className={classes.message} variant='body' align='center'>
                Important: This will create an address managed by HUT34 Wallet.
                Your private key will be encrypted and the password stored in your Google Drive.
                We only have access to this file when you are logged into HUT34 Wallet.
                You can export your private key and/or keystore at any time.
              </Typography>
            </Grid>
            <Grid item>
              <Button onClick={this.createAddressOnClick}> Create Address </Button>
              <Button onClick={onClose}>
                Cancel
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    )
  }
}

const styles = theme => ({
  typography: {
    useNextVariants: true,
    suppressDeprecationWarnings: true
  },
  modalWrapper: {
    padding: '30px 30px 30px 30px'
  }
})

export default withStyles(styles)(CreateAddressComponent)
