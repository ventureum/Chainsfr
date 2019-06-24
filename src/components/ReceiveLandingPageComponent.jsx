import React, { Component } from 'react'

import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Avatar from '@material-ui/core/Avatar'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import ReceiveLandingIllustration from '../images/receive-landing.svg'
import MuiLink from '@material-ui/core/Link'
import { Link } from 'react-router-dom'
import Paths from '../Paths.js'
import { getCryptoSymbol } from '../tokens'

class ReceiveLandingPageComponent extends Component {
  renderBtnSection = () => {
    let { isAuthenticated, transfer } = this.props
    let { receivingId } = transfer

    if (isAuthenticated) {
      // show 'Accept' button only for authenticated users
      return (
        <Grid item>
          <Button
            variant='outlined'
            color='primary'
            onClick={() => this.props.goToStep(1)}
            id='accept'
          >
            Accept
          </Button>
        </Grid>
      )
    } else {
      // show two buttons, one for guest, one for logging in
      return (
        <>
          <Grid item>
            <Button
              variant='outlined'
              color='primary'
              onClick={() => this.props.goToStep(1)}
              id='guest'
            >
              Guest
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant='contained'
              color='primary'
              component={Link}
              to={`${Paths.login}/?redirect=%2Freceive?id=${receivingId}`}
              id='loginGoogle'
            >
              Login with Google
            </Button>
          </Grid>
        </>
      )
    }
  }

  render () {
    const { actionsPending, transfer, classes, sendTime, receiveTime, cancelTime } = this.props
    if (transfer) {
      var { receivingId, receiveTxHash, cancelTxHash, sender, destination, transferAmount, cryptoType } = transfer
      var hasReceived = !!receiveTxHash
      var hasCancelled = !!cancelTxHash
    }

    return (
      <Grid container direction='row' alignItems='stretch' >
        <Grid item xl={7} lg={7} md={7} className={classes.leftColumn}>
          <Grid container direction='column' justify='center' alignItems='center'>
            <Grid item className={classes.leftContainer}>
              <img
                src={ReceiveLandingIllustration}
                alt={'landing-illustration'}
                className={classes.landingIllustration}
              />
              <Grid item className={classes.stepContainer}>
                <Grid item className={classes.stepTitleContainer}>
                  <Typography className={classes.stepTitle}>
                    Easy as 3 steps to complete the transfer
                  </Typography>
                </Grid>
                <Grid item className={classes.step}>
                  <Grid container direction='row'>
                    <Avatar className={classes.stepIcon}> 1 </Avatar>
                    <Typography align='left' className={classes.stepText}>
                      Log in to enter security answer
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item className={classes.step}>
                  <Grid container direction='row'>
                    <Avatar className={classes.stepIcon}> 2 </Avatar>
                    <Typography align='left' className={classes.stepText}>
                      Select the wallet to deposit
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item className={classes.step}>
                  <Grid container direction='row'>
                    <Avatar className={classes.stepIcon}> 3 </Avatar>
                    <Typography align='left' className={classes.stepText}>
                      Accept the transfer
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xl={5} lg={5} md={5}>
          <Grid item className={classes.rightContainer}>
            {(actionsPending.getTransfer || !transfer) ? <CircularProgress color='primary' />
              : <Grid container direction='column' justify='center' alignItems='stretch'>
                <Grid item className={classes.titleSection}>
                  <Grid container direction='column' justify='center' alignItems='flex-start'>
                    <Typography className={classes.title} variant='h6' align='left'>
                      {hasReceived && 'Transfer has been previously accepted'}
                      {hasCancelled && 'Transfer has been cancelled'}
                      {!hasReceived && !hasCancelled && 'Transaction pending'}
                    </Typography>
                    <Typography className={classes.transferId} align='left'>
                      {`Transfer ID: ${receivingId}`}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item className={classes.reviewItem}>
                  <Typography className={classes.reviewSubtitle} align='left'>
                   From
                  </Typography>
                  <Typography className={classes.reviewContent} align='left'>
                    {sender}
                  </Typography>
                </Grid>
                <Grid item className={classes.reviewItem}>
                  <Typography className={classes.reviewSubtitle} align='left'>
                   To
                  </Typography>
                  <Typography className={classes.reviewContent} align='left'>
                    {destination}
                  </Typography>
                </Grid>
                <Grid item className={classes.reviewItem}>
                  <Typography className={classes.reviewSubtitle} align='left'>
                   Amount
                  </Typography>
                  <Typography className={classes.reviewContent} align='left'>
                    {transferAmount} {getCryptoSymbol(cryptoType)}
                  </Typography>
                </Grid>
                <Grid item className={classes.reviewItem}>
                  <Typography className={classes.reviewSubtitle} align='left'>
                   Sent on
                  </Typography>
                  <Typography className={classes.reviewContent} align='left'>
                    {sendTime}
                  </Typography>
                </Grid>
                {(hasReceived || hasCancelled) &&
                <Grid item className={classes.reviewItem}>
                  <Typography className={classes.reviewSubtitle} align='left'>
                    {hasReceived && 'Received on'}
                    {hasCancelled && 'Cancelled on'}
                  </Typography>
                  <Typography className={classes.reviewContent} align='left'>
                    {hasReceived && receiveTime}
                    {hasCancelled && cancelTime}
                  </Typography>
                </Grid>
                }
                {(hasReceived || hasCancelled) &&
                <Grid item>
                  <Typography color='primary' className={classes.etherscanLink} align='left'>
                    <MuiLink
                      target='_blank'
                      rel='noopener'
                      href={`https://rinkeby.etherscan.io/tx/${(hasReceived && receiveTxHash) || (hasCancelled && cancelTxHash)}`}>
                      Check status on Etherscan
                    </MuiLink>
                  </Typography>
                </Grid>
                }
                {!hasReceived && !hasCancelled &&
                <Grid item className={classes.btnSection}>
                  <Grid container direction='row' justify='flex-start' spacing={3}>
                    { this.renderBtnSection() }
                  </Grid>
                </Grid>
                }
                <Grid item className={classes.helperTextSection}>
                  <Typography className={classes.helperText} align='left'>
                   Have questions? Please take a look at our FAQ
                  </Typography>
                </Grid>
              </Grid>}
          </Grid>
        </Grid>
      </Grid>
    )
  }
}

const styles = theme => ({
  leftColumn: {
    backgroundColor: '#F8F8F8'
  },
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
    fontSize: '14px'
  },
  stepIcon: {
    height: '25px',
    width: '25px',
    backgroundColor: theme.palette.primary.main,
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
  reviewSubtitle: {
    color: '#777777',
    fontSize: '12px',
    lineHeight: '17px'
  },
  reviewContent: {
    color: '#333333',
    fontSize: '18px',
    lineHeight: '24px'
  },
  reviewItem: {
    marginTop: '30px'
  },
  btnSection: {
    marginTop: '60px'
  },
  helperTextSection: {
    marginTop: '20px'
  },
  helperText: {
    color: '#777777',
    fontSize: '12px',
    fontWeight: '600',
    letterSpacing: '0.48px'
  },
  etherscanLink: {
    fontSize: '12px',
    fontWeight: '600'
  }
})

export default withStyles(styles)(ReceiveLandingPageComponent)
