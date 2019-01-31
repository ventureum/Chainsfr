import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles'
import { Link } from 'react-router-dom'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import Divider from '@material-ui/core/Divider'

const cryptoAbbreviationMap = {
  'ethereum': 'ETH',
  'bitcoin': 'BTC',
  'dai': 'DAI'
}

class Review extends Component {
  handleReviewNext = () => {
    const { metamask, transferForm, cryptoSelection, walletSelection } = this.props
    const { transferAmount, sender, destination, password } = transferForm
    // submit tx
    this.props.submitTx({
      fromWallet: metamask,
      walletType: walletSelection,
      cryptoType: cryptoSelection,
      transferAmount: transferAmount,
      destination: destination,
      sender: sender,
      password: password
    })
  }

  render () {
    const { classes, transferForm, cryptoSelection } = this.props
    const { transferAmount, sender, destination, password } = transferForm
    return (
      <Grid container direction='column' alignItems='center'>
        <Grid item className={classes.root}>
          <Grid container direction='column' justify='center' alignItems='stretch'>
            <Grid item>
              <Typography className={classes.title} variant='h6' align='center'>
                Review details of your transfer
              </Typography>
            </Grid>
            <Grid item>
              <Paper className={classes.reviewPaper} elevation={1}>
                <Grid container direction='row' justify='space-between' alignItems='center'>
                  <Grid item lg={6}>
                    <Typography className={classes.reviewLeftTitle} align='left'>
                      Transfer details
                    </Typography>
                  </Grid>
                </Grid>
                <Grid container direction='row' justify='space-between' alignItems='center'>
                  <Grid item lg={6}>
                    <Typography className={classes.reviewLeftSubtitle} align='left'>
                      You send
                    </Typography>
                  </Grid>
                  <Grid item lg={6}>
                    <Typography className={classes.reviewRightSubtitleLarge} align='right'>
                      {transferAmount} {cryptoAbbreviationMap[cryptoSelection]}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid container direction='row' justify='space-between' alignItems='center'>
                  <Grid item lg={6}>
                    <Typography className={classes.reviewLeftSubtitle} align='left'>
                      Your email
                    </Typography>
                  </Grid>
                  <Grid item lg={6}>
                    <Typography className={classes.reviewRightSubtitleSmall} align='right'>
                      {sender}
                    </Typography>
                  </Grid>
                </Grid>
                <Divider className={classes.reviewDivider} variant='middle' />
                <Grid container direction='row' justify='space-between' alignItems='center'>
                  <Grid item lg={6}>
                    <Typography className={classes.reviewLeftTitle} align='left'>
                      Recipient details
                    </Typography>
                  </Grid>
                </Grid>
                <Grid container direction='row' justify='space-between' alignItems='center'>
                  <Grid item lg={6}>
                    <Typography className={classes.reviewLeftSubtitle} align='left'>
                      Email
                    </Typography>
                  </Grid>
                  <Grid item lg={6}>
                    <Typography className={classes.reviewRightSubtitleSmall} align='right'>
                      {destination}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid container direction='row' justify='space-between' alignItems='center'>
                  <Grid item lg={6}>
                    <Typography className={classes.reviewLeftSubtitle} align='left'>
                      Security Answer
                    </Typography>
                  </Grid>
                  <Grid item lg={6}>
                    <Typography className={classes.reviewRightSubtitleSmall} align='right'>
                      {password}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            <Grid item>
              <Button
                className={classes.submitBtn}
                fullWidth
                variant='contained'
                color='primary'
                size='large'
                onClick={this.handleReviewNext}
              >
                Confirm and submit
              </Button>
              <Button
                className={classes.backBtn}
                fullWidth
                variant='contained'
                color='primary'
                size='large'
                component={Link}
                to={'/Transfer/SetReipientAndPin'}
              >
                Back
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    )
  }
}

const styles = theme => ({
  root: {
    width: '100%',
    maxWidth: '680px',
    margin: '0px 0px 16px 0px'
  },

  button: {
    marginTop: theme.spacing.unit,
    marginRight: theme.spacing.unit
  },
  actionsContainer: {
    marginBottom: theme.spacing.unit * 2
  },
  resetContainer: {
    padding: theme.spacing.unit * 3
  },
  stepper: {
    background: '#f1f1f1'
  },
  walletBtn: {
    width: '180px',
    height: '230px',
    padding: '10px 15px 25px',
    marginLeft: '10px',
    marginRight: '10px',
    borderRadius: '5px',
    backgroundColor: '#fff',
    transition: 'all .3s ease'
  },
  walletBtnLogo: {
    height: '100px'
  },
  walletBtnTittle: {
    fontWeight: '500',
    fontSize: '20px',
    marginBottom: '10px'
  },
  walletBtnDesc: {
    lineHeight: '20px',
    color: '#506175',
    fontSize: '14px'
  },
  cryptoIcon: {
    height: '100px',
    margin: theme.spacing.unit * 2
  },
  recipientSettingForm: {
    maxWidth: '400px'
  },
  reviewPaper: {
    minWidth: '339px',
    border: 'solid 1px #e2e6e8',
    borderRadius: '4px',
    padding: '24px'
  },
  stepContentContainer: {
    maxWidth: '400px'
  },
  continueBtn: {
    marginTop: '16px'
  },
  backBtn: {
    marginTop: '16px'
  },
  submitBtn: {
    marginTop: '16px',
    color: '#fff',
    backgroundColor: '#2ED06E'
  },
  title: {
    color: '#2e4369',
    fontSize: '28px',
    fontWeight: '800',
    lineHeight: '32px',
    fontFamily: 'Averta,Avenir W02,Avenir,Helvetica,Arial,sans-serif',
    padding: '16px 0 24px 0'
  },
  reviewLeftTitle: {
    color: '#829ca9',
    fontWeight: '600',
    letterSpacaing: '0',
    fontSize: '14px',
    lineHeight: '24px',
    fontFamily: 'Averta,Avenir W02,Avenir,Helvetica,Arial,sans-serif'
  },
  reviewLeftSubtitle: {
    color: '#5d7079',
    fontWeight: '400',
    letterSpacaing: '.016em',
    fontSize: '14px',
    lineHeight: '24px',
    fontFamily: 'Averta,Avenir W02,Avenir,Helvetica,Arial,sans-serif'
  },
  reviewRightSubtitleLarge: {
    color: '#2e4369',
    fontWeight: '600',
    letterSpacaing: '0',
    fontSize: '22px',
    lineHeight: '30px',
    fontFamily: 'Averta,Avenir W02,Avenir,Helvetica,Arial,sans-serif'
  },
  reviewRightSubtitleSmall: {
    color: '#2e4369',
    fontWeight: '400',
    letterSpacaing: '016em',
    fontSize: '16px',
    lineHeight: '24px',
    fontFamily: 'Averta,Avenir W02,Avenir,Helvetica,Arial,sans-serif'
  },
  reviewDivider: {
    marginTop: '16px',
    marginBottom: '16px'
  }
})

export default withStyles(styles)(Review)
