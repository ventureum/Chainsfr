import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import CircularProgress from '@material-ui/core/CircularProgress'
import { getCryptoSymbol, getTxFeesCryptoType } from '../tokens'
import WalletUtils from '../wallets/utils'

class ReceiveReviewComponent extends Component {
  handleReviewNext = () => {
    const { transfer, escrowWallet, lastUsedWallet, txFee, walletSelection, wallet } = this.props
    const { receivingId, transferAmount } = transfer
    // accept transfer
    this.props.acceptTransfer({
      receivingId: receivingId,
      escrowWallet: WalletUtils.toWalletDataFromState('escrow', transfer.cryptoType, escrowWallet),
      receiveWallet: WalletUtils.toWalletDataFromState(walletSelection, transfer.cryptoType, lastUsedWallet || wallet),
      transferAmount: transferAmount,
      txFee: txFee
    })
  }

  render () {
    const { classes, transfer, actionsPending, txFee, destinationAddress, sentOn } = this.props
    const { transferAmount, sender, destination, cryptoType } = transfer

    if (!actionsPending.getTxFee && txFee) {
      var receiveAmount = ['ethereum', 'bitcoin'].includes(cryptoType)
        ? parseFloat(transferAmount) - parseFloat(txFee.costInStandardUnit)
        : parseFloat(transferAmount)
    }

    return (
      <Grid container direction='column' justify='center' alignItems='stretch'>
        <Grid item>
          <Grid container direction='column' justify='center' alignItems='center'>
            <Grid item>
              <Grid item>
                <Typography className={classes.title} variant='h6' align='center'>
                  Pending Transaction
                </Typography>
              </Grid>
              <Paper className={classes.reviewItemContainer}>
                <Grid item className={classes.reviewItem}>
                  <Typography className={classes.reviewSubtitle} align='left'>
                    From
                  </Typography>
                  <Typography className={classes.reviewContent} align='left' id='sender'>
                    {sender}
                  </Typography>
                </Grid>
                <Grid item className={classes.reviewItem}>
                  <Typography className={classes.reviewSubtitle} align='left'>
                    To
                  </Typography>
                  <Typography className={classes.reviewContent} align='left' id='destination'>
                    {destination}
                  </Typography>
                </Grid>
                <Grid item className={classes.reviewItem}>
                  <Typography className={classes.reviewSubtitle} align='left'>
                    Sent on
                  </Typography>
                  <Typography className={classes.reviewContent} align='left' id='sentOn'>
                    {sentOn}
                  </Typography>
                </Grid>
                <Grid item className={classes.reviewItem}>
                  <Typography className={classes.reviewSubtitle} align='left'>
                    Wallet Address
                  </Typography>
                  <Typography className={classes.reviewContent} align='left' id='destinationAddress'>
                    {destinationAddress}
                  </Typography>
                </Grid>
                <Grid item className={classes.reviewItem}>
                  <Typography className={classes.reviewSubtitle} align='left'>
                    Amount
                  </Typography>
                  <Typography className={classes.reviewContentAmount} align='left' id='transferAmount'>
                    {transferAmount} {getCryptoSymbol(cryptoType)}
                  </Typography>
                </Grid>
                <Grid item className={classes.reviewItem}>
                  <Typography className={classes.reviewSubtitle} align='left'>
                    Transaction Fee
                  </Typography>
                  {!actionsPending.getTxFee && txFee
                    ? <Typography className={classes.reviewContent} align='left'>
                      {txFee.costInStandardUnit} {getCryptoSymbol(getTxFeesCryptoType(cryptoType))}
                    </Typography>
                    : <CircularProgress size={18} color='primary' />}
                </Grid>
                <Grid item>
                  <Typography className={classes.reviewSubtitle} align='left'>
                    You will receive*
                  </Typography>
                  {!actionsPending.getTxFee && txFee
                    ? <Typography className={classes.reviewContent} align='left' id='receiveAmount'>
                      {receiveAmount} {getCryptoSymbol(cryptoType)}
                    </Typography>
                    : <CircularProgress size={18} color='primary' />}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
        <Grid item className={classes.btnSection}>
          <Grid container direction='row' justify='center' spacing={3}>
            <Grid item>
              <Button
                color='primary'
                size='large'
                onClick={() => this.props.goToStep(-1)}
                id='cancel'
              >
                Cancel
              </Button>
            </Grid>
            <Grid item>
              <div className={classes.wrapper}>
                <Button
                  fullWidth
                  variant='contained'
                  color='primary'
                  size='large'
                  disabled={actionsPending.acceptTransfer}
                  onClick={this.handleReviewNext}
                  id='complete'
                >
                  Complete
                </Button>
                {actionsPending.acceptTransfer && <CircularProgress size={24} color='primary' className={classes.buttonProgress} />}
              </div>
            </Grid>
          </Grid>
        </Grid>
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
    padding: '0px 0px 0px 0px',
    marginBottom: '20px'
  },
  reviewItemContainer: {
    border: 'border: 1px solid #D2D2D2',
    borderRadius: '8px',
    backgroundColor: '#FAFAFA',
    padding: '20px'
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
  reviewContentAmount: {
    color: '#333333',
    fontSize: '18px',
    lineHeight: '24px',
    fontWeight: 'bold'
  },
  reviewItem: {
    marginBottom: '30px'
  },
  btnSection: {
    marginTop: '60px'
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  },
  wrapper: {
    position: 'relative'
  }
})

export default withStyles(styles)(ReceiveReviewComponent)
