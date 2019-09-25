import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import Button from '@material-ui/core/Button'
import LinearProgress from '@material-ui/core/LinearProgress'

const CREATE_WALLET_PROGRESS = {
  'CREATE': 'Creating Drive Wallet...',
  'STORE': 'Encrypt and store safely into your Google Drive...'
}

class OnboardingComponent extends Component {
  state = {
    step: '',
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

  isPasswordMatched = () => {
    let { password, passwordConfirmation } = this.state
    if (passwordConfirmation.length > 0) {
      return password === passwordConfirmation
    }
    return true
  }

  onSubmit = () => {
    this.props.register()
    this.props.createCloudWallet(this.state.password, (step) => { this.setState({ step: step }) })
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

  render () {
    let { classes, actionsPending, profile } = this.props
    const onboardingActionsPending = actionsPending.createCloudWallet || actionsPending.register
    return (
      <div className={classes.root}>
        <Grid container direction='column' alignItems='center'>
          <Grid container direction='column' className={classes.container} alignItems='center'>
            {/* Center the entire container, this step is necessary to make upper and lower section to have same width */}
            <Grid item>
              <Grid container direction='column' justify='center' alignItems='stretch' spacing={3}>
                <Grid item>
                  <Typography align='left' className={classes.onBoardingTitle}>
                    Welcome to Chainsfr,
                  </Typography>
                  <Typography align='left' className={classes.onBoardingTitle}>
                    {profile.profileObj.name}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography align='left' className={classes.onBoardingSubtitle}>
                    We are going to create a Drive wallet for you.
                    Please set an independent password to protect your
                    Drive wallet and your future transfers.
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
                    disabled={onboardingActionsPending}
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
                    disabled={onboardingActionsPending}
                  />
                </Grid>
                <Grid item>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={this.state.termsAccepted}
                        onChange={this.handleCheckboxChange}
                        color='primary'
                        disabled={onboardingActionsPending}
                      />
                    }
                    label={this.renderTermsAndConditionsLabel()}
                  />
                </Grid>
                {actionsPending.createCloudWallet &&
                  <Grid item >
                    <Grid container direction='column' justify='center' className={classes.loadingSection}>
                      <Grid item>
                        <Typography className={classes.progressTitle} >
                          This may take up to one minute.
                        </Typography>
                        <Typography className={classes.progressSubtext} >
                          {CREATE_WALLET_PROGRESS[this.state.step]}
                        </Typography>
                        <LinearProgress className={classes.linearProgress} />
                      </Grid>
                    </Grid>
                  </Grid>
                }
                <Grid item align='center'>
                  <Button
                    variant='contained'
                    color='primary'
                    disabled={!this.state.termsAccepted ||
                      !this.isPasswordMatched() ||
                      this.state.password === '' ||
                      onboardingActionsPending}
                    onClick={this.onSubmit}
                  >
                    Start Using Chainsfr
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
    )
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
  wrapper: {
    margin: theme.spacing(1),
    position: 'relative'
  },
  loadingSection: {
    backgroundColor: 'rgba(66,133,244,0.05)',
    padding: '20px',
    margin: '20px 0px 20px 0px',
    borderRadius: '4px'
  },
  progressTitle: {
    color: '#333333',
    fontSize: '14px',
    fontWeight: 600
  },
  progressSubtext: {
    color: '#777777',
    fontSize: '14px'
  },
  linearProgress: {
    marginTop: '20px'
  }
})

export default withStyles(styles)(OnboardingComponent)
