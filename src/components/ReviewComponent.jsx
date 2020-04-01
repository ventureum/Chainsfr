// @flow
import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import { getCryptoSymbol, getTxFeesCryptoType } from '../tokens'
import Divider from '@material-ui/core/Divider'
import path from '../Paths.js'
import * as TransferInfoCommon from './TransferInfoCommon'
import type { AccountData } from '../types/account.flow'
import type { Recipient } from '../types/transfer.flow.js'

type Props = {
  submitTx: Function,
  push: Function,
  transferForm: Object,
  recipients: Array<Recipient>,
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
      transferForm,
      accountSelection,
      receiveAccountSelection,
      actionsPending,
      txFee,
      currencyAmount,
      push,
      userProfile,
      directTransfer,
      recipients
    } = this.props
    const { transferAmount, password, sendMessage } = transferForm
    const { cryptoType } = accountSelection

    const recipient = recipients.find(r => r.email === transferForm.destination)
    return (
      <Grid container direction='column'>
        <Grid item>
          <Grid container direction='column' spacing={2}>
            <Grid item>
              <Typography variant='h3' data-test-id='title'>
                Review Details
              </Typography>
            </Grid>
            <Grid item>
              <TransferInfoCommon.FromAndToSection
                directionLabel='To'
                user={
                  !directTransfer
                    ? {
                        name: transferForm.receiverName,
                        email: transferForm.destination,
                        avatar: recipient && recipient.imageUrl
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
                        email: userProfile.email,
                        avatar: userProfile.imageUrl
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
                    <Typography variant='body2' data-test-id='transfer_amount'>
                      {transferAmount} {getCryptoSymbol(cryptoType)}
                    </Typography>
                    <Typography
                      style={{ marginLeft: '10px' }}
                      variant='caption'
                      data-test-id='currency_amount'
                    >
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
                    <Typography variant='body2' data-test-id='tx_fee'>
                      {txFee && txFee.costInStandardUnit}{' '}
                      {getCryptoSymbol(getTxFeesCryptoType(cryptoType))}
                    </Typography>
                    <Typography
                      style={{ marginLeft: '10px' }}
                      variant='caption'
                      data-test-id='currency_tx_fee'
                    >
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
                      <Typography variant='body2' data-test-id='security_answer'>
                        {password}
                      </Typography>
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
                  <Typography variant='body2' data-test-id='send_msg'>
                    {sendMessage || '(Not provided)'}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Divider />
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <Grid container direction='row' justify='center' spacing={2}>
            <Grid item>
              <Box mt={6} mb={3}>
                <Button
                  color='primary'
                  variant='text'
                  onClick={() => push(`${directTransfer ? path.directTransfer : path.transfer}`)}
                  data-test-id='back'
                >
                  Back
                </Button>
              </Box>
            </Grid>
            {!actionsPending.submitTx && (
              <Grid item>
                <Box mt={6} mb={3}>
                  <Button
                    fullWidth
                    variant='contained'
                    color='primary'
                    onClick={() =>
                      push(`${directTransfer ? path.directTransfer : path.transfer}?step=2`)
                    }
                    data-test-id='continue'
                  >
                    Continue
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
    )
  }
}

export default (ReviewComponent)
