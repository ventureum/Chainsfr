import React, { Component } from 'react'

import { withStyles } from '@material-ui/core/styles'
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

class LandingPageComponent extends Component {
  state = {
    expanded: false,
    walletSelection: ''
  }

  renderRecentTransferItem = (transfer, i) => {
    const { classes } = this.props
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
                primary={`${transfer.transferType === 'SENDER' ? 'To' : 'From'} ${
                  transfer.destination
                }`}
                secondary={secondaryDesc}
              />
            </Grid>
            <Grid xs={4} item>
              <Grid container direction='row' justify='space-between' alignItems='center'>
                <Grid item>
                  <Typography align='center' className={classes[stateClassName]}>
                    {toUserReadableState[transfer.transferType][transfer.state]}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography align='right' className={classes.recentTransferItemTransferAmount}>
                    {transfer.transferType === 'SENDER' ? '-' : '+'}
                    {transfer.transferAmount} {getCryptoSymbol(transfer.cryptoType)}
                  </Typography>
                  <Typography
                    align='right'
                    className={classes.recentTransferItemTransferCurrencyAmount}
                  >
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
              <Typography className={classes.recentTransferItemTransferId}>
                Transfer ID:{' '}
                {transfer.transferType === 'SENDER' ? transfer.transferId : transfer.receivingId}
              </Typography>
            </Grid>
            {transfer.password && (
              <Grid item>
                <Typography className={classes.recentTransferItemTransferId}>
                  Security Answer: {transfer.password}
                </Typography>
              </Grid>
            )}
            {transfer.sendMessage && (
              <Grid item>
                <Typography className={classes.recentTransferItemTransferMessage}>
                  Message: {transfer.sendMessage}
                </Typography>
              </Grid>
            )}
            {transfer.cancelMessage && (
              <Grid item>
                <Typography className={classes.recentTransferItemTransferMessage}>
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
                <Typography className={classes.recentTransferItemTransferId}>
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
                  target='_black'
                  to={`cancel?id=${transfer.transferId}`}
                  className={classes.recentTransferItemCancelBtn}
                >
                  Cancel Transfer
                </Button>
              </Grid>
            )}
          </Grid>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    )
  }

  renderWalletSection = props => {
    const { classes, push } = this.props
    const { walletSelection } = this.state
    // Do not remove <div style={{ padding: 10 }}>
    // See https://material-ui.com/components/grid/#limitations
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

  renderTransferHistorySection = () => {
    const { classes, actionsPending, transferHistory, loadMoreTransferHistory } = this.props
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
                      <Typography className={classes.txHistoryTitleText}>Transaction</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Grid container alignItems='center' justify='space-between'>
                        <Grid item>
                          <Typography className={classes.txHistoryTitleText}>Status</Typography>
                        </Grid>
                        <Grid item>
                          <Typography className={classes.txHistoryTitleText}>Amount</Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                <Divider />
                {!actionsPending.getTransferHistory && transferHistory.history.length === 0 && (
                  <Grid container justify='center'>
                    <Typography className={classes.noTxText}>
                      It seems you don't have any transactions yet
                    </Typography>
                  </Grid>
                )}
                {transferHistory.history.map((transfer, i) =>
                  this.renderRecentTransferItem(transfer, i)
                )}
              </InfiniteScroll>
            </Grid>
          </Grid>
        </Container>
      </Grid>
    )
  }

  render () {
    return (
      <Grid container direction='column'>
        <Grid item>{this.renderWalletSection()}</Grid>
        <Grid item>{this.renderTransferHistorySection()}</Grid>
      </Grid>
    )
  }
}

const styles = theme => ({
  coloredBackgrond: {
    backgroundColor: '#FAFBFE'
  },
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
  txHistoryTitleText: {
    fontWeight: '600',
    fontSize: '12px',
    color: '#777777'
  },
  recentTransferItemTransferStatusPending: {
    borderRadius: '100px',
    backgroundColor: '#F49B20',
    color: 'white',
    padding: '5px',
    fontSize: '14px',
    width: '86px',
    fontWeight: '500'
  },
  recentTransferItemTransferStatusTextBased: {
    borderRadius: '100px',
    backgroundColor: '#43B384',
    color: 'white',
    padding: '5px',
    fontSize: '14px',
    width: '86px',
    fontWeight: '500'
  },
  recentTransferItemTransferStatusError: {
    borderRadius: '100px',
    backgroundColor: '#A8A8A8',
    color: 'white',
    width: '86px',
    padding: '5px ',
    fontSize: '14px',
    fontWeight: '500'
  },
  recentTransferItemTransferAmount: {
    fontWeight: '500',
    fontSize: '14px',
    color: '#333333'
  },
  recentTransferItemTransferCurrencyAmount: {
    fontWeight: '500',
    fontSize: '14px',
    color: '#777777'
  },
  recentTransferItemTransferMessage: {
    color: '#777777',
    fontSize: '12px',
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
  noTxText: {
    margin: '60px 0px 60px 0px',
    fontSize: '24px',
    color: '#A8A8A8'
  }
})

export default withStyles(styles)(LandingPageComponent)
