// @flow
import React, { Component } from 'react'
import clsx from 'clsx'
import Grid from '@material-ui/core/Grid'
import Avatar from '@material-ui/core/Avatar'
import Button from '@material-ui/core/Button'
import Box from '@material-ui/core/Box'
import LinearProgress from '@material-ui/core/LinearProgress'
import { withStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import InputAdornment from '@material-ui/core/InputAdornment'
import Icon from '@material-ui/core/Icon'
import IconButton from '@material-ui/core/IconButton'
import RefreshIcon from '@material-ui/icons/Refresh'
import numeral from 'numeral'
import { getCryptoSymbol, getCryptoLogo } from '../tokens'
import Select from '@material-ui/core/Select'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import OutlinedInput from '@material-ui/core/OutlinedInput'
import Divider from '@material-ui/core/Divider'
import Tooltip from '@material-ui/core/Tooltip'
import { accountStatus } from '../types/account.flow'
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
  addRecipient: Function,
  cryptoAccounts: Array<Object>
}

class TransferFormComponent extends Component<Props> {
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
      addRecipient,
      generateSecurityAnswer,
      cryptoAccounts
    } = this.props
    const {
      accountSelection,
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
          <FormControl className={classes.formControl} variant='outlined'>
            <InputLabel htmlFor='destination-helper'>Select Account</InputLabel>
            <Select
              renderValue={value => {
                return (
                  <div>
                    <Typography>{value.name}</Typography>
                    <Typography className={classes.securityAnswerBtnHelperText}>
                      {value.cryptoType === 'bitcoin'
                        ? `${value.hdWalletVariables.xpub.slice(
                            0,
                            16
                          )}...${value.hdWalletVariables.xpub.slice(-24)}`
                        : value.address}
                    </Typography>
                  </div>
                )
              }}
              value={accountSelection || ''}
              onChange={handleTransferFormChange('accountSelection')}
              input={<OutlinedInput labelWidth={125} name='Select Account' />}
              error={!!formError.accountSelection}
              id={'accountSelection'}
            >
              {cryptoAccounts.map((accountData, index) => {
                return (
                  <MenuItem key={index} value={accountData}>
                    <Grid container spacing={2}>
                      <Grid item>
                        <Avatar src={getCryptoLogo(accountData.cryptoType)}></Avatar>
                      </Grid>
                      <Grid item>
                        <Typography>{accountData.name}</Typography>
                        <Typography className={classes.securityAnswerBtnHelperText}>
                          {accountData.cryptoType === 'bitcoin'
                            ? `${accountData.hdWalletVariables.xpub.slice(
                                0,
                                16
                              )}...${accountData.hdWalletVariables.xpub.slice(-24)}`
                            : accountData.address}
                        </Typography>
                      </Grid>
                    </Grid>
                  </MenuItem>
                )
              })}
              {cryptoAccounts.length !== 0 && <Divider />}
              <MenuItem value='addCryptoAccount'>
                <Button onClick={() => {}} style={{ width: '100%' }}>
                  <Typography>Add Account</Typography>
                </Button>
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>
        {accountSelection && accountSelection.status === accountStatus.syncing && (
          <Grid item>
            <Box
              style={{
                padding: '20px',
                backgroundColor: 'rgba(57, 51, 134, 0.05)',
                borderRadius: '4px'
              }}
            >
              <Typography variant='body2' style={{ marginBottom: '10px' }}>
                Checking your account
              </Typography>
              <LinearProgress />
            </Box>
          </Grid>
        )}
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
                value={transferAmount || 0}
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
              'We recommend you to use auto-generated security password for better security'
            }
            onChange={handleTransferFormChange('password')}
            value={password || ''}
            InputProps={{
              endAdornment: accountSelection && (
                <InputAdornment position='end'>
                  <Tooltip title='Generate Security Answer' position='left'>
                    <IconButton color='primary' onClick={generateSecurityAnswer}>
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
