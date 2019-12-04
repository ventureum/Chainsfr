import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import LinearProgress from '@material-ui/core/LinearProgress'
import CircularProgress from '@material-ui/core/CircularProgress'
import { getCryptoSymbol, getTxFeesCryptoType } from '../tokens'
import Divider from '@material-ui/core/Divider'

class ReceiveReviewComponent extends Component {
  handleReviewNext = () => {
    const { destinationAccount, transfer, escrowAccount, txFee } = this.props
    const { receivingId, transferAmount, walletId } = transfer
    // accept transfer
    this.props.acceptTransfer({
      receivingId: receivingId,
      escrowAccount: escrowAccount,
      destinationAccount: destinationAccount,
      transferAmount: transferAmount,
      txFee: txFee,
      walletId: walletId
    })
  }

  render () {
    const {
      classes,
      transfer,
      actionsPending,
      txFee,
      destinationAddress,
      sendTime,
      receiveAmount,
      currencyAmount,
      proceedable
    } = this.props
    const { transferAmount, senderName, sender, destination, receiverName, cryptoType } = transfer

    return (
      <Grid container direction='column'>
        <Grid item>
          <Grid container direction='column' spacing={2}>
            <Grid item>
              <Typography variant='h3' id='title'>
                Transaction Review
              </Typography>
            </Grid>
            <Grid item>
              <Grid container direction='row' align='center' spacing={1}>
                <Grid item xs={6}>
                  <Grid container direction='column' alignItems='flex-start'>
                    <Typography variant='caption'>From</Typography>
                    <Typography variant='body2' id='senderName'>
                      {senderName}
                    </Typography>
                    <Typography variant='caption' id='sender'>
                      {sender}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item xs={6}>
                  <Grid container direction='column' alignItems='flex-start'>
                    <Typography variant='caption'>To</Typography>
                    <Typography variant='body2' id='receiverName'>
                      {receiverName}
                    </Typography>
                    <Typography variant='caption' id='destination'>
                      {destination}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Divider />
            </Grid>
            <Grid item>
              <Grid container direction='column' alignItems='flex-start'>
                <Grid item>
                  <Typography variant='caption'>Wallet Address</Typography>
                </Grid>
                <Grid item>
                  <Typography variant='body2' id='destinationAddress'>
                    {destinationAddress}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Divider />
            </Grid>
            <Grid item>
              <Grid container direction='column' alignItems='flex-start'>
                <Grid item>
                  <Typography variant='caption'>Amount</Typography>
                </Grid>
                <Grid item>
                  <Grid container direction='row' alignItems='center'>
                    <Typography variant='body2' id='transferAmount'>
                      {transferAmount} {getCryptoSymbol(cryptoType)}
                    </Typography>
                    <Typography style={{ marginLeft: '10px' }} variant='caption'>
                      ≈ {currencyAmount.transferAmount}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Divider />
            </Grid>
            <Grid item>
              <Grid container direction='column' alignItems='flex-start'>
                <Grid item>
                  <Typography variant='caption'>Transaction Fee</Typography>
                </Grid>
                <Grid item>
                  {!actionsPending.getTxFee && txFee ? (
                    <Grid container direction='row' alignItems='center'>
                      <Typography variant='body2'>
                        {`${txFee.costInStandardUnit} ${getCryptoSymbol(
                          getTxFeesCryptoType(cryptoType)
                        )}`}
                      </Typography>
                      <Typography style={{ marginLeft: '10px' }} variant='caption'>
                        ≈ {currencyAmount.txFee}
                      </Typography>
                    </Grid>
                  ) : (
                    <CircularProgress size={18} color='primary' />
                  )}
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Divider />
            </Grid>
            <Grid item>
              <Grid container direction='column' alignItems='flex-start'>
                <Grid item>
                  <Typography variant='caption'>You will receive*</Typography>
                </Grid>
                <Grid item>
                  {receiveAmount ? (
                    <Grid container direction='row' alignItems='center'>
                      <Typography variant='body2' id='receiveAmount'>
                        {`${receiveAmount} ${getCryptoSymbol(cryptoType)}`}
                      </Typography>
                      <Typography style={{ marginLeft: '10px' }} variant='caption'>
                        ≈ {currencyAmount.receiveAmount}
                      </Typography>
                    </Grid>
                  ) : (
                    <CircularProgress size={18} color='primary' />
                  )}
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Divider />
            </Grid>
            <Grid item>
              <Grid container direction='column' alignItems='flex-start'>
                <Grid item>
                  <Typography variant='caption'>Sent on</Typography>
                </Grid>
                <Grid item>
                  <Typography variant='body2' id='sentOn'>
                    {sendTime}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            {actionsPending.acceptTransfer && (
              <Grid item>
                <Paper style={{ padding: '20px', marginTop: '30px' }}>
                  <Grid container direction='column'>
                    <Grid item>
                      <Typography variant='h6'>Transfer processing...</Typography>
                    </Grid>
                    <Grid>
                      <LinearProgress className={classes.linearProgress} />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            )}
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
                disabled={!proceedable}
              >
                Cancel
              </Button>
            </Grid>
            <Grid item>
              <Button
                fullWidth
                variant='contained'
                color='primary'
                size='large'
                disabled={!proceedable}
                onClick={this.handleReviewNext}
                id='complete'
              >
                Complete
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    )
  }
}

const styles = theme => ({
  btnSection: {
    marginTop: '60px'
  },
  linearProgress: {
    marginTop: '20px'
  }
})

export default withStyles(styles)(ReceiveReviewComponent)
