import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Link from '@material-ui/core/Link'
import { withStyles } from '@material-ui/core/styles'
import CircularProgress from '@material-ui/core/CircularProgress'
import GoogleLoginButton from './GoogleLoginButton'
import ChainsfrLogo from '../images/chainsfr_logo.svg'
import ChainsfrLogoWhite from '../images/chainsfr_logo_white.svg'
import classNames from 'classnames'
import env from '../typedEnv'

const data = {
  mainNet:
  {
    faq:
    [
      {
        title: 'Do I need a Chainsfer account?',
        content: 'No. You only need a Google account. You can track the status of your transaction through the link in your email.'
      },
      {
        title: 'Why sign in with Google?',
        content: 'Chainsfer service uses your Google account to store your crypto wallet and transfer information.'
      },
      {
        title: 'Is Chainsfer related to Google?',
        content: 'No. Chainsfer is registered as a third party apps using Google Drive APIs.'
      }
    ],
    faqURL: env.REACT_APP_FAQ_URL,
    loginURL: env.REACT_APP_ENTRYPOINT_MAINNET_URL,
    loginTitle: 'Chainsfr',
    linkText: 'Try Chainsfer TestNet',
    backgroundColor: '#F6F9FE',
    fontColor: '#1E0E62'
  },
  testNet:
  {
    faq: [
      {
        title: 'What is chainsfr TestNet?',
        content: 'It is an alternative block chain, to be used for testing features.'
      },
      {
        title: 'Does TestNet coin have value?',
        content: 'Chainsfer service uses your Google account to store your crypto wallet and transfer information.'
      },
      {
        title: 'How does it work?',
        content: 'No. Chainsfer is registered as a third party apps using Google Drive APIs.'
      }
    ],
    faqURL: env.REACT_APP_FAQ_TESTNET_URL,
    loginURL: env.REACT_APP_ENTRYPOINT_TESTNET_URL,
    loginTitle: 'Chainsfr TestNet',
    linkText: 'Switch to Main App',
    backgroundColor: '#393386',
    fontColor: '#FFF'
  }
}

class LoginComponent extends Component {
  loginSuccess = async (response) => {
    this.props.onLogin(response)
  }

  loginFailure = async (response) => {
    console.log(response)
  }

  render () {
    let { classes, actionsPending, isMainNet } = this.props

    const envSuffix = isMainNet ? 'MainNet' : 'TestNet'

    return (
      <Grid container justify='center' className={classNames(classes.container, classes[`container${envSuffix}`])}>
        <Grid container direction='row' className={classes.centerContainer}>
          <Grid item md={12} className={classes.header}>
            <img className={classes.chainsfrLogo} src={isMainNet ? ChainsfrLogo : ChainsfrLogoWhite} alt='Chainsfr Logo' />
          </Grid>
          <Grid container direction='row'>
            <Grid item md={6}>
              <Grid><Typography variant='h4' gutterBottom className={classNames(classes.faqSectionTitle, classes[`faqFontColor${envSuffix}`])}>FAQ</Typography></Grid>
              {isMainNet &&
                data.mainNet.faq.map((item, i) => (
                  <Grid className={classes.leftContainer} key={i}>
                    <Typography variant='h6' className={classNames(classes.faqTitle, classes[`faqFontColor${envSuffix}`])}>{item.title}</Typography>
                    <Typography className={classNames(classes.faqContent, classes[`faqFontColor${envSuffix}`])}>{item.content}</Typography>
                  </Grid>
                ))
              }
              {!isMainNet &&
                data.testNet.faq.map((item, i) => (
                  <Grid className={classes.leftContainer} key={i}>
                    <Typography variant='h6' className={classNames(classes.faqTitle, classes[`faqFontColor${envSuffix}`])}>{item.title}</Typography>
                    <Typography className={classNames(classes.faqContent, classes[`faqFontColor${envSuffix}`])}>{item.content}</Typography>
                  </Grid>
                ))
              }
              <Grid className={classes.leftContainer}>
                <Button className={isMainNet ? classes.btnOutlinedDark : classes.btnOutlinedWhite} href={isMainNet ? data.mainNet.faqURL : data.testNet.faqURL} target='_blank' >Learn More</Button>
              </Grid>
            </Grid>
            <Grid item md={6}>
              <Paper className={classes.paperContainter}>
                <Grid>
                  <Typography variant='h3' align='center' gutterBottom className={classes.loginTitle}>{isMainNet ? data.mainNet.loginTitle : data.testNet.loginTitle}</Typography>
                  <Typography align='center' gutterBottom className={classes.loginContent}>Send cryptocurrency using email</Typography>
                </Grid>
                <Grid item align='center' className={classes.paperButtons}>
                  <Grid className={classes.wrapper}>
                    <GoogleLoginButton onSuccess={this.loginSuccess}
                      onFailure={this.loginFailure}
                      disabled={actionsPending.getCloudWallet} />
                    {
                      actionsPending.getCloudWallet &&
                      <CircularProgress size={24} color='primary'className={classes.buttonProgress} />
                    }
                  </Grid>
                  <Link href={isMainNet ? data.testNet.loginURL : data.mainNet.loginURL} className={classes.paperBtnLink}>{isMainNet ? data.mainNet.linkText : data.testNet.linkText}</Link>
                </Grid>
                <Grid item container className={classes.paperFooter} justify='center'>
                  <Link href='#' variant='caption' align='center' color='textSecondary'>Term and Use</Link>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    // </Container>
    )
  }
}

const styles = theme => ({
  root: {
    flex: 1
  },
  container: {
    '@media (min-width: 380px) and (max-width : 751px)': {
      maxWidth: '380px'
    },
    '@media (min-width: 752px) and (max-width : 1129px)': {
      maxWidth: '752px'
    },
    '@media (min-width: 1130px) and (max-width : 1489px)': {
      maxWidth: '960px'
    },
    '@media (min-width: 1490px) ': {
    }
  },
  containerMainNet: {
    backgroundColor: '#F6F9FE'
  },
  containerTestNet: {
    backgroundColor: '#393386'
  },
  header: {
    paddingTop: 60,
    paddingBottom: 60
  },
  chainsfrLogo: {
    width: 180
  },
  paperContainter: {
    padding: 60
  },
  paperButtons: {
    marginBottom: 30
  },
  paperBtnLink: {
    fontFamily: 'Poppins',
    fontSize: 14,
    fontWeight: 500,
    color: '#4285F4'
  },
  paperFooter: {
    paddingTop: 20,
    borderTop: 'solid 1px #e9e9e9'
  },
  wrapper: {
    padding: 30,
    maxHeight: 60,

    '&:first-child p': {
      padding: 15,
      fontFamily: 'Poppins',
      fontSize: 16
    }
  },
  leftContainer: {
    paddingTop: 30,
    paddingBottom: 30,
    maxWidth: 480
  },
  faqFontColorMainNet: {
    color: '#1E0E62'
  },
  faqFontColorTestNet: {
    color: '#FFF'
  },
  faqSectionTitle: {
    fontFamily: 'Poppins',
    fontSize: 24,
    fontWeight: 700
  },
  faqTitle: {
    fontFamily: 'Poppins',
    fontSize: 18,
    fontWeight: 500
  },
  faqContent: {
    fontFamily: 'Poppins',
    fontWeight: 400
  },
  loginTitle: {
    fontFamily: 'Poppins',
    fontWeight: 700,
    fontSize: 42,
    color: '#1E0E62'
  },
  loginContent: {
    fontFamily: 'Poppins',
    fontWeight: 400,
    fontSize: 18,
    color: '#1E0E62'
  },
  centerContainer: {
    maxWidth: '1080px',
    width: '100%'
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  },
  btnOutlinedDark: {
    border: '1px solid #EBEAED',
    borderRadius: 100,
    padding: '10px 20px',
    fontFamily: 'Poppins',
    fontWeight: 500,
    fontSize: '16px',
    textTransform: 'capitalize',
    lineHeight: '22px',
    color: '#1E0E62'
  },
  btnOutlinedWhite: {
    border: '1px solid #FFFFFF',
    borderRadius: 100,
    padding: '10px 20px',
    fontFamily: 'Poppins',
    fontWeight: 500,
    fontSize: '16px',
    textTransform: 'capitalize',
    lineHeight: '22px',
    color: '#FFF'
  }
})

export default withStyles(styles)(LoginComponent)
