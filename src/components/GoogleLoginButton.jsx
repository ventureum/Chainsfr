import React, { Component } from 'react'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import GoogleIcon from '../images/google-icon.svg'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import env from '../typedEnv'
import UnsupportedBrowserModal from './UnsupportedBrowserModal'
// for testing only
import { GOOGLE_LOGIN_AUTH_OBJ } from '../tests/e2e/mocks/user'
import UAParser from 'ua-parser-js'

const THIRD_PARTY_COOKIE_BLOCKED = `Google can't sign you into Chainsfr when you are in Incognito Mode. 
Please open this view in a regular tab of Chrome or Safari to sign in with Google.`

const EMBEDDED_BROWSER_NOT_SUPPROTED = `Google can't sign you in safely inside this app. 
Please open this view in a browser like Chrome or Safari to sign in with Google.`

class GoogleLoginButton extends Component {
  state = {
    openUnsupportedBrowserModal: false,
    unsupportedBrowserModalContent: null
  }

  toggleUnsupportedBrowserModal = content => {
    this.setState(prevState => {
      return {
        openUnsupportedBrowserModal: !prevState.openUnsupportedBrowserModal,
        unsupportedBrowserModalContent: content
      }
    })
  }

  gapiLoad = () => {
    return new Promise((resolve, reject) => {
      window.gapi.load('auth2', {
        callback: function () {
          // Handle gapi.client initialization.
          resolve()
        },
        onerror: function () {
          reject(new Error('Load gapi client failed'))
        },
        timeout: 5000, // 5 seconds.
        ontimeout: function () {
          // Handle timeout.
          reject(new Error('Load gapi client timeout'))
        }
      })
    })
  }

  login = async () => {
    const clientParser = new UAParser()
    const result = clientParser.getResult()
    if (
      !['chrome', 'safari', 'mobile safari', 'firefox'].includes(result.browser.name.toLowerCase())
    ) {
      this.toggleUnsupportedBrowserModal(EMBEDDED_BROWSER_NOT_SUPPROTED)
    } else {
      try {
        await this.gapiLoad()
        console.log('gapi loaded')
        let userInstance
        if (env.REACT_APP_ENV === 'test' && env.REACT_APP_E2E_TEST_MOCK_USER) {
          // mock login
          console.log('Mocking login')
          userInstance = GOOGLE_LOGIN_AUTH_OBJ
        } else {
          let googleAuth = await window.gapi.auth2.getAuthInstance()
          if (!googleAuth || !googleAuth.isSignedIn.get()) {
            const client = await window.gapi.auth2.init({
              clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
              scope: process.env.REACT_APP_GOOGLE_API_SCOPE,
              discoveryDocs: process.env.REACT_APP_GOOGLE_API_DISCOVERY_DOCS
            })

            // set option to display account selection everytime
            // This is what differs from react-google-login
            let options = new window.gapi.auth2.SigninOptionsBuilder()
            options.setPrompt('select_account')
            userInstance = await client.signIn(options)
          } else {
            userInstance = await googleAuth.currentUser.get()
          }
          const basicProfile = userInstance.getBasicProfile()
          const authResponse = userInstance.getAuthResponse()
          userInstance.googleId = basicProfile.getId()
          userInstance.tokenObj = authResponse
          userInstance.idToken = authResponse.id_token
          userInstance.accessToken = authResponse.access_token
          userInstance.profileObj = {
            googleId: basicProfile.getId(),
            imageUrl: basicProfile.getImageUrl(),
            email: basicProfile.getEmail(),
            name: basicProfile.getName(),
            givenName: basicProfile.getGivenName(),
            familyName: basicProfile.getFamilyName()
          }
        }
        this.props.onSuccess(userInstance)
      } catch (e) {
        if (e.details && e.details === 'Cookies are not enabled in current environment.') {
          // this happens in chrome incognito mode
          // see https://developers.google.com/identity/sign-in/web/troubleshooting#third-party_cookies_and_data_blocked
          // notify user to create a cookie exception for https://accounts.google.com
          this.toggleUnsupportedBrowserModal(THIRD_PARTY_COOKIE_BLOCKED)
        }
        this.props.onFailure(e)
      }
    }
  }

  render () {
    const { disabled, classes, path } = this.props
    const { openUnsupportedBrowserModal, unsupportedBrowserModalContent } = this.state
    const word = path && path.includes('login') ? 'in' : 'up'
    return (
      <>
        <Button
          fullWidth
          variant='contained'
          color='primary'
          onClick={() => this.login()}
          disabled={disabled}
          classes={{ label: classes.loginBtnSpan, root: classes.loginBtnRoot }}
        >
          <Box
            className={classes.iconContainer}
            display='flex'
            justifyContent='center'
            alignItems='center'
          >
            <img src={GoogleIcon} style={{ width: 16 }} alt='googleIcon' />
          </Box>
          <Typography
            variant='button'
            className={classes.loginBtnText}
            style={{ flex: 1 }}
            align='center'
          >
            Sign {word} with Google
          </Typography>
        </Button>
        <UnsupportedBrowserModal
          open={openUnsupportedBrowserModal}
          handleClose={() => this.toggleUnsupportedBrowserModal()}
          content={unsupportedBrowserModalContent}
        />
      </>
    )
  }
}

const style = theme => ({
  loginBtnText: {
    fontFamily: 'Poppins'
  },
  loginBtnRoot: {
    padding: '8px',
    maxWidth: '300px'
  },
  loginBtnSpan: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    height: '24px'
  },
  iconContainer: {
    backgroundColor: '#ffffff',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    alignSelf: 'flex-start',
    position: 'absolute',
    left: '0px',
    top: '0px'
  },
  btnText: {
    fontSize: '14px'
  }
})

export default withStyles(style)(GoogleLoginButton)
