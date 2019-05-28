import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import CircularProgress from '@material-ui/core/CircularProgress'
import DialogTitle from '@material-ui/core/DialogTitle'
import Dialog from '@material-ui/core/Dialog'
import { getCryptoSymbol, getTxFeesCryptoType } from '../tokens'

class CancelReviewComponent extends Component {
  state = {
    open: false
  }

  handleReviewNext = () => {
    const { transfer, escrowWallet, txCost } = this.props
    const { sendingId, sendTxHash, transferAmount, cryptoType } = transfer
    this.props.cancelTransfer({
      escrowWallet: escrowWallet.decryptedWallet,
      sendingId: sendingId,
      sendTxHash: sendTxHash,
      cryptoType: cryptoType,
      transferAmount: transferAmount,
      txCost: txCost
    })
  }

  handleModalOpen = () => {
    this.setState({ open: true })
  }

  handleModalClose = () => {
    this.setState({ open: false })
  }

  handleDestinationOnChange = (event) => {
    this.setState({ destinationInput: event.target.value })
  }

  renderModal = () => {
    let { classes, actionsPending } = this.props

    return (
      <Dialog
        aria-labelledby='cancel-dialog-title'
        open={this.state.open}
        onClose={this.handleClose}
      >
        <DialogTitle id='cancel-dialog-title'>
          <Typography className={classes.modalTitle}>
            Cancel Transfer
          </Typography>
        </DialogTitle>
        <Grid container direction='column' justify='center' alignItems='center' className={classes.modalContainer}>
          <Grid item className={classes.modalDescSection}>
            <Typography className={classes.modalDesc}>
              You are going to cancel the arranged transfer. Recepient will receive an email notification and won’t be able to accept the transfer anymore. Gas fee will be applied.
            </Typography>
          </Grid>
          <Grid item className={classes.modalBtnSection}>
            <Grid container direction='row' justify='flex-end' alignItems='center'>
              <Grid item>
                <Button
                  color='primary'
                  onClick={this.handleModalClose}
                >
                  Let me think again
                </Button>
              </Grid>
              <Grid item>
                <div className={classes.wrapper}>
                  <Button
                    variant='contained'
                    color='primary'
                    disabled={actionsPending.cancelTransfer}
                    onClick={this.handleReviewNext}
                  >
                    Cancel Transfer
                  </Button>
                  {(actionsPending.verifyPassword || actionsPending.cancelTransfer) &&
                  <CircularProgress
                    size={24}
                    color='primary'
                    className={classes.buttonProgress}
                  />}
                </div>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Dialog>
    )
  }

  render () {
    const { classes, transfer, escrowWallet, actionsPending, txCost, sendTime } = this.props
    if (transfer) {
      var { sendingId, transferAmount, sender, destination, cryptoType } = transfer
    }

    if (
      actionsPending.getTransfer ||
      actionsPending.verifyPassword ||
      !transfer ||
      !escrowWallet
    ) {
      return (
        <Grid container direction='column' justify='center' alignItems='center'>
          <Grid item>
            <CircularProgress
              color='primary'
              className={classes.transferProgress}
            />
          </Grid>
        </Grid>
      )
    }

    return (
      <Grid container direction='column' justify='center' alignItems='center'>
        <Grid item>
          <Paper className={classes.receiptPaper} elevation={1}>
            <Grid container direction='column' justify='center' alignItems='stretch'>
              <Grid item>
                <Grid item className={classes.titleSection}>
                  <Grid container direction='column' justify='center' alignItems='flex-start'>
                    <Typography className={classes.title} variant='h6' align='left'>
                      Transfer details
                    </Typography>
                    <Typography className={classes.transferId} align='left'>
                      {`Transfer ID: ${sendingId}`}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item className={classes.reviewItem}>
                  <Typography className={classes.reviewSubtitle} align='left'>
                     From
                  </Typography>
                  <Typography className={classes.reviewContent} align='left'>
                    {sender}
                  </Typography>
                </Grid>
                <Grid item className={classes.reviewItem}>
                  <Typography className={classes.reviewSubtitle} align='left'>
                     To
                  </Typography>
                  <Typography className={classes.reviewContent} align='left'>
                    {destination}
                  </Typography>
                </Grid>
                <Grid item className={classes.reviewItem}>
                  <Typography className={classes.reviewSubtitle} align='left'>
                     Amount
                  </Typography>
                  <Typography className={classes.reviewContent} align='left'>
                    {transferAmount} {getCryptoSymbol(cryptoType)}
                  </Typography>
                </Grid>
                <Grid item className={classes.reviewItem}>
                  <Typography className={classes.reviewSubtitle} align='left'>
                      Transaction Fee
                  </Typography>
                  <Typography className={classes.reviewContent} align='left'>
                    {!actionsPending.getTxCost && txCost
                      ? `${txCost.costInStandardUnit} ${getCryptoSymbol(getTxFeesCryptoType(cryptoType))}`
                      : <CircularProgress size={18} color='primary' />}
                  </Typography>
                </Grid>
                <Grid item className={classes.reviewItem}>
                  <Typography className={classes.reviewSubtitle} align='left'>
                     Sent on
                  </Typography>
                  <Typography className={classes.reviewContent} align='left'>
                    {sendTime}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item className={classes.btnSection}>
          <Grid container direction='row' justify='center' spacing={24}>
            <Grid item>
              <Button
                fullWidth
                color='primary'
                size='large'
                onClick={this.handleModalOpen}
              >
                Cancel Transfer
              </Button>
            </Grid>
          </Grid>
        </Grid>
        {this.state.open && this.renderModal()}
      </Grid>
    )
  }
}

const styles = theme => ({
  title: {
    color: '#333333',
    fontSize: '18px',
    fontWeight: '600',
    lineHeight: '24px',
    padding: '0px 0px 0px 0px'
  },
  transferId: {
    color: '#777777',
    fontSize: '12px',
    lineHeight: '17px'
  },
  reviewSubtitle: {
    color: '#777777',
    fontSize: '12px',
    lineHeight: '17px'
  },
  reviewContent: {
    color: '#333333',
    fontSize: '18px',
    lineHeight: '24px'
  },
  reviewItem: {
    marginTop: '30px'
  },
  receiptPaper: {
    marginTop: '20px',
    padding: '60px 90px'
  },
  checkCircleIcon: {
    color: '#0CCD70',
    fontSize: '40px',
    marginBottom: '14px'
  },
  informReceiverText: {
    color: '#333333',
    maxWidth: '360px'
  },
  btnSection: {
    marginTop: '60px'
  },
  iconBtn: {
    padding: '0',
    marginLeft: '16px'
  },
  transferProgress: {
    padding: '60px'
  },
  modalContainer: {
    padding: '0px 24px 24px 24px'
  },
  modalBtnSection: {
    width: '100%'
  },
  modalTitle: {
    color: '#333333',
    fontSize: '18px',
    fontWeight: '500'
  },
  modalDesc: {
    color: '#333333',
    fontSize: '14px'
  },
  modalDescSection: {
    paddingBottom: '20px'
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  },
  wrapper: {
    margin: theme.spacing.unit,
    position: 'relative'
  }
})

export default withStyles(styles)(CancelReviewComponent)
