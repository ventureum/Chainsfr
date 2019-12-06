// @flow
import React, { Component } from 'react'
import clsx from 'clsx'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles'
import { Link } from 'react-router-dom'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import InputAdornment from '@material-ui/core/InputAdornment'
import Icon from '@material-ui/core/Icon'
import IconButton from '@material-ui/core/IconButton'
import RefreshIcon from '@material-ui/icons/Refresh'
import { getCryptoSymbol } from '../tokens'
import Select from '@material-ui/core/Select'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import OutlinedInput from '@material-ui/core/OutlinedInput'
import Divider from '@material-ui/core/Divider'
import Tooltip from '@material-ui/core/Tooltip'
import AccountDropdownContainer from '../containers/AccountDropdownContainer'
import path from '../Paths.js'

type Props = {
  generateSecurityAnswer: Function,
  goToStep: Function,
  backToHome: Function,
  handleTransferFormChange: Function,
  validateForm: Function,
  balanceCurrencyAmount: string,
  transferForm: Object,
  currency: string,
  classes: Object,
  actionsPending: Object,
  recipients: Array<Object>,
  addRecipient: Function,
  walletSelectionPrefilled: string,
  accountSelection: Object
}

class EmailTransferFormComponent extends Component<Props> {
  render () {
    const {
      classes,
      transferForm,
      handleTransferFormChange,
      validateForm,
      currency,
      balanceCurrencyAmount,
      actionsPending,
      recipients,
      addRecipient,
      generateSecurityAnswer,
      walletSelectionPrefilled,
      accountSelection
    } = this.props
    const {
      transferAmount,
      transferCurrencyAmount,
      destination,
      password,
      sender,
      senderName,
      sendMessage,
      formError
    } = transferForm

    return (
      <Grid container direction='column' justify='center' alignItems='stretch' spacing={1}>
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
            value={senderName || ''}
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
            value={sender || ''}
            disabled
          />
        </Grid>
        <Grid item>
          <AccountDropdownContainer
            onChange={handleTransferFormChange('accountId')}
            filterCriteria={accountData =>
              !walletSelectionPrefilled || accountData.walletType === walletSelectionPrefilled
            }
            accountId={accountSelection}
          />
        </Grid>
        <Grid item>
          <FormControl className={classes.formControl} variant='outlined'>
            <InputLabel htmlFor='destination-helper'>Select Recipient</InputLabel>
            <Select
              value={destination || ''}
              onChange={handleTransferFormChange('destination')}
              input={<OutlinedInput labelWidth={125} name='Select Recipient' />}
              error={!!formError.destination}
              id={'destination'}
            >
              {recipients.map(recipient => {
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
              })}
              {recipients.length !== 0 && <Divider />}
              <MenuItem value='AddRecipient'>
                <Button
                  onClick={() => {
                    addRecipient()
                  }}
                  style={{ width: '100%' }}
                >
                  <Typography>Add Recipient</Typography>
                </Button>
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item>
          <Grid container direction='row' justify='center' alignItems='center' spacing={3}>
            <Grid item xs>
              <TextField
                margin='normal'
                fullWidth
                id='currencyAmount'
                variant='outlined'
                label='Fiat'
                error={!!formError.transferCurrencyAmount}
                helperText={formError.transferCurrencyAmount || `Balance: ${balanceCurrencyAmount}`}
                type='number'
                disabled={!accountSelection}
                onChange={handleTransferFormChange('transferCurrencyAmount')}
                value={transferCurrencyAmount}
                InputProps={{
                  startAdornment: <InputAdornment position='start'>{currency}</InputAdornment>
                }}
              />
            </Grid>
            <Grid item align='center'>
              <Icon className={clsx(classes.icon, 'fa fa-exchange-alt')} />
            </Grid>
            <Grid item xs>
              <TextField
                margin='normal'
                fullWidth
                id='cryptoAmount'
                variant='outlined'
                label='Amount (Cryptocurrency)'
                error={!!formError.transferAmount}
                type='number'
                helperText={
                  formError.transferAmount ||
                  (accountSelection
                    ? `Balance: ${accountSelection.balanceInStandardUnit} ${getCryptoSymbol(
                        accountSelection.cryptoType
                      )}`
                    : '')
                }
                disabled={!accountSelection}
                onChange={handleTransferFormChange('transferAmount')}
                value={transferAmount}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      {getCryptoSymbol(accountSelection && accountSelection.cryptoType)}
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <TextField
            disabled={!accountSelection}
            fullWidth
            id='password'
            label='Security Answer'
            className={classes.textField}
            margin='normal'
            variant='outlined'
            error={!!formError.password}
            helperText={
              formError.password ||
              'We recommend you to use auto-generated security password for better security'
            }
            onChange={handleTransferFormChange('password')}
            value={password || ''}
            InputProps={{
              endAdornment: accountSelection && (
                <InputAdornment position='end'>
                  <Tooltip title='Generate Security Answer' position='left'>
                    <IconButton
                      color='primary'
                      onClick={() => {
                        generateSecurityAnswer()
                      }}
                    >
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              )
            }}
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
            error={!!formError.sendMessage}
            helperText={formError.sendMessage}
            onChange={handleTransferFormChange('sendMessage')}
            value={sendMessage || ''}
            inputProps={{ maxLength: 100 }} // message max length
            disabled={!accountSelection}
          />
        </Grid>
        <Grid item className={classes.btnSection}>
          <Grid container direction='row' justify='center' spacing={3}>
            <Grid item>
              <Button
                color='primary'
                size='large'
                onClick={() => this.props.backToHome()}
                id='back'
                to={path.home}
                component={Link}
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

export default withStyles(styles)(EmailTransferFormComponent)
