import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import CircularProgress from '@material-ui/core/CircularProgress'
import { getCryptoSymbol } from '../tokens'

class ReviewComponent extends Component {
  handleReviewNext = () => {
    const { wallet, transferForm, cryptoSelection, walletSelection, txCost } = this.props
    const { transferAmount, sender, destination, password } = transferForm

    // submit tx
    this.props.submitTx({
      fromWallet: wallet,
      walletType: walletSelection,
      cryptoType: cryptoSelection,
      transferAmount: transferAmount,
      destination: destination,
      sender: sender,
      password: password,
      txCost: txCost
    })
  }

  componentDidMount () {
    // refresh gas cost
    const { cryptoSelection, getTxCost } = this.props
    getTxCost({ cryptoType: cryptoSelection })
  }

  render () {
    const { classes, transferForm, cryptoSelection, actionsPending, txCost } = this.props
    const { transferAmount, sender, destination, password } = transferForm

    return (
      <Grid container direction='column' justify='center' alignItems='stretch'>
        <Grid item>
          <Grid container direction='column' justify='center' alignItems='center'>
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
                  {!actionsPending.getTxCost && txCost
                    ? <Typography className={classes.reviewContent} align='left'>
                      {txCost.costInStandardUnit} {getCryptoSymbol(cryptoSelection)}
                    </Typography>
                    : <CircularProgress size={18} color='primary' />}
                </Grid>
                <Grid item>
                  <Typography className={classes.reviewSubtitle} align='left'>
                    Total Cost
                  </Typography>
                  {!actionsPending.getTxCost && txCost
                    ? <Typography className={classes.reviewContent} align='left'>
                      {parseFloat(txCost.costInStandardUnit) + parseFloat(transferAmount)} {getCryptoSymbol(cryptoSelection)}
                    </Typography>
                    : <CircularProgress size={18} color='primary' />}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
        <Grid item className={classes.btnSection}>
          <Grid container direction='row' justify='center' spacing={24}>
            <Grid item>
              <Button
                color='primary'
                size='large'
                onClick={() => this.props.goToStep(-1)}
              >
                Back to previous
              </Button>
            </Grid>
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
                {actionsPending.submitTx && <CircularProgress size={24} color='primary' className={classes.buttonProgress} />}
              </div>
            </Grid>
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
    marginTop: '60px'
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
  }
})

export default withStyles(styles)(ReviewComponent)
