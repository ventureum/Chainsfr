import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import CircularProgress from '@material-ui/core/CircularProgress'
import moment from 'moment'

const cryptoAbbreviationMap = {
  'ethereum': 'ETH',
  'bitcoin': 'BTC',
  'dai': 'DAI'
}

class CancelReviewComponent extends Component {
  handleReviewNext = () => {
    const { transfer, password } = this.props
    const { sendingId, sendTxHash, transferAmount, cryptoType } = transfer

    this.props.verifyPasswordAndCancelTransfer({
      encriptedWallet: transfer.data,
      password: password,
      sendingId: sendingId,
      sendTxHash: sendTxHash,
      cryptoType: cryptoType,
      transferAmount: transferAmount
    })
  }

  componentDidMount () {
    // refresh gas cost
    const { cryptoType } = this.props.transfer
    this.props.getGasCost({ cryptoType: cryptoType })
  }

  render () {
    const { classes, transfer, actionsPending, gasCost } = this.props
    const { transferAmount, sender, destination, cryptoType, sendTimestamp } = transfer

    return (
      <Grid container direction='column' justify='center' alignItems='stretch'>
        <Grid item>
          <Grid container direction='column' justify='center' alignItems='center'>
            <Grid item>
              <Grid item>
                <Typography className={classes.title} variant='h6' align='center'>
                  Please review details of your transfer
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
                    Amount
                  </Typography>
                  <Typography className={classes.reviewContentAmount} align='left'>
                    {transferAmount} {cryptoAbbreviationMap[cryptoType]}
                  </Typography>
                </Grid>
                <Grid item className={classes.reviewItem}>
                  <Typography className={classes.reviewSubtitle} align='left'>
                    Gas Fee
                  </Typography>
                  {!actionsPending.getGasCost && gasCost
                   ? <Typography className={classes.reviewContent} align='left'>
                     {gasCost.costInEther} ETH
                   </Typography>
                   : <CircularProgress size={18} color='primary' />}
                </Grid>
                <Grid item>
                  <Typography className={classes.reviewSubtitle} align='left'>
                    Total Cost
                  </Typography>
                  {!actionsPending.getGasCost && gasCost
                   ? <Typography className={classes.reviewContent} align='left'>
                     {parseFloat(gasCost.costInEther) + parseFloat(transferAmount)} ETH
                   </Typography>
                   : <CircularProgress size={18} color='primary' />}
                </Grid>
                <Grid item className={classes.reviewItem}>
                  <Typography className={classes.reviewSubtitle} align='left'>
                    Sent on
                  </Typography>
                  <Typography className={classes.reviewContent} align='left'>
                    {moment.unix(sendTimestamp).format('MMM Do YYYY, HH:mm:ss')}
                  </Typography>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
        <Grid item className={classes.btnSection}>
          <Grid container direction='row' justify='center' spacing={24}>
            <Grid item>
              <div className={classes.wrapper}>
                <Button
                  fullWidth
                  variant='contained'
                  color='primary'
                  size='large'
                  disabled={actionsPending.submitTx}
                  onClick={this.handleReviewNext}
                >
                  Cancel Transfer
                </Button>
                {actionsPending.submitTx && <CircularProgress size={24} color='primary' className={classes.buttonProgress} />}
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

export default withStyles(styles)(CancelReviewComponent)
