import React, { Component } from 'react'
import Box from '@material-ui/core/Box'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Link from '@material-ui/core/Link'
import { withStyles } from '@material-ui/core/styles'
import GoogleLoginButton from './GoogleLoginButton'
import classNames from 'classnames'
import env from '../typedEnv'
import { ReceiveTransferDataSection } from './ReceiveFormComponent'

const data = {
  mainNet: {
    faq: [
      {
        title: 'Do I need a Chainsfr account?',
        content:
          'No. You only need a Google account. You can track the status of your transaction through the link in your email.'
      },
      {
        title: 'Why sign in with Google?',
        content:
          'Chainsfr service uses your Google account to store your crypto wallet and transfer information.'
      },
      {
        title: 'Is Chainsfr related to Google?',
        content: 'No. Chainsfr is registered as a third party apps using Google Drive APIs.'
      }
    ],
    faqURL: env.REACT_APP_FAQ_URL,
    loginTitle: 'Chainsfr',
    linkText: 'Try it on Testnet',
    backgroundColor: '#F6F9FE',
    fontColor: '#1E0E62'
  },
  testNet: {
    faq: [
      {
        title: 'What is testnet?',
        content:
          'The testnet is an alternative blockchain, to be used for testing. Testnet coins are separate and distinct from actual coins, and are never supposed to have any value.'
      },
      {
        title: 'Why sign in with Google?',
        content:
          'Chainsfr service uses your Google account to store your crypto wallet and transfer information.'
      },
      {
        title: 'How does it work?',
        content:
          'Ethereum testnet coins are provided when you first log in, and can be used for testing transfer functionalities.'
      }
    ],
    faqURL: env.REACT_APP_FAQ_URL,
    loginTitle: 'Chainsfr Testnet',
    linkText: 'Switch to Mainnet',
    backgroundColor: '#393386',
    fontColor: '#FFF'
  },
  termURL: env.REACT_APP_TERMS_URL
}

class LoginComponent extends Component {
  loginSuccess = async response => {
    this.props.onGoogleLoginReturn(response)
  }

  loginFailure = async response => {
    console.log(response)
  }

  renderLoginBtn = () => {
    const { classes } = this.props
    return (
      <Grid className={classes.btnContainer}>
        <GoogleLoginButton onSuccess={this.loginSuccess} onFailure={this.loginFailure} />
      </Grid>
    )
  }

  renderReceiveLogin = () => {
    let { transfer, sendTime, receiveTime, cancelTime, currencyAmount } = this.props

    let isInvalidTransfer = false
    if (transfer) {
      var { receiveTxHash, cancelTxHash } = transfer
      if (receiveTxHash || cancelTxHash) isInvalidTransfer = true
    }

    return (
      <Box display='flex' flexDirection='column' alignItems='center'>
        <Box width='100%' maxWidth='560px' pt={3}>
          <Box display='flex' flexDirection='column' padding='0px 10px 0px 10px'>
            <ReceiveTransferDataSection
              transfer={transfer}
              sendTime={sendTime}
              receiveTime={receiveTime}
              cancelTime={cancelTime}
              currencyAmount={currencyAmount}
            />
            {!isInvalidTransfer && (
              <Box maxWidth={480} mt={3} width='100%' alignSelf='center'>
                {this.renderLoginBtn()}
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    )
  }

  renderReceiptLogin = () => {
    let { classes } = this.props
    return (
      <Grid container direction='column' alignItems='center'>
        {/* struct copied from ReceiveComponent */}
        <Grid item className={classes.sectionContainer}>
          <Grid container direction='column'>
            <Grid item>
              <Grid container direction='column' alignItems='center'>
                <Grid item className={classes.subComponent}>
                  <Grid
                    container
                    direction='column'
                    justify='center'
                    alignItems='stretch'
                    spacing={2}
                  >
                    <Grid container direction='column' spacing={4}>
                      <Grid item>
                        <Grid container direction='column' justify='center' align='center'>
                          <Typography variant='h3'> Please login to view this receipt </Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item>{this.renderLoginBtn()}</Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    )
  }

  render () {
    let { classes, renderReceiveLogin, renderReceiptLogin, isMainNet } = this.props

    const envSuffix = isMainNet ? 'MainNet' : 'TestNet'

    if (renderReceiveLogin) {
      return this.renderReceiveLogin()
    } else if (renderReceiptLogin) {
      return this.renderReceiptLogin()
    }

    return (
      <Grid container className={classNames(classes.container, classes[`container${envSuffix}`])}>
        <Grid className={classes.faqContainer} container md={6} justify='center'>
          <Box mt={6} mx='auto'>
            <Grid>
              <Typography
                variant='h4'
                display='inline'
                gutterBottom
                className={classNames(classes.faqSectionTitle, classes[`faqFontColor${envSuffix}`])}
              >
                FAQ
              </Typography>
            </Grid>
            {isMainNet &&
              data.mainNet.faq.map((item, i) => (
                <Grid className={classes.leftContainer} key={i}>
                  <Typography
                    align='left'
                    className={classNames(classes.faqTitle, classes[`faqFontColor${envSuffix}`])}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    align='left'
                    className={classNames(classes.faqContent, classes[`faqFontColor${envSuffix}`])}
                  >
                    {item.content}
                  </Typography>
                </Grid>
              ))}
            {!isMainNet &&
              data.testNet.faq.map((item, i) => (
                <Grid className={classes.leftContainer} key={i}>
                  <Typography
                    align='left'
                    className={classNames(classes.faqTitle, classes[`faqFontColor${envSuffix}`])}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    align='left'
                    className={classNames(classes.faqContent, classes[`faqFontColor${envSuffix}`])}
                  >
                    {item.content}
                  </Typography>
                </Grid>
              ))}
            <Grid className={classes.leftContainer}>
              <Button
                className={isMainNet ? classes.btnOutlinedDark : classes.btnOutlinedWhite}
                href={isMainNet ? data.mainNet.faqURL : data.testNet.faqURL}
                target='_blank'
              >
                Learn More
              </Button>
            </Grid>
          </Box>
        </Grid>
        <Grid item md={6} className={classes.loginContainer}>
          <Box mt={12}>
            <Grid item xs>
              <Typography variant='h3' align='center' className={classes.loginTitle}>
                {isMainNet ? data.mainNet.loginTitle : data.testNet.loginTitle}
              </Typography>
              <Typography align='center' className={classes.loginContent}>
                Send cryptocurrency by email
              </Typography>
            </Grid>
            <Grid item align='center' className={classes.paperButtons}>
              <Grid className={classes.btnContainer}>
                <GoogleLoginButton onSuccess={this.loginSuccess} onFailure={this.loginFailure} />
              </Grid>
            </Grid>
            <Grid item container className={classes.paperFooter} justify='center'>
              <Box mb={6}>
                <Link
                  variant='caption'
                  align='center'
                  color='textSecondary'
                  href={data.termURL}
                  target='_blank'
                >
                  Term and Use
                </Link>
              </Box>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    )
  }
}

const styles = theme => ({
  container: {
    width: '100%',
    flexGrow: 1
  },
  centerContainer: {
    '@media (min-width: 380px) and (max-width : 751px)': {
      maxWidth: '380px'
    },
    '@media (min-width: 752px) and (max-width : 959px)': {
      maxWidth: '480px'
    },
    '@media (min-width: 960px) and (max-width : 1129px)': {
      maxWidth: '960px'
    },
    '@media (min-width: 1130px) and (max-width : 1489px)': {
      maxWidth: '1080px'
    },
    '@media (min-width: 1490px) ': {
      maxWidth: '1080px'
    },
    height: '100%'
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
    width: 180,
    marginLeft: 30
  },
  faqContainer: {
    marginBottom: 30,
    order: 3,
    '@media screen and (min-width: 960px) ': {
      order: 1
    }
  },
  loginContainer: {
    width: '100%',
    backgroundColor: '#fff',
    order: 2
  },
  paperContainter: {
    marginLeft: 30,
    marginRight: 30,
    marginBottom: 60,
    marginTop: 60
  },
  paperButtons: {
    marginTop: 30,
    marginBottom: 30
  },
  paperBtnLink: {
    fontFamily: 'Poppins',
    fontSize: 14,
    fontWeight: 500,
    color: '#4285F4'
  },
  paperFooter: {
    marginTop: 60
  },
  btnContainer: {
    display: 'flex',
    maxHeight: 40,
    position: 'relative',
    justifyContent: 'center'
  },
  leftContainer: {
    padding: 30,
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
    fontWeight: 700,
    paddingLeft: 30,
    paddingRight: 30
  },
  faqTitle: {
    fontFamily: 'Poppins',
    fontSize: 20,
    lineHeight: '40px',
    fontWeight: 500
  },
  faqContent: {
    fontFamily: 'Poppins',
    fontSize: 16,
    lineHeight: '20px',
    fontWeight: 400
  },
  loginTitle: {
    fontFamily: 'Poppins',
    fontWeight: 700,
    fontSize: 32,
    lineHeight: '48px',
    color: '#1E0E62'
  },
  loginContent: {
    fontFamily: 'Poppins',
    fontWeight: 400,
    fontSize: 18,
    lineHeight: '26px',
    color: '#1E0E62'
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
  },
  subComponent: {
    width: '100%',
    maxWidth: '680px',
    margin: '0px 0px 16px 0px',
    padding: '30px'
  },
  sectionContainer: {
    width: '100%',
    maxWidth: '1200px'
  }
})

export default withStyles(styles)(LoginComponent)
