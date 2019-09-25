// @flow
import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import { getCryptoSymbol, getTxFeesCryptoType } from '../tokens'
import LinearProgress from '@material-ui/core/LinearProgress'
import { getWalletTitle } from '../wallet'
import WalletUtils from '../wallets/utils'
import MetamaskPendingIcon from '../images/metamask_pending.png'
import Divider from '@material-ui/core/Divider'

type Props = {
  submitTx: Function,
  goToStep: Function,
  classes: Object,
  transferForm: Object,
  cryptoSelection: string,
  walletSelection: string,
  wallet: Object,
  txFee: Object,
  currencyAmount: Object,
  currency: string,
  userProfile: Object,
  actionsPending: {
    submitTx: boolean,
    getTxFee: boolean
  }
}

const BASE_WALLET_INSTRUCTION = {
  ledger:
    'Please keep your Ledger connected and carefully verify all transaction details on your device. ' +
    'Press the right button to confirm and sign the transaction if everything is correct. ' +
    'The transaction is then signed and sent to the network for confirmation.',
  metamask: 'Please confirm transaction in the Metamask popup window.',
  drive: 'Please wait while we are broadcasting your transaction to the network.',
  metamaskWalletConnect: 'Please confirm transaction in the MetaMask Mobile on your phone',
  walletLink: 'Please confirm transaction in the Mobile wallet on your phone',
  referralWallet: 'Please wait while we are broadcasting your transaction to the network.'
}

const BASE_CRYPTO_INSTRUCTION = {
  dai:
    'Two consecutive transactions will be sent: The first one prepays the transaction fees for receiving or cancellation.' +
    'The second one sends DAI tokens.'
}

const WALLET_INSTRUCTION = {
  ledger: {
    bitcoin: BASE_WALLET_INSTRUCTION.ledger,
    ethereum: BASE_WALLET_INSTRUCTION.ledger,
    dai: (
      <div>
        {BASE_WALLET_INSTRUCTION.ledger}
        <br /> <br />
        {BASE_CRYPTO_INSTRUCTION.dai}
      </div>
    )
  },
  metamask: {
    ethereum: (
      <div>
        {BASE_WALLET_INSTRUCTION.metamask}
        <br /> <br />
        Look for <img src={MetamaskPendingIcon} alt='metamask pending icon' />
        on the right side of the address bar if the popup is not shown.
      </div>
    ),
    dai: (
      <div>
        {BASE_WALLET_INSTRUCTION.metamask}
        <br /> <br />
        {BASE_CRYPTO_INSTRUCTION.dai}
        <br /> <br />
        Look for <img src={MetamaskPendingIcon} alt='metamask pending icon' />
        on the right side of the address bar if the popup is not shown.
      </div>
    )
  },
  drive: {
    bitcoin: BASE_WALLET_INSTRUCTION.drive,
    ethereum: BASE_WALLET_INSTRUCTION.drive,
    dai: BASE_WALLET_INSTRUCTION.drive,
    libra: BASE_WALLET_INSTRUCTION.drive
  },
  metamaskWalletConnect: {
    ethereum: <div>{BASE_WALLET_INSTRUCTION.metamaskWalletConnect}</div>,
    dai: (
      <div>
        {BASE_WALLET_INSTRUCTION.metamaskWalletConnect}
        <br /> <br />
        {BASE_CRYPTO_INSTRUCTION.dai}
      </div>
    )
  },
  trustWalletConnect: {
    ethereum: <div>{BASE_WALLET_INSTRUCTION.metamaskWalletConnect}</div>,
    dai: (
      <div>
        {BASE_WALLET_INSTRUCTION.metamaskWalletConnect}
        <br /> <br />
        {BASE_CRYPTO_INSTRUCTION.dai}
      </div>
    )
  },
  coinomiWalletConnect: {
    ethereum: <div>{BASE_WALLET_INSTRUCTION.metamaskWalletConnect}</div>,
    dai: (
      <div>
        {BASE_WALLET_INSTRUCTION.metamaskWalletConnect}
        <br /> <br />
        {BASE_CRYPTO_INSTRUCTION.dai}
      </div>
    )
  },
  coinbaseWalletLink: {
    ethereum: <div>{BASE_WALLET_INSTRUCTION.walletLink}</div>
  },
  referralWallet: {
    ethereum: <div>{BASE_WALLET_INSTRUCTION.referralWallet}</div>
  }
}

class ReviewComponent extends Component<Props> {
  handleReviewNext = () => {
    const {
      userProfile,
      wallet,
      transferForm,
      currency,
      cryptoSelection,
      walletSelection,
      txFee
    } = this.props
    const {
      transferAmount,
      transferCurrencyAmount,
      sender,
      senderName,
      destination,
      receiverName,
      password,
      sendMessage
    } = transferForm

    // submit tx
    this.props.submitTx({
      fromWallet: WalletUtils.toWalletDataFromState(walletSelection, cryptoSelection, wallet),
      transferAmount: transferAmount,
      transferFiatAmountSpot: transferCurrencyAmount,
      fiatType: currency,
      // receiver
      destination: destination,
      receiverName: receiverName,
      // sender
      senderName: senderName,
      senderAvatar: userProfile.imageUrl,
      sender: sender,
      password: password,
      sendMessage: sendMessage,
      txFee: txFee
    })
  }
  render () {
    const {
      classes,
      transferForm,
      cryptoSelection,
      actionsPending,
      txFee,
      walletSelection,
      currencyAmount
    } = this.props
    const {
      transferAmount,
      sender,
      senderName,
      destination,
      receiverName,
      password,
      sendMessage
    } = transferForm

    return (
      <Grid container direction='column'>
        <Grid item>
          <Grid container direction='column' spacing={2}>
            <Grid item>
              <Typography variant='h3'>Review and Confirm</Typography>
            </Grid>
            <Grid item>
              <Grid container direction='row' align='center' spacing={1}>
                <Grid item xs={6}>
                  <Grid container direction='column' alignItems='flex-start'>
                    <Typography variant='caption'>From</Typography>
                    <Typography variant='body2' id='senderName'>
                      {senderName}
                    </Typography>
                    <Typography variant='caption' id='sender'>
                      {sender}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item xs={6}>
                  <Grid container direction='column' alignItems='flex-start'>
                    <Typography variant='caption'>To</Typography>
                    <Typography variant='body2' id='receiverName'>
                      {receiverName}
                    </Typography>
                    <Typography variant='caption'>{destination}</Typography>
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
                      {transferAmount} {getCryptoSymbol(cryptoSelection)}
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
                      {txFee.costInStandardUnit}{' '}
                      {getCryptoSymbol(getTxFeesCryptoType(cryptoSelection))}
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
            {sendMessage && sendMessage.length > 0 && (
              <>
                <Grid item>
                  <Divider />
                </Grid>
                <Grid item>
                  <Grid container direction='column' alignItems='flex-start'>
                    <Grid item>
                      <Typography variant='caption'>Message</Typography>
                      <Typography variant='body2'>{sendMessage}</Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </>
            )}
            <Grid item>
              <Divider />
            </Grid>
            {actionsPending.submitTx && (
              <Grid item>
                <Paper style={{ padding: '20px', marginTop: '30px' }}>
                  <Grid container direction='column'>
                    <Grid item>
                      <Typography variant='h6'>
                        {getWalletTitle(walletSelection)} Transfer Instructions
                      </Typography>
                    </Grid>
                    <Grid>
                      <Typography variant='caption'>
                        {WALLET_INSTRUCTION[walletSelection][cryptoSelection]}
                      </Typography>
                    </Grid>
                    <Grid>
                      <LinearProgress className={classes.linearProgress} />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Grid>
        <Grid item className={classes.btnSection}>
          <Grid container direction='row' justify='center' spacing={3}>
            <Grid item>
              <Button
                color='primary'
                size='large'
                onClick={() => this.props.goToStep(-1)}
                disabled={actionsPending.submitTx}
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
                  disabled={actionsPending.submitTx}
                  onClick={this.handleReviewNext}
                >
                  Confirm and transfer
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
