import React, { Component } from 'react'

import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import SvgIcon from '@material-ui/core/SvgIcon'

class GoogleLoginButton extends Component {
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
    try {
      await this.gapiLoad()
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
        const res = await client.signIn(options)

        const basicProfile = res.getBasicProfile()
        const authResponse = res.getAuthResponse()
        res.googleId = basicProfile.getId()
        res.tokenObj = authResponse
        res.tokenId = authResponse.id_token
        res.accessToken = authResponse.access_token
        res.profileObj = {
          googleId: basicProfile.getId(),
          imageUrl: basicProfile.getImageUrl(),
          email: basicProfile.getEmail(),
          name: basicProfile.getName(),
          givenName: basicProfile.getGivenName(),
          familyName: basicProfile.getFamilyName()
        }
        this.props.onSuccess(res)
      }
    } catch (e) {
      this.props.onFailure(e)
    }
  }

  render () {
    const { classes, disabled } = this.props
    const btnClassNmae = disabled ? `${classes.btn} ${classes.btnDisabled}` : classes.btn
    return (
      <Grid container direction='row' alignItems='center' className={btnClassNmae} onClick={() => this.login()} >
        <Grid item className={classes.iconContainer}>
          <SvgIcon viewBox='0 0 18 18' className={classes.svg}>
            <g fill='#000' fillRule='evenodd'>
              <path
                d='M9 3.48c1.69 0 2.83.73 3.48 1.34l2.54-2.48C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.96l2.91 2.26C4.6 5.05 6.62 3.48 9 3.48z'
                fill='#EA4335'
              />
              <path d='M17.64 9.2c0-.74-.06-1.28-.19-1.84H9v3.34h4.96c-.1.83-.64 2.08-1.84 2.92l2.84 2.2c1.7-1.57 2.68-3.88 2.68-6.62z' fill='#4285F4' />
              <path
                d='M3.88 10.78A5.54 5.54 0 0 1 3.58 9c0-.62.11-1.22.29-1.78L.96 4.96A9.008 9.008 0 0 0 0 9c0 1.45.35 2.82.96 4.04l2.92-2.26z'
                fill='#FBBC05'
              />
              <path
                d='M9 18c2.43 0 4.47-.8 5.96-2.18l-2.84-2.2c-.76.53-1.78.9-3.12.9-2.38 0-4.4-1.57-5.12-3.74L.97 13.04C2.45 15.98 5.48 18 9 18z'
                fill='#34A853'
              />
              <path fill='none' d='M0 0h18v18H0z' />
            </g>
          </SvgIcon>
        </Grid>
        <Grid item>
          <Typography className={classes.text}>Sign in with Google</Typography>
        </Grid>
      </Grid>
    )
  }
}

const styles = theme => ({
  btn: {
    margin: '60px 0px 60px 0px',
    backgroundColor: 'rgb(66, 133, 244)',
    opacity: 1,
    padding: '1px',
    display: 'flex',
    width: '65%',
    '&:hover': {
      cursor: 'pointer',
      opacity: 0.9
    },
    borderRadius: 2,
    boxShadow: '0 2px 2px 0 rgba(0, 0, 0, .24), 0 0 1px 0 rgba(0, 0, 0, .24)'
  },
  btnDisabled: {
    opacity: 0.5
  },
  iconContainer: {
    marginRight: 10,
    background: '#fff',
    padding: '10px',
    borderRadius: 2
  },
  svg: {
    height: '18px',
    width: '18px'
  },
  text: {
    color: '#ffffff',
    fontWeight: '500'
  }
})
export default withStyles(styles)(GoogleLoginButton)
