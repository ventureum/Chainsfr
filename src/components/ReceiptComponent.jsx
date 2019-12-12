// @flow
import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import CheckCircleIcon from '@material-ui/icons/CheckCircleRounded'
import ErrorRoundedIcon from '@material-ui/icons/ErrorRounded'
import CancelRoundedIcon from '@material-ui/icons/CancelRounded'
import FileCopyIcon from '@material-ui/icons/FileCopy'
import Tooltip from '@material-ui/core/Tooltip'
import IconButton from '@material-ui/core/IconButton'
import Button from '@material-ui/core/Button'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { getCryptoSymbol } from '../tokens'
import Paths from '../Paths.js'
import { Link } from 'react-router-dom'
import Divider from '@material-ui/core/Divider'
import Box from '@material-ui/core/Box'
import MuiLink from '@material-ui/core/Link'
import Skeleton from '@material-ui/lab/Skeleton'
import url from '../url'
import transferStates from '../transferStates'

type Props = {
  transfer: Object,
  sendTime: string,
  receiveTime: string,
  cancelTime: string,
  classes: Object,
  error: Object,
  backToHome: Function
}

type State = {
  copied: boolean
}

class ReceiptComponent extends Component<Props, State> {
  state = {
    copied: false
  }

  renderReceipt () {
    const { classes, transfer, sendTime, receiveTime, cancelTime, backToHome } = this.props
    const { copied } = this.state
    const {
      transferId,
      receivingId,
      state,
      transferType,
      cryptoType,
      transferAmount,
      transferFiatAmountSpot,
      fiatType,
      sender,
      senderName,
      destination,
      receiverName,
      sendMessage,
      receiveMessage,
      cancelMessage,
      password,
      receiveTxHash,
      cancelTxHash,
      txFee,
      txFeeCurrencyAmount,
      receiverAccount,
      senderAccount
    } = transfer
    const id = transferType === 'SENDER' ? transferId : receivingId

    let title
    let titleIcon
    let messageBoxContent

    switch (state) {
      case transferStates.SEND_PENDING:
        // only accessible to sender
        title = 'Transfer Arranged'
        titleIcon = <CheckCircleIcon className={classes.checkCircleIcon} />
        messageBoxContent =
          'The blockchain is processing your transfer. A notification email will be' +
          'sent to you once the transfer is ready to be accepted.'
        break
      case transferStates.SEND_FAILURE:
        // only accessible to sender
        // TODO need to classify failures into different cases
        // make errror messsage more specific
        title = 'Transfer Delayed'
        titleIcon = <ErrorRoundedIcon className={classes.errorRoundedIcon} />
        messageBoxContent =
          'Your transfer is experiencing longer than usual time to' +
          'be processed by the network. To learn more, visit our Help Center.'
        break
      case transferStates.SEND_CONFIRMED_RECEIVE_PENDING:
        if (transferType === 'SENDER') {
          title = 'Transfer Sent'
          messageBoxContent = `An email notification was sent to ${receiverName} successfully.`
        } else {
          title = 'Transfer Accepted'
          messageBoxContent = (
            <>
              It may take some time to update your account balance. You can track the transaction
              <MuiLink
                target='_blank'
                rel='noopener'
                href={url.getExplorerTx(cryptoType, receiveTxHash)}
              >
                {' here'}
              </MuiLink>
              .
            </>
          )
        }
        titleIcon = <CheckCircleIcon className={classes.checkCircleIcon} />
        break
      case transferStates.SEND_CONFIRMED_RECEIVE_FAILURE:
        if (transferType === 'SENDER') {
          title = 'Transfer Sent'
          titleIcon = <CheckCircleIcon className={classes.checkCircleIcon} />
          messageBoxContent = `An email notification was sent to ${receiverName} successfully.`
        } else {
          title = 'Accept Failed'
          titleIcon = <ErrorRoundedIcon className={classes.errorRoundedIcon} />
          messageBoxContent = (
            <>
              Something went wrong while sending your transfer. You can track the transaction
              <MuiLink
                target='_blank'
                rel='noopener'
                href={url.getExplorerTx(cryptoType, receiveTxHash)}
              >
                {' here'}
              </MuiLink>
              . Please contact us for help.
            </>
          )
        }
        break
      case transferStates.SEND_CONFIRMED_RECEIVE_CONFIRMED:
        title = 'Transfer Completed'
        titleIcon = <CheckCircleIcon className={classes.checkCircleIcon} />
        break
      case transferStates.SEND_CONFIRMED_RECEIVE_NOT_INITIATED:
        if (transferType === 'SENDER') {
          title = 'Transfer Sent'
          titleIcon = <CheckCircleIcon className={classes.checkCircleIcon} />
          messageBoxContent = `An email notification was sent to ${receiverName} successfully.`
        } else {
          title = 'Pending to Receive'
        }
        break
      case transferStates.SEND_CONFIRMED_RECEIVE_EXPIRED:
        title = 'Transfer Expired'
        titleIcon = <ErrorRoundedIcon className={classes.errorRoundedIcon} />
        if (transferType === 'SENDER') {
          messageBoxContent = `Transfer has expired. Please cancel the transfer.`
        }
        break
      case transferStates.SEND_CONFIRMED_CANCEL_PENDING:
        title = 'Transfer Cancelled'
        if (transferType === 'SENDER') {
          titleIcon = <CancelRoundedIcon className={classes.cancelRoundedIcon} />
          messageBoxContent = (
            <>
              It may take some time to update your account balance. You can track the transaction
              <MuiLink
                target='_blank'
                rel='noopener'
                href={url.getExplorerTx(cryptoType, receiveTxHash)}
              >
                {' here'}
              </MuiLink>
              .
            </>
          )
        } else {
          titleIcon = <CancelRoundedIcon className={classes.cancelRoundedIcon} />
        }
        break
      case transferStates.SEND_CONFIRMED_CANCEL_CONFIRMED:
        title = 'Transfer Cancelled'
        if (transferType === 'SENDER') {
          titleIcon = <CancelRoundedIcon className={classes.cancelRoundedIcon} />
        } else {
          titleIcon = <CancelRoundedIcon className={classes.cancelRoundedIcon} />
        }
        break
      case transferStates.SEND_CONFIRMED_CANCEL_FAILURE:
        if (transferType === 'SENDER') {
          title = 'Cancel Failed'
          titleIcon = <ErrorRoundedIcon className={classes.errorRoundedIcon} />
          messageBoxContent = (
            <>
              Something went wrong while cancelling your transfer. You can track the transaction
              <MuiLink
                target='_blank'
                rel='noopener'
                href={url.getExplorerTx(cryptoType, cancelTxHash)}
              >
                {' here'}
              </MuiLink>
              . Please contact us for help.
            </>
          )
        } else {
          // TODO: show cancelled or Ready to deposit?
          title = 'Transfer Cancelled'
          titleIcon = <CancelRoundedIcon className={classes.cancelRoundedIcon} />
        }
        break
      default:
        throw new Error('Unknown transfer state')
    }
    if (state)
      return (
        <Grid container direction='column' spacing={4}>
          <Grid item>
            <Grid container direction='column' justify='center' align='center'>
              {titleIcon}
              <Typography variant='h3'> {title} </Typography>
            </Grid>
          </Grid>
          <Grid item>
            <Grid container direction='column' spacing={2}>
              {messageBoxContent && (
                <Grid item>
                  <Box className={classes.reminder}>
                    <Typography variant='body2' align='left'>
                      {messageBoxContent}
                    </Typography>
                  </Box>
                </Grid>
              )}
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
              {transferType === 'SENDER' && senderAccount && (
                <>
                  <Grid item>
                    <Divider />
                  </Grid>
                  <Grid item>
                    <Grid container direction='column' alignItems='flex-start'>
                      <Grid item>
                        <Typography variant='caption'>From Account</Typography>
                      </Grid>
                      <Grid item>
                        <Grid container direction='column' alignItems='flex-start'>
                          <Typography variant='body2'>{senderAccount.displayName}</Typography>
                          <Typography variant='caption'>{senderAccount.address}</Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </>
              )}
              {transferType === 'RECEIVER' && receiverAccount && (
                <>
                  <Grid item>
                    <Divider />
                  </Grid>
                  <Grid item>
                    <Grid container direction='column' alignItems='flex-start'>
                      <Grid item>
                        <Typography variant='caption'>Deposit to Account</Typography>
                      </Grid>
                      <Grid item>
                        <Grid container direction='column' alignItems='flex-start'>
                          <Typography variant='body2'>{receiverAccount.displayName}</Typography>
                          <Typography variant='caption'>{receiverAccount.address}</Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </>
              )}
              <Grid item>
                <Divider />
              </Grid>
              <Grid item>
                <Grid container direction='row' alignItems='center' spacing={1}>
                  <Grid item xs>
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
                            ( ≈ {transferFiatAmountSpot} {fiatType} )
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                  {txFee && txFeeCurrencyAmount && (
                    <Grid item xs>
                      <Grid container direction='column' alignItems='flex-start'>
                        <Grid item>
                          <Typography variant='caption'>Network Fee</Typography>
                        </Grid>
                        <Grid item>
                          <Grid container direction='row' alignItems='center'>
                            <Typography variant='body2'>
                              {txFee.costInStandardUnit} {getCryptoSymbol(cryptoType)}
                            </Typography>
                            <Typography style={{ marginLeft: '10px' }} variant='caption'>
                              ( ≈ {txFeeCurrencyAmount} )
                            </Typography>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  )}
                </Grid>
              </Grid>
              {transferType === 'SENDER' && (
                <>
                  <Grid item>
                    <Divider />
                  </Grid>
                  <Grid item>
                    <Grid container direction='column' alignItems='flex-start'>
                      <Typography variant='caption'>Security Answer</Typography>
                      <Grid item style={{ width: '100%' }}>
                        <Grid container justify='space-between' direction='row' alignItems='center'>
                          {password ? (
                            <>
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
                                  <IconButton
                                    disableRipple
                                    color='primary'
                                    className={classes.iconBtn}
                                  >
                                    <FileCopyIcon fontSize='small' />
                                  </IconButton>
                                </Tooltip>
                              </CopyToClipboard>
                            </>
                          ) : (
                            <Skeleton
                              height={16}
                              width='20%'
                              style={{ marginTop: '2px', marginBottom: '2px' }}
                            />
                          )}
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </>
              )}
              {sendMessage && (
                <>
                  <Grid item>
                    <Divider />
                  </Grid>
                  <Grid item>
                    <Grid container direction='column' alignItems='flex-start'>
                      <Grid item>
                        <Typography variant='caption'>Sender Message</Typography>
                        <Typography variant='body2'>{sendMessage}</Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                </>
              )}
              {receiveTxHash && receiveMessage && (
                <>
                  <Grid item>
                    <Divider />
                  </Grid>
                  <Grid item>
                    <Grid container direction='column' alignItems='flex-start'>
                      <Grid item>
                        <Typography variant='caption'>Receiver Message</Typography>
                        <Typography variant='body2'>{receiveMessage}</Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                </>
              )}
              {cancelTxHash && cancelMessage && (
                <>
                  <Grid item>
                    <Divider />
                  </Grid>
                  <Grid item>
                    <Grid container direction='column' alignItems='flex-start'>
                      <Grid item>
                        <Typography variant='caption'>Cancellation Reason</Typography>
                        <Typography variant='body2'>{cancelMessage}</Typography>
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
                  {sendTime && (
                    <Grid item>
                      <Typography variant='caption'>Sent on {sendTime}</Typography>
                    </Grid>
                  )}
                  {receiveTime && (
                    <Grid item>
                      <Typography variant='caption'>Received on {receiveTime}</Typography>
                    </Grid>
                  )}
                  {cancelTime && (
                    <Grid item>
                      <Typography variant='caption'>Cancelled on {cancelTime}</Typography>
                    </Grid>
                  )}
                  <Grid item>
                    <Typography variant='caption'>Transfer ID: {id}</Typography>
                  </Grid>
                </Grid>
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

  render () {
    const { classes, transfer } = this.props

    return (
      <Grid container direction='column' alignItems='center'>
        <Grid item className={classes.sectionContainer}>
          <Grid container direction='column' alignItems='stretch'>
            <Grid item>
              <Grid container direction='column' alignItems='center'>
                <Grid item className={classes.subContainer}>
                  {transfer && this.renderReceipt()}
                </Grid>
              </Grid>
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
  errorRoundedIcon: {
    color: '#F3A40A',
    fontSize: '48px',
    marginBottom: '14px',
    marginTop: '15px'
  },
  cancelRoundedIcon: {
    color: '#A8A8A8',
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
    backgroundColor: 'rgba(57, 51, 134, 0.1)',
    borderRadius: '4px'
  },
  sectionContainer: {
    width: '100%',
    maxWidth: '1080px'
  },
  subContainer: {
    width: '100%',
    maxWidth: '550px',
    margin: '0px 0px 16px 0px',
    padding: '30px'
  }
})

export default withStyles(styles)(ReceiptComponent)
