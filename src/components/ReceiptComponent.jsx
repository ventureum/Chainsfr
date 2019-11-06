// @flow
import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import CheckCircleIcon from '@material-ui/icons/CheckCircleRounded'
import FileCopyIcon from '@material-ui/icons/FileCopy'
import Tooltip from '@material-ui/core/Tooltip'
import IconButton from '@material-ui/core/IconButton'
import Button from '@material-ui/core/Button'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { getCryptoSymbol, getTxFeesCryptoType } from '../tokens'
import Paths from '../Paths.js'
import { Link } from 'react-router-dom'
import Divider from '@material-ui/core/Divider'
import Box from '@material-ui/core/Box'

type Props = {
  backToHome: Function,
  txFee: Object,
  receipt: Object,
  classes: Object,
  password: string,
  sendTime: string,
  currencyAmount: Object
}

type State = {
  copied: boolean
}

class ReceiptComponent extends Component<Props, State> {
  state = {
    copied: false
  }

  render () {
    const { copied } = this.state
    const { classes, password, txFee, receipt, backToHome, sendTime, currencyAmount } = this.props
    const {
      transferId,
      transferAmount,
      sender,
      senderName,
      destination,
      receiverName,
      sendMessage,
      accountSelection
    } = receipt
    const { cryptoType } = accountSelection
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
                <Typography variant='caption'>Security Answer</Typography>
                <Grid item style={{ width: '100%' }}>
                  <Grid container justify='space-between' direction='row' alignItems='center'>
                    <Typography variant='body2'>{password}</Typography>
                    <CopyToClipboard
                      text={password}
                      onCopy={() => {
                        this.setState({ copied: true }, () =>
                          setTimeout(() => this.setState({ copied: false }), 1500)
                        )
                      }}
                    >
                      <Tooltip placement='right' open={copied} title='Copied'>
                        <IconButton disableRipple color='primary' className={classes.iconBtn}>
                          <FileCopyIcon fontSize='small' />
                        </IconButton>
                      </Tooltip>
                    </CopyToClipboard>
                  </Grid>
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
            <Grid item>
              <Grid container direction='column' spacing={1}>
                <Grid item>
                  <Typography variant='caption'>Sent on {sendTime}</Typography>
                </Grid>
                <Grid item>
                  <Typography variant='caption'>Transfer ID: {transferId}</Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Box className={classes.reminder}>
                <Typography variant='body2'>
                  Don't forget to inform your recipient the security answer, whih is required to
                  accept the tranfer.
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
    marginBottom: '14px',
    marginTop: '15px'
  },
  btnSection: {
    marginTop: '60px'
  },
  iconBtn: {
    padding: '0',
    marginLeft: '16px',
    marginRight: '16px'
  },
  reminder: {
    padding: '20px',
    backgroundColor: 'rgba(66, 133, 244, 0.1)',
    borderRadius: '4px'
  }
})

export default withStyles(styles)(ReceiptComponent)
