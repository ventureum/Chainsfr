import React, { Component } from 'react'

import { withStyles } from '@material-ui/core/styles'
import { Link } from 'react-router-dom'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Avatar from '@material-ui/core/Avatar'
import Button from '@material-ui/core/Button'
import List from '@material-ui/core/List'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ExpansionPanel from '@material-ui/core/ExpansionPanel'
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary'
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import CircularProgress from '@material-ui/core/CircularProgress'
import { Scrollbars } from 'react-custom-scrollbars'
import SendLandingIllustration from '../images/send-landing.svg'
import moment from 'moment'
import { getCryptoSymbol } from '../tokens'

class LandingPageComponent extends Component {
  getIdAbbreviation = (id) => {
    return id.slice(0, 4) + '...' + id.slice(-4)
  }

  renderRecentTransferItem = (transfer) => {
    const { classes } = this.props

    let secondaryDesc = null
    let icon = null

    if (transfer.state === 'pending') {
      // pending receive
      secondaryDesc = 'sent on ' + moment.unix(transfer.sendTimestamp).format('MMM Do YYYY, HH:mm:ss')
    } else if (transfer.state === 'received') {
      secondaryDesc = 'received on ' + moment.unix(transfer.receiveTimestamp).format('MMM Do YYYY, HH:mm:ss')
    } else if (transfer.state === 'cancelled') {
      secondaryDesc = 'cancelled on ' + moment.unix(transfer.cancelTimestamp).format('MMM Do YYYY, HH:mm:ss')
    }

    return (
      <ExpansionPanel>
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
          {icon}
          <ListItemText primary={`To ${transfer.destination}`} secondary={secondaryDesc} />
          <ListItemSecondaryAction>
            <Grid container direction='row' justify='space-between' alignItems='center'>
              <Grid item>
                {transfer.state === 'pending' &&
                <Typography className={classes.recentTransferItemTransferStatusPending}>
                   Pending
                </Typography>
                }
                {transfer.state === 'received' &&
                <Typography className={classes.recentTransferItemTransferStatus}>
                   Received
                </Typography>
                }
                {transfer.state === 'cancelled' &&
                <Typography className={classes.recentTransferItemTransferStatus}>
                   Cancelled
                </Typography>
                }
              </Grid>
              <Grid item>
                <Typography className={classes.recentTransferItemTransferAmount}>
                  - {transfer.transferAmount} {getCryptoSymbol(transfer.cryptoType)}
                </Typography>
              </Grid>
            </Grid>
          </ListItemSecondaryAction>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <Grid container direction='column' justify='center' alignItems='flex-start'>
            <Grid item>
              <Typography className={classes.recentTransferItemTransferId}>
                Transfer ID: {transfer.sendingId}
              </Typography>
            </Grid>
            {transfer.state === 'pending' &&
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
  render () {
    const { classes, actionsPending, transferHistory } = this.props
    return (
      <Grid container direction='column' justify='center' alignItems='center'>
        {/* Center the entire container, this step is necessary to make upper and lower section to have same width */}
        <Grid item>
          {/* 'stretch' ensures upper and lower section align properly */}
          <Grid container direction='column' justify='center' alignItems='stretch' className={classes.root}>
            {/* Upper section */}
            <Grid item>
              <Grid container direction='row' alignItems='center'>
                <Grid item xl={6} lg={6} md={6} className={classes.leftColumn}>
                  <Grid container direction='column' justify='center' alignItems='center'>
                    <Grid item className={classes.leftContainer}>
                      <img
                        src={SendLandingIllustration}
                        alt={'landing-illustration'}
                        className={classes.landingIllustration}
                      />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xl={6} lg={6} md={6} className={classes.rightColumn}>
                  <Grid container direction='column' justify='center' alignItems='center'>
                    <Grid item className={classes.rightContainer}>
                      <Grid item className={classes.stepTitleContainer}>
                        <Typography className={classes.stepTitle}>
                          Send cryptocurrency directly to another person using email
                        </Typography>
                      </Grid>
                      <Grid item className={classes.step}>
                        <Grid container direction='row'>
                          <Avatar className={classes.stepIcon}> 1 </Avatar>
                          <Typography align='left' className={classes.stepText}>
                            Connect to your wallet
                          </Typography>
                        </Grid>
                      </Grid>
                      <Grid item className={classes.step}>
                        <Grid container direction='row'>
                          <Avatar className={classes.stepIcon}> 2 </Avatar>
                          <Typography align='left' className={classes.stepText}>
                            Set the amount, recipient email and security answer
                          </Typography>
                        </Grid>
                      </Grid>
                      <Grid item className={classes.step}>
                        <Grid container direction='row'>
                          <Avatar className={classes.stepIcon}> 3 </Avatar>
                          <Typography align='left' className={classes.stepText}>
                            Review and transfer
                          </Typography>
                        </Grid>
                      </Grid>
                      <Grid item className={classes.btnSection}>
                        <Grid container direction='row' justify='flex-start' spacing={24}>
                          <Grid item>
                            <Button
                              color='primary'
                              disabled
                            >
                              Request Payment
                            </Button>
                          </Grid>
                          <Grid item>
                            <Button
                              variant='contained'
                              color='primary'
                              onClick={() => this.props.goToStep(1)}
                            >
                              Arrange Transfer
                            </Button>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            {/* Lower section */}
            <Grid item>
              <Grid container direction='column' justify='center' alignItems='stretch'>
                <Typography className={classes.recentTxTitle} >
                  Recent Transactions
                </Typography>
                <Scrollbars style={{ height: 300 }}>
                  <List subheader={<li />}>
                    {actionsPending.getTransferHistory &&
                    <Grid container direction='row' justify='center' alignItems='center'>
                      <CircularProgress color='primary' />
                    </Grid>
                    }
                    {transferHistory && transferHistory.map((transfer) => this.renderRecentTransferItem(transfer))}
                  </List>
                </Scrollbars>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    )
  }
}

const styles = theme => ({
  leftContainer: {
    margin: '60px',
    maxWidth: '600px'
  },
  rightContainer: {
    margin: '60px'
  },
  landingIllustration: {
    maxWidth: '100%',
    marginBottom: '60px'
  },
  stepContainer: {
    padding: '30px'
  },
  stepTitleContainer: {
    marginBottom: '30px'
  },
  step: {
    marginBottom: '22px'
  },
  stepTitle: {
    color: '#333333',
    fontWeight: 'bold',
    fontSize: '18px'
  },
  stepText: {
    color: '#333333',
    fontSize: '18px'
  },
  stepIcon: {
    height: '34px',
    width: '34px',
    backgroundColor: '#FFFFFF',
    border: '2px solid #4285F4',
    color: theme.palette.primary.main,
    marginRight: '9.5px'
  },
  title: {
    color: '#333333',
    fontSize: '24px',
    fontWeight: '600',
    lineHeight: '36px',
    letterSpacing: '0.97px',
    padding: '0px 0px 0px 0px'
  },
  transferId: {
    color: '#777777',
    fontSize: '12px',
    lineHeight: '17px'
  },
  btnSection: {
    marginTop: '60px'
  },
  recentTxTitle: {
    color: '#333333',
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '30px'
  },
  recentTransferItemTransferAmount: {
    marginRight: '30px',
    marginLeft: '172px'
  },
  recentTransferItemTransferStatusPending: {
    borderRadius: '4px',
    backgroundColor: '#F5A623',
    color: 'white',
    padding: '5px 10px 5px 10px',
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
  }
})

export default withStyles(styles)(LandingPageComponent)
