import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import { createMuiTheme, withStyles } from '@material-ui/core/styles'
import { GoogleLogin } from 'react-google-login'
import logo from '../logo.svg'

class LoginComponent extends Component {
  loginSuccess = async (response) => {
    console.log('login success')
    console.log(this.props)
    this.props.onLogin(response)
  }

  loginFailure = async (response) => {
    console.log(response)
  }

  render () {
    let { classes } = this.props
    return (
      <Grid container className={classes.root} direction='column' justify='center' alignItems='center'>
        <Grid item>
          <Grid container direction='column' justify='center' alignItems='center'>
            <Grid item>
              <img src={logo} alt='' />
            </Grid>
            <Grid item className={classes.textSection} align='center'>
              <Typography className={classes.heading} variant='h3' gutterBottom align='center'>
                Milestone
              </Typography>
              <Typography className={classes.content} variant='h5' gutterBottom>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse eu feugiat ante, feugiat ultrices urna. Sed feugiat congue urna, in lacinia dolor accumsan faucibus.
              </Typography>
            </Grid>
            <Grid item className={classes.loginButton} align='center'>
              <GoogleLogin
                clientId='754636752811-bdve3j98l74duv96vit2hqm635io3cjv.apps.googleusercontent.com'
                buttonText='Login'
                scope='https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata'
                discoveryDocs='https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
                onSuccess={this.loginSuccess}
                onFailure={this.loginFailure}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    )
  }
}

const theme = createMuiTheme({
  typography: {
    useNextVariants: true,
    suppressDeprecationWarnings: true
  },
  root: {
    height: '100vh',
    width: '100vw'
  },
  heading: {
    marginTop: '42px',
    height: '43px',
    width: '100%',
    color: '#333333',
    fontSize: '32px',
    fontWeight: 'bold',
    letterSpacing: '0.56px',
    lineHeight: '43px'
  },
  content: {
    marginTop: '20px',
    width: '90vw',
    maxWidth: '640px',
    color: '#666666',
    fontSize: '18px',
    letterSpacing: '0.32px',
    lineHeight: '24px'
  },
  loginButton: {
    marginTop: '60px',
    color: 'black',
    height: '200px',
    minWidth: '800px'
  },
  palette: {
    primary: {
      main: '#000000'
    },
    secondary: {
      main: '#f44336'
    }
  }
})

export default withStyles(theme)(LoginComponent)
