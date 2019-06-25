import React, { Component } from 'react'

import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'

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
        res.idToken = authResponse.id_token
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
    return (
      <Grid container direction='row' alignItems='center' justify='center' className={disabled ? classes.btnDisabled : classes.btn} onClick={() => this.login()} >
        <Grid item>
          <Typography className={classes.text}>Sign in with Google</Typography>
        </Grid>
      </Grid>
    )
  }
}

const styles = theme => ({
  btn: {
    backgroundColor: '#4285F4',
    opacity: 1,
    '&:hover': {
      cursor: 'pointer',
      opacity: 0.9
    },
    borderRadius: 8
  },
  btnDisabled: {
    backgroundColor: '#4285F4',
    opacity: 0.5,
    borderRadius: 8
  },
  text: {
    color: '#ffffff',
    fontWeight: '500',
    fontSize: '20px'
  }
})
export default withStyles(styles)(GoogleLoginButton)
