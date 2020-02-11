import React, { Component } from 'react'

import { withStyles, makeStyles, useTheme } from '@material-ui/core/styles'
import { Link } from 'react-router-dom'
import Container from '@material-ui/core/Container'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import Box from '@material-ui/core/Box'
import ExpansionPanel from '@material-ui/core/ExpansionPanel'
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary'
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import CircularProgress from '@material-ui/core/CircularProgress'
import InfiniteScroll from 'react-infinite-scroller'
import moment from 'moment'
import { getCryptoSymbol } from '../tokens'
import path from '../Paths.js'
import Divider from '@material-ui/core/Divider'
import { transferStates } from '../actions/transferActions'
import MuiLink from '@material-ui/core/Link'
import url from '../url'
import UserAvatar from './MicroComponents/UserAvatar'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import EmptyStateImage from '../images/empty_state_01.png'
import { WalletButton } from './WalletSelectionButtons.jsx'
import { walletSelections } from '../wallet'

const toUserReadableState = {
  SENDER: {
    SEND_PENDING: 'Sending',
    SEND_FAILURE: 'Send Failed',
    SEND_CONFIRMED_RECEIVE_EXPIRED: 'Expired',
    SEND_CONFIRMED_RECEIVE_PENDING: 'Accepting',
    SEND_CONFIRMED_RECEIVE_FAILURE: 'Accept Failed',
    SEND_CONFIRMED_RECEIVE_CONFIRMED: 'Completed',
    SEND_CONFIRMED_RECEIVE_NOT_INITIATED: 'Pending',
    SEND_CONFIRMED_CANCEL_PENDING: 'Cancelling',
    SEND_CONFIRMED_CANCEL_CONFIRMED: 'Cancelled',
    SEND_CONFIRMED_CANCEL_Failure: 'Cancel Failed'
  },
  RECEIVER: {
    SEND_CONFIRMED_RECEIVE_PENDING: 'Receiving',
    SEND_CONFIRMED_RECEIVE_FAILURE: 'Receive Failed',
    SEND_CONFIRMED_RECEIVE_CONFIRMED: 'Completed'
  }
}

const baseRecentTransferItemTransferStatus = {
  borderRadius: '100px',
  color: 'white',
  padding: '5px',
  width: '86px',
  height: '14px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'stretch'
}

const useStyles = makeStyles({
  expansionPanelRoot: {
    boxShadow: 'none',
    marginTop: '0px',
    paddingTop: 5,
    paddingBottom: 5
  },
  expansionPanelExpanded: {
    marginTop: 'auto'
  },
  txHistoryTitleContainer: {
    margin: '10px 0px 10px 0px',
    width: '100%',
    padding: '0px 60px 0px 24px'
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
  recentTransferItemTransferMessage: {
    maxWidth: '300px',
    // prevent overflow for long messages
    wordWrap: 'break-word',
    // additional margin to make message boundary clearer
    marginBottom: '20px'
  },
  recentTransferItemTransferId: {
    color: '#777777',
    fontSize: '12px'
  },
  recentTransferItemCancelBtn: {
    padding: '0px',
    fontSize: '12px',
    fontWeight: '500',
    marginTop: '10px'
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
  }
})

export function UserRecentTransactions (props) {
  const classes = useStyles()
  const { actionsPending, transferHistory, loadMoreTransferHistory } = props
  const theme = useTheme()
  const wide = useMediaQuery(theme.breakpoints.up('sm'))

  function renderRecentTransferItem (transfer, i) {
    if (transfer.error) {
      return (
        <ExpansionPanel
          key={i + 1}
          className={i % 2 === 0 ? undefined : classes.coloredBackgrond}
          classes={{
            root: classes.expansionPanelRoot,
            expanded: classes.expansionPanelExpanded,
            content: classes.expansionPanelSummaryContent
          }}
        >
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Grid container direction='row' alignItems='center' justify='center'>
              <Typography>{transfer.error}</Typography>
            </Grid>
          </ExpansionPanelSummary>
        </ExpansionPanel>
      )
    }
    let secondaryDesc = null
    if (transfer.state === transferStates.SEND_CONFIRMED_RECEIVE_CONFIRMED) {
      secondaryDesc = 'on ' + moment.unix(transfer.receiveTimestamp).format('MMM Do YYYY')
    } else if (transfer.state === transferStates.SEND_CONFIRMED_CANCEL_CONFIRMED) {
      secondaryDesc = 'on ' + moment.unix(transfer.cancelTimestamp).format('MMM Do YYYY')
    } else {
      // pending receive
      secondaryDesc = 'on ' + moment.unix(transfer.sendTimestamp).format('MMM Do YYYY')
    }

    let stateClassName = 'recentTransferItemTransferStatusTextBased' // default
    if (
      // in progress
      [
        transferStates.SEND_PENDING,
        transferStates.SEND_CONFIRMED_RECEIVE_PENDING,
        transferStates.SEND_CONFIRMED_RECEIVE_NOT_INITIATED,
        transferStates.SEND_CONFIRMED_CANCEL_PENDING
      ].includes(transfer.state)
    ) {
      stateClassName = 'recentTransferItemTransferStatusPending'
    } else if (
      // error
      [
        transferStates.SEND_FAILURE,
        transferStates.SEND_CONFIRMED_RECEIVE_FAILURE,
        transferStates.SEND_CONFIRMED_RECEIVE_EXPIRED,
        transferStates.SEND_CONFIRMED_CANCEL_FAILURE
      ].includes(transfer.state)
    ) {
      stateClassName = 'recentTransferItemTransferStatusError'
    }

    const txHash = transfer.cancelTxHash ? transfer.cancelTxHash : transfer.sendTxHash
    return (
      <ExpansionPanel
        key={i + 1}
        className={i % 2 === 0 ? undefined : classes.coloredBackgrond}
        classes={{
          root: classes.expansionPanelRoot,
          expanded: classes.expansionPanelExpanded
        }}
      >
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
          <Grid container direction='row' alignItems='center'>
            <Grid xs={7} md={7} item>
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
                    {transfer.transferType === 'SENDER' ? (
                      <>
                        <UserAvatar
                          name={transfer.receiverName}
                          src={transfer.receiverAvatar}
                          style={{ width: 32 }}
                        />
                        <Box ml={1}>
                          <Typography variant='body2'>{transfer.receiverName}</Typography>
                        </Box>
                      </>
                    ) : (
                      <>
                        <UserAvatar
                          name={transfer.senderName}
                          src={transfer.senderAvatar}
                          style={{ width: 32 }}
                        />
                        <Box ml={1}>
                          <Typography variant='body2'>{transfer.senderName}</Typography>
                          <Typography variant='caption'>{secondaryDesc}</Typography>
                        </Box>
                      </>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Grid>
            <Grid xs={5} md={4} item>
              <Grid
                container
                direction='row'
                justify='space-between'
                alignItems='center'
                spacing={1}
              >
                <Grid item xs={12} sm='auto'>
                  <Box display='flex' justifyContent='flex-end'>
                    <Box className={classes[stateClassName]}>
                      <Typography variant='button' align='center'>
                        {toUserReadableState[transfer.transferType][transfer.state]}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm='auto'>
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
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Grid container direction='column' justify='center' alignItems='flex-start'>
            <Grid item>
              <Typography variant='caption'>
                Transfer ID:{' '}
                {transfer.transferType === 'SENDER' ? transfer.transferId : transfer.receivingId}
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant='caption'>
                {transfer.transferType === 'SENDER'
                  ? `To: ${transfer.destination}`
                  : `From: ${transfer.sender}`}
              </Typography>
            </Grid>
            {transfer.password && (
              <Grid item>
                <Typography variant='caption'>Security Answer: {transfer.password}</Typography>
              </Grid>
            )}
            {transfer.sendMessage && (
              <Grid item>
                <Typography variant='caption' className={classes.recentTransferItemTransferMessage}>
                  Message: {transfer.sendMessage}
                </Typography>
              </Grid>
            )}
            {transfer.cancelMessage && (
              <Grid item>
                <Typography variant='caption' className={classes.recentTransferItemTransferMessage}>
                  Cancellation Reason: {transfer.cancelMessage}
                </Typography>
              </Grid>
            )}
            {[
              transferStates.SEND_PENDING,
              transferStates.SEND_FAILURE,
              transferStates.SEND_CONFIRMED_CANCEL_PENDING
            ].includes(transfer.state) && (
              <Grid item>
                <Typography variant='caption'>
                  You can track the Transaction
                  <MuiLink
                    target='_blank'
                    rel='noopener'
                    href={url.getExplorerTx(transfer.cryptoType, txHash)}
                  >
                    {' here'}
                  </MuiLink>
                </Typography>
              </Grid>
            )}
            {[
              transferStates.SEND_CONFIRMED_RECEIVE_EXPIRED,
              transferStates.SEND_CONFIRMED_RECEIVE_NOT_INITIATED
            ].includes(transfer.state) && (
              <Grid item>
                <Button
                  color='primary'
                  component={Link}
                  target='_blank'
                  rel='noopener'
                  to={`cancel?id=${transfer.transferId}`}
                  className={classes.recentTransferItemCancelBtn}
                >
                  Cancel Transfer
                </Button>
              </Grid>
            )}
            {transferStates.SEND_CONFIRMED_RECEIVE_CONFIRMED === transfer.state && (
              <Grid item>
                <Button
                  color='primary'
                  component={Link}
                  target='_blank'
                  rel='noopener'
                  to={`${path.receipt}?${
                    transfer.transferId ? 'transferId' : 'receivingId'
                  }=${transfer.transferId || transfer.receivingId}`}
                  className={classes.recentTransferItemCancelBtn}
                >
                  View receipt
                </Button>
              </Grid>
            )}
          </Grid>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    )
  }

  return (
    <Container maxWidth='lg'>
      <Grid container direction='column' justify='center' alignItems='stretch'>
        <Grid item>
          <Grid container direction='row'>
            <Grid item>
              <Typography variant='h2'>Recent Transactions</Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid style={{ minHeight: '300px', maxHeight: '500px', overflow: 'auto' }}>
          <InfiniteScroll
            loader={
              actionsPending.getTransferHistory && (
                <Grid container direction='row' justify='center' key={0} alignItems='center'>
                  <CircularProgress color='primary' style={{ marginTop: '30px' }} />
                </Grid>
              )
            }
            threshold={300}
            pageStart={0}
            loadMore={() => {
              if (!actionsPending.getTransferHistory) {
                loadMoreTransferHistory(transferHistory.history.length)
              }
            }}
            useWindow={false}
            hasMore={transferHistory.hasMore}
            initialLoad={false}
          >
            <Grid item className={classes.txHistoryTitleContainer}>
              <Grid container direction='row' alignItems='center'>
                <Grid item xs={6} md={7}>
                  <Typography variant='h6'>Transaction</Typography>
                </Grid>
                <Grid item xs={6} md={4}>
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
            {!actionsPending.getTransferHistory && transferHistory.history.length === 0 && (
              <Box display='flex' flexDirection='column' alignItems='center' mt={6} mb={6}>
                <Box mb={2}>
                  <img src={EmptyStateImage} alt='Empty State' />
                </Box>
                <Typography variant='subtitle2' color='textSecondary'>
                  It seems you don't have any transactions yet
                </Typography>
              </Box>
            )}
            {transferHistory.history.map((transfer, i) => renderRecentTransferItem(transfer, i))}
          </InfiniteScroll>
        </Grid>
      </Grid>
    </Container>
  )
}

class LandingPageComponent extends Component {
  renderWalletSection = props => {
    const { classes, push } = this.props
    return (
      <Grid container alignItems='center' justify='center' className={classes.coloredBackgrond}>
        <Container className={classes.walletSectionContainer}>
          <Box mb={4}>
            <Typography align='center' variant='h2'>
              Start an Email Transfer from
            </Typography>
          </Box>
          <Grid container direction='row' alignItems='center' justify='center'>
            {walletSelections
              .filter(w => {
                return (
                  w.walletType !== 'drive' &&
                  !w.hide &&
                  w.walletType !== 'metamask' &&
                  w.walletType !== 'metamaskWalletConnect'
                )
              })
              .map((w, i) => {
                return (
                  <Grid item xs={4} sm={2} md={2} key={i}>
                    <WalletButton walletType={w.walletType} handleClick={this.handleWalletSelect} />
                  </Grid>
                )
              })}
          </Grid>
          <Grid container direction='row' alignItems='center' justify='center'>
            <Grid item>
              <Button variant='contained' color='primary' onClick={() => push(path.transfer)}>
                Start Transfer
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Grid>
    )
  }

  render () {
    const { actionsPending, transferHistory, loadMoreTransferHistory } = this.props
    return (
      <Grid container direction='column'>
        <Grid item>{this.renderWalletSection()}</Grid>
        <Grid item>
          <UserRecentTransactions
            actionsPending={actionsPending}
            transferHistory={transferHistory}
            loadMoreTransferHistory={loadMoreTransferHistory}
          />
        </Grid>
      </Grid>
    )
  }
}

const styles = theme => ({
  walletSectionContainer: {
    maxWidth: '1000px'
  }
})

export default withStyles(styles)(LandingPageComponent)
