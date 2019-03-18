import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import HelpIcon from '@material-ui/icons/Help'
import Tooltip from '@material-ui/core/Tooltip'
import IconButton from '@material-ui/core/IconButton'
import MuiLink from '@material-ui/core/Link'
import Button from '@material-ui/core/Button'
import moment from 'moment'
import Paths from '../Paths.js'
import { Link } from 'react-router-dom'
import { getCryptoSymbol, getTxFeesCryptoType } from '../tokens'

class ReceiveReceiptComponent extends Component {
  render () {
    const { classes, txCost, receipt, backToHome } = this.props
    const { receivingId, transferAmount, sender, destination, cryptoType, receiveTimestamp, receiveTxHash } = receipt

    if (txCost) {
      var receiveAmount = ['ethereum', 'bitcoin'].includes(cryptoType)
        ? parseFloat(transferAmount) - parseFloat(txCost.costInStandardUnit)
        : parseFloat(transferAmount)
    }

    return (
      <Grid container direction='column' justify='center' alignItems='center'>
        <Grid item>
          <Paper className={classes.receiptPaper} elevation={1}>
            <Grid container direction='column' justify='center' alignItems='stretch'>
              <Grid item>
                <Grid item className={classes.titleSection}>
                  <Grid container direction='column' justify='center' alignItems='center'>
                    <CheckCircleIcon className={classes.checkCircleIcon} />
                    <Typography className={classes.title} variant='h6' align='center'>
                      Transfer Completed
                    </Typography>
                    <Typography className={classes.transferId} align='center'>
                      {`Transfer ID: ${receivingId}`}
                    </Typography>
                  </Grid>
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
                    Amount
                  </Typography>
                  <Typography className={classes.reviewContent} align='left'>
                    {transferAmount} {getCryptoSymbol(cryptoType)}
                  </Typography>
                </Grid>
                <Grid item className={classes.reviewItem}>
                  <Typography className={classes.reviewSubtitle} align='left'>
                    Transaction Fee
                  </Typography>
                  <Typography className={classes.reviewContent} align='left'>
                    {`${txCost.costInStandardUnit} ${getCryptoSymbol(getTxFeesCryptoType(cryptoType))}`}
                  </Typography>
                </Grid>
                <Grid item className={classes.reviewItem}>
                  <Typography className={classes.reviewSubtitle} align='left'>
                    You will receive*
                  </Typography>
                  <Typography className={classes.reviewContent} align='left'>
                    {`${receiveAmount} ${getCryptoSymbol(cryptoType)}`}
                  </Typography>
                </Grid>
                <Grid item className={classes.reviewItem}>
                  <Typography className={classes.reviewSubtitle} align='left'>
                    Accept on
                  </Typography>
                  <Typography className={classes.reviewContent} align='left'>
                    {moment.unix(receiveTimestamp).format('MMM Do YYYY, HH:mm:ss')}
                  </Typography>
                </Grid>
                <Grid item className={classes.reviewItem}>
                  <Typography variant='body2' className={classes.informReceiverText} align='left'>
                    It may takes a few minutes to complete the transaction. You can track the transaction
                    <MuiLink target='_blank' rel='noopener' href={`https://rinkeby.etherscan.io/tx/${receiveTxHash}`}>
                      {' here'}
                    </MuiLink>
                    . A confirmation email will be sent to you.
                    <Tooltip title='Open FAQ'>
                      <IconButton disableRipple className={classes.iconBtn}>
                        <HelpIcon fontSize='small' />
                      </IconButton>
                    </Tooltip>
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item className={classes.btnSection}>
          <Grid container direction='row' justify='center' spacing={24}>
            <Grid item>
              <Button
                fullWidth
                variant='contained'
                color='primary'
                size='large'
                component={Link}
                to={Paths.home}
                onClick={backToHome}
              >
                Back to Home
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>)
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
  transferId: {
    color: '#777777',
    fontSize: '12px',
    lineHeight: '17px'
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
  receiptPaper: {
    marginTop: '20px',
    padding: '60px 90px'
  },
  checkCircleIcon: {
    color: '#0CCD70',
    fontSize: '40px',
    marginBottom: '14px'
  },
  informReceiverText: {
    color: '#333333',
    maxWidth: '360px'
  },
  btnSection: {
    marginTop: '60px'
  },
  iconBtn: {
    padding: '0',
    marginLeft: '16px'
  }
})

export default withStyles(styles)(ReceiveReceiptComponent)
