import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import CircularProgress from '@material-ui/core/CircularProgress'
import moment from 'moment'
import { getCryptoSymbol } from '../tokens'

class ReceiveReviewComponent extends Component {
  handleReviewNext = () => {
    const { transfer, escrowWallet, wallet, walletSelection, txCost } = this.props
    const { receivingId, transferAmount } = transfer

    // accept transfer
    // TODO handle ledger nano s and erc20 tokens
    this.props.acceptTransfer({
      receivingId: receivingId,
      escrowWallet: escrowWallet.decryptedWallet,
      destinationAddress: wallet.accounts[0].address,
      walletType: walletSelection,
      cryptoType: transfer.cryptoType,
      transferAmount: transferAmount,
      txCost: txCost
    })
  }

  componentDidMount () {
    // refresh gas cost
    const { transfer } = this.props
    this.props.getTxCost({ cryptoType: transfer.cryptoType })
  }

  render () {
    const { classes, wallet, transfer, cryptoSelection, actionsPending, txCost } = this.props
    const { transferAmount, sender, destination, cryptoType, sendTimestamp } = transfer

    var address = wallet.accounts[0].address

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
                    Sent on
                  </Typography>
                  <Typography className={classes.reviewContent} align='left'>
                    {moment.unix(sendTimestamp).format('MMM Do YYYY, HH:mm:ss')}
                  </Typography>
                </Grid>
                <Grid item className={classes.reviewItem}>
                  <Typography className={classes.reviewSubtitle} align='left'>
                    Wallet Address
                  </Typography>
                  <Typography className={classes.reviewContent} align='left'>
                    {address}
                  </Typography>
                </Grid>
                <Grid item className={classes.reviewItem}>
                  <Typography className={classes.reviewSubtitle} align='left'>
                    Amount
                  </Typography>
                  <Typography className={classes.reviewContentAmount} align='left'>
                    {transferAmount} {getCryptoSymbol(cryptoType)}
                  </Typography>
                </Grid>
                <Grid item className={classes.reviewItem}>
                  <Typography className={classes.reviewSubtitle} align='left'>
                    Transaction Fee
                  </Typography>
                  <Typography className={classes.reviewContent} align='left'>
                    {!actionsPending.getTxCost && txCost
                      ? `${txCost.costInStandardUnit} ${getCryptoSymbol(cryptoSelection)}`
                      : <CircularProgress size={18} color='primary' />}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography className={classes.reviewSubtitle} align='left'>
                    You will receive*
                  </Typography>
                  <Typography className={classes.reviewContent} align='left'>
                    {!actionsPending.getTxCost && txCost
                      ? `${parseFloat(transferAmount) - parseFloat(txCost.costInStandardUnit)} ${getCryptoSymbol(cryptoSelection)}`
                      : <CircularProgress size={18} color='primary' />}
                  </Typography>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
        <Grid item className={classes.btnSection}>
          <Grid container direction='row' justify='center' spacing={24}>
            <Grid item>
              <Button
                color='primary'
                size='large'
                onClick={() => this.props.goToStep(-3)}
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
