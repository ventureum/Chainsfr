import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import LinearProgress from '@material-ui/core/LinearProgress'

class ReceivePasswordComponent extends Component {
  state = {
    password: ''
  }

  componentDidMount () {
    this.props.clearDecryptedWallet()
  }

  onChange = (event) => {
    this.clearError()
    this.setState({ password: event.target.value })
  }

  handleNext = () => {
    let { verifyPassword, transfer } = this.props
    let { password } = this.state
    verifyPassword({
      encryptedWallet: transfer.data,
      password: password + transfer.destination,
      cryptoType: transfer.cryptoType
    })
  }

  clearError =() => {
    const { error, clearVerifyPasswordError } = this.props
    if (error) {
      clearVerifyPasswordError()
    }
  }

  render () {
    const { classes, error, actionsPending } = this.props
    const { password } = this.state
    return (
      <Grid container direction='column' justify='center' alignItems='stretch' spacing={24}>
        <form className={classes.root} noValidate autoComplete='off'>
          <Grid item>
            <Typography className={classes.title} align='left'>
              Enter Security Answer
            </Typography>
          </Grid>
          <Grid item>
            <TextField
              fullWidth
              id='password'
              label='Security Answer'
              className={classes.textField}
              margin='normal'
              variant='outlined'
              error={!!error}
              helperText={error ? 'Incorrect security answer' : 'Please enter security answer set by the sender'}
              onChange={this.onChange}
              value={password || ''}
            />
          </Grid>
          {actionsPending.verifyPassword &&
          <Grid item>
            <Grid container direction='column' className={classes.linearProgressContainer} spacing={8}>
              <Grid item>
                <Typography className={classes.checkingText}>Checking password...</Typography>
              </Grid>
              <Grid item>
                <LinearProgress className={classes.linearProgress} />
              </Grid>
            </Grid>
          </Grid>
          }
          <Grid item className={classes.btnSection}>
            <Grid container direction='row' justify='center' spacing={24}>
              <Grid item>
                <Button
                  color='primary'
                  size='large'
                  onClick={() => {
                    this.clearError()
                    this.props.goToStep(-1)
                  }}
                >
                  Cancel
                </Button>
              </Grid>
              <Grid item>
                <Button
                  fullWidth
                  variant='contained'
                  color='primary'
                  size='large'
                  onClick={this.handleNext}
                  disabled={actionsPending.verifyPassword}
                >
                  Continue
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </form>
      </Grid>
    )
  }
}

const styles = theme => ({
  root: {
    margin: '60px'
  },
  title: {
    color: '#333333',
    fontSize: '24px',
    fontWeight: '600',
    lineHeight: '36px',
    letterSpacing: '0.97px',
    padding: '0px 0px 0px 0px'
  },
  btnSection: {
    marginTop: '60px'
  },
  linearProgressContainer: {
    backgroundColor: 'rgba(66,133,244,0.05)',
    borderRadius: '4px',
    padding: '10px 20px 10px 20px',
    marginTop: '30px'
  },
  checkingText: {
    color: '#333333',
    fontSize: '14px',
    fontWeight: 600
  },
  linearProgress: {
    marginTop: '8px'
  }
})

export default withStyles(styles)(ReceivePasswordComponent)
