// @flow
import React, { Component } from 'react'
import Avatar from '@material-ui/core/Avatar'
import Box from '@material-ui/core/Box'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import { getCryptoSymbol, getTxFeesCryptoType } from '../tokens'
import Divider from '@material-ui/core/Divider'
import path from '../Paths.js'
import { getWalletLogo, getWalletTitle } from '../wallet'

type Props = {
  submitTx: Function,
  push: Function,
  classes: Object,
  transferForm: Object,
  wallet: Object,
  txFee: Object,
  currencyAmount: Object,
  currency: string,
  userProfile: Object,
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
      actionsPending,
      txFee,
      currencyAmount,
      push,
      userProfile
    } = this.props
    const {
      transferAmount,
      destination,
      receiverName,
      password,
      sendMessage,
      accountId
    } = transferForm
    const { cryptoType } = accountId
    return (
      <Grid container direction='column'>
        <Grid item>
          <Grid container direction='column' spacing={2}>
            <Grid item>
              <Typography variant='h3'>Review Details</Typography>
            </Grid>
            <Grid item>
              <Grid container direction='row' align='center' spacing={1}>
                <Grid item xs={6}>
                  <Box display='flex' flexDirection='column'>
                    <Typography variant='caption' align='left'>
                      Recipient
                    </Typography>
                    <Box display='flex' flexDirection='row' alignItems='center' mt={1}>
                      <Box mr={1} display='inline'>
                        {/* wallet icon */}
                        <Avatar src={userProfile.imageUrl}></Avatar>
                      </Box>
                      <Box display='flex' flexDirection='column' alignItems='flex-start'>
                        <Typography variant='body2' id='receiverName'>
                          {receiverName}
                        </Typography>
                        <Typography variant='caption'>{destination}</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box display='flex' flexDirection='column'>
                    <Typography variant='caption' align='left'>
                      From Account
                    </Typography>
                    <Box display='flex' flexDirection='row' alignItems='center' mt={1}>
                      <Box mr={1} display='inline'>
                        {/* wallet icon */}
                        <Avatar
                          style={{ borderRadius: '2px' }}
                          src={getWalletLogo(accountId.walletType)}
                        ></Avatar>
                      </Box>
                      <Box display='flex' flexDirection='column' alignItems='flex-start'>
                        <Typography variant='body2' id='accountDisplayName'>
                          {accountId.displayName}
                        </Typography>
                        <Typography variant='caption'>
                          {getWalletTitle(accountId.walletType)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
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
              <Button color='primary' size='large' onClick={() => push(`${path.transfer}`)}>
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
                  onClick={() => push(`${path.transfer}?step=2`)}
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
