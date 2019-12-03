// @flow
import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import { getCryptoSymbol, getTxFeesCryptoType } from '../tokens'
import Divider from '@material-ui/core/Divider'

type Props = {
  submitTx: Function,
  goToStep: Function,
  classes: Object,
  transferForm: Object,
  wallet: Object,
  txFee: Object,
  currencyAmount: Object,
  currency: string,
  userProfile: Object,
  actionsPending: {
    submitTx: boolean,
    getTxFee: boolean
  }
}

class ReviewComponent extends Component<Props> {
  render () {
    const { classes, transferForm, actionsPending, txFee, currencyAmount } = this.props
    const {
      transferAmount,
      sender,
      senderName,
      destination,
      receiverName,
      password,
      sendMessage,
      accountId
    } = transferForm
    const { cryptoType } = accountId
    return (
      <Grid container direction='column'>
        <Grid item>
          <Grid container direction='column' spacing={2}>
            <Grid item>
              <Typography variant='h3'>Review and Confirm</Typography>
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
                    <Typography variant='caption'>{destination}</Typography>
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
                  <Typography variant='caption'>Amount</Typography>
                </Grid>
                <Grid item>
                  <Grid container direction='row' alignItems='center'>
                    <Typography variant='body2'>
                      {transferAmount} {getCryptoSymbol(cryptoType)}
                    </Typography>
                    <Typography style={{ marginLeft: '10px' }} variant='caption'>
                      ( ≈ {currencyAmount.transferAmount} )
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
                  <Grid container direction='row' alignItems='center'>
                    <Typography variant='body2'>
                      {txFee.costInStandardUnit} {getCryptoSymbol(getTxFeesCryptoType(cryptoType))}
                    </Typography>
                    <Typography style={{ marginLeft: '10px' }} variant='caption'>
                      ( ≈ {currencyAmount.txFee} )
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
                  <Typography variant='caption'>Security Answer</Typography>
                  <Typography variant='body2'>{password}</Typography>
                </Grid>
              </Grid>
            </Grid>
            {sendMessage && sendMessage.length > 0 && (
              <>
                <Grid item>
                  <Divider />
                </Grid>
                <Grid item>
                  <Grid container direction='column' alignItems='flex-start'>
                    <Grid item>
                      <Typography variant='caption'>Message</Typography>
                      <Typography variant='body2'>{sendMessage}</Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </>
            )}
            <Grid item>
              <Divider />
            </Grid>
          </Grid>
        </Grid>
        <Grid item className={classes.btnSection}>
          <Grid container direction='row' justify='center' spacing={3}>
            <Grid item>
              <Button color='primary' size='large' onClick={() => this.props.goToStep(-1)}>
                Back to previous
              </Button>
            </Grid>
            {!actionsPending.submitTx && (
              <Grid item>
                <Button
                  fullWidth
                  variant='contained'
                  color='primary'
                  size='large'
                  onClick={() => this.props.goToStep(1)}
                >
                  Continue
                </Button>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
    )
  }
}

const styles = theme => ({
  btnSection: {
    marginTop: '60px',
    marginBottom: '150px'
  },
  linearProgress: {
    marginTop: '20px'
  }
})

export default withStyles(styles)(ReviewComponent)
