import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import MuiLink from '@material-ui/core/Link'
import Button from '@material-ui/core/Button'
import Divider from '@material-ui/core/Divider'
import Box from '@material-ui/core/Box'
import Paths from '../Paths.js'
import { Link } from 'react-router-dom'
import { getCryptoSymbol, getTxFeesCryptoType } from '../tokens'
import url from '../url'

class ReceiveReceiptComponent extends Component {
  render () {
    const {
      classes,
      txFee,
      transfer,
      receipt,
      backToHome,
      receiveTime,
      receiveAmount,
      currencyAmount
    } = this.props
    const {
      receivingId,
      transferAmount,
      senderName,
      sender,
      destination,
      cryptoType,
      receiverName
    } = transfer
    const { receiveTxHash } = receipt

    return (
      <Grid container direction='column' spacing={5}>
        <Grid item>
          <Grid container direction='column' justify='center' align='center'>
            <CheckCircleIcon className={classes.checkCircleIcon} />
            <Typography variant='h3'>Transfer Completed</Typography>
          </Grid>
        </Grid>
        <Grid item>
          <Grid container direction='column' spacing={2}>
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
                  <Grid container direction='row' alignItems='center'>
                    <Typography variant='body2'>
                      {`${txFee.costInStandardUnit} ${getCryptoSymbol(
                        getTxFeesCryptoType(cryptoType)
                      )}`}
                    </Typography>
                    <Typography style={{ marginLeft: '10px' }} variant='caption'>
                      ( ≈ {currencyAmount.txFee})
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
                  <Typography variant='caption'>You will receive*</Typography>
                </Grid>
                <Grid item>
                  <Grid container direction='row' alignItems='center'>
                    <Typography variant='body2' id='receiveAmount'>
                      {`${receiveAmount} ${getCryptoSymbol(cryptoType)}`}
                    </Typography>
                    <Typography
                      style={{ marginLeft: '10px' }}
                      variant='caption'
                      id='receiveCurrencyAmount'
                    >
                      ( ≈ {currencyAmount.receiveAmount})
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Divider />
            </Grid>
            <Grid item>
              <Grid container direction='column' spacing={1}>
                <Grid item>
                  <Typography variant='caption'>Accept on {receiveTime}</Typography>
                </Grid>
                <Grid item>
                  <Typography variant='caption'>Transfer ID: {receivingId}</Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Box className={classes.reminder}>
                <Typography variant='body2' align='left'>
                  It may takes a few minutes to complete the transaction. You can track the
                  transaction
                  <MuiLink
                    target='_blank'
                    rel='noopener'
                    href={url.getExplorerTx(cryptoType, receiveTxHash)}
                  >
                    {' here'}
                  </MuiLink>
                  . A confirmation email will be sent to you.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <Grid container direction='row' justify='center'>
            <Grid item>
              <Button
                id='back'
                fullWidth
                variant='contained'
                color='primary'
                size='large'
                component={Link}
                to={Paths.home}
                onClick={backToHome}
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
  checkCircleIcon: {
    color: '#43B384',
    fontSize: '48px',
    marginBottom: '14px'
  },
  reminder: {
    padding: '20px',
    backgroundColor: 'rgba(66, 133, 244, 0.1)',
    borderRadius: '4px'
  }
})

export default withStyles(styles)(ReceiveReceiptComponent)
