import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles'
import { Link, Redirect } from 'react-router-dom'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import CircularProgress from '@material-ui/core/CircularProgress'
import UUIDv1 from 'uuid/v1'
import paths from '../Paths'

const cryptoAbbreviationMap = {
  'ethereum': 'ETH',
  'bitcoin': 'BTC',
  'dai': 'DAI'
}

class ReviewComponent extends Component {
  state = {
    id: null // on-refresh, clear transfer id so we will not be redirected to the receipt page
  }

  handleReviewNext = () => {
    const { metamask, transferForm, cryptoSelection, walletSelection } = this.props
    const { transferAmount, sender, destination, password } = transferForm

    let id = UUIDv1()
    // submit tx
    this.props.submitTx({
      id: id,
      fromWallet: metamask,
      walletType: walletSelection,
      cryptoType: cryptoSelection,
      transferAmount: transferAmount,
      destination: destination,
      sender: sender,
      password: password
    })

    this.setState({ id: id })
  }

  componentDidMount () {
    // refresh gas cost
    const { metamask, transferForm, cryptoSelection, walletSelection } = this.props
    const { transferAmount, sender, destination, password } = transferForm
    this.props.getGasCost({
      fromWallet: metamask,
      walletType: walletSelection,
      cryptoType: cryptoSelection,
      transferAmount: transferAmount,
      destination: destination,
      sender: sender,
      password: password
    })
  }

  render () {
    const { id } = this.state
    const { classes, transferForm, cryptoSelection, actionsPending, receipt, gasCost } = this.props
    const { transferAmount, sender, destination, password } = transferForm

    if (!actionsPending.submitTx && receipt && receipt.txRequest.id === id) {
      return (<Redirect push to={paths.transfer + paths.receiptStep} />)
    }

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
                  <Typography className={classes.reviewContent} align='left'>
                    {transferAmount} {cryptoAbbreviationMap[cryptoSelection]}
                  </Typography>
                </Grid>
                <Grid item className={classes.reviewItem}>
                  <Typography className={classes.reviewSubtitle} align='left'>
                    Gas Fee
                  </Typography>
                  <Typography className={classes.reviewContent} align='left'>
                    {!actionsPending.getGasCost && gasCost
                      ? `${gasCost.costInEther} ETH`
                      : <CircularProgress size={18} color='primary' />}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography className={classes.reviewSubtitle} align='left'>
                    Total Cost
                  </Typography>
                  <Typography className={classes.reviewContent} align='left'>
                    {!actionsPending.getGasCost && gasCost
                      ? `${parseFloat(gasCost.costInEther) + parseFloat(transferAmount)} ETH`
                      : <CircularProgress size={18} color='primary' />}
                  </Typography>
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
                component={Link}
                to={paths.transfer + paths.recipientStep}
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
