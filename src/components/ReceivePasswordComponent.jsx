import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles'
import { Link, Redirect } from 'react-router-dom'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import paths from '../Paths'

class ReceivePasswordComponent extends Component {
  state = {
    password: ''
  }

  componentDidMount () {
    this.props.clearDecryptedWallet()
  }

  onChange = (event) => {
    this.setState({ password: event.target.value })
  }

  handleNext = () => {
    let { verifyPassword, transfer } = this.props
    let { password } = this.state
    verifyPassword(transfer.data, password + transfer.destination)
  }

  render () {
    const { classes, actionsPending, escrowWallet, error } = this.props
    const { password } = this.state

    if (!actionsPending.verifyPassword && escrowWallet.decryptedWallet) {
      // verifyPassword is not currently running and wallet has been decrypted
      return (<Redirect push to={paths.receive + paths.receiveWalletSelectionStep} />)
    }

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
          <Grid item className={classes.btnSection}>
            <Grid container direction='row' justify='center' spacing={24}>
              <Grid item>
                <Button
                  color='primary'
                  size='large'
                  component={Link}
                  to={paths.receive}
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
  }
})

export default withStyles(styles)(ReceivePasswordComponent)
