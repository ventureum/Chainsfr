import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles'
import { Link } from 'react-router-dom'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import update from 'immutability-helper'
import paths from '../Paths'
import utils from '../utils'
import numeral from 'numeral'

class RecipientComponent extends Component {
  state = {
    formError: {
      sender: null,
      destination: null,
      transferAmount: null,
      password: null
    }
  }

  componentDidMount () {
    this.props.generateSecurityAnswer()
  }

  componentDidUpdate (prevProps) {
    const { transferForm, metamask } = this.props

    if (transferForm.transferAmount !== prevProps.transferForm.transferAmount) {
      if (transferForm.transferAmount && metamask && metamask.balance) {
        // validation
        if (parseFloat(transferForm.transferAmount) > utils.toHumanReadableUnit(metamask.balance)) {
          this.setState(update(this.state, { formError: { transferAmount: { $set: 'Insufficient balance' } } }))
        } else if (this.state.formError.transferAmount) {
          this.setState(update(this.state, { formError: { transferAmount: { $set: null } } }))
        }
      }
    }
  }

  handleTransferFormChange = name => event => {
    const { transferForm } = this.props

    this.props.updateTransferForm(update(transferForm, {
      [name]: { $set: event.target.value }
    }))
  }
  securityAnswerHelperText = () => {
    const { classes, generateSecurityAnswer } = this.props
    return (
      <div>
        <Button
          size='small'
          onClick={generateSecurityAnswer}
          className={classes.generateSecurityAnswerBtn}
        >
          <Typography color='primary' className={classes.generateSecurityAnswerBtnText}>
            Re-generate Security Answer
          </Typography>
        </Button>
        <Typography className={classes.securityAnswerBtnHelperText}>
          We recommend you to use auto-generated security password for better security
        </Typography>
      </div>
    )
  }

  render () {
    const { formError } = this.state
    const { classes, transferForm, metamask } = this.props
    const { transferAmount, destination, password, sender } = transferForm
    let balance = metamask.balance ? numeral(utils.toHumanReadableUnit(metamask.balance)).format('0.000a') : '0'
    return (
      <Grid container direction='column' justify='center' alignItems='stretch' spacing={24}>
        <form className={classes.recipientSettingForm} noValidate autoComplete='off'>
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
              id='amount'
              label='Amount'
              className={classes.textField}
              margin='normal'
              variant='outlined'
              error={formError.transferAmount}
              helperText={formError.transferAmount ? `Insufficient funds, you have ${balance}` : `Balance: ${balance}`}
              onChange={this.handleTransferFormChange('transferAmount')}
              value={transferAmount}
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
              helperText={this.securityAnswerHelperText()}
              onChange={this.handleTransferFormChange('password')}
              value={password}
            />
          </Grid>
          <Grid item>
            <Grid container direction='row' justify='center' spacing={24}>
              <Grid item>
                <Button
                  color='primary'
                  size='large'
                  component={Link}
                  to={paths.transfer + paths.walletSelectionStep}
                >
                  Back to previous
                </Button>
              </Grid>
              <Grid item>
                <Button
                  fullWidth
                  variant='contained'
                  color='primary'
                  size='large'
                  component={Link}
                  to={paths.transfer + paths.reviewStep}
                  disabled={!transferAmount || !destination || !password}
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
  btn: {
    margin: '16px 0px 16px 0px'
  },
  generateSecurityAnswerBtnText: {
    fontSize: '12px'
  },
  securityAnswerBtnHelperText: {
    fontSize: '0.75rem',
    color: 'rgba(0, 0, 0, 0.54)',
    textAlign: 'left',
    minHeight: '1em',
    lineHeight: '1em'
  },
  generateSecurityAnswerBtn: {
    padding: '0px 0px 0px 0px'
  }
})

export default withStyles(styles)(RecipientComponent)
