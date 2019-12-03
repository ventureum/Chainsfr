import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles'

import Button from '@material-ui/core/Button'
import Divider from '@material-ui/core/Divider'
import Dialog from '@material-ui/core/Dialog'
import CheckCircleIcon from '@material-ui/icons/CheckCircleRounded'

import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import LinearProgress from '@material-ui/core/LinearProgress'
import TextField from '@material-ui/core/TextField'
import TransferForm from '../containers/FormContainer'
import { getCryptoSymbol, getTxFeesCryptoType } from '../tokens'

class SendToAnotherAccountModal extends Component {
  renderReview = () => {
    const {
      transferForm,
      accountSelection,
      txFee,
      currencyAmount,
      errors,
      classes,
      actionsPending,
      handleConfirm,
      password,
      handlePasswordChange
    } = this.props
    const { transferAmount, destination } = transferForm
    const { cryptoType } = accountSelection
    return (
      <Grid container direction='column'>
        <Grid item>
          <Grid container direction='column' spacing={2}>
            <Grid item>
              <Grid container direction='row' align='center'>
                <Grid item xs={6}>
                  <Grid container direction='column' alignItems='flex-start'>
                    <Typography variant='caption'>From</Typography>
                    <Typography variant='body2' id='senderName'>
                      Chainsfr Wallet
                    </Typography>
                    <Typography variant='caption' id='senderName'>
                      {cryptoType === 'bitcoin'
                        ? `${accountSelection.hdWalletVariables.xpub.slice(
                            0,
                            12
                          )}...${accountSelection.hdWalletVariables.xpub.slice(-20)}`
                        : accountSelection.address}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item xs={6}>
                  <Grid container direction='column' alignItems='flex-start'>
                    <Typography variant='caption'>To</Typography>
                    <Typography variant='body2' id='receiverName'>
                      {destination.name}
                    </Typography>
                    <Typography variant='caption' id='receiverName'>
                      {destination.address}
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
                <Grid item>
                  <Typography variant='caption'>Amount</Typography>
                </Grid>
                <Grid item>
                  <Grid container direction='row' alignItems='center'>
                    <Typography variant='body2'>
                      {transferAmount} {getCryptoSymbol(cryptoType)}
                    </Typography>
                    <Typography style={{ marginLeft: '10px' }} variant='caption'>
                      ( ≈ {currencyAmount.transferAmount} )
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
                <Grid item>
                  <Typography variant='caption'>Transaction Fee</Typography>
                </Grid>
                <Grid item>
                  <Grid container direction='row' alignItems='center'>
                    <Typography variant='body2'>
                      {txFee.costInStandardUnit} {getCryptoSymbol(getTxFeesCryptoType(cryptoType))}
                    </Typography>
                    <Typography style={{ marginLeft: '10px' }} variant='caption'>
                      ( ≈ {currencyAmount.txFee} )
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Divider />
            </Grid>
            <Grid item>
              <Typography variant='body2' align='left'>
                Unlock your Chainsfr Wallet to transfer
              </Typography>
            </Grid>
            <Grid item>
              <TextField
                fullWidth
                autoFocus
                id='password'
                label='Chainsfr Wallet Password'
                margin='normal'
                variant='outlined'
                error={!!errors.checkWalletConnection}
                helperText={errors.checkWalletConnection ? 'Incorrect password' : ''}
                onChange={event => {
                  handlePasswordChange(event.target.value)
                }}
                value={password}
                type='password'
                onKeyPress={ev => {
                  if (ev.key === 'Enter') {
                    handleConfirm(password)
                  }
                }}
              />
            </Grid>
            {(actionsPending.checkWalletConnection ||
              actionsPending.verifyAccount ||
              actionsPending.directTransfer) && (
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
          </Grid>
        </Grid>
      </Grid>
    )
  }

  renderReceipt = () => {
    const { transferForm, accountSelection, txFee, currencyAmount, receipt, sendTime } = this.props
    const { transferAmount, destination } = transferForm
    const { cryptoType } = accountSelection
    return (
      <Grid container direction='column'>
        <Grid item>
          <Grid container direction='column' spacing={2}>
            <Grid item>
              <Typography variant='h3'>Review and Confirm</Typography>
            </Grid>
            <Grid item>
              <Grid container direction='row' align='center'>
                <Grid item xs={6}>
                  <Grid container direction='column' alignItems='flex-start'>
                    <Typography variant='caption'>From</Typography>
                    <Typography variant='body2' id='senderName'>
                      Chainsfr Wallet
                    </Typography>
                    <Typography variant='caption'>
                      {cryptoType === 'bitcoin'
                        ? `${accountSelection.hdWalletVariables.xpub.slice(
                            0,
                            16
                          )}...${accountSelection.hdWalletVariables.xpub.slice(-24)}`
                        : accountSelection.address}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item xs={6}>
                  <Grid container direction='column' alignItems='flex-start'>
                    <Typography variant='caption'>To</Typography>
                    <Typography variant='body2' id='receiverName'>
                      {destination.name}
                    </Typography>
                    <Typography variant='caption'>{destination.address}</Typography>
                  </Grid>
                </Grid>
              </Grid>
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
                    <Typography variant='body2'>
                      {transferAmount} {getCryptoSymbol(cryptoType)}
                    </Typography>
                    <Typography style={{ marginLeft: '10px' }} variant='caption'>
                      ( ≈ {currencyAmount.transferAmount} )
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
                <Grid item>
                  <Typography variant='caption'>Transaction Fee</Typography>
                </Grid>
                <Grid item>
                  <Grid container direction='row' alignItems='center'>
                    <Typography variant='body2'>
                      {txFee.costInStandardUnit} {getCryptoSymbol(getTxFeesCryptoType(cryptoType))}
                    </Typography>
                    <Typography style={{ marginLeft: '10px' }} variant='caption'>
                      ( ≈ {currencyAmount.txFee} )
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Divider />
            </Grid>
            <Grid item>
              <Typography variant='caption'>Sent on Time: {sendTime}</Typography>
            </Grid>
            <Grid item>
              <Typography variant='caption'>Transfer Hash: {receipt.txHash}</Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    )
  }

  renderDialogContent = () => {
    const { step } = this.props
    let content
    switch (step) {
      case 0:
        content = <TransferForm form='direct_transfer' />
        break
      case 1:
        content = this.renderReview()
        break
      case 2:
        content = this.renderReceipt()
        break
      default:
        content = null
    }
    return <div>{content}</div>
  }

  renderDialogActions = () => {
    const { password, step, back, next, errors } = this.props
    let buttons
    switch (step) {
      case 0:
        buttons = (
          <>
            <Button
              onClick={() => {
                back()
              }}
            >
              Cancel
            </Button>
            <Button
              variant='contained'
              color='primary'
              onClick={() => {
                next()
              }}
              style={{ marginLeft: '40px' }}
            >
              Continue
            </Button>
          </>
        )
        break
      case 1:
        buttons = (
          <>
            <Button
              onClick={() => {
                back()
              }}
            >
              Back to Previous
            </Button>
            <Button
              variant='contained'
              color='primary'
              onClick={() => {
                next(password)
              }}
              style={{ marginLeft: '40px' }}
              disabled={
                password.length === 0 || !!errors.checkWalletConnection || !!errors.directTransfer
              }
            >
              Confirm and Transfer
            </Button>
          </>
        )
        break
      case 2:
      default:
        buttons = (
          <Button
            variant='contained'
            color='primary'
            onClick={() => {
              next()
            }}
            style={{ marginLeft: '40px' }}
          >
            Close
          </Button>
        )
        break
    }
    return buttons
  }

  renderDialogTitle = () => {
    const { step, classes } = this.props
    switch (step) {
      case 0:
        return <Typography variant='h2'>Transfer to Another Account</Typography>
      case 1:
        return <Typography variant='h2'>Review and Confirm</Typography>
      case 2:
        return (
          <Grid container direction='column' justify='center' align='center'>
            <CheckCircleIcon className={classes.checkCircleIcon} />
            <Typography variant='h3'>Transfer Completed</Typography>
          </Grid>
        )
      default:
        return null
    }
  }

  render () {
    const { open, handleClose, classes } = this.props
    return (
      <Dialog
        open={open}
        onClose={() => {
          handleClose()
        }}
        scroll='body'
        classes={{ paperScrollBody: classes.paperScrollBody }}
      >
        <div className={classes.dialogTitle}>{this.renderDialogTitle()}</div>
        <div>{this.renderDialogContent()}</div>
        <div className={classes.actionSection}>{this.renderDialogActions()}</div>
      </Dialog>
    )
  }
}

const styles = theme => ({
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500]
  },
  dialogTitle: {
    marginBottom: '60px'
  },
  linearProgressContainer: {
    backgroundColor: 'rgba(66,133,244,0.05)',
    borderRadius: '4px',
    padding: '10px 20px 10px 20px',
    marginTop: '30px'
  },
  checkCircleIcon: {
    color: '#43B384',
    fontSize: '48px',
    marginBottom: '14px',
    marginTop: '15px'
  },
  paperScrollBody: {
    padding: '60px',
    width: '600px'
  },
  actionSection: {
    display: 'flex',
    direction: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: '60px'
  }
})

export default withStyles(styles)(SendToAnotherAccountModal)
