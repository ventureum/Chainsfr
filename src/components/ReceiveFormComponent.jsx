
import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import LinearProgress from '@material-ui/core/LinearProgress'
import Skeleton from '@material-ui/lab/Skeleton'
import update from 'immutability-helper'
import AccountDropdownContainer from '../containers/AccountDropdownContainer'
import Divider from '@material-ui/core/Divider'
import { getCryptoSymbol } from '../tokens'
import { Link } from 'react-router-dom'
import Paths from '../Paths.js'

function ReceiveTransferDataSectionUnstyled (props) {
  let { classes, transfer, sendTime, receiveTime, cancelTime, currencyAmount } = props
  if (transfer) {
    var {
      receivingId,
      transferAmount,
      senderName,
      sender,
      destination,
      sendMessage,
      receiverName,
      cryptoType,
      receiveTxHash,
      cancelTxHash
    } = transfer
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
    <>
      <Grid item>
        <Typography className={classes.title} variant='h3' align='left'>
          Accept Pending Transfer
        </Typography>
      </Grid>
      <Grid item>
        <Grid container direction='row' align='center' spacing={1}>
          <Grid item xs={6}>
            <Grid container direction='column' alignItems='flex-start'>
              {!transfer ? (
                <>
                  <Skeleton
                    height={14}
                    width='20%'
                    style={{ marginTop: '2px', marginBottom: '2px' }}
                  />
                  <Skeleton
                    height={16}
                    width='30%'
                    style={{ marginTop: '2px', marginBottom: '2px' }}
                  />
                  <Skeleton
                    height={14}
                    width='50%'
                    style={{ marginTop: '2px', marginBottom: '2px' }}
                  />
                </>
              ) : (
                <>
                  <Typography variant='caption'>From</Typography>
                  <Typography variant='body2' id='senderName'>
                    {senderName}
                  </Typography>
                  <Typography variant='caption' id='sender'>
                    {sender}
                  </Typography>
                </>
              )}
            </Grid>
          </Grid>
          <Grid item xs={6}>
            <Grid container direction='column' alignItems='flex-start'>
              {!transfer ? (
                <>
                  <Skeleton
                    height={14}
                    width='20%'
                    style={{ marginTop: '2px', marginBottom: '2px' }}
                  />
                  <Skeleton
                    height={16}
                    width='30%'
                    style={{ marginTop: '2px', marginBottom: '2px' }}
                  />
                  <Skeleton
                    height={14}
                    width='50%'
                    style={{ marginTop: '2px', marginBottom: '2px' }}
                  />
                </>
              ) : (
                <>
                  <Typography variant='caption'>To</Typography>
                  <Typography variant='body2' id='receiverName'>
                    {receiverName}
                  </Typography>
                  <Typography variant='caption' id='destination'>
                    {destination}
                  </Typography>
                </>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid item>
        <Divider className={classes.divider} />
      </Grid>
      <Grid item>
        <Grid container direction='column' alignItems='flex-start'>
          {!transfer ? (
            <>
              <Skeleton height={14} width='15%' style={{ marginTop: '2px', marginBottom: '2px' }} />
              <Skeleton height={16} width='30%' style={{ marginTop: '2px', marginBottom: '2px' }} />
            </>
          ) : (
            <>
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
            </>
          )}
        </Grid>
      </Grid>
      <Grid item>
        <Divider className={classes.divider} />
      </Grid>
      <Grid item>
        <Grid container direction='column' alignItems='flex-start'>
          {!transfer ? (
            <>
              <Skeleton height={14} width='15%' style={{ marginTop: '2px', marginBottom: '2px' }} />
              <Skeleton height={16} width='30%' style={{ marginTop: '2px', marginBottom: '2px' }} />
            </>
          ) : (
            <>
              <Typography variant='caption'>Message</Typography>
              <Typography variant='body2'>{sendMessage}</Typography>
            </>
          )}
        </Grid>
      </Grid>
      <Grid item>
        <Divider className={classes.divider} />
      </Grid>
      <Grid item>
        <Grid container direction='column' spacing={1}>
          {!transfer ? (
            <>
              <Skeleton height={14} width='15%' style={{ marginTop: '2px', marginBottom: '2px' }} />
              <Skeleton height={16} width='30%' style={{ marginTop: '2px', marginBottom: '2px' }} />
            </>
          ) : (
            <>
              <Grid item>
                <Typography variant='caption'>Sent on {sendTime}</Typography>
              </Grid>
              <Grid item>
                <Typography variant='caption'>Transfer ID: {receivingId}</Typography>
              </Grid>{' '}
            </>
          )}
        </Grid>
      </Grid>
    </>
  )
}

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

  handleNext = () => {
    let { verifyEscrowAccountPassword, escrowAccount } = this.props
    let { password } = this.state
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

  onAccountChange = account => {
    const { transferForm, updateTransferForm } = this.props
    updateTransferForm(update(transferForm, { accountId: { $set: account } }))
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
    const { classes, accountSelection, transfer, error, actionsPending, push } = this.props

    let isInvalidTransfer = false

    if (transfer) {
      var { receiveTxHash, cancelTxHash } = transfer
      if (receiveTxHash || cancelTxHash) isInvalidTransfer = true
    }
    const { password } = this.state

    return (
      <Grid container direction='column' justify='center' alignItems='stretch' spacing={2}>
        <ReceiveTransferDataSection {...this.props} />
        {!isInvalidTransfer && transfer && (
          <>
            <Grid item style={{ marginTop: '65px' }}>
              <AccountDropdownContainer
                purpose={'receive'}
                onChange={this.onAccountChange}
                filterCriteria={accountData => accountData.cryptoType === transfer.cryptoType}
                accountId={accountSelection}
              />
            </Grid>
            <Grid item>
              <TextField
                fullWidth
                autoFocus
                id='password'
                label='Security Answer'
                margin='normal'
                variant='outlined'
                error={!!error}
                helperText={
                  error
                    ? 'Incorrect security answer'
                    : 'Please enter security answer set by the sender'
                }
                onChange={this.onChange}
                value={password || ''}
                onKeyPress={ev => {
                  if (ev.key === 'Enter') {
                    this.handleNext()
                  }
                }}
              />
            </Grid>
          </>
        )}
        {actionsPending.verifyEscrowAccountPassword && (
          <Grid item>
            <Grid
              container
              direction='column'
              className={classes.linearProgressContainer}
              spacing={2}
            >
              <Grid item>
                <Typography variant='body2'>Checking password...</Typography>
              </Grid>
              <Grid item>
                <LinearProgress className={classes.linearProgress} />
              </Grid>
            </Grid>
          </Grid>
        )}
        {!isInvalidTransfer && (
          <Grid item className={classes.btnSection}>
            <Grid container direction='row' justify='center'>
              <Grid item>
                <Button
                  id='cancel'
                  color='primary'
                  size='large'
                  onClick={() => {
                    this.clearError()
                    push(Paths.home)
                  }}
                  disabled={actionsPending.verifyEscrowAccountPassword}
                >
                  Cancel
                </Button>
              </Grid>
              <Grid item>
                <Button
                  id='continue'
                  fullWidth
                  variant='contained'
                  color='primary'
                  size='large'
                  onClick={this.handleNext}
                  disabled={actionsPending.verifyEscrowAccountPassword || !accountSelection}
                >
                  Continue
                </Button>
              </Grid>
            </Grid>
          </Grid>
        )}
      </Grid>
    )
  }
}

const styles = theme => ({
  root: {
    padding: '0px 20px 0px 20px',
    margin: '60px 0px 60px 0px'
  },
  divider: {
    marginBottom: '10px'
  },
  title: {
    marginBottom: '10px'
  },
  btnSection: {
    marginTop: '60px'
  },
  linearProgressContainer: {
    backgroundColor: 'rgba(66,133,244,0.05)',
    borderRadius: '4px',
    padding: '10px 20px 10px 20px',
    marginTop: '30px'
  },
  linearProgress: {
    marginTop: '8px'
  },
  transferDataSectionSkeleton: {
    marginTop: '2px',
    marginBottom: '2px'
  }
})

const ReceiveTransferDataSection = withStyles(styles)(ReceiveTransferDataSectionUnstyled)
export { ReceiveTransferDataSection }
export default withStyles(styles)(ReceiveFormComponent)
