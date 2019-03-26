import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import { GoogleLogin } from 'react-google-login'
import Avatar from '@material-ui/core/Avatar'
import SendLandingIllustration from '../images/send-landing.svg'
import TextField from '@material-ui/core/TextField'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import Button from '@material-ui/core/Button'

class LoginComponent extends Component {
  state = {
    password: '',
    passwordConfirmation: '',
    termsAccepted: false
  }

  handleChange = prop => event => {
    this.setState({ [prop]: event.target.value })
  }

  handleCheckboxChange = () => {
    this.setState({ termsAccepted: !this.state.termsAccepted })
  }

  handleClickShowPassword = () => {
    this.setState(state => ({ showPassword: !state.showPassword }))
  }

  loginSuccess = async (response) => {
    this.props.onLogin(response)
  }

  loginFailure = async (response) => {
    console.log(response)
  }

  isPasswordMatched = () => {
    let { password, passwordConfirmation } = this.state
    if (passwordConfirmation.length > 0) {
      return password === passwordConfirmation
    }
    return true
  }

  onSubmit = () => {
    this.props.setRecoveryPassword(this.state.password)
  }

  renderTermsAndConditionsLabel = () => {
    let { classes } = this.props
    return (<Typography>
      {'I agree to the '}
      <span />
      <a className={classes.termslink} target='_blank' rel='noopener noreferrer' href='https://docs.google.com/document/d/e/2PACX-1vScWE32Rzf-z8OYmzS9mKTBcpVftWMbeR_BfbhmeJxHDF4jaiYXyUfPOtGif7mI6RSpoQ19onaawdYE/pub'>
        terms and conditions
      </a>
    </Typography>)
  }

  renderOnBoardingStep = () => {
    let { classes, profile } = this.props

    return (
      <div className={classes.root}>
        <Grid container direction='column' alignItems='center'>
          <Grid container direction='column' className={classes.container} alignItems='center'>
            {/* Center the entire container, this step is necessary to make upper and lower section to have same width */}
            <Grid item>
              <Grid container direction='column' justify='center' alignItems='stretch' spacing={24}>
                <Grid item>
                  <Typography align='left' className={classes.onBoardingTitle}>
                    Welcome to Chainsfer,
                  </Typography>
                  <Typography align='left' className={classes.onBoardingTitle}>
                    {profile.profileObj.name}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography align='left' className={classes.onBoardingSubtitle}>
                    We are going to create a Chainsfer wallet for you.
                    Please set a recovery password to protect your
                    Chainsfer wallet and your future transfers.
                  </Typography>
                </Grid>
                <Grid item>
                  <TextField
                    id='outlined-adornment-password'
                    variant='outlined'
                    fullWidth
                    type={'password'}
                    label='Password'
                    value={this.state.password}
                    onChange={this.handleChange('password')}
                  />
                </Grid>
                <Grid item>
                  <TextField
                    id='outlined-adornment-password-confirmation'
                    variant='outlined'
                    fullWidth
                    type={'password'}
                    label='Confirm Password'
                    value={this.state.passwordConfirmation}
                    onChange={this.handleChange('passwordConfirmation')}
                    error={!this.isPasswordMatched()}
                    helperText={!this.isPasswordMatched() && 'Passwords must match'}
                  />
                </Grid>
                <Grid item>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={this.state.termsAccepted}
                        onChange={this.handleCheckboxChange}
                        color='primary'
                      />
                    }
                    label={this.renderTermsAndConditionsLabel()}
                  />
                </Grid>
                <Grid item align='center'>
                  <Button
                    variant='contained'
                    color='primary'
                    disabled={!this.state.termsAccepted}
                    onClick={this.onSubmit}
                  >
                    Start Using Chainsfer
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
    )
  }

  render () {
    let { classes, profile } = this.props

    if (profile.isAuthenticated && profile.newUser) {
      return this.renderOnBoardingStep()
    } else {
      return (
        <Grid container direction='column' justify='center' alignItems='center'>
          {/* Center the entire container, this step is necessary to make upper and lower section to have same width */}
          <Grid item className={classes.centerContainer}>
            {/* 'stretch' ensures upper and lower section align properly */}
            <Grid container direction='column' justify='center' alignItems='stretch'>
              {/* Upper section */}
              <Grid item>
                <Grid container direction='row' alignItems='center' justify='space-around'>
                  <Grid item md={6} className={classes.leftContainer}>
                    <img
                      src={SendLandingIllustration}
                      alt={'landing-illustration'}
                      className={classes.landingIllustration}
                    />
                  </Grid>
                  <Grid item md={6} className={classes.rightColumn}>
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
                        <Grid item align='center'>
                          <GoogleLogin
                            className={classes.loginBtn}
                            theme='dark'
                            clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
                            scope={process.env.REACT_APP_GOOGLE_API_SCOPE}
                            discoveryDocs={process.env.REACT_APP_GOOGLE_API_DISCOVERY_DOCS}
                            onSuccess={this.loginSuccess}
                            onFailure={this.loginFailure}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            {/* Lower section (TODO) */}
          </Grid>
        </Grid>
      )
    }
  }
}

const styles = theme => ({
  root: {
    flex: 1
  },
  container: {
    marginTop: '60px',
    '@media (min-width: 380px) and (max-width : 751px)': {
      maxWidth: '380px'
    },
    '@media (min-width: 752px) and (max-width : 1129px)': {
      maxWidth: '752px'
    },
    '@media (min-width: 1130px) and (max-width : 1489px)': {
      maxWidth: '1130px'
    },
    '@media (min-width: 1490px) ': {
      maxWidth: '1490px'
    }
  },
  onBoardingTitle: {
    fontSize: '24px',
    fontWeight: 500,
    color: '#333333'
  },
  onBoardingSubtitle: {
    fontSize: '14px',
    color: '#333333',
    maxWidth: '340px'
  },
  subComponent: {
    width: '100%',
    maxWidth: '680px',
    margin: '0px 0px 16px 0px'
  },
  leftContainer: {
    margin: '60px 0px 60px 0px',
    maxWidth: '600px'
  },
  rightContainer: {
    margin: '60px 0px 60px 0px'
  },
  landingIllustration: {
    width: '100%'
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
  helperTextSection: {
    marginTop: '20px'
  },
  recentTxTitle: {
    color: '#333333',
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '30px'
  },
  recentTransferItemTransferAmount: {
    marginRight: '30px'
  },
  checkCircleIcon: {
    color: '#0CCD70',
    fontSize: '40px'
  },
  sendIcon: {
    fontSize: '40px'
  },
  notInterestedIcon: {
    color: '#a8aaac',
    fontSize: '40px'
  },
  typography: {
    useNextVariants: true,
    suppressDeprecationWarnings: true
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
  loginBtn: {
    width: '100%',
    maxWidth: '320px',
    margin: '60px 0px 60px 0px'
  },
  centerContainer: {
    maxWidth: '1330px',
    width: '100%'
  }
})

export default withStyles(styles)(LoginComponent)
