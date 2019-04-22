// @flow
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
import { getCryptoDecimals } from '../tokens'
import BN from 'bn.js'

type Props = {
  updateTransferForm: Function,
  generateSecurityAnswer: Function,
  clearSecurityAnswer: Function,
  goToStep: Function,
  getTxCost: Function,
  cryptoSelection: string,
  walletSelection: string,
  transferForm: Object,
  wallet: Object,
  classes: Object,
  txCost: any,
  actionsPending: Object
}

const INSUFFICIENT_FUNDS_FOR_TX_FEES = 'Insufficient funds for paying transaction fees'

class RecipientComponent extends Component<Props> {
  componentDidMount () {
    this.props.clearSecurityAnswer()
  }

  componentDidUpdate (prevProps) {
    const { walletSelection, cryptoSelection, transferForm, actionsPending } = this.props
    if (prevProps.transferForm.transferAmount !== this.props.transferForm.transferAmount) {
      this.props.getTxCost({
        cryptoType: cryptoSelection,
        transferAmount: transferForm.transferAmount,
        walletType: walletSelection
      })
    } else if (
      !actionsPending.getTxCost &&
      prevProps.actionsPending.getTxCost
    ) {
      this.props.updateTransferForm(update(transferForm, {
        formError: { transferAmount: { $set: this.validate('transferAmount', transferForm.transferAmount) } }
      }))
    }
  }

  validateForm = () => {
    const { transferForm } = this.props
    const { formError } = transferForm

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
    const { transferForm } = this.props

    this.props.updateTransferForm(update(transferForm, {
      [name]: { $set: event.target.value },
      formError: { [name]: { $set: this.validate(name, event.target.value) } }
    }))
  }

  validate = (name, value) => {
    const { wallet, cryptoSelection, txCost } = this.props
    let balance = wallet ? wallet.crypto[cryptoSelection][0].balance : null
    const decimals = getCryptoDecimals(cryptoSelection)
    if (name === 'transferAmount') {
      if (!validator.isFloat(value, { min: 0.0001, max: utils.toHumanReadableUnit(balance, decimals) })) {
        if (value === '-' || parseFloat(value) < 0.0001) {
          return 'The amount must be greater than 0.0001'
        } else {
          return `The amount cannot exceed your current balance ${utils.toHumanReadableUnit(balance, decimals)}`
        }
      } else if (txCost) {
        // balance check passed
        if (['ethereum', 'dai'].includes(cryptoSelection)) {
          // ethereum based coins
          // now check if ETH balance is sufficient for paying tx fees
          if (
            cryptoSelection === 'ethereum' &&
            new BN(balance).lt(new BN(txCost.costInBasicUnit).add(utils.toBasicTokenUnit(parseFloat(value), decimals, 8)))
          ) {
            return INSUFFICIENT_FUNDS_FOR_TX_FEES
          }
          if (cryptoSelection === 'dai') {
            let ethBalance = wallet.crypto.ethereum[0].balance
            if (new BN(ethBalance).lt(new BN(txCost.costInBasicUnit))) {
              return INSUFFICIENT_FUNDS_FOR_TX_FEES
            }
          }
        } else if (
          cryptoSelection === 'bitcoin' &&
          new BN(balance).lt(new BN(txCost.costInBasicUnit).add(utils.toBasicTokenUnit(parseFloat(value), decimals, 8)))
        ) {
          return INSUFFICIENT_FUNDS_FOR_TX_FEES
        }
      }
    } else if (name === 'sender' || name === 'destination') {
      if (!validator.isEmail(value)) {
        return 'Invalid email'
      }
    } else if (name === 'password') {
      if (!validator.isLength(value, { min: 6, max: undefined })) {
        return 'Length must be greater or equal than 6'
      }
    }
    return null
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
    const { classes, transferForm, wallet, cryptoSelection } = this.props
    const { transferAmount, destination, password, sender, formError } = transferForm

    let balance = wallet.crypto[cryptoSelection][0].balance ? numeral(utils.toHumanReadableUnit(wallet.crypto[cryptoSelection][0].balance, getCryptoDecimals(cryptoSelection))).format('0.000a') : '0'
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
