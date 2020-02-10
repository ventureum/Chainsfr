// @flow
import React, { Component } from 'react'
import Avatar from '@material-ui/core/Avatar'
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
import { getWalletLogo, getWalletTitle } from '../wallet'
import { getCryptoSymbol, getCryptoPlatformType, getCryptoTitle } from '../tokens'
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

  renderReceipt () {
    const { classes, transfer, sendTime, receiveTime, cancelTime, backToHome } = this.props
    const { copied, showAddress } = this.state
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
    let platFormType = ''
    if (cryptoType) {
      platFormType = getCryptoPlatformType(cryptoType)
      platFormType = platFormType.charAt(0).toUpperCase() + platFormType.substring(1)
    }

    switch (state) {
      case transferStates.SEND_PENDING:
        // only accessible to sender
        title = 'Transfer Arranged'
        titleIcon = <CheckCircleIcon className={classes.checkCircleIcon} />
        messageBoxContent =
          `${platFormType} network is processing your transaction. ` +
          `${receiverName} will receive an email notification to ` +
          `accept your transfer shortly`
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
        throw new Error(`Unknown transfer state: ${state}`)
    }
    if (state)
      return (
        <Box display='flex' flexDirection='column' alignItems='stretch'>
          <Box display='flex' flexDirection='column' alignItems='center'>
            {titleIcon}
            <Typography variant='h3'> {title} </Typography>
          </Box>

          {messageBoxContent && (
            <Box mt={4} padding={2} className={classes.reminder}>
              <Typography variant='body2' align='left'>
                {messageBoxContent}
              </Typography>
            </Box>
          )}

          <Box pt={6}>
            <Grid container style={{ width: '100%' }} direction='column' spacing={2}>
              <Grid item>
                <Box display='flex' flexDirection='row' alignItems='flex-start' width='100%'>
                  <Box mr={2} width='50px' mt={1}>
                    <Typography
                      variant='button'
                      align='center'
                      className={classes.trasnferDirection}
                    >
                      To
                    </Typography>
                  </Box>

                  <Box display='flex' flexDirection='column' alignItems='flex-start' width='100%'>
                    <Box display='flex' flexDirection='row' alignItems='center'>
                      <Box mr={1}>
                        {transfer.receiverAvatar ? (
                          <Avatar src={transfer.receiverAvatar} style={{ width: 32 }}></Avatar>
                        ) : (
                          <Avatar style={{ width: 32 }}>
                            {transfer.receiverName.charAt(0).toUpperCase()}
                          </Avatar>
                        )}
                      </Box>
                      <Box>
                        <Typography variant='body2' id='receiverName'>
                          {receiverName}
                        </Typography>
                        <Typography variant='caption' id='destination'>
                          {destination}
                        </Typography>
                      </Box>
                    </Box>
                    {transferType === 'RECEIVER' && receiverAccount && (
                      <>
                        <Box pt={1} pb={1} width='100%'>
                          <Divider />
                        </Box>
                        <Box display='flex' flexDirection='row' alignItems='center' mb={2}>
                          <Box mr={1}>
                            <Avatar
                              style={{ borderRadius: '2px', width: '32px' }}
                              src={getWalletLogo(receiverAccount.walletType)}
                            ></Avatar>
                          </Box>
                          <Box>
                            <Typography variant='body2' id='senderName'>
                              {receiverAccount.name}
                            </Typography>
                            <Typography variant='caption' id='sender'>
                              {`${getWalletTitle(receiverAccount.walletType)}, ${getCryptoTitle(
                                receiverAccount.platformType
                              )}`}
                            </Typography>
                          </Box>
                        </Box>
                        <Button
                          className={classes.addressBtn}
                          color='primary'
                          onClick={() => {
                            this.toggleAddress()
                          }}
                        >
                          Show Address
                        </Button>
                        {showAddress && (
                          <Box mt={1}>
                            <Typography variant='caption'>{receiverAccount.address}</Typography>
                          </Box>
                        )}
                      </>
                    )}
                  </Box>
                </Box>
              </Grid>
              <Grid item>
                <Divider />
              </Grid>
              <Grid item>
                <Box display='flex' flexDirection='row' alignItems='flex-start' width='100%'>
                  <Box mr={2} width='50px' mt={1}>
                    <Typography
                      variant='button'
                      align='center'
                      className={classes.trasnferDirection}
                    >
                      From
                    </Typography>
                  </Box>
                  <Box display='flex' flexDirection='column' alignItems='flex-start' width='100%'>
                    <Box display='flex' flexDirection='row' alignItems='center'>
                      <Box mr={1}>
                        {transfer.senderAvatar ? (
                          <Avatar src={transfer.senderAvatar} style={{ width: 32 }}></Avatar>
                        ) : (
                          <Avatar style={{ width: 32 }}>
                            {transfer.senderName.charAt(0).toUpperCase()}
                          </Avatar>
                        )}
                      </Box>
                      <Box>
                        <Typography variant='body2' id='senderName'>
                          {senderName}
                        </Typography>
                        <Typography variant='caption' id='sender'>
                          {sender}
                        </Typography>
                      </Box>
                    </Box>
                    {transferType === 'SENDER' && senderAccount && (
                      <>
                        <Box pt={1} pb={1} width='100%'>
                          <Divider />
                        </Box>
                        <Box display='flex' flexDirection='row' alignItems='center' mb={2}>
                          <Box mr={1}>
                            <Avatar
                              style={{ borderRadius: '2px', width: '32px' }}
                              src={getWalletLogo(senderAccount.walletType)}
                            ></Avatar>
                          </Box>
                          <Box>
                            <Typography variant='body2' id='senderName'>
                              {senderAccount.name}
                            </Typography>
                            <Typography variant='caption' id='sender'>
                              {`${getWalletTitle(senderAccount.walletType)}, ${getCryptoTitle(
                                senderAccount.platformType
                              )}`}
                            </Typography>
                          </Box>
                        </Box>
                        <Button
                          className={classes.addressBtn}
                          color='primary'
                          onClick={() => {
                            this.toggleAddress()
                          }}
                        >
                          Show Address
                        </Button>
                        {showAddress && (
                          <Box mt={1}>
                            <Typography variant='caption'>{senderAccount.address}</Typography>
                          </Box>
                        )}
                      </>
                    )}
                  </Box>
                </Box>
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
                </>
              )}
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
          </Box>

          <Box mt={7}>
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
