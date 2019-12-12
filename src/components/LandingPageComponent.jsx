import React, { Component } from 'react'

import { withStyles, makeStyles } from '@material-ui/core/styles'
import { Link } from 'react-router-dom'
import Container from '@material-ui/core/Container'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import Box from '@material-ui/core/Box'
import ListItemText from '@material-ui/core/ListItemText'
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
import WalletSelectionButtons from './WalletSelectionButtons'

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
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'stretch'
}

const useStyles = makeStyles({
  expansionPanelRoot: {
    boxShadow: 'none',
    marginTop: '0px'
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
  }
})

export function UserRecentTransactions (props) {
  const classes = useStyles()
  const { actionsPending, transferHistory, loadMoreTransferHistory } = props

  function renderRecentTransferItem (transfer, i) {
    if (transfer.error) {
      return (
        <ExpansionPanel
          key={i + 1}
          className={i % 2 !== 0 ? undefined : classes.coloredBackgrond}
          classes={{
            root: classes.expansionPanelRoot,
            expanded: classes.expansionPanelExpanded
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
      secondaryDesc =
        'received on ' + moment.unix(transfer.receiveTimestamp).format('MMM Do YYYY, HH:mm:ss')
    } else if (transfer.state === transferStates.SEND_CONFIRMED_CANCEL_CONFIRMED) {
      secondaryDesc =
        'cancelled on ' + moment.unix(transfer.cancelTimestamp).format('MMM Do YYYY, HH:mm:ss')
    } else {
      // pending receive
      secondaryDesc =
        'sent on ' + moment.unix(transfer.sendTimestamp).format('MMM Do YYYY, HH:mm:ss')
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
        className={i % 2 !== 0 ? undefined : classes.coloredBackgrond}
        classes={{
          root: classes.expansionPanelRoot,
          expanded: classes.expansionPanelExpanded
        }}
      >
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
          <Grid container direction='row' alignItems='center'>
            <Grid xs={8} item>
              <ListItemText
                primary={
                  transfer.transferType === 'SENDER'
                    ? `To ${transfer.receiverName}`
                    : `From ${transfer.senderName}`
                }
                secondary={secondaryDesc}
              />
            </Grid>
            <Grid xs={4} item>
              <Grid container direction='row' justify='space-between' alignItems='center'>
                <Grid item>
                  <Box className={classes[stateClassName]}>
                    <Typography variant='button' align='center'>
                      {toUserReadableState[transfer.transferType][transfer.state]}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item>
                  <Typography align='right' variant='body2'>
                    {transfer.transferType === 'SENDER' ? '-' : '+'}
                    {transfer.transferAmount} {getCryptoSymbol(transfer.cryptoType)}
                  </Typography>
                  <Typography align='right' variant='caption'>
                    {transfer.transferType === 'SENDER' ? '-' : '+'}
                    {transfer.transferCurrencyAmount}
                  </Typography>
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
                  ? `To ${transfer.destination}`
                  : `From ${transfer.sender}`}
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
    <Grid
      container
      alignItems='center'
      justify='center'
      className={classes.transactionHistorySection}
    >
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
                  <Grid item xs={8}>
                    <Typography variant='h6'>Transaction</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Grid container alignItems='center' justify='space-between'>
                      <Grid item>
                        <Typography variant='h6'>Status</Typography>
                      </Grid>
                      <Grid item>
                        <Typography variant='h6'>Amount</Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Divider />
              {!actionsPending.getTransferHistory && transferHistory.history.length === 0 && (
                <Grid container justify='center'>
                  <Typography variant='subtitle1'>
                    It seems you don't have any transactions yet
                  </Typography>
                </Grid>
              )}
              {transferHistory.history.map((transfer, i) => renderRecentTransferItem(transfer, i))}
            </InfiniteScroll>
          </Grid>
        </Grid>
      </Container>
    </Grid>
  )
}

class LandingPageComponent extends Component {
  state = {
    walletSelection: ''
  }

  renderWalletSection = props => {
    const { classes, push } = this.props
    const { walletSelection } = this.state
    return (
      <Grid container alignItems='center' justify='center' className={classes.coloredBackgrond}>
        <Container maxWidth='lg'>
          <Box mb={2}>
            <Typography variant='h2'>Transfer From</Typography>
          </Box>
          <WalletSelectionButtons
            purpose='send'
            walletSelection={walletSelection}
            handleClick={walletType => this.setState({ walletSelection: walletType })}
          />
          <Grid container direction='row' alignItems='center' justify='center'>
            <Grid item>
              <Button
                variant='contained'
                color='primary'
                onClick={() => push(`${path.transfer}?walletSelection=${walletSelection}`)}
                disabled={!walletSelection}
              >
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
  coloredBackgrond: {
    backgroundColor: '#FAFBFE'
  }
})

export default withStyles(styles)(LandingPageComponent)
