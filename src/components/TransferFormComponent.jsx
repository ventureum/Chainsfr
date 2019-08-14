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
import Select from '@material-ui/core/Select'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormHelperText from '@material-ui/core/FormHelperText'
import FormControl from '@material-ui/core/FormControl'
import OutlinedInput from '@material-ui/core/OutlinedInput'

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
  actionsPending: Object,
  recipients: Array<Object>,
  addRecipient: Function
}

class TransferFormComponent extends Component<Props> {
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
      actionsPending,
      recipients,
      addRecipient
    } = this.props
    const {
      transferAmount,
      transferCurrencyAmount,
      destination,
      password,
      sender,
      senderName,
      message,
      formError
    } = transferForm

    return (
      <Grid container direction='column' justify='center' alignItems='stretch' spacing={3}>
        <form className={classes.recipientSettingForm} noValidate autoComplete='off'>
          <Grid item>
            <TextField
              fullWidth
              id='sender_name'
              label='Your Name'
              placeholder='John Doe'
              className={classes.textField}
              margin='normal'
              variant='outlined'
              error={!!formError.senderName}
              helperText={formError.senderName}
              onChange={handleTransferFormChange('senderName')}
              value={senderName}
            />
          </Grid>
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
              disabled
            />
          </Grid>
          <Grid item>
            <FormControl className={classes.formControl} variant='outlined'>
              <InputLabel htmlFor='destination-helper'>Destination</InputLabel>
              <Select
                value={destination}
                onChange={handleTransferFormChange('destination')}
                input={<OutlinedInput labelWidth={85} name='destination' />}
                error={!!formError.destination}
                id={'destination'}
              >
                {recipients.length === 0 ? (
                  <MenuItem value=''>
                    <em>None</em>
                  </MenuItem>
                ) : (
                  recipients.map(recipient => {
                    return (
                      <MenuItem key={recipient.name} value={recipient.email}>
                        <div>
                          <Typography>{recipient.name}</Typography>
                          <Typography className={classes.securityAnswerBtnHelperText}>
                            {recipient.email}
                          </Typography>
                        </div>
                      </MenuItem>
                    )
                  })
                )}
              </Select>
              <FormHelperText id='destination-helper'>
                <span>
                  <Button
                    onClick={() => {
                      addRecipient()
                    }}
                    className={classes.addNewRecipientBtn}
                  >
                    <Typography color='primary' className={classes.addNewRecipientBtnText}>
                      Add New Recipient
                    </Typography>
                  </Button>
                </span>
              </FormHelperText>
            </FormControl>
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
          <Grid item>
            <TextField
              fullWidth
              id='message'
              label='Message (Optional)'
              className={classes.textField}
              margin='normal'
              variant='outlined'
              error={!!formError.message}
              helperText={formError.message}
              onChange={handleTransferFormChange('message')}
              value={message || ''}
              inputProps={{ maxLength: 72 }} // message max length
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
  },
  formControl: {
    width: '100%',
    margin: '5px 0px 5px 0px'
  },
  addNewRecipientBtn: {
    margin: '0px 0px 0px 0px'
  },
  addNewRecipientBtnText: {
    fontSize: '14px'
  }
})

export default withStyles(styles)(TransferFormComponent)
