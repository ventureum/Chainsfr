// @flow
import React, { Component } from 'react'
import clsx from 'clsx'
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
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

// Material Icons
import AccountCircle from '@material-ui/icons/AccountCircleRounded'
import AddIcon from '@material-ui/icons/AddRounded'

type Props = {
  generateSecurityAnswer: Function,
  push: Function,
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

type State = {
  inputLabelWidth: number
}

class EmailTransferFormComponent extends Component<Props, State> {
  inputLabelRef: any
  constructor (props) {
    super(props)
    this.state = {
      inputLabelWidth: 0
    }
    this.inputLabelRef = React.createRef()
  }

  componentDidMount () {
    this.setState({ inputLabelWidth: this.inputLabelRef.current.offsetWidth })
  }

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
      accountSelection,
      push
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
      <Grid container direction='column' justify='center' alignItems='stretch'>
        <Grid item style={{ marginBottom: 30 }}>
          <Typography variant='h3'>Set up Transfer</Typography>
        </Grid>
        <Grid item>
          <FormControl variant='outlined' fullWidth margin='normal'>
            <InputLabel ref={this.inputLabelRef} htmlFor='destination-helper'>
              Select Recipient
            </InputLabel>
            <Select
              value={destination || ''}
              onChange={handleTransferFormChange('destination')}
              input={
                <OutlinedInput labelWidth={this.state.inputLabelWidth} name='Select Recipient' />
              }
              error={!!formError.destination}
              id={'destination'}
            >
              {recipients.map(recipient => {
                return (
                  <MenuItem key={recipient.name} value={recipient.email}>
                    <Box display='flex' alignItems='flex-top'>
                      <AccountCircle fontSize='large' color='secondary' id='accountCircle' />
                      <Box ml={1}>
                        <Typography variant='body2'>{recipient.name}</Typography>
                        <Typography variant='caption'>{recipient.email}</Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                )
              })}
              {recipients.length !== 0 && <Divider />}
              <MenuItem value='AddRecipient'>
                <Button
                  onClick={() => {
                    addRecipient()
                  }}
                  variant='text'
                  color='primary'
                  fullWidth
                >
                  <AddIcon fontSize='small' />
                  Add Recipient
                </Button>
              </MenuItem>
            </Select>
          </FormControl>
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
          <Grid container direction='row' justify='center' alignItems='stretch'>
            <Grid item xs={5}>
              <TextField
                margin='normal'
                fullWidth
                id='cryptoAmount'
                variant='outlined'
                error={!!formError.transferAmount}
                type='number'
                helperText={
                  formError.transferAmount ||
                  (accountSelection
                    ? `Balance: ${accountSelection.balanceInStandardUnit} ${getCryptoSymbol(
                        accountSelection.cryptoType
                      )}`
                    : 'Balance: 0.00')
                }
                disabled={!accountSelection}
                onChange={handleTransferFormChange('transferAmount')}
                value={transferAmount}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Typography variant='body2' color='textSecondary'>
                        Amount
                      </Typography>
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position='end'>
                      <Typography variant='body2' color='textSecondary'>
                        {(accountSelection && getCryptoSymbol(accountSelection.cryptoType)) ||
                          'BTC'}
                      </Typography>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs align='center'>
              <Box pt={2}>
                <Icon className={clsx(classes.icon, 'fa fa-exchange-alt')} />
              </Box>
            </Grid>
            <Grid item xs={5}>
              <TextField
                margin='normal'
                fullWidth
                id='currencyAmount'
                variant='outlined'
                error={!!formError.transferCurrencyAmount}
                helperText={formError.transferCurrencyAmount || `Balance: ${balanceCurrencyAmount}`}
                type='number'
                onWheel={event => {
                  event.preventDefault()
                }}
                disabled={!accountSelection}
                onChange={handleTransferFormChange('transferCurrencyAmount')}
                value={transferCurrencyAmount}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <Typography variant='body2' color='textSecondary'>
                        Amount
                      </Typography>
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position='end'>
                      <Typography variant='body2' color='textSecondary'>
                        {currency}
                      </Typography>
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
            margin='normal'
            variant='outlined'
            error={!!formError.password}
            helperText={
              formError.password || 'We recommend you to use auto-generated security answer.'
            }
            onChange={handleTransferFormChange('password')}
            value={password || ''}
            InputProps={{
              endAdornment: accountSelection && (
                <InputAdornment position='end'>
                  <Tooltip title='Generate Security Answer' position='left'>
                    <Button
                      className={classes.generateBtn}
                      color='primary'
                      onClick={() => {
                        handleTransferFormChange('password')({
                          target: { value: generateSecurityAnswer() }
                        })
                      }}
                    >
                      Generate
                    </Button>
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
        <Grid item>
          <Grid
            container
            direction='row'
            justify='center'
            spacing={2}
            className={classes.btnSection}
          >
            <Grid item>
              <Button
                color='primary'
                variant='text'
                onClick={() => this.props.backToHome()}
                id='back'
                to={path.home}
                component={Link}
              >
                Back to Previous
              </Button>
            </Grid>
            <Grid item>
              <Button
                id='continue'
                variant='contained'
                color='primary'
                onClick={() => push(`${path.transfer}?step=1`)}
                disabled={!validateForm(transferForm) || actionsPending.getTxFee}
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
    marginTop: 30,
    marginBottom: 30
  },
  icon: {
    color: '#777777'
  },
  addNewRecipientBtn: {
    margin: '0px 0px 0px 0px'
  },
  addNewRecipientBtnText: {
    fontSize: '14px'
  },
  generateBtn: {
    background: `rgba(57, 51, 134, 0.1)`,
    borderRadis: '4px',
    fontSize: '12px',
    padding: '6px 10px 6px 10px'
  }
})

export default withStyles(styles)(EmailTransferFormComponent)
