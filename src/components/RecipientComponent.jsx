import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles'
import { Link } from 'react-router-dom'
import TextField from '@material-ui/core/TextField'
import paths from '../Paths'

class RecipientComponent extends Component {
  state = {
    transferAmount: this.props.transferForm.transferAmount,
    password: this.props.transferForm.password,
    destination: this.props.transferForm.destination,
    sender: this.props.transferForm.sender
  }

  handleTransferFormChange = name => event => {
    this.setState({
      [name]: event.target.value
    })
  }

  render () {
    const { classes, updateTransferForm } = this.props
    const { transferAmount, destination, password, sender } = this.state
    return (
      <Grid container direction='column' justify='center' alignItems='stretch' spacing={24}>
        <form className={classes.recipientSettingForm} noValidate autoComplete='off'>
          <Grid item>
            <TextField
              fullWidth
              required
              id='amount'
              label='Amount'
              className={classes.textField}
              margin='normal'
              variant='outlined'
              onChange={this.handleTransferFormChange('transferAmount')}
              value={transferAmount}
            />
          </Grid>
          <Grid item>
            <TextField
              fullWidth
              required
              id='sender'
              label='Your Email'
              placeholder='john@gmail.com'
              className={classes.textField}
              margin='normal'
              variant='outlined'
              helperText='A tracking number will be sent to this email. It will also be shown to the recipient'
              onChange={this.handleTransferFormChange('sender')}
              value={sender}
            />
          </Grid>
          <Grid item>
            <TextField
              fullWidth
              required
              id='destination'
              label='Recipient Email'
              placeholder='john@gmail.com'
              className={classes.textField}
              margin='normal'
              variant='outlined'
              onChange={this.handleTransferFormChange('destination')}
              value={destination}
            />
          </Grid>
          <Grid item>
            <TextField
              fullWidth
              required
              id='password'
              label='Security Answer'
              className={classes.textField}
              margin='normal'
              variant='outlined'
              helperText='Use the offline auto-generated password for maximum security'
              onChange={this.handleTransferFormChange('password')}
              value={password}
            />
          </Grid>
          <Grid item className={classes.btn}>
            <Button
              className={classes.continueBtn}
              fullWidth
              variant='contained'
              color='primary'
              size='large'
              onClick={() => { updateTransferForm(this.state) }}
              component={Link}
              to={paths.review}
              disabled={!transferAmount || !destination || !password}
            >
              Continue
            </Button>
          </Grid>
          <Grid item className={classes.btn}>
            <Button
              className={classes.backBtn}
              fullWidth
              variant='contained'
              color='primary'
              size='large'
              component={Link}
              to={paths.walletSelection}
            >
              Back
            </Button>
          </Grid>
        </form>
      </Grid>
    )
  }
}

const styles = theme => ({
  btn: {
    margin: '16px 0px 16px 0px'
  }
})

export default withStyles(styles)(RecipientComponent)
