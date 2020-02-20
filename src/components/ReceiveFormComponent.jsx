import React, { Component, useState } from 'react'
import { AccountDropdown } from './TransferFormComponents'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import CircularProgress from '@material-ui/core/CircularProgress'
import Divider from '@material-ui/core/Divider'
import { FromAndToSection } from './TransferInfoCommon'
import { getCryptoSymbol, getTxFeesCryptoType } from '../tokens'
import Grid from '@material-ui/core/Grid'
import LinearProgress from '@material-ui/core/LinearProgress'
import { Link } from 'react-router-dom'
import Paths from '../Paths.js'
import Skeleton from '@material-ui/lab/Skeleton'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import update from 'immutability-helper'
import { withStyles } from '@material-ui/core/styles'

const formStyle = theme => ({
  divider: {
    marginBottom: '10px'
  },
  title: {
    marginBottom: '10px'
  },
  cardRoot: {
    maxWidth: 540,
    alignSelf: 'center',
    width: '100%',
    boxShadow: '0px 4px 8px rgba(0,0,0,0.1)',
    borderRadius: '8px',
    padding: 0
  }
})

const ReceiveTransferDataSection = withStyles(formStyle)(props => {
  let { classes, transfer, sendTime, receiveTime, cancelTime, currencyAmount } = props
  if (!transfer) {
    return (
      <Card className={classes.cardRoot}>
        <Box display='flex' width='100%' height={300} justifyContent='center' alignItems='center'>
          <CircularProgress />
        </Box>
      </Card>
    )
  }

  var {
    receivingId,
    transferAmount,
    senderName,
    sender,
    senderAvatar,
    receiverAvatar,
    destination,
    sendMessage,
    receiverName,
    cryptoType,
    receiveTxHash,
    cancelTxHash
  } = transfer

  const senderInfo = {
    name: senderName,
    email: sender,
    avatar: senderAvatar
  }
  const receiverInfo = {
    name: receiverName,
    email: destination,
    avatar: receiverAvatar
  }
  if (receiveTxHash || cancelTxHash) {
    // invalid pending transfer
    return (
      <>
        <Grid item>
          <Typography className={classes.title} variant='h3' align='left'>
            Sorry, we were unable to process your request
          </Typography>
          <Typography variant='caption'>
            {receiveTxHash
              ? `This transfer has been deposited on ${receiveTime}`
              : `This transfer has been cancelled on ${cancelTime}`}
          </Typography>
        </Grid>
        <Grid item>
          <Button
            fullWidth
            variant='contained'
            color='primary'
            component={Link}
            to={`${Paths.receipt}?receivingId=${receivingId}`}
          >
            View Receipt
          </Button>
        </Grid>
      </>
    )
  }

  return (
    <Card className={classes.cardRoot}>
      <Box padding={3}>
        <Typography className={classes.title} variant='h3' align='left'>
          Pending Transfer
        </Typography>
        <Grid container direction='column' spacing={2}>
          <Grid item>
            <FromAndToSection directionLabel='To' user={receiverInfo} />
          </Grid>
          <Grid item>
            <Divider />
          </Grid>
          <Grid item>
            <FromAndToSection directionLabel='From' user={senderInfo} />
          </Grid>
          <Grid item>
            <Divider />
          </Grid>
          <Grid item>
            <Grid container direction='column' alignItems='flex-start'>
              <Grid item>
                <Typography variant='caption'>Amount</Typography>
              </Grid>
              <Grid item>
                <Grid container direction='row' alignItems='center'>
                  <Typography variant='body2' id='transferAmount'>
                    {transferAmount} {getCryptoSymbol(cryptoType)}
                  </Typography>
                  <Typography style={{ marginLeft: '10px' }} variant='caption'>
                    ≈ {currencyAmount.transferAmount}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            <Divider />
          </Grid>
          <Grid item>
            <Grid container direction='column' alignItems='flex-start'>
              <Typography variant='caption'>Message</Typography>
              <Typography variant='body2'>{sendMessage}</Typography>
            </Grid>
          </Grid>
          <Grid item>
            <Divider />
          </Grid>
          <Grid item>
            <Grid container direction='column' spacing={1}>
              <Grid item>
                <Typography variant='caption'>Sent on {sendTime}</Typography>
              </Grid>
              <Grid item>
                <Typography variant='caption'>Transfer ID: {receivingId}</Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Card>
  )
})

const inputSectionStyle = theme => ({
  linearProgress: {
    marginTop: '8px'
  },
  textField: {
    marginTop: 30
  },
  btn: {
    alignSelf: 'center',
    marginTop: 30
  },
  linearProgressContainer: {
    backgroundColor: 'rgba(66,133,244,0.05)',
    borderRadius: '8px'
  },
  checkIcon: {
    width: 14,
    color: '#43b384',
    marginRight: 10
  }
})

const InputSection = withStyles(inputSectionStyle)(props => {
  const {
    onPasswordSubmit,
    clearError,
    error,
    classes,
    passwordValidated,
    actionsPending,
    transfer,
    onDeposit,
    accountSelection,
    currencyAmount,
    txFee
  } = props
  const [password, setPassword] = useState('')

  const onChange = password => {
    clearError()
    setPassword(password)
  }

  const onAccountChange = content => {
    const { transferForm, updateTransferForm } = props
    updateTransferForm(update(transferForm, { accountId: content.accountId }))
  }

  return (
    <Box display='flex' alignItems='stretch' flexDirection='column' padding={3} maxWidth='540px'>
      {!passwordValidated && (
        <>
          <Typography variant='h3'>Enter Security Answer to Unlock</Typography>
          <TextField
            fullWidth
            autoFocus
            id='answer'
            variant='outlined'
            placeholder='Enter Security Answer to Unlock'
            error={!!error}
            helperText={error ? 'Incorrect security answer' : undefined}
            onChange={event => {
              onChange(event.target.value)
            }}
            value={password || ''}
            onKeyPress={ev => {
              if (ev.key === 'Enter') {
                onPasswordSubmit(password)
              }
            }}
            disabled={actionsPending.verifyEscrowAccountPassword}
            className={classes.textField}
          />
          {actionsPending.verifyEscrowAccountPassword && (
            <Box
              display='flex'
              flexDirection='column'
              className={classes.linearProgressContainer}
              padding={2}
              mt={3}
            >
              <Typography variant='body2'>Checking password...</Typography>
              <LinearProgress className={classes.linearProgress} />
            </Box>
          )}
          <Button
            color='primary'
            variant='contained'
            className={classes.btn}
            onClick={() => {
              onPasswordSubmit(password)
            }}
            disabled={!password}
          >
            Validate Security Answer
          </Button>
        </>
      )}
      {passwordValidated && (
        <>
          <Box
            display='flex'
            flexDirection='row'
            alignItems='center'
            padding={2}
            style={{
              backgroundColor: 'rgba(67, 179, 132, 0.1)'
            }}
          >
            <CheckCircleIcon className={classes.checkIcon}></CheckCircleIcon>
            <Typography variant='body2'>Security answer validated</Typography>
          </Box>
          <Box mt={3} mb={3}>
            <Typography variant='h3'>Select Account to Deposit</Typography>
          </Box>
          <AccountDropdown
            online
            purpose='receive'
            inputLabel='Account'
            filterCriteria={accountData => accountData.cryptoType === transfer.cryptoType}
            updateForm={onAccountChange}
            hideCryptoDropdown
          />
          <Box>
            {txFee ? (
              <Typography variant='caption'>
                Network Fee:
                {` ${txFee.costInStandardUnit} ${getCryptoSymbol(
                  getTxFeesCryptoType(transfer.cryptoType)
                )} `}
                {`(${currencyAmount.txFee})`}
              </Typography>
            ) : (
              <>
                <Typography variant='caption'>Network Fee: </Typography>
                <Skeleton style={{ width: 50 }} />
              </>
            )}
          </Box>
          {actionsPending.acceptTransfer && (
            <Box
              display='flex'
              flexDirection='column'
              className={classes.linearProgressContainer}
              padding={2}
              mt={3}
            >
              <Typography variant='body2'>Processing transaction...</Typography>
              <LinearProgress className={classes.linearProgress} />
            </Box>
          )}
          <Button
            color='primary'
            variant='contained'
            className={classes.btn}
            onClick={() => {
              onDeposit()
            }}
            disabled={
              actionsPending.acceptTransfer ||
              actionsPending.syncWithNetwork ||
              actionsPending.getTxFee ||
              !accountSelection
            }
          >
            Deposit to Account
          </Button>
        </>
      )}
    </Box>
  )
})

class ReceiveFormComponent extends Component {
  state = {
    password: ''
  }

  componentDidMount () {
    this.clearError()
  }

  onChange = event => {
    this.clearError()
    this.setState({ password: event.target.value })
  }

  onPasswordSubmit = password => {
    let { verifyEscrowAccountPassword, escrowAccount } = this.props
    verifyEscrowAccountPassword({
      transferId: null,
      account: escrowAccount,
      password: password
    })
  }

  clearError = () => {
    const { error, clearVerifyEscrowAccountPasswordError } = this.props
    if (error) {
      clearVerifyEscrowAccountPasswordError()
    }
  }

  renderUnableToAccept () {
    const { classes, transfer, receiveTime, cancelTime } = this.props
    let title
    let message

    if (transfer.receiveTxHash) {
      title = 'Transfer Accepted'
      message = `This transfer was accepted on ${receiveTime}`
    } else if (transfer.cancelTxHash) {
      title = 'Transfer Cancelled'
      message = `This transfer was cancelled on ${cancelTime}`
    }

    return (
      <Grid container direction='column' justify='center' alignItems='stretch' spacing={2}>
        <Grid item>
          <Typography
            className={classes.title}
            variant='h3'
            align='left'
            title='unable-to-accept-title'
          >
            {title}
          </Typography>
        </Grid>
        <Grid item>
          <Typography variant='caption' id='unable-to-accept-message'>
            {message}
          </Typography>
          <Typography variant='caption' id='unable-to-accept-view-receipt'>
            {message}
          </Typography>
        </Grid>
        <Grid item>
          <Button component={Link} to={Paths.receipt}>
            View Receipt
          </Button>
        </Grid>
      </Grid>
    )
  }

  render () {
    const { transfer } = this.props

    let isInvalidTransfer = false

    if (transfer) {
      var { receiveTxHash, cancelTxHash } = transfer
      if (receiveTxHash || cancelTxHash) isInvalidTransfer = true
    }

    return (
      <Box display='flex' flexDirection='column' padding='0px 10px 0px 10px'>
        <ReceiveTransferDataSection {...this.props} />
        {!isInvalidTransfer && transfer && (
          <InputSection
            onPasswordSubmit={this.onPasswordSubmit}
            clearError={this.clearError}
            {...this.props}
          />
        )}
      </Box>
    )
  }
}

const styles = theme => ({
  title: {
    marginBottom: '10px'
  },
  btnSection: {
    marginTop: '60px'
  }
})

export { ReceiveTransferDataSection }
export default withStyles(styles)(ReceiveFormComponent)
