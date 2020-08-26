// @flow
import React, { Component } from 'react'
import Alert from '@material-ui/lab/Alert'
import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import CheckCircleIcon from '@material-ui/icons/CheckCircleRounded'
import ErrorRoundedIcon from '@material-ui/icons/ErrorRounded'
import CancelRoundedIcon from '@material-ui/icons/CancelRounded'
import FileCopyIcon from '@material-ui/icons/FileCopy'
import Tooltip from '@material-ui/core/Tooltip'
import IconButton from '@material-ui/core/IconButton'
import OpenInNewIcon from '@material-ui/icons/OpenInNew'
import Button from '@material-ui/core/Button'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { getCryptoSymbol, getCryptoPlatformType, getTxFeesCryptoType } from '../tokens'
import Paths from '../Paths.js'
import { Link } from 'react-router-dom'
import Divider from '@material-ui/core/Divider'
import Box from '@material-ui/core/Box'
import MuiLink from '@material-ui/core/Link'
import Skeleton from '@material-ui/lab/Skeleton'
import * as TransferInfoCommon from './TransferInfoCommon'
import url from '../url'
import transferStates from '../transferStates'
import TwitterIcon from '@material-ui/icons/Twitter'

type Props = {
  transfer: Object,
  sendTime: string,
  receiveTime: string,
  cancelTime: string,
  classes: Object,
  error: Object,
  backToHome: Function,
  twitterShareReceipt: Function
}

type State = {
  copied: boolean,
  showAddress: boolean
}

class ReceiptComponent extends Component<Props, State> {
  state = {
    copied: false,
    showAddress: false
  }

  toggleAddress = () => {
    this.setState(prevState => {
      return {
        ...prevState,
        showAddress: !prevState.showAddress
      }
    })
  }

  twitterShare = () => {
    const { twitterShareReceipt, transfer } = this.props
    twitterShareReceipt(transfer)
  }

  renderReceipt () {
    const { classes, transfer, sendTime, receiveTime, cancelTime, backToHome } = this.props
    const { copied } = this.state
    const {
      transferId,
      receivingId,
      state,
      transferType,
      transferMethod,
      cryptoType,
      transferAmount,
      transferFiatAmountSpot,
      fiatType,
      destination,
      receiverName,
      receiverAvatar,
      sender,
      senderName,
      senderAvatar,
      sendMessage,
      receiveMessage,
      cancelMessage,
      password,
      receiveTxHash,
      cancelTxHash,
      txFee,
      txFeeCurrencyAmount,
      receiverAccount,
      destinationAccount, // for direct transfer
      senderAccount,
      sendTxHash,
      emailSentFailure
    } = transfer
    const id = transferType === 'SENDER' ? transferId : receivingId

    let title
    let titleIcon
    let messageBoxContent
    let platFormType = ''
    if (cryptoType) {
      platFormType = getCryptoPlatformType(cryptoType)
      platFormType = platFormType.charAt(0).toUpperCase() + platFormType.substring(1)
    }

    switch (state) {
      case transferStates.SEND_PENDING:
        // only accessible to sender
        title = 'Payment Arranged'
        titleIcon = <CheckCircleIcon className={classes.checkCircleIcon} />
        messageBoxContent =
          `${platFormType} network is processing your transaction. ` +
          `${receiverName} will receive an email notification to ` +
          `accept your payment shortly`
        break
      case transferStates.SEND_DIRECT_TRANSFER_PENDING:
        // only accessible to sender
        title = 'Payment Arranged'
        titleIcon = <CheckCircleIcon className={classes.checkCircleIcon} />
        messageBoxContent = `${platFormType} network is processing your transaction. `
        break
      case transferStates.SEND_FAILURE:
      case transferStates.SEND_DIRECT_TRANSFER_FAILURE:
        // only accessible to sender
        // TODO need to classify failures into different cases
        // make errror messsage more specific
        titleIcon = <ErrorRoundedIcon className={classes.errorRoundedIcon} />
        if (emailSentFailure) {
          title = 'Transfer Failed'
          messageBoxContent =
            `This transfer was not successful likely due to an invalid email address of ${receiverName}. ` +
            `You need to sign in to cancel the transfer first, ` +
            `then update the email address for ${receiverName} and make a new transfer.`
        } else {
          title = 'Transfer Delayed'
          messageBoxContent =
            'Your transfer is experiencing longer than usual time to ' +
            'be processed by the network. To learn more, visit our Help Center.'
        }
        break
      case transferStates.SEND_DIRECT_TRANSFER_CONFIRMED:
        title = 'Payment Completed'
        titleIcon = <CheckCircleIcon className={classes.checkCircleIcon} />
        break
      case transferStates.SEND_CONFIRMED_RECEIVE_PENDING:
      case transferStates.SEND_CONFIRMED_EXPIRED_RECEIVE_PENDING:
        // edge case, receive initiated before expiration, pending just after expiration
        if (transferType === 'SENDER') {
          title = 'Payment Sent'
          messageBoxContent = `An email notification was sent to ${receiverName} successfully.`
        } else {
          title = 'Payment Accepted'
          messageBoxContent = (
            <Typography>
              It may take some time to update your balance. You can track the transaction
              <MuiLink
                target='_blank'
                rel='noopener'
                href={url.getExplorerTx(cryptoType, receiveTxHash)}
              >
                {' here'}
              </MuiLink>
              .
            </Typography>
          )
        }
        titleIcon = <CheckCircleIcon className={classes.checkCircleIcon} />
        break
      case transferStates.SEND_CONFIRMED_RECEIVE_FAILURE:
        if (transferType === 'SENDER') {
          title = 'Payment Sent'
          titleIcon = <CheckCircleIcon className={classes.checkCircleIcon} />
          messageBoxContent = `An email notification was sent to ${receiverName} successfully.`
        } else {
          title = 'Accept Failed'
          titleIcon = <ErrorRoundedIcon className={classes.errorRoundedIcon} />
          messageBoxContent = (
            <Typography>
              Something went wrong while sending your payment. You can track the transaction
              <MuiLink
                target='_blank'
                rel='noopener'
                href={url.getExplorerTx(cryptoType, receiveTxHash)}
              >
                {' here'}
              </MuiLink>
              . Please contact us for help.
            </Typography>
          )
        }
        break
      case transferStates.SEND_CONFIRMED_EXPIRED_RECEIVE_FAILURE:
        // edge case, receive initiated before expiration, failure just after expiration
        if (transferType === 'SENDER') {
          title = 'Payment Expired'
          titleIcon = <ErrorRoundedIcon className={classes.errorRoundedIcon} />
          messageBoxContent = `Payment has expired. Please reclaim the payment.`
          break
        } else {
          title = 'Accept Failed'
          titleIcon = <ErrorRoundedIcon className={classes.errorRoundedIcon} />
          messageBoxContent = (
            <Typography>
              Something went wrong while sending your payment. You can track the transaction
              <MuiLink
                target='_blank'
                rel='noopener'
                href={url.getExplorerTx(cryptoType, receiveTxHash)}
              >
                {' here'}
              </MuiLink>
              . Please contact us for help.
            </Typography>
          )
        }
        break
      case transferStates.SEND_CONFIRMED_RECEIVE_CONFIRMED:
      case transferStates.SEND_CONFIRMED_EXPIRED_RECEIVE_CONFIRMED:
        title = 'Payment Completed'
        titleIcon = <CheckCircleIcon className={classes.checkCircleIcon} />
        break
      case transferStates.SEND_CONFIRMED_RECEIVE_NOT_INITIATED:
        if (transferType === 'SENDER') {
          title = 'Payment Sent'
          titleIcon = <CheckCircleIcon className={classes.checkCircleIcon} />
          messageBoxContent = `An email notification was sent to ${receiverName} successfully.`
        } else {
          title = 'Pending to Receive'
        }
        break
      case transferStates.SEND_CONFIRMED_EXPIRED_RECEIVE_NOT_INITIATED:
        title = 'Payment Expired'
        titleIcon = <ErrorRoundedIcon className={classes.errorRoundedIcon} />
        if (transferType === 'SENDER') {
          messageBoxContent = `Payment has expired. Please reclaim the payment.`
        }
        break
      case transferStates.SEND_CONFIRMED_CANCEL_PENDING:
        title = 'Payment Cancelled'
        if (transferType === 'SENDER') {
          titleIcon = <CancelRoundedIcon className={classes.cancelRoundedIcon} />
          messageBoxContent = (
            <Typography>
              It may take some time to update your balance. You can track the transaction
              <MuiLink
                target='_blank'
                rel='noopener'
                href={url.getExplorerTx(cryptoType, cancelTxHash)}
              >
                {' here'}
              </MuiLink>
              .
            </Typography>
          )
        } else {
          titleIcon = <CancelRoundedIcon className={classes.cancelRoundedIcon} />
        }
        break
      case transferStates.SEND_CONFIRMED_EXPIRED_CANCEL_PENDING:
        if (transferType === 'SENDER') {
          title = 'Payment Reclaimed'
          titleIcon = <CheckCircleIcon className={classes.checkCircleIcon} />
          messageBoxContent = (
            <Typography>
              It may take some time to update your balance. You can track the transaction
              <MuiLink
                target='_blank'
                rel='noopener'
                href={url.getExplorerTx(cryptoType, cancelTxHash)}
              >
                {' here'}
              </MuiLink>
              .
            </Typography>
          )
        } else {
          title = 'Payment Expired'
          titleIcon = <CancelRoundedIcon className={classes.cancelRoundedIcon} />
        }
        break
      case transferStates.SEND_CONFIRMED_CANCEL_CONFIRMED:
        title = 'Payment Cancelled'
        if (transferType === 'SENDER') {
          titleIcon = <CancelRoundedIcon className={classes.cancelRoundedIcon} />
        } else {
          titleIcon = <CancelRoundedIcon className={classes.cancelRoundedIcon} />
        }
        break
      case transferStates.SEND_CONFIRMED_EXPIRED_CANCEL_CONFIRMED:
        if (transferType === 'SENDER') {
          title = 'Payment Reclaimed'
          titleIcon = <CheckCircleIcon className={classes.checkCircleIcon} />
        } else {
          title = 'Payment Expired'
          titleIcon = <CancelRoundedIcon className={classes.cancelRoundedIcon} />
        }
        break
      case transferStates.SEND_CONFIRMED_CANCEL_FAILURE:
        if (transferType === 'SENDER') {
          title = 'Cancel Failed'
          titleIcon = <ErrorRoundedIcon className={classes.errorRoundedIcon} />
          messageBoxContent = (
            <Typography>
              Something went wrong while cancelling your payment. You can track the transaction
              <MuiLink
                target='_blank'
                rel='noopener'
                href={url.getExplorerTx(cryptoType, cancelTxHash)}
              >
                {' here'}
              </MuiLink>
              . Please contact us for help.
            </Typography>
          )
        } else {
          title = 'Payment Cancelled'
          titleIcon = <CancelRoundedIcon className={classes.cancelRoundedIcon} />
        }
        break
      case transferStates.SEND_CONFIRMED_EXPIRED_CANCEL_FAILURE:
        if (transferType === 'SENDER') {
          title = 'Reclaim Failed'
          titleIcon = <ErrorRoundedIcon className={classes.errorRoundedIcon} />
          messageBoxContent = (
            <Typography>
              Something went wrong while reclaiming your payment. You can track the transaction
              <MuiLink
                target='_blank'
                rel='noopener'
                href={url.getExplorerTx(cryptoType, cancelTxHash)}
              >
                {' here'}
              </MuiLink>
              . Please contact us for help.
            </Typography>
          )
        } else {
          title = 'Payment Expired'
          titleIcon = <CancelRoundedIcon className={classes.cancelRoundedIcon} />
        }
        break
      default:
        throw new Error(`Unknown transfer state: ${state}`)
    }
    if (state)
      return (
        <Box display='flex' flexDirection='column' alignItems='stretch'>
          <Box display='flex' flexDirection='column' alignItems='center'>
            {titleIcon}
            <Box mt={0.5}>
              <Typography variant='h3' data-test-id='title'>
                {title}
              </Typography>
            </Box>
          </Box>

          {messageBoxContent && (
            <Box mt={2}>
              <Alert severity='info' icon={false}>
                {messageBoxContent}
              </Alert>
            </Box>
          )}

          <Box pt={3}>
            <Grid container style={{ width: '100%' }} direction='column' spacing={2}>
              <Grid item>
                <TransferInfoCommon.FromAndToSection
                  directionLabel='From'
                  user={
                    transferMethod === 'EMAIL_TRANSFER'
                      ? {
                          name: senderName,
                          email: sender,
                          avatar: senderAvatar
                        }
                      : null
                  }
                  account={transferType === 'SENDER' ? senderAccount : null}
                />
              </Grid>
              <Grid item>
                <Divider />
              </Grid>
              <Grid item>
                <TransferInfoCommon.FromAndToSection
                  directionLabel='To'
                  user={
                    transferMethod === 'EMAIL_TRANSFER'
                      ? {
                          name: receiverName,
                          email: destination,
                          avatar: receiverAvatar
                        }
                      : null
                  }
                  // direct transfer: always show destination account
                  // email transfer: show receiverAccount for receiver
                  account={
                    transferMethod === 'DIRECT_TRANSFER'
                      ? destinationAccount
                      : transferMethod === 'EMAIL_TRANSFER' && transferType === 'RECEIVER'
                      ? receiverAccount
                      : null
                  }
                />
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
                      <Typography variant='body2' data-test-id='transfer_amount'>
                        {transferAmount} {getCryptoSymbol(cryptoType)}
                      </Typography>
                      <Typography
                        style={{ marginLeft: '10px' }}
                        variant='caption'
                        data-test-id='currency_amount'
                      >
                        ( ≈ {transferFiatAmountSpot} {fiatType} )
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              {txFee && txFeeCurrencyAmount && (
                <>
                  <Grid item>
                    <Divider />
                  </Grid>
                  <Grid item>
                    <Grid container direction='column' alignItems='flex-start'>
                      <Grid item>
                        <Typography variant='caption'>Network Fee</Typography>
                      </Grid>
                      <Grid item>
                        <Grid container direction='row' alignItems='center'>
                          <Typography variant='body2' data-test-id='tx_fee'>
                            {txFee.costInStandardUnit}{' '}
                            {getCryptoSymbol(getTxFeesCryptoType(cryptoType))}
                          </Typography>
                          <Typography
                            style={{ marginLeft: '10px' }}
                            variant='caption'
                            data-test-id='currency_tx_fee'
                          >
                            ( ≈ {txFeeCurrencyAmount} )
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </>
              )}
              {transferMethod === 'EMAIL_TRANSFER' && transferType === 'SENDER' && (
                <>
                  <Grid item>
                    <Divider />
                  </Grid>
                  <Grid item>
                    <Grid container direction='column' alignItems='flex-start'>
                      <Typography variant='caption'>Security Answer</Typography>
                      <Grid item style={{ width: '100%' }}>
                        <Grid
                          container
                          justify='space-between'
                          direction='row'
                          alignItems='center'
                        >
                          {password ? (
                            <>
                              <Typography variant='body2' data-test-id='security_answer'>
                                {password}
                              </Typography>
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
                                    data-test-id='copy_security_answer_btn'
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
                        <Typography variant='body2' data-test-id='send_msg'>
                          {sendMessage}
                        </Typography>
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
                        <Typography variant='body2' data-test-id='receive_msg'>
                          {receiveMessage}
                        </Typography>
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
                        <Typography variant='body2' data-test-id='cancel_msg'>
                          {cancelMessage}
                        </Typography>
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
                      <Box display='flex' flexDirection='row' alignItems='center'>
                        <Typography variant='caption' data-test-id='send_on'>
                          Sent on {sendTime}
                        </Typography>
                        <IconButton
                          target='_blank'
                          rel='noopener'
                          href={url.getExplorerTx(cryptoType, sendTxHash)}
                          className={classes.iconBtn}
                          data-test-id='send_explorer_btn'
                        >
                          <OpenInNewIcon style={{ fontSize: '18px' }} />
                        </IconButton>
                      </Box>
                    </Grid>
                  )}
                  {receiveTime && (
                    <Grid item>
                      <Box display='flex' flexDirection='row' alignItems='center'>
                        <Typography variant='caption' data-test-id='receive_on'>
                          Received on {receiveTime}
                        </Typography>
                        <IconButton
                          target='_blank'
                          rel='noopener'
                          href={url.getExplorerTx(cryptoType, receiveTxHash)}
                          className={classes.iconBtn}
                          data-test-id='receive_explorer_btn'
                        >
                          <OpenInNewIcon style={{ fontSize: '18px' }} />
                        </IconButton>
                      </Box>
                    </Grid>
                  )}
                  {cancelTime && (
                    <Grid item>
                      <Box display='flex' flexDirection='row' alignItems='center'>
                        <Typography variant='caption' data-test-id='cancel_on'>
                          Cancelled on {cancelTime}
                        </Typography>
                        <IconButton
                          target='_blank'
                          rel='noopener'
                          href={url.getExplorerTx(cryptoType, cancelTxHash)}
                          className={classes.iconBtn}
                          data-test-id='cancel_explorer_btn'
                        >
                          <OpenInNewIcon style={{ fontSize: '18px' }} />
                        </IconButton>
                      </Box>
                    </Grid>
                  )}
                  <Grid item>
                    <Typography variant='caption' data-test-id='transfer_id'>
                      Transfer ID: {id}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
          <Box mt={2}>
            <Alert
              severity='info'
              icon={false}
              action={
                <Button
                  variant='outlined'
                  color='primary'
                  size='small'
                  startIcon={<TwitterIcon />}
                  target='_blank'
                  rel='noopener noreferrer'
                  href={`https://twitter.com/intent/tweet?text=I just sent ${transferAmount} (${transferFiatAmountSpot} ${fiatType}) with Chainsfr&url=https://chainsfr.com&via=chainsfr_com`}
                  onClick={this.twitterShare}
                >
                  Share
                </Button>
              }
            >
              <Box>
                <p>
                  {'Get 100 '}
                  <a
                    aria-label='reward points'
                    rel='noopener noreferrer'
                    size='small'
                    target='_blank'
                    href='https://help.chainsfr.com/en/articles/4323912-rewards-plan'
                    style={{ textDecoration: 'none', color: '#333', fontWeight: '700' }}
                  >
                    reward points
                  </a>
                  {' when you share on twitter!'}
                </p>
              </Box>
            </Alert>
          </Box>

          <Box mt={7}>
            <Grid container direction='row' justify='center'>
              <Grid item>
                <Button
                  id='back'
                  fullWidth
                  variant='contained'
                  color='primary'
                  component={Link}
                  to={Paths.home}
                  onClick={backToHome}
                >
                  Back to Home
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>
      )
  }

  render () {
    const { classes, transfer } = this.props
    return (
      <Box display='flex' flexDirection='column' alignItems='center' pt={3} pb={12}>
        <Box className={classes.sectionContainer} padding={2}>
          {transfer && this.renderReceipt()}
        </Box>
      </Box>
    )
  }
}

const styles = theme => ({
  checkCircleIcon: {
    color: '#43B384',
    fontSize: '48px'
  },
  errorRoundedIcon: {
    color: '#F3A40A',
    fontSize: '48px'
  },
  cancelRoundedIcon: {
    color: '#A8A8A8',
    fontSize: '48px'
  },
  iconBtn: {
    padding: '0',
    marginLeft: '16px',
    marginRight: '16px'
  },
  sectionContainer: {
    width: '100%',
    [theme.breakpoints.down('sm')]: {
      maxWidth: '320px'
    },
    [theme.breakpoints.up('sm')]: {
      maxWidth: '480px'
    }
  },
  trasnferDirection: {
    borderRadius: '100px',
    color: '#777777',
    height: '14px',
    fontSize: '12px',
    padding: '5px 10px 5px 10px',
    backgroundColor: '#E9E9E9'
  },
  addressBtn: {
    background: `rgba(57, 51, 134, 0.1)`,
    borderRadis: '4px',
    fontSize: '12px',
    padding: '6px 10px 6px 10px'
  }
})

export default withStyles(styles)(ReceiptComponent)
