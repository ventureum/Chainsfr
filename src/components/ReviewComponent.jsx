// @flow
import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import CircularProgress from '@material-ui/core/CircularProgress'
import { getCryptoSymbol, getTxFeesCryptoType } from '../tokens'
import LinearProgress from '@material-ui/core/LinearProgress'
import { getWalletTitle } from '../wallet'
import WalletUtils from '../wallets/utils'
import MetamaskPendingIcon from '../images/metamask_pending.png'

type Props = {
  submitTx: Function,
  goToStep: Function,
  classes: Object,
  transferForm: Object,
  cryptoSelection: string,
  walletSelection: string,
  wallet: Object,
  txFee: Object,
  actionsPending: {
    submitTx: boolean,
    getTxFee: boolean
  }
}

const BASE_WALLET_INSTRUCTION = {
  ledger: 'Please keep your Ledger connected and carefully verify all transaction details on your device. ' +
          'Press the right button to confirm and sign the transaction if everything is correct. ' +
          'The transaction is then signed and sent to the network for confirmation.',
  metamask: 'Please confirm transaction in the Metamask popup window.',
  drive: 'Please wait while we are broadcasting your transaction to the network.'
}

const BASE_CRYPTO_INSTRUCTION = {
  dai: 'Two consecutive transactions will be sent: The first one prepays the transaction fees for receiving or cancellation.' +
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
    dai: BASE_WALLET_INSTRUCTION.drive
  }
}

class ReviewComponent extends Component<Props> {
  handleReviewNext = () => {
    const { wallet, transferForm, cryptoSelection, walletSelection, txFee } = this.props
    const { transferAmount, sender, destination, password } = transferForm

    // submit tx
    this.props.submitTx({
      fromWallet: WalletUtils.toWalletDataFromState(walletSelection, cryptoSelection, wallet),
      transferAmount: transferAmount,
      destination: destination,
      sender: sender,
      password: password,
      txFee: txFee
    })
  }

  render () {
    const { classes, transferForm, cryptoSelection, actionsPending, txFee, walletSelection } = this.props
    const { transferAmount, sender, destination, password } = transferForm

    return (
      <Grid container direction='column' justify='center' alignItems='center'>
        <Grid item className={classes.reviewSection}>
          <Grid container direction='column' justify='center'>
            <Grid item>
              <Grid item>
                <Typography className={classes.title} variant='h6' align='center'>
                  Please review details of your transfer
                </Typography>
              </Grid>
              <Paper className={classes.reviewItemContainer}>
                <Grid item className={classes.reviewItem}>
                  <Typography className={classes.reviewSubtitle} align='left'>
                    From
                  </Typography>
                  <Typography className={classes.reviewContent} align='left'>
                    {sender}
                  </Typography>
                </Grid>
                <Grid item className={classes.reviewItem}>
                  <Typography className={classes.reviewSubtitle} align='left'>
                    To
                  </Typography>
                  <Typography className={classes.reviewContent} align='left'>
                    {destination}
                  </Typography>
                </Grid>
                <Grid item className={classes.reviewItem}>
                  <Typography className={classes.reviewSubtitle} align='left'>
                    Security Answer
                  </Typography>
                  <Typography className={classes.reviewContent} align='left'>
                    {password}
                  </Typography>
                </Grid>
                <Grid item className={classes.reviewItem}>
                  <Typography className={classes.reviewSubtitle} align='left'>
                    Amount
                  </Typography>
                  <Typography className={classes.reviewContentAmount} align='left'>
                    {transferAmount} {getCryptoSymbol(cryptoSelection)}
                  </Typography>
                </Grid>
                <Grid item className={classes.reviewItem}>
                  <Typography className={classes.reviewSubtitle} align='left'>
                    Transaction Fee
                  </Typography>
                  {!actionsPending.getTxFee && txFee
                    ? <Typography className={classes.reviewContent} align='left'>
                      {txFee.costInStandardUnit} {getCryptoSymbol(getTxFeesCryptoType(cryptoSelection))}
                    </Typography>
                    : <CircularProgress size={18} color='primary' />}
                </Grid>
              </Paper>
              { actionsPending.submitTx &&
                <Grid item>
                  <Grid container direction='column' className={classes.instructionContainer}>
                    <Grid item>
                      <Typography className={classes.instructionTitile}>
                        {getWalletTitle(walletSelection)} Transfer Instructions
                      </Typography>
                    </Grid>
                    <Grid>
                      <Typography className={classes.instructionText}>
                        {WALLET_INSTRUCTION[walletSelection][cryptoSelection]}
                      </Typography>
                    </Grid>
                    <Grid>
                      <LinearProgress className={classes.linearProgress} />
                    </Grid>
                  </Grid>
                </Grid>
              }
            </Grid>
          </Grid>
        </Grid>
        <Grid item className={classes.btnSection}>
          <Grid container direction='row' justify='center' spacing={3}>
            <Grid item>
              <Button
                color='primary'
                size='large'
                onClick={() => this.props.goToStep(-1)}
              >
                Back to previous
              </Button>
            </Grid>
            {!actionsPending.submitTx &&
            <Grid item>
              <div className={classes.wrapper}>
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
              </div>
            </Grid>
            }
          </Grid>
        </Grid>
      </Grid>
    )
  }
}

const styles = theme => ({
  title: {
    color: '#333333',
    fontSize: '18px',
    fontWeight: '600',
    lineHeight: '24px',
    padding: '0px 0px 0px 0px',
    marginBottom: '20px'
  },
  reviewItemContainer: {
    border: 'border: 1px solid #D2D2D2',
    borderRadius: '8px',
    backgroundColor: '#FAFAFA',
    padding: '20px'
  },
  reviewSubtitle: {
    color: '#777777',
    fontSize: '12px',
    lineHeight: '17px'
  },
  reviewContent: {
    color: '#333333',
    fontSize: '18px',
    lineHeight: '24px'
  },
  reviewContentAmount: {
    color: '#333333',
    fontSize: '18px',
    lineHeight: '24px',
    fontWeight: 'bold'
  },
  reviewItem: {
    marginBottom: '30px'
  },
  btnSection: {
    marginTop: '60px',
    width: '100%',
    maxWidth: '470px',
    marginBottom: '150px'
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  },
  wrapper: {
    position: 'relative'
  },
  instructionContainer: {
    padding: '20px',
    backgroundColor: 'rgba(66,133,244,0.05)',
    borderRadius: '4px',
    margin: '30px 0px 30px 0px'
  },
  instructionTitile: {
    color: '#333333',
    fontSize: '14px',
    fontWeight: '500'
  },
  instructionText: {
    fontSize: '12px',
    color: '#666666'
  },
  reviewSection: {
    maxWidth: '360px',
    width: '100%'
  },
  linearProgress: {
    marginTop: '20px'
  }
})

export default withStyles(styles)(ReviewComponent)
