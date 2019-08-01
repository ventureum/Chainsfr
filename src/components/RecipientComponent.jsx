// @flow
import React, { Component } from 'react'
import clsx from 'clsx'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import InputAdornment from '@material-ui/core/InputAdornment'
import Icon from '@material-ui/core/Icon'
import numeral from 'numeral'
import { getCryptoSymbol } from '../tokens'

type Props = {
  generateSecurityAnswer: Function,
  goToStep: Function,
  handleTransferFormChange: Function,
  validateForm: Function,
  balanceAmount: string,
  balanceCurrencyAmount: string,
  cryptoSelection: string,
  transferForm: Object,
  currency: string,
  classes: Object,
  actionsPending: Object
}

class RecipientComponent extends Component<Props> {
  securityAnswerHelperText = validationErrMsg => {
    const { classes, generateSecurityAnswer } = this.props
    return (
      // this section resides in <p>, thus cannot have <div>
      <span>
        <Button
          size='small'
          onClick={generateSecurityAnswer}
          className={classes.generateSecurityAnswerBtn}
        >
          <Typography
            component={'span'}
            color='primary'
            className={classes.generateSecurityAnswerBtnText}
          >
            Generate Security Answer
          </Typography>
        </Button>
        {validationErrMsg && (
          <Typography component={'span'} className={classes.securityAnswerBtnHelperTextError}>
            {validationErrMsg}
          </Typography>
        )}
        {!validationErrMsg && (
          <Typography component={'span'} className={classes.securityAnswerBtnHelperText}>
            We recommend you to use auto-generated security password for better security
          </Typography>
        )}
      </span>
    )
  }

  render () {
    const {
      classes,
      transferForm,
      cryptoSelection,
      handleTransferFormChange,
      validateForm,
      currency,
      balanceAmount,
      balanceCurrencyAmount,
      actionsPending
    } = this.props
    const {
      transferAmount,
      transferCurrencyAmount,
      destination,
      password,
      sender,
      formError
    } = transferForm

    return (
      <Grid container direction='column' justify='center' alignItems='stretch' spacing={3}>
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
              helperText={
                formError.sender ||
                'A tracking number will be sent to this email. It will also be shown to the recipient'
              }
              onChange={handleTransferFormChange('sender')}
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
              onChange={handleTransferFormChange('destination')}
              value={destination}
            />
          </Grid>
          <Grid item>
            <Grid container direction='row' justify='center' alignItems='center'>
              <Grid item md={5}>
                <TextField
                  margin='normal'
                  fullWidth
                  id='currencyAmount'
                  variant='outlined'
                  label={`Amount (${currency})`}
                  error={!!formError.transferCurrencyAmount}
                  helperText={
                    formError.transferCurrencyAmount || `Balance: ${balanceCurrencyAmount}`
                  }
                  onChange={handleTransferFormChange('transferCurrencyAmount')}
                  value={transferCurrencyAmount}
                  InputProps={{
                    startAdornment: <InputAdornment position='start'>{currency}</InputAdornment>
                  }}
                />
              </Grid>
              <Grid item md={2} align='center'>
                <Icon className={clsx(classes.icon, 'fa fa-exchange-alt')} />
              </Grid>
              <Grid item md={5}>
                <TextField
                  margin='normal'
                  fullWidth
                  id='cryptoAmount'
                  variant='outlined'
                  label={`Amount (${getCryptoSymbol(cryptoSelection)})`}
                  error={!!formError.transferAmount}
                  helperText={
                    formError.transferAmount ||
                    `Balance: ${numeral(balanceAmount).format('0.000[000]')} ${getCryptoSymbol(
                      cryptoSelection
                    )}`
                  }
                  onChange={handleTransferFormChange('transferAmount')}
                  value={transferAmount}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        {getCryptoSymbol(cryptoSelection)}
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
            </Grid>
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
              onChange={handleTransferFormChange('password')}
              value={password || ''}
            />
          </Grid>
          <Grid item className={classes.btnSection}>
            <Grid container direction='row' justify='center' spacing={3}>
              <Grid item>
                <Button
                  color='primary'
                  size='large'
                  onClick={() => this.props.goToStep(-1)}
                  id='back'
                >
                  Back to previous
                </Button>
              </Grid>
              <Grid item>
                <Button
                  id='continue'
                  fullWidth
                  variant='contained'
                  color='primary'
                  size='large'
                  onClick={() => this.props.goToStep(1)}
                  disabled={!validateForm() || actionsPending.getTxFee}
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
    padding: '0px 0px 0px 0px',
    marginRight: '6px'
  },
  btnSection: {
    marginTop: '60px'
  },
  icon: {
    color: '#777777'
  }
})

export default withStyles(styles)(RecipientComponent)
