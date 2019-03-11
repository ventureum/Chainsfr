import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import update from 'immutability-helper'
import utils from '../utils'
import numeral from 'numeral'
import validator from 'validator'

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
    this.props.clearSecurityAnswer()
  }

  componentDidUpdate (prevProps) {
    let { password } = this.props.transferForm
    if (prevProps.transferForm.password !== password) {
      // need to re-validate password
      if (password && !validator.isLength(password, { min: 6, max: undefined })) {
        this.setState(update(this.state, { formError: { password: { $set: 'Length must be greater or equal than 6' } } }))
      } else {
        this.setState(update(this.state, { formError: { password: { $set: null } } }))
      }
    }
  }

  validateForm = () => {
    const { formError } = this.state
    const { transferForm } = this.props

    // form must be filled without errors
    return (transferForm.sender &&
            transferForm.destination &&
            transferForm.transferAmount &&
            transferForm.password &&
            !formError.sender &&
            !formError.destination &&
            !formError.transferAmount &&
            !formError.password)
  }

  handleTransferFormChange = name => event => {
    const { transferForm, wallet } = this.props

    this.props.updateTransferForm(update(transferForm, {
      [name]: { $set: event.target.value }
    }))

    let balance = wallet ? wallet.accounts[0].balance['ethereum'] : null

    // validation
    if (name === 'transferAmount') {
      if (wallet && balance &&
          !validator.isFloat(event.target.value, { min: 0.0001, max: utils.toHumanReadableUnit(balance) })) {
        if (event.target.value === '-' || parseFloat(event.target.value) < 0.0001) {
          this.setState(update(this.state, { formError: { [name]: { $set: 'The amount must be greater than 0.0001' } } }))
        } else {
          this.setState(update(this.state, { formError: { [name]: { $set: `The amount cannot exceed your current balance ${utils.toHumanReadableUnit(balance)}` } } }))
        }
      } else {
        this.setState(update(this.state, { formError: { [name]: { $set: null } } }))
      }
    } else if (name === 'sender' || name === 'destination') {
      if (!validator.isEmail(event.target.value)) {
        this.setState(update(this.state, { formError: { [name]: { $set: 'Invalid email' } } }))
      } else {
        this.setState(update(this.state, { formError: { [name]: { $set: null } } }))
      }
    } else if (name === 'password') {
      if (!validator.isLength(event.target.value, { min: 6, max: undefined })) {
        this.setState(update(this.state, { formError: { [name]: { $set: 'Length must be greater or equal than 6' } } }))
      } else {
        this.setState(update(this.state, { formError: { [name]: { $set: null } } }))
      }
    }
  }

  securityAnswerHelperText = (validationErrMsg) => {
    const { classes, generateSecurityAnswer } = this.props
    return (
      // this section resides in <p>, thus cannot have <div>
      <span>
        <Button
          size='small'
          onClick={generateSecurityAnswer}
          className={classes.generateSecurityAnswerBtn}
        >
          <Typography component={'span'} color='primary' className={classes.generateSecurityAnswerBtnText}>
            Generate Security Answer
          </Typography>
        </Button>
        {validationErrMsg &&
        <Typography component={'span'} className={classes.securityAnswerBtnHelperTextError}>
          {validationErrMsg}
        </Typography>
        }
        {!validationErrMsg &&
        <Typography component={'span'} className={classes.securityAnswerBtnHelperText}>
           We recommend you to use auto-generated security password for better security
        </Typography>
        }
      </span>
    )
  }

  render () {
    const { formError } = this.state
    const { classes, transferForm, wallet, cryptoSelection } = this.props
    const { transferAmount, destination, password, sender } = transferForm

    let balance = wallet.accounts[0].balance[cryptoSelection] ? numeral(utils.toHumanReadableUnit(wallet.accounts[0].balance[cryptoSelection])).format('0.000a') : '0'

    return (
      <Grid container direction='column' justify='center' alignItems='stretch' spacing={24}>
        <form className={classes.recipientSettingForm} noValidate autoComplete='off'>
          <Grid item>
            <TextField
              fullWidth
              id='sender'
              label='Your Email'
              placeholder='john@gmail.com'
              className={classes.textField}
              margin='normal'
              variant='outlined'
              error={!!formError.sender}
              helperText={formError.sender || 'A tracking number will be sent to this email. It will also be shown to the recipient'}
              onChange={this.handleTransferFormChange('sender')}
              value={sender}
            />
          </Grid>
          <Grid item>
            <TextField
              fullWidth
              id='destination'
              label='Recipient Email'
              placeholder='john@gmail.com'
              className={classes.textField}
              margin='normal'
              variant='outlined'
              error={!!formError.destination}
              helperText={formError.destination}
              onChange={this.handleTransferFormChange('destination')}
              value={destination}
            />
          </Grid>
          <Grid item>
            <TextField
              fullWidth
              id='amount'
              label='Amount'
              className={classes.textField}
              margin='normal'
              variant='outlined'
              error={!!formError.transferAmount}
              helperText={formError.transferAmount || `Balance: ${balance}`}
              onChange={this.handleTransferFormChange('transferAmount')}
              value={transferAmount}
            />
          </Grid>
          <Grid item>
            <TextField
              fullWidth
              id='password'
              label='Security Answer'
              className={classes.textField}
              margin='normal'
              variant='outlined'
              error={!!formError.password}
              helperText={this.securityAnswerHelperText(formError.password)}
              onChange={this.handleTransferFormChange('password')}
              value={password || ''}
            />
          </Grid>
          <Grid item className={classes.btnSection}>
            <Grid container direction='row' justify='center' spacing={24}>
              <Grid item>
                <Button
                  color='primary'
                  size='large'
                  onClick={() => this.props.goToStep(-1)}
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
                  onClick={() => this.props.goToStep(1)}
                  disabled={!this.validateForm()}
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
  securityAnswerBtnHelperTextError: {
    fontSize: '0.75rem',
    color: '#f44336',
    textAlign: 'left',
    minHeight: '1em',
    lineHeight: '1em'
  },
  generateSecurityAnswerBtn: {
    padding: '0px 0px 0px 0px'
  },
  btnSection: {
    marginTop: '60px'
  }
})

export default withStyles(styles)(RecipientComponent)
