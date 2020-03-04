// @flow
import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import { getCryptoSymbol, getTxFeesCryptoType } from '../tokens'
import Divider from '@material-ui/core/Divider'
import path from '../Paths.js'
import * as TransferInfoCommon from './TransferInfoCommon'
import type { AccountData } from '../types/account.flow'

type Props = {
  submitTx: Function,
  push: Function,
  classes: Object,
  transferForm: Object,
  accountSelection: AccountData,
  receiveAccountSelection: AccountData,
  wallet: Object,
  txFee: Object,
  currencyAmount: Object,
  currency: string,
  userProfile: Object,
  directTransfer: boolean,
  actionsPending: {
    submitTx: boolean,
    getTxFee: boolean
  },
  error: string
}

class ReviewComponent extends Component<Props> {
  render () {
    const {
      classes,
      transferForm,
      accountSelection,
      receiveAccountSelection,
      actionsPending,
      txFee,
      currencyAmount,
      push,
      userProfile,
      directTransfer
    } = this.props
    const { transferAmount, password, sendMessage } = transferForm
    const { cryptoType } = accountSelection

    return (
      <Grid container direction='column'>
        <Grid item>
          <Grid container direction='column' spacing={2}>
            <Grid item>
              <Typography variant='h3'>Review Details</Typography>
            </Grid>
            <Grid item>
              <TransferInfoCommon.FromAndToSection
                directionLabel='To'
                user={
                  !directTransfer
                    ? {
                        name: transferForm.receiverName,
                        email: transferForm.destination
                      }
                    : null
                }
                account={directTransfer ? receiveAccountSelection : null}
              />
            </Grid>
            <Grid item>
              <Divider />
            </Grid>
            <Grid item>
              <TransferInfoCommon.FromAndToSection
                directionLabel='From'
                user={
                  !directTransfer
                    ? {
                        name: userProfile.name,
                        email: userProfile.email
                      }
                    : null
                }
                account={accountSelection}
              />
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
                      {txFee && txFee.costInStandardUnit}{' '}
                      {getCryptoSymbol(getTxFeesCryptoType(cryptoType))}
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
            {password && (
              <>
                <Grid item>
                  <Grid container direction='column' alignItems='flex-start'>
                    <Grid item>
                      <Typography variant='caption'>Security Answer</Typography>
                      <Typography variant='body2'>{password}</Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item>
                  <Divider />
                </Grid>
              </>
            )}
            <Grid item>
              <Grid container direction='column' alignItems='flex-start'>
                <Grid item>
                  <Typography variant='caption'>Message</Typography>
                  <Typography variant='body2'>{sendMessage || '(Not provided)'}</Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Divider />
            </Grid>
          </Grid>
        </Grid>
        <Grid item className={classes.btnSection}>
          <Grid container direction='row' justify='center' spacing={3}>
            <Grid item>
              <Button
                color='primary'
                size='large'
                onClick={() => push(`${directTransfer ? path.directTransfer : path.transfer}`)}
              >
                Back to previous
              </Button>
            </Grid>
            {!actionsPending.submitTx && (
              <Grid item>
                <Button
                  fullWidth
                  variant='contained'
                  color='primary'
                  size='large'
                  onClick={() =>
                    push(`${directTransfer ? path.directTransfer : path.transfer}?step=2`)
                  }
                >
                  Continue
                </Button>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
    )
  }
}

const styles = theme => ({
  btnSection: {
    marginTop: '60px',
    marginBottom: '150px'
  },
  linearProgress: {
    marginTop: '20px'
  }
})

export default withStyles(styles)(ReviewComponent)
