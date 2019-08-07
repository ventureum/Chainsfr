import React, { Component } from 'react'

import { withStyles } from '@material-ui/core/styles'
import { Link } from 'react-router-dom'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import ListItemText from '@material-ui/core/ListItemText'
import ExpansionPanel from '@material-ui/core/ExpansionPanel'
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary'
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import CircularProgress from '@material-ui/core/CircularProgress'
import InfiniteScroll from 'react-infinite-scroller'
import moment from 'moment'
import { getCryptoSymbol, getCryptoDecimals, getCrypto } from '../tokens'
import { walletCryptoSupports } from '../wallet'
import path from '../Paths.js'
import utils from '../utils'
import numeral from 'numeral'
import Divider from '@material-ui/core/Divider'
import {
  Spotlight,
  SpotlightManager,
  SpotlightTarget,
  SpotlightTransition
} from '@atlaskit/onboarding'
import { isMobile } from 'react-device-detect'
import env from '../typedEnv'
import { transferStates } from '../actions/transferActions'
import MuiLink from '@material-ui/core/Link'
import url from '../url'
import { spacing, fontSize } from '../styles/base'
import { uiColors } from '../styles/color'
import { headers, textValues } from '../styles/typography'

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
    active: this.props.profile.newUser ? 0 : null,
    expanded: false
  }

  start = () => this.setState({ active: 0 })

  next = () => this.setState(
    state => ({ active: state.active + 1 })
  )

  finish = () => {
    this.setState({ active: null })
    this.props.setNewUserTag(false)
  }

  renderActiveSpotlight = () => {
    const { classes } = this.props
    let headerComponent = (headerText) => {
      return (
        <Typography className={classes.spotlightHeaderText}>{headerText}</Typography>
      )
    }
    const devVariants = [
      <Spotlight
        actions={[
          {
            onClick: this.next,
            text: <Typography className={classes.spotlightbtnText}>Next</Typography>
          }
        ]}
        actionsBeforeElement={<Typography className={classes.spotlightStepText}>1/3</Typography>}
        heading='Drive Wallet'
        header={((props) => {
          return headerComponent(props.children[0].props.children)
        })}
        target='one'
        key='one'
        targetBgColor='#fff'
        pulse={false}
        dialogPlacement='left middle'
      >
        <Typography className={classes.spotlightBodyText}>
          {`Welcome to Chainsfr!` +
            `We have set up a Drive Wallet for you to get familiar with our transfer feature.`}
        </Typography>
      </Spotlight>,
      <Spotlight
        actionsBeforeElement={<Typography className={classes.spotlightStepText}>2/3</Typography>}
        actions={[
          { onClick: this.next, text: <Typography className={classes.spotlightbtnText}>Next</Typography> }
        ]}
        heading='Free Testing ETH'
        header={((props) => {
          return headerComponent(props.children[0].props.children)
        })}
        target='two'
        key='two'
        targetBgColor='#fff'
        pulse={false}
        dialogPlacement='right middle'
      >
        <Typography className={classes.spotlightBodyText}>
          We have loaded you up with some free ETH on the test network Rinkeby.
        </Typography>
      </Spotlight>,
      <Spotlight
        actionsBeforeElement={<Typography className={classes.spotlightStepText}>3/3</Typography>}
        actions={[{ onClick: this.finish, text: <Typography className={classes.spotlightbtnText}>Done</Typography> }]}
        heading='Start Transfering'
        header={((props) => {
          return headerComponent(props.children[0].props.children)
        })}
        target='three'
        key='three'
        targetBgColor='#fff'
        pulse={false}
        dialogPlacement='right middle'
      >
        <Typography className={classes.spotlightBodyText}>
          Now it is the right time to try our transfer feature. Click on Arrange Transfer to start.
        </Typography>
      </Spotlight>
    ]

    const prodVariants = [
      <Spotlight
        actions={[
          {
            onClick: this.next,
            text: <Typography className={classes.spotlightbtnText}>Next</Typography>
          }
        ]}
        actionsBeforeElement={<Typography className={classes.spotlightStepText}>1/2</Typography>}
        heading='Drive Wallet'
        header={((props) => {
          return headerComponent(props.children[0].props.children)
        })}
        target='one'
        key='one'
        targetBgColor='#fff'
        pulse={false}
        dialogPlacement='left middle'
      >
        <Typography className={classes.spotlightBodyText}>
          {`Welcome to Chainsfr!` +
            `We have set up a Drive Wallet for you to get familiar with our transfer feature.`}
        </Typography>
      </Spotlight>,
      <Spotlight
        actionsBeforeElement={<Typography className={classes.spotlightStepText}>2/2</Typography>}
        actions={[{ onClick: this.finish, text: <Typography className={classes.spotlightbtnText}>Done</Typography> }]}
        heading='Start Transfering'
        header={((props) => {
          return headerComponent(props.children[0].props.children)
        })}
        target='three'
        key='three'
        targetBgColor='#fff'
        pulse={false}
        dialogPlacement='right middle'
      >
        <Typography className={classes.spotlightBodyText}>
          Now it is the right time to try our transfer feature. Click on Arrange Transfer to start.
        </Typography>
      </Spotlight>
    ]

    if (
      this.state.active == null ||
      this.props.actionsPending.getTransferHistory ||
      this.props.actionsPending.getCloudWallet ||
      isMobile
    ) return null

    // Skip variants[1] in prod env
    if (env.NODE_ENV === 'production') return prodVariants[this.state.active]

    return devVariants[this.state.active]
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
            <Grid container direction='row' alignItems='center' justify='center' >
              <Typography>
                {transfer.data.error}
              </Typography>
            </Grid>
          </ExpansionPanelSummary>
        </ExpansionPanel>
      )
    }

    let secondaryDesc = null
    if (transfer.state === transferStates.SEND_CONFIRMED_RECEIVE_CONFIRMED) {
      secondaryDesc = 'received on ' + moment.unix(transfer.receiveTimestamp).format('MMM Do YYYY, HH:mm:ss')
    } else if (transfer.state === transferStates.SEND_CONFIRMED_CANCEL_CONFIRMED) {
      secondaryDesc = 'cancelled on ' + moment.unix(transfer.cancelTimestamp).format('MMM Do YYYY, HH:mm:ss')
    } else {
      // pending receive
      secondaryDesc = 'sent on ' + moment.unix(transfer.sendTimestamp).format('MMM Do YYYY, HH:mm:ss')
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
          <Grid container direction='row' alignItems='center' >
            <Grid xs={8} item>
              <ListItemText
                primary={
                  `${transfer.transferType === 'SENDER' ? 'To' : 'From'} ${transfer.destination}`
                }
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
                  <Typography align='right' className={classes.recentTransferItemTransferCurrencyAmount}>
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
                Transfer ID: {transfer.transferType === 'SENDER' ? transfer.sendingId : transfer.receivingId}
              </Typography>
            </Grid>
            {transfer.password &&
            <Grid item>
              <Typography className={classes.recentTransferItemTransferId}>
                Security Answer: {transfer.password}
              </Typography>
            </Grid>
            }
            {transfer.message &&
            <Grid item>
              <Typography className={classes.recentTransferItemTransferMessage}>
                Message: {transfer.message}
              </Typography>
            </Grid>
            }
            {[transferStates.SEND_PENDING,
              transferStates.SEND_FAILURE,
              transferStates.SEND_CONFIRMED_CANCEL_PENDING].includes(transfer.state) &&
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
            }
            {[transferStates.SEND_CONFIRMED_RECEIVE_EXPIRED,
              transferStates.SEND_CONFIRMED_RECEIVE_NOT_INITIATED].includes(transfer.state) &&
              <Grid item>
                <Button
                  color='primary'
                  component={Link}
                  target='_black'
                  to={`cancel?id=${transfer.sendingId}`}
                  className={classes.recentTransferItemCancelBtn}
                >
                  Cancel Transfer
                </Button>
              </Grid>
            }
          </Grid>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    )
  }

  renderWalletSection = (props) => {
    const { classes, actionsPending, cloudWallet, walletBalanceCurrencyAmount } = this.props
    // Do not remove <div style={{ padding: 10 }}>
    // See https://material-ui.com/components/grid/#limitations
    return (
      <Grid container alignItems='center' justify='center' className={classes.coloredBackgrond}>
        <Grid item className={classes.sectionContainer}>
          <Grid container direction='column'>
            <Grid item>
              <Typography className={classes.balanceTitleText}>
                My Balance
              </Typography>
            </Grid>

            <Grid item className={classes.verticalMarginL}>
              <div style={{ padding: 10 }}>
                <Grid container direction='row' alignItems='center' spacing={5}>
                  {walletCryptoSupports['drive'].map((c, i) => {
                    c = getCrypto(c.cryptoType)
                    return (
                      <Grid item sm={4} key={i} xs={12} >
                        <Grid container direction='column' alignItems='center' justify='center' className={classes.balanceContainer}>
                          <SpotlightTarget name={c.cryptoType === 'ethereum' ? 'two' : undefined}>
                            <Grid item>
                              {cloudWallet.crypto[c.cryptoType] && !actionsPending.getCloudWallet
                                ? <>
                                  <Grid container direction='row' alignItems='center' justify='center'>
                                    <Typography align='left' className={classes.balanceText}>
                                      {numeral(utils.toHumanReadableUnit(cloudWallet.crypto[c.cryptoType][0].balance, getCryptoDecimals(c.cryptoType))).format('0.000[000]')}
                                    </Typography>
                                    <Typography align='right' className={classes.balanceCurrencyText}>
                                      (≈ {walletBalanceCurrencyAmount[c.cryptoType]})
                                    </Typography>
                                  </Grid>
                                </>
                                : <CircularProgress color='primary' />
                              }
                              <Typography className={classes.cryptoTypeText} align='center'>{c.symbol}</Typography>
                            </Grid>
                          </SpotlightTarget>
                        </Grid>
                      </Grid>
                    )
                  })}
                </Grid>
              </div>
            </Grid>

            <Grid item className={classes.verticalMarginL}>
              <div style={{ padding: 8 }}>
                <Grid container direction='row' alignItems='center' justify='center' spacing={4}>
                  <Grid item >
                    <SpotlightTarget name='one'>
                      <Button
                        variant='contained'
                        component={Link}
                        to={path.wallet}
                        className={classes.viewDriveWalletBtn}
                      >
                        View Drive Wallet
                      </Button>
                    </SpotlightTarget>
                  </Grid>
                  <Grid item >
                    <SpotlightTarget name='three'>
                      <Button
                        variant='contained'
                        component={Link}
                        to={path.transfer}
                        className={classes.startTransferBtn}
                      >
                        Start Transfer
                      </Button>
                    </SpotlightTarget>
                  </Grid>
                </Grid>
              </div>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    )
  }

  renderTransferHistorySection = () => {
    const { classes, actionsPending, transferHistory, loadMoreTransferHistory } = this.props
    return (
      <Grid container alignItems='center' justify='center' className={classes.transactionHistorySection}>
        <Grid item className={classes.sectionContainer}>
          <Grid container direction='column' justify='center' alignItems='stretch'>
            <Grid item>
              <Grid container direction='row'>
                <Grid item>
                  <Typography className={classes.recentTxTitle} >
                    Recent Transactions
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid style={{ minHeight: '300px', maxHeight: '500px', overflow: 'auto' }}>
              <InfiniteScroll
                loader={
                  actionsPending.getTransferHistory &&
                  <Grid container direction='row' justify='center' key={0} alignItems='center'>
                    <CircularProgress color='primary' style={{ marginTop: '30px' }} />
                  </Grid>
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
                  <Grid container direction='row' alignItems='center' >
                    <Grid item xs={8}>
                      <Typography className={classes.txHistoryTitleText}>
                        Transaction
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Grid container alignItems='center' justify='space-between'>
                        <Grid item>
                          <Typography className={classes.txHistoryTitleText}>
                            Status
                          </Typography>
                        </Grid>
                        <Grid item>
                          <Typography className={classes.txHistoryTitleText}>
                            Amount
                          </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                <Divider />
                {!actionsPending.getTransferHistory && transferHistory.history.length === 0 &&
                  <Grid container justify='center'>
                    <Typography className={classes.noTxText}>
                      It seems you don't have any transactions yet
                    </Typography>
                  </Grid>
                }
                {transferHistory.history.map((transfer, i) => this.renderRecentTransferItem(transfer, i))}
              </InfiniteScroll>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    )
  }

  render () {
    return (
      <SpotlightManager blanketIsTinted={false}>

        <Grid container direction='column'>
          <Grid item >
            {this.renderWalletSection()}
          </Grid>
          <Grid item>
            {this.renderTransferHistorySection()}
          </Grid>
          <SpotlightTransition>
            {this.renderActiveSpotlight()}
          </SpotlightTransition>
        </Grid>
      </SpotlightManager>
    )
  }
}

const styles = theme => ({
  sectionContainer: {
    width: '100%',
    maxWidth: '1200px',
    margin: `0px ${spacing.s} 0px ${spacing.s}`,
    paddingTop: spacing.l,
    paddingBottom: spacing.l
  },
  coloredBackgrond: {
    backgroundColor: '#FAFBFE'
  },
  balanceContainer: {
    height: '120px',
    border: `1px solid ${uiColors.white}`,
    boxShadow: `0px 2px 4px rgba(51, 51, 51, 0.1)`,
    backgroundColor: uiColors.white,
    borderRadius: '8px'
  },
  balanceTitleText: {
    ...headers.h2,
    marginLeft: '10px',
    fontWeight: '600'
  },
  balanceText: {
    fontSize: fontSize.xl.size,
    lineHeight: fontSize.xl.lineHeight,
    fontWeight: '600',
    color: '#333333'
  },
  balanceCurrencyText: {
    ...textValues.textSmall,
    marginLeft: '5px',
    color: '#777777'
  },
  verticalMarginL: {
    marginTop: spacing.l,
    marginBottom: spacing.l
  },
  expansionPanelRoot: {
    boxShadow: 'none',
    marginTop: '0px'
  },
  expansionPanelExpanded: {
    marginTop: 'auto'
  },
  btnContainer: {
    margin: '10px 10px 10px 10px'
  },
  recentTxTitle: {
    ...headers.h2,
    fontWeight: '600'
  },
  cryptoTypeText: {
    color: '#777777',
    fontSize: '18px',
    lineHeight: '21px'
  },
  viewAllTxTitle: {
    ...headers.h4,
    color: '#396EC8'
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
  startTransferBtn: {
    backgroundColor: '#393386',
    borderRadius: '4px',
    color: '#ffffff',
    boxShadow: 'none',
    textTransform: 'none',
    fontWeight: '600'
  },
  viewDriveWalletBtn: {
    border: '1px solid #393386',
    boxSizing: 'border-box',
    borderRadius: '4px',
    backgroundColor: '#FAFBFE',
    color: '#393386',
    boxShadow: 'none',
    textTransform: 'none',
    fontWeight: '600'
  },
  spotlightHeaderText: {
    color: '#ffffff',
    marginBottom: '10px',
    fontSize: '18px',
    fontWeight: '500'
  },
  spotlightBodyText: {
    color: '#ffffff',
    fontSize: '14px'
  },
  spotlightStepText: {
    color: '#ffffff',
    fontSize: '12px'
  },
  spotlightbtnText: {
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '500'
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
