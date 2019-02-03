import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles'
import { Link } from 'react-router-dom'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import Divider from '@material-ui/core/Divider'
import paths from '../Paths'

const cryptoAbbreviationMap = {
  'ethereum': 'ETH',
  'bitcoin': 'BTC',
  'dai': 'DAI'
}

class ReviewComponent extends Component {
  handleReviewNext = () => {
    const { metamask, transferForm, cryptoSelection, walletSelection } = this.props
    const { transferAmount, sender, destination, password } = transferForm
    // submit tx
    this.props.submitTx({
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
    const { classes, transferForm, cryptoSelection } = this.props
    const { transferAmount, sender, destination, password } = transferForm
    return (
      <Grid container direction='column' justify='center' alignItems='stretch'>
        <Grid item>
          <Grid container direction='column' justify='center' alignItems='center'>
            <Grid item>
              <Grid item>
                <Typography className={classes.title} variant='h6' align='center'>
                  Review details of your transfer
                </Typography>
              </Grid>
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
                  0.00004 ETH
                </Typography>
              </Grid>
              <Grid item className={classes.reviewItem}>
                <Typography className={classes.reviewSubtitle} align='left'>
                  Total Cost
                </Typography>
                <Typography className={classes.reviewContent} align='left'>
                  1.24004 ETH
                </Typography>
              </Grid>
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
                to={paths.recipient}
              >
                Back to previous
              </Button>
            </Grid>
            <Grid item>
              <Button
                fullWidth
                variant='contained'
                color='primary'
                size='large'
                component={Link}
                to={paths.review}
                onClick={this.handleReviewNext}
              >
                Confirm and transfer
              </Button>
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
    padding: '0px 0px 0px 0px'
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
    marginTop: '30px'
  },
  btnSection: {
    marginTop: '60px'
  }
})

export default withStyles(styles)(ReviewComponent)
