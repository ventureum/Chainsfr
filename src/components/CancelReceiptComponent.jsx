import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import MuiLink from '@material-ui/core/Link'
import Button from '@material-ui/core/Button'
import Paths from '../Paths'
import { getCryptoSymbol, getTxFeesCryptoType } from '../tokens'
import url from '../url'

class CancelReceiptComponent extends Component {
  render () {
    const { classes, receipt, txFee, backToHome, cancelTime, toCurrencyAmount } = this.props
    const { sendingId, transferAmount, cryptoType, cancelTxHash, cancelMessage } = receipt

    const receiveAmount = ['ethereum', 'bitcoin'].includes(cryptoType)
      ? parseFloat(transferAmount) - parseFloat(txFee.costInStandardUnit)
      : parseFloat(transferAmount)

    return (
      <Grid container direction='column' justify='center' alignItems='center'>
        <Grid item>
          <Paper className={classes.receiptPaper} elevation={1}>
            <Grid container direction='column' justify='center' alignItems='stretch'>
              <Grid item>
                <Grid item className={classes.titleSection}>
                  <Grid container direction='column' justify='center' alignItems='center'>
                    <CheckCircleIcon className={classes.checkCircleIcon} />
                    <Typography className={classes.title} variant='h6' align='center'>
                      Cancellation Completed
                    </Typography>
                    <Typography className={classes.transferId} align='center'>
                      {`Transfer ID: ${sendingId}`}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item className={classes.reviewItem}>
                  <Typography className={classes.reviewSubtitle} align='left'>
                    Amount
                  </Typography>
                  <Grid container direction='column'>
                    <Typography className={classes.reviewContentAmount} align='left'>
                      {transferAmount} {getCryptoSymbol(cryptoType)}
                    </Typography>
                    <Typography className={classes.reviewContentCurrencyAmount} align='left'>
                      ≈ {toCurrencyAmount(transferAmount)}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item className={classes.reviewItem}>
                  <Typography className={classes.reviewSubtitle} align='left'>
                    Transaction Fee
                  </Typography>
                  <Grid container direction='column'>
                    <Typography className={classes.reviewContentAmount} align='left'>
                      {`${txFee.costInStandardUnit} ${getCryptoSymbol(
                        getTxFeesCryptoType(cryptoType)
                      )}`}
                    </Typography>
                    <Typography className={classes.reviewContentCurrencyAmount} align='left'>
                      ≈ {toCurrencyAmount(txFee.costInStandardUnit)}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item className={classes.reviewItem}>
                  <Typography className={classes.reviewSubtitle} align='left'>
                    You will receive*
                  </Typography>
                  <Grid container direction='column'>
                    <Typography
                      className={classes.reviewContentAmount}
                      align='left'
                      id='receiveAmount'
                    >
                      {`${receiveAmount} ${getCryptoSymbol(cryptoType)}`}
                    </Typography>
                    <Typography
                      className={classes.reviewContentCurrencyAmount}
                      align='left'
                      id='receiveCurrencyAmount'
                    >
                      ≈ {toCurrencyAmount(receiveAmount)}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item className={classes.reviewItem}>
                  <Typography className={classes.reviewSubtitle} align='left'>
                    Cancelled on
                  </Typography>
                  <Typography className={classes.reviewContent} align='left'>
                    {cancelTime}
                  </Typography>
                </Grid>
                {cancelMessage &&
                cancelMessage.length > 0 && ( // only show message when available
                  <Grid item className={classes.reviewItem}>
                    <Typography className={classes.reviewSubtitle} align='left'>
                        Cancel message
                    </Typography>
                    <Typography className={classes.reviewContentMessage} align='left'>
                      {cancelMessage}
                    </Typography>
                  </Grid>
                )}
                <Grid item className={classes.reviewItem}>
                  <Typography variant='body2' className={classes.informReceiverText} align='left'>
                    It may takes a few minutes to complete the transaction. You can track the
                    transaction
                    <MuiLink
                      target='_blank'
                      rel='noopener'
                      href={url.getExplorerTx(receipt.cryptoType, cancelTxHash)}
                    >
                      {' here'}
                    </MuiLink>
                    . A confirmation email will be sent to you.
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item className={classes.btnSection}>
          <Grid container direction='row' justify='center' spacing={3}>
            <Grid item>
              <Button
                fullWidth
                variant='contained'
                color='primary'
                size='large'
                component={Link}
                to={Paths.home}
                onClick={backToHome}
                id='back'
              >
                Back to Home
              </Button>
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
  reviewContentAmount: {
    color: '#333333',
    fontSize: '18px',
    lineHeight: '24px',
    fontWeight: 'bold'
  },
  reviewContentCurrencyAmount: {
    color: '#777777',
    fontSize: '14px',
    lineHeight: '24px',
    fontWeight: 'bold',
    marginLeft: '5px'
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
  reviewContentMessage: {
    color: '#333333',
    fontSize: '18px',
    lineHeight: '24px',
    maxWidth: '300px',
    // prevent overflow for long messages
    wordWrap: 'break-word'
  }
})

export default withStyles(styles)(CancelReceiptComponent)
