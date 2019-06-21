import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'

class OnboardingComponent extends Component {
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

  isPasswordMatched = () => {
    let { password, passwordConfirmation } = this.state
    if (passwordConfirmation.length > 0) {
      return password === passwordConfirmation
    }
    return true
  }

  onSubmit = () => {
    this.props.createCloudWallet(this.state.password)
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

    return (
      <div className={classes.root}>
        <Grid container direction='column' alignItems='center'>
          <Grid container direction='column' className={classes.container} alignItems='center'>
            {/* Center the entire container, this step is necessary to make upper and lower section to have same width */}
            <Grid item>
              <Grid container direction='column' justify='center' alignItems='stretch' spacing={24}>
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
                    We are going to create a Chainsfr wallet for you.
                    Please set an independent password to protect your
                    Chainsfr wallet and your future transfers.
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
                  <div className={classes.wrapper}>
                    <Button
                      variant='contained'
                      color='primary'
                      disabled={!this.state.termsAccepted ||
                                !this.isPasswordMatched() ||
                                this.state.password === '' ||
                                actionsPending.createCloudWallet}
                      onClick={this.onSubmit}
                    >
                      Start Using Chainsfr
                    </Button>
                    {actionsPending.createCloudWallet &&
                    <CircularProgress
                      size={24}
                      color='primary'
                      className={classes.buttonProgress}
                    />}
                  </div>
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
    margin: theme.spacing.unit,
    position: 'relative'
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  }
})

export default withStyles(styles)(OnboardingComponent)
