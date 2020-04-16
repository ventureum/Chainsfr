import React, { Component } from 'react'
import Box from '@material-ui/core/Box'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Link from '@material-ui/core/Link'
import { withStyles } from '@material-ui/core/styles'
import GoogleLoginButton from './GoogleLoginButton'
import classNames from 'classnames'
import env from '../typedEnv'
import { ReceiveTransferDataSection } from './ReceiveFormComponent'
import ChainsfrLogoSVG from '../images/logo_chainsfr_617_128.svg'
import ChainsfrLogoDemoSVG from '../images/logo_chainsfr_demo_852_128.svg'

const data = {
  descriptions: [
    {
      title: 'Pay Crypto via Email',
      content: 'No more nonsensical crypto address.'
    },
    {
      title: 'Control Your Payment',
      content: 'Send in seconds. Cancel if needed.'
    },
    {
      title: 'Connect to Popular Wallets',
      content: 'Coinbase, MetaMask, Ledger, and more.'
    },
    {
      title: 'Own Your Asset',
      content: 'Non-Custodial, end-to-end encrypted.'
    },
    {
      title: 'All within Google',
      content: 'Login, manage, auto-backup.'
    }
  ],
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

    if (renderReceiveLogin) {
      return this.renderReceiveLogin()
    } else if (renderReceiptLogin) {
      return this.renderReceiptLogin()
    }

    return (
      <Grid container className={classNames(classes.container, classes.containerInfo)}>
        <Grid item md={6} className={classes.faqContainer}>
          {data.descriptions.map((item, i) => (
            <Grid className={classes.leftContainer} key={i}>
              <Typography
                align='left'
                className={classNames(classes.faqTitle, classes.faqFontColor)}
              >
                {item.title}
              </Typography>
              <Typography
                align='left'
                className={classNames(classes.faqContent, classes.faqFontColor)}
              >
                {item.content}
              </Typography>
            </Grid>
          ))}
        </Grid>
        <Grid item md={6} className={classes.loginContainer}>
          <Box flexGrow={1}>
            <Box display='flex' my={10}>
              <Box display='flex' flexDirection='column' alignItems='center' mx='auto'>
                <Box width='300'>
                  <img
                    className={classes.chainsfrLogo}
                    src={isMainNet ? ChainsfrLogoSVG : ChainsfrLogoDemoSVG}
                    alt='Chainsfr Logo'
                  />
                </Box>
                <Box mt={4} width={300}>
                  <GoogleLoginButton onSuccess={this.loginSuccess} onFailure={this.loginFailure} />
                </Box>
                <Box mt={3}>
                  <Link
                    className={classes.linkText}
                    variant='caption'
                    align='center'
                    color='textSecondary'
                    href={data.termURL}
                    target='_blank'
                  >
                    Term and Use
                  </Link>
                </Box>
              </Box>
            </Box>
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
  containerInfo: {
    backgroundColor: '#393386'
  },
  chainsfrLogo: {
    height: 40,
    margin: 'auto'
  },
  faqContainer: {
    paddingTop: 30,
    paddingBottom: 30,
    margin: 'auto',
    order: 3,
    '@media screen and (min-width: 960px) ': {
      order: 1
    }
  },
  loginContainer: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#fff',
    order: 2
  },
  btnContainer: {
    display: 'flex',
    maxHeight: 40,
    position: 'relative',
    justifyContent: 'center'
  },
  leftContainer: {
    padding: 20,
    margin: 'auto',
    maxWidth: 480
  },
  faqFontColor: {
    color: '#FFF'
  },
  faqTitle: {
    fontFamily: 'Poppins',
    fontSize: 20,
    lineHeight: '40px',
    fontWeight: 500
  },
  faqContent: {
    color: '#c4c4d8',
    fontFamily: 'Poppins',
    fontSize: 16,
    lineHeight: '20px',
    fontWeight: 400
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
  },
  linkText: {
    fontFamily: 'Poppins'
  }
})

export default withStyles(styles)(LoginComponent)
