import React, { Component, useState } from 'react'
import Avatar from '@material-ui/core/Avatar'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import clsx from 'clsx'
import CloseIcon from '@material-ui/icons/CloseRounded'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import Drawer from '@material-ui/core/Drawer'
import { withStyles, makeStyles, useTheme } from '@material-ui/core/styles'
import { Link } from 'react-router-dom'
import Container from '@material-ui/core/Container'
import { getWalletLogo, getWalletTitle } from '../wallet'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import Box from '@material-ui/core/Box'
import CircularProgress from '@material-ui/core/CircularProgress'
import ListItem from '@material-ui/core/ListItem'
import IconButton from '@material-ui/core/IconButton'
import InfiniteScroll from 'react-infinite-scroller'
import moment from 'moment'
import Skeleton from '@material-ui/lab/Skeleton'
import { getCryptoSymbol, getTxFeesCryptoType } from '../tokens'
import path from '../Paths.js'
import Divider from '@material-ui/core/Divider'
import UserAvatar from './MicroComponents/UserAvatar'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import EmptyStateImage from '../images/empty_state_01.png'
import VisibilityIcon from '@material-ui/icons/Visibility'
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff'

const toUserReadableState = {
  SENDER: {
    /* sending */
    SEND_PENDING: {
      label: 'Sending',
      labelStyle: 'recentTransferItemTransferStatusPending',
      action: 'TRACK_TX'
    },
    SEND_FAILURE: {
      label: 'Send Failed',
      labelStyle: 'recentTransferItemTransferStatusError',
      action: 'TRACK_TX'
    },

    /* receiving */
    SEND_CONFIRMED_RECEIVE_NOT_INITIATED: {
      label: 'Pending',
      labelStyle: 'recentTransferItemTransferStatusPending',
      action: 'CANCEL'
    },
    SEND_CONFIRMED_RECEIVE_PENDING: {
      label: 'Accepting',
      labelStyle: 'recentTransferItemTransferStatusPending'
    },
    SEND_CONFIRMED_RECEIVE_FAILURE: {
      label: 'Pending',
      labelStyle: 'recentTransferItemTransferStatusPending',
      action: 'CANCEL'
    },
    SEND_CONFIRMED_RECEIVE_CONFIRMED: {
      label: 'Completed',
      labelStyle: 'recentTransferItemTransferStatusTextBased'
    },

    /* receiving during expiration */
    SEND_CONFIRMED_EXPIRED_RECEIVE_NOT_INITIATED: {
      label: 'Expired',
      labelStyle: 'recentTransferItemTransferStatusError',
      action: 'RECLAIM'
    },
    SEND_CONFIRMED_EXPIRED_RECEIVE_PENDING: {
      // receiver is accepting the transfer,
      // ignore expiration status to prevent sender from
      // cancelling the transfer
      label: 'Accepting',
      labelStyle: 'recentTransferItemTransferStatusPending'
    },
    SEND_CONFIRMED_EXPIRED_RECEIVE_FAILURE: {
      // receive failure just after expiration
      // receiver cannot accept the transfer anymore due to
      // expiration, mark it as "Expired"
      label: 'Expired',
      labelStyle: 'recentTransferItemTransferStatusError',
      action: 'RECLAIM'
    },
    SEND_CONFIRMED_EXPIRED_RECEIVE_CONFIRMED: {
      label: 'Completed',
      labelStyle: 'recentTransferItemTransferStatusTextBased'
    },

    /* cancellation */
    SEND_CONFIRMED_CANCEL_PENDING: {
      label: 'Cancelling',
      labelStyle: 'recentTransferItemTransferStatusPending',
      action: 'TRACK_TX'
    },
    SEND_CONFIRMED_CANCEL_FAILURE: {
      label: 'Cancel Failed',
      labelStyle: 'recentTransferItemTransferStatusError',
      action: 'TRACK_TX'
    },
    SEND_CONFIRMED_CANCEL_CONFIRMED: {
      label: 'Cancelled',
      labelStyle: 'recentTransferItemTransferStatusTextBased'
    },

    /* cancellation after expiration */
    SEND_CONFIRMED_EXPIRED_CANCEL_PENDING: {
      label: 'Reclaiming',
      labelStyle: 'recentTransferItemTransferStatusPending',
      action: 'TRACK_TX'
    },
    SEND_CONFIRMED_EXPIRED_CANCEL_FAILURE: {
      label: 'Reclaim Failed',
      labelStyle: 'recentTransferItemTransferStatusError',
      action: 'TRACK_TX'
    },
    SEND_CONFIRMED_EXPIRED_CANCEL_CONFIRMED: {
      label: 'Reclaimed',
      labelStyle: 'recentTransferItemTransferStatusTextBased'
    },
    UNKNOWN_STATE: {
      label: 'Unknow State',
      labelStyle: 'recentTransferItemTransferStatusTextBased'
    }
  },
  RECEIVER: {
    /* sending */
    SEND_PENDING: {
      label: 'Sending',
      labelStyle: 'recentTransferItemTransferStatusPending',
      action: 'TRACK_TX'
    },
    SEND_FAILURE: {
      label: 'Send Failed',
      labelStyle: 'recentTransferItemTransferStatusError',
      action: 'TRACK_TX'
    },
    /* receiving */
    SEND_CONFIRMED_RECEIVE_NOT_INITIATED: {
      label: 'Pending',
      labelStyle: 'recentTransferItemTransferStatusPending',
      action: 'DEPOSIT'
    },
    SEND_CONFIRMED_RECEIVE_PENDING: {
      label: 'Receiving',
      labelStyle: 'recentTransferItemTransferStatusPending',
      action: 'TRACK_TX'
    },
    SEND_CONFIRMED_RECEIVE_FAILURE: {
      label: 'Receive Failed',
      labelStyle: 'recentTransferItemTransferStatusError',
      action: 'TRACK_TX'
    },
    SEND_CONFIRMED_RECEIVE_CONFIRMED: {
      label: 'Completed',
      labelStyle: 'recentTransferItemTransferStatusTextBased'
    },

    /* receiving during expiration */
    SEND_CONFIRMED_EXPIRED_RECEIVE_PENDING: {
      label: 'Receiving',
      labelStyle: 'recentTransferItemTransferStatusPending',
      action: 'TRACK_TX'
    },
    SEND_CONFIRMED_EXPIRED_RECEIVE_NOT_INITIATED: {
      label: 'Expired',
      labelStyle: 'recentTransferItemTransferStatusError'
    },
    SEND_CONFIRMED_EXPIRED_RECEIVE_FAILURE: {
      label: 'Receive Failed',
      labelStyle: 'recentTransferItemTransferStatusError',
      action: 'TRACK_TX'
    },
    SEND_CONFIRMED_EXPIRED_RECEIVE_CONFIRMED: {
      label: 'Completed',
      labelStyle: 'recentTransferItemTransferStatusTextBased'
    },

    /* cancellation */
    SEND_CONFIRMED_CANCEL_PENDING: {
      label: 'Cancelling',
      labelStyle: 'recentTransferItemTransferStatusPending'
    },
    SEND_CONFIRMED_CANCEL_FAILURE: {
      label: 'Cancel Failed',
      labelStyle: 'recentTransferItemTransferStatusError'
    },
    SEND_CONFIRMED_CANCEL_CONFIRMED: {
      label: 'Cancelled',
      labelStyle: 'recentTransferItemTransferStatusTextBased'
    },

    /* cancellation after expiration */
    SEND_CONFIRMED_EXPIRED_CANCEL_PENDING: {
      label: 'Reclaiming',
      labelStyle: 'recentTransferItemTransferStatusPending'
    },
    SEND_CONFIRMED_EXPIRED_CANCEL_FAILURE: {
      label: 'Reclaim Failed',
      labelStyle: 'recentTransferItemTransferStatusError'
    },
    SEND_CONFIRMED_EXPIRED_CANCEL_CONFIRMED: {
      label: 'Reclaimed',
      labelStyle: 'recentTransferItemTransferStatusTextBased'
    },
    UNKNOWN_STATE: {
      label: 'Unknow State',
      labelStyle: 'recentTransferItemTransferStatusTextBased'
    }
  },
  DIRECT_TRANSFER: {
    SEND_PENDING: 'Sending',
    SEND_FAILURE: 'Send Failed',
    SEND_CONFIRMED: 'Completed'
  }
}

const baseRecentTransferItemTransferStatus = {
  borderRadius: '100px',
  color: 'white',
  padding: '5px',
  width: '100px',
  height: '14px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'stretch'
}

const useStyles = makeStyles(theme => ({
  listItem: {
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    border: 'none',
    '&:hover': {
      textDecoration: 'none',
      backgroundColor: 'rgba(0, 0, 0, 0.05)',
      // Reset on touch devices, it doesn't add specificity
      '@media (hover: none)': {
        backgroundColor: 'transparent'
      }
    }
  },
  txHistoryTitleContainer: {
    margin: '10px 0px 10px 0px',
    width: '100%',
    padding: '0px 64px 0px 20px'
  },
  recentTransferItemTransferStatusPending: {
    ...baseRecentTransferItemTransferStatus,
    backgroundColor: '#F49B20'
  },
  recentTransferItemTransferStatusTextBased: {
    ...baseRecentTransferItemTransferStatus,
    backgroundColor: '#43B384'
  },
  recentTransferItemTransferStatusError: {
    ...baseRecentTransferItemTransferStatus,
    backgroundColor: '#A8A8A8'
  },
  smallStatus: {
    width: 'auto',
    height: '14px',
    paddingLeft: 10,
    paddingRight: 10
  },
  trasnferDirection: {
    borderRadius: '100px',
    color: '#777777',
    height: '14px',
    padding: '5px 10px 5px 10px',
    backgroundColor: '#E9E9E9'
  },
  coloredBackgrond: {
    backgroundColor: '#FAFBFE'
  },
  container: {
    paddingTop: 40,
    paddingBottom: 30
  },
  expandIcon: {
    padding: '10px',
    width: '24px',
    height: 'auto'
  },
  transferDetailDrawer: {
    maxWidth: '480px',
    width: '100%',
    flexDirection: 'column',
    alignItems: 'stretch'
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500]
  },
  closeIcon: {
    width: '24px',
    height: 'auto'
  },
  tinyFont: {
    fontSize: '11px'
  },
  passwordBtn: {
    padding: 0,
    borderRadius: 0
  },
  cancelBtn: {
    color: '#662A27'
  }
}))

function TransferDetailsComponent (props) {
  const { transfer, open, onClose, getTransferPassword, enqueueSnackbar } = props
  const [showPassword, setShowPassword] = useState(false)
  const classes = useStyles()
  let name, avatar, email, password, timestamp, timestampTitle, account, transferId, timestamp2
  if (transfer) {
    if (transfer.transferType === 'SENDER') {
      name = transfer.senderName
      avatar = transfer.senderAvatar
      email = transfer.sender
      password = transfer.password
      account = JSON.parse(transfer.senderAccount)
      transferId = transfer.transferId
    } else if (transfer.transferType === 'RECEIVER') {
      name = transfer.receiverName
      avatar = transfer.receiverAvatar
      email = transfer.destination
      if (transfer.receiverAccount) account = JSON.parse(transfer.receiverAccount)
      transferId = transfer.receivingId
    }
    if (transfer.expiresAt) {
      timestamp = moment.unix(transfer.expiresAt).format('MMMM Do YYYY - h:mm a')
      timestampTitle = 'Expiration Date'
      timestamp2 = `Date Sent ${moment
        .unix(transfer.sendTimestamp)
        .format('MMMM Do YYYY - h:mm a')}`
    }
    if (transfer.cancelTimestamp) {
      timestamp = moment.unix(transfer.cancelTimestamp).format('MMMM Do YYYY - h:mm a')
      timestampTitle = 'Cancellation Date'
    }
    if (transfer.receiveTimestamp) {
      timestamp = moment.unix(transfer.receiveTimestamp).format('MMMM Do YYYY - h:mm a')
      timestampTitle = 'Completion Date'
      timestamp2 = `Date Received ${timestamp}`
    }
  }
  return (
    <Drawer
      open={open}
      anchor='right'
      classes={{
        paper: classes.transferDetailDrawer
      }}
      onClose={() => {
        onClose()
      }}
    >
      {transfer && (
        <>
          <Box padding={2}>
            <Typography variant='h3'>Details</Typography>
            <IconButton
              onClick={() => {
                onClose()
              }}
              className={classes.closeButton}
            >
              <CloseIcon className={classes.closeIcon} />
            </IconButton>
          </Box>
          <Divider />
          <Box display='flex' padding='20px 40px 20px 40px' flexDirection='column'>
            <Box pt={2}>
              <Typography variant='caption'>
                {transfer.transferType === 'SENDER' ? 'To' : 'From'}
              </Typography>
              <Box display='flex' alignItems='center' justifyContent='space-between'>
                <Box>
                  <Typography variant='h4'>{name}</Typography>
                  <Typography variant='caption'>{email}</Typography>
                </Box>
                <UserAvatar name={name} src={avatar} style={{ width: 36, height: 'auto' }} />
              </Box>
            </Box>
            <Box pt={2}>
              <Box display='flex' alignItems='center' justifyContent='space-between'>
                <Typography variant='caption'>Amount</Typography>
                <Box
                  className={clsx(
                    classes[toUserReadableState[transfer.transferType][transfer.state].labelStyle],
                    classes.smallStatus
                  )}
                >
                  <Typography variant='button' align='center' style={{ fontSize: '12px' }}>
                    {toUserReadableState[transfer.transferType][transfer.state].label}
                  </Typography>
                </Box>
              </Box>
              <Box display='flex' alignItems='center'>
                <Typography variant='h4' style={{ marginRight: 10 }}>
                  {transfer.transferAmount} {getCryptoSymbol(transfer.cryptoType)}
                </Typography>
                <Typography align='right' variant='caption'>
                  (≈ {transfer.transferCurrencyAmount})
                </Typography>
              </Box>
            </Box>
            {transfer.transferType === 'SENDER' && (
              <Box pt={2}>
                <Typography variant='caption'>Security Answer</Typography>
                <Box display='flex' alignItems='center' justifyContent='space-between'>
                  {showPassword ? (
                    transfer.passwordLoading ? (
                      <Skeleton width={90} height={20} />
                    ) : (
                      <CopyToClipboard
                        text={password}
                        onCopy={() => {
                          enqueueSnackbar({
                            message: 'Security answer copied!',
                            options: { variant: 'success', autoHideDuration: 3000 }
                          })
                        }}
                      >
                        <Button className={classes.passwordBtn}>
                          <Typography variant='h4'>{password}</Typography>
                        </Button>
                      </CopyToClipboard>
                    )
                  ) : (
                    <Typography variant='h4'>*********</Typography>
                  )}
                  <IconButton
                    style={{ padding: 5 }}
                    onClick={() => {
                      if (!password) {
                        getTransferPassword(transferId)
                      }
                      setShowPassword(!showPassword)
                    }}
                  >
                    {showPassword ? (
                      <VisibilityIcon style={{ width: '22px', color: '#777777' }} />
                    ) : (
                      <VisibilityOffIcon style={{ width: '22px', color: '#777777' }} />
                    )}
                  </IconButton>
                </Box>
              </Box>
            )}
            <Box pt={2}>
              <Typography variant='caption'>Message</Typography>
              <Typography variant='h4'>{transfer.sendMessage}</Typography>
            </Box>
            <Box pt={2}>
              <Typography variant='caption'>{timestampTitle}</Typography>
              <Typography variant='h4'>{timestamp}</Typography>
            </Box>
          </Box>
          {/* account section*/}
          <Box
            mt={2}
            padding={2}
            ml={2}
            mr={2}
            borderRadius='10px'
            bgcolor='#F4F5FC'
            display='flex'
            flexDirection='column'
          >
            {account && (
              <Box display='inline-box' mb={2}>
                <Avatar
                  style={{ borderRadius: '2px', marginRight: '10px', width: 38, height: 38 }}
                  src={getWalletLogo(account.walletType)}
                />
                <Box>
                  <Typography variant='h4'>{account.name}</Typography>
                  <Typography variant='caption'>{`${getWalletTitle(
                    account.walletType
                  )}, ending ****${account.address.slice(-5)}`}</Typography>
                </Box>
              </Box>
            )}
            <Typography variant='caption' className={classes.tinyFont}>
              {timestamp2}
            </Typography>
            {transfer.txFee && transfer.txFeeCurrencyAmount && (
              <Typography variant='caption' className={classes.tinyFont}>
                Network Fee: {transfer.txFee.costInStandardUnit}{' '}
                {getCryptoSymbol(getTxFeesCryptoType(transfer.cryptoType))} ( ≈{' '}
                {transfer.txFeeCurrencyAmount} )
              </Typography>
            )}
            <Box display='inline-box'>
              <Typography variant='caption' className={classes.tinyFont}>
                Transfer ID:{' '}
              </Typography>
              <Link
                target='_blank'
                rel='noopener'
                to={`${path.receipt}?${
                  transfer.transferId ? 'transferId' : 'receivingId'
                }=${transfer.transferId || transfer.receivingId}`}
              >
                <Typography
                  variant='caption'
                  style={{ textDecoration: 'underline', lineBreak: 'anywhere' }}
                  className={classes.tinyFont}
                >
                  {transferId}
                </Typography>
              </Link>
            </Box>
          </Box>
          {toUserReadableState[transfer.transferType][transfer.state].action === 'DEPOSIT' && (
            <Box alignSelf='center' mt={2} mb={3}>
              <Button
                variant='contained'
                color='primary'
                component={Link}
                target='_blank'
                rel='noopener'
                to={`${path.receive}?id=${transfer.receivingId}`}
                onClick={() => {
                  onClose()
                }}
              >
                Start to Deposit
              </Button>
            </Box>
          )}
          {toUserReadableState[transfer.transferType][transfer.state].action === 'CANCEL' && (
            <Box alignSelf='center' mt={2} mb={3}>
              <Button
                variant='contained'
                component={Link}
                target='_blank'
                rel='noopener'
                className='warning'
                to={`cancel?id=${transfer.transferId}`}
                data-test-id='cancel_btn'
                onClick={() => {
                  onClose()
                }}
              >
                Cancel Payment
              </Button>
            </Box>
          )}
          {toUserReadableState[transfer.transferType][transfer.state].action === 'RECLAIM' && (
            <Box alignSelf='center' mt={2} mb={3}>
              <Button
                variant='contained'
                color='primary'
                component={Link}
                target='_blank'
                rel='noopener'
                to={`cancel?id=${transfer.transferId}`}
                data-test-id='reclaim_btn'
                onClick={() => {
                  onClose()
                }}
              >
                Reclaim Payment
              </Button>
            </Box>
          )}
        </>
      )}
    </Drawer>
  )
}

export function UserRecentTransactions (props) {
  const classes = useStyles()
  const {
    actionsPending,
    transferHistory,
    loadMoreTransferHistory,
    getTransferPassword,
    enqueueSnackbar
  } = props
  const theme = useTheme()
  const wide = useMediaQuery(theme.breakpoints.up('md'))
  const [selectedTransferIndex, setSelectedTransferIndex] = useState(-1) // store the index
  const selectedTransfer =
    selectedTransferIndex >= 0 ? transferHistory.history[selectedTransferIndex] : null
  function renderRecentTransferItem (transfer, i) {
    let secondaryDesc = null
    let name, avatar
    // show timestamp of the first action by either sender or receiver
    if (transfer.transferType === 'SENDER') {
      secondaryDesc = moment.unix(transfer.sendTimestamp).format('M/D/Y HH:mm')
      name = transfer.senderName
      avatar = transfer.senderAvatar
    } else if (transfer.transferType === 'RECEIVER') {
      if (transfer.receiveTimestamp) {
        secondaryDesc = moment.unix(transfer.receiveTimestamp).format('M/D/Y HH:mm')
      } else {
        secondaryDesc = moment.unix(transfer.sendTimestamp).format('M/D/Y HH:mm')
      }
      name = transfer.receiverName
      avatar = transfer.receiverAvatar
    }
    return (
      <ListItem
        key={i + 1}
        className={
          i % 2 === 0 ? classes.listItem : clsx(classes.listItem, classes.coloredBackgrond)
        }
        button
        onClick={() => {
          // if (transfer.transferType === 'SENDER') getTransferPassword(transfer.transferId)
          setSelectedTransferIndex(i)
        }}
        data-test-id={`tx_history_${i}`}
      >
        <Box flex={1}>
          <Grid container direction='row' alignItems='center' spacing={1}>
            <Grid xs={6} md={7} item>
              <Grid container alignItems='center' spacing={1}>
                <Grid item xs={12} md={2}>
                  <Box>
                    <Typography
                      variant='button'
                      align='center'
                      className={classes.trasnferDirection}
                    >
                      {transfer.transferType === 'SENDER' ? 'To' : 'From'}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md>
                  <Box display='flex' flexDirection='row' alignItems='center'>
                    <UserAvatar name={name} src={avatar} style={{ width: 32 }} />
                    <Box ml={1}>
                      <Typography variant='body2'>{name}</Typography>
                      <Typography variant='caption'>{secondaryDesc}</Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
            <Grid xs md={5} item>
              <Grid
                container
                direction='row'
                justify='space-between'
                alignItems='center'
                spacing={1}
              >
                <Grid item xs={12} md={'auto'}>
                  <Box display='flex' justifyContent='flex-end'>
                    <Box
                      className={
                        classes[
                          toUserReadableState[transfer.transferType][transfer.state].labelStyle
                        ]
                      }
                    >
                      <Typography variant='button' align='center'>
                        {toUserReadableState[transfer.transferType][transfer.state].label}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={'auto'}>
                  <Box
                    display='flex'
                    flexDirection='column'
                    alignItems='flex-end'
                    justifyContent='flex-end'
                  >
                    <Typography variant='body2'>
                      {transfer.transferType === 'SENDER' ? '-' : '+'}
                      {transfer.transferAmount} {getCryptoSymbol(transfer.cryptoType)}
                    </Typography>
                    <Typography align='right' variant='caption'>
                      {transfer.transferType === 'SENDER' ? '-' : '+'}
                      {transfer.transferCurrencyAmount}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Box>
        <ChevronRightIcon className={classes.expandIcon} />
      </ListItem>
    )
  }

  return (
    <Container className={classes.container}>
      <InfiniteScroll
        loader={
          actionsPending.getEmailTransferHistory && (
            <Grid container direction='row' justify='center' key={0} alignItems='center'>
              <CircularProgress
                color='primary'
                style={{ marginTop: '30px' }}
                data-test-id='tx_history_loading'
              />
            </Grid>
          )
        }
        threshold={300}
        pageStart={0}
        loadMore={() => {
          if (!actionsPending.getEmailTransferHistory) {
            loadMoreTransferHistory(transferHistory.history.length)
          }
        }}
        useWindow
        hasMore={
          !!transferHistory.destinationLastEvaluatedKey || !!transferHistory.senderLastEvaluatedKey
        }
        initialLoad={false}
      >
        <Grid item className={classes.txHistoryTitleContainer}>
          <Grid container direction='row' alignItems='center'>
            <Grid item xs={6} md={7}>
              <Typography variant='h6'>Transaction</Typography>
            </Grid>
            <Grid item xs={6} md={5}>
              <Box
                display='flex'
                flexDirection='row'
                alignItems='center'
                justifyContent={wide ? 'space-between' : 'flex-end'}
              >
                {wide ? (
                  <>
                    <Typography variant='h6'>Status</Typography>
                    <Typography variant='h6'>Amount</Typography>
                  </>
                ) : (
                  <Typography variant='h6'>Status/Amount</Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </Grid>
        <Divider />
        {!actionsPending.getEmailTransferHistory && transferHistory.history.length === 0 && (
          <Box display='flex' flexDirection='column' alignItems='center' mt={6} mb={6}>
            <Box mb={2}>
              <img src={EmptyStateImage} alt='Empty State' data-test-id='empty_img' />
            </Box>
            <Typography variant='subtitle2' color='textSecondary'>
              It seems you don't have any transactions yet
            </Typography>
          </Box>
        )}
        {transferHistory.history.map((transfer, i) => renderRecentTransferItem(transfer, i))}
        <TransferDetailsComponent
          transfer={selectedTransfer}
          open={!!selectedTransfer}
          onClose={() => {
            setSelectedTransferIndex(null)
          }}
          enqueueSnackbar={enqueueSnackbar}
          getTransferPassword={getTransferPassword}
        />
      </InfiniteScroll>
    </Container>
  )
}

class LandingPageComponent extends Component {
  renderUpperSection = props => {
    const { classes, push } = this.props
    return (
      <Box
        className={classes.coloredBackgrond}
        alignItems='center'
        justifyContent='center'
        display='flex'
      >
        <Container className={classes.container}>
          <Grid container>
            <Grid item md={6} xs={12} className={classes.upperBigGridItem}>
              <Box
                display='flex'
                alignItems='flex-start'
                flexDirection='column'
                height='100%'
                justifyContent='center'
              >
                <Typography variant='h2' data-test-id='emt_title'>
                  My Payments
                </Typography>
                <Typography className={classes.descText} data-test-id='emt_subtitle'>
                  Make Cryptocurrency payments to any Email address. Cancel payments when needed.
                </Typography>
                <Box display='flex' alignItems='center' mt={1} width='100%'>
                  <Grid container>
                    <Grid item className={classes.uppperSmallGridItem}>
                      <Button
                        variant='contained'
                        color='primary'
                        onClick={() => push(path.transfer)}
                        data-test-id='emt_btn'
                      >
                        Make a Payment
                      </Button>
                    </Grid>
                    <Grid item className={classes.uppperSmallGridItem}>
                      <Button
                        className={classes.lightbtn}
                        color='primary'
                        onClick={() => push(path.connections)}
                        data-test-id='cya_btn'
                      >
                        Connect to Your Existing Wallets
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    )
  }

  render () {
    const {
      actionsPending,
      transferHistory,
      loadMoreTransferHistory,
      getTransferPassword,
      enqueueSnackbar
    } = this.props
    return (
      <Box display='flex' flexDirection='column'>
        {this.renderUpperSection()}
        <UserRecentTransactions
          actionsPending={actionsPending}
          transferHistory={transferHistory}
          loadMoreTransferHistory={loadMoreTransferHistory}
          getTransferPassword={getTransferPassword}
          enqueueSnackbar={enqueueSnackbar}
        />
      </Box>
    )
  }
}

const styles = theme => ({
  coloredBackgrond: {
    backgroundColor: '#FAFBFE'
  },
  upperBigGridItem: {
    [theme.breakpoints.down('sm')]: {
      paddingTop: '30px'
    }
  },
  uppperSmallGridItem: {
    marginTop: '20px',
    marginRight: '40px'
  },
  lightbtn: {
    backgroundColor: 'rgba(57, 51, 134, 0.05)'
  },
  container: {
    paddingTop: 40,
    paddingBottom: 30,
    [theme.breakpoints.up('sm')]: {
      paddingLeft: '30px',
      paddingRight: '30px'
    }
  },
  descText: {
    lineHeight: '20px',
    fontSize: 14,
    fontWeight: '600',
    color: '#777777'
  }
})

export default withStyles(styles)(LandingPageComponent)
