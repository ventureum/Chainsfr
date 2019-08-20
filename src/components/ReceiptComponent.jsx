// @flow
import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import FileCopyIcon from '@material-ui/icons/FileCopy'
import Tooltip from '@material-ui/core/Tooltip'
import IconButton from '@material-ui/core/IconButton'
import Button from '@material-ui/core/Button'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { getCryptoSymbol, getTxFeesCryptoType } from '../tokens'
import Paths from '../Paths.js'
import { Link } from 'react-router-dom'

type Props = {
  backToHome: Function,
  cryptoSelection: string,
  txFee: Object,
  receipt: Object,
  classes: Object,
  password: string,
  sendTime: string,
  currencyAmount: Object
}

type State = {
  copied: boolean
}

class ReceiptComponent extends Component<Props, State> {
  state = {
    copied: false
  }

  render() {
    const { copied } = this.state
    const {
      classes,
      password,
      cryptoSelection,
      txFee,
      receipt,
      backToHome,
      sendTime,
      currencyAmount
    } = this.props
    const {
      transferId,
      transferAmount,
      sender,
      senderName,
      destination,
      receiverName,
      sendMessage
    } = receipt
    return (
      <Grid container direction='column' justify='center' alignItems='center'>
        <Grid item>
          <Paper className={classes.receiptPaper} elevation={1}>
            <Grid
              container
              direction='column'
              justify='center'
              alignItems='stretch'
            >
              <Grid item>
                <Grid item className={classes.titleSection}>
                  <Grid
                    container
                    direction='column'
                    justify='center'
                    alignItems='center'
                  >
                    <CheckCircleIcon className={classes.checkCircleIcon} />
                    <Typography
                      className={classes.title}
                      variant='h6'
                      align='center'
                    >
                      Transfer Sent
                    </Typography>
                    <Typography className={classes.transferId} align='center'>
                      {`Transfer ID: ${transferId}`}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item className={classes.reviewItem}>
                  <Typography className={classes.reviewSubtitle} align='left'>
                    From
                  </Typography>
                  <Typography
                    className={classes.reviewContent}
                    align='left'
                    id='senderName'
                  >
                    {senderName}
                  </Typography>
                  <Typography
                    className={classes.reviewContentEmail}
                    align='left'
                    id='sender'
                  >
                    {sender}
                  </Typography>
                </Grid>
                <Grid item className={classes.reviewItem}>
                  <Typography className={classes.reviewSubtitle} align='left'>
                    To
                  </Typography>
                  <Typography
                    className={classes.reviewContent}
                    align='left'
                    id='receiverName'
                  >
                    {receiverName}
                  </Typography>
                  <Typography className={classes.reviewContentEmail} align='left'>
                    {destination}
                  </Typography>
                </Grid>
                <Grid item className={classes.reviewItem}>
                  <Typography className={classes.reviewSubtitle} align='left'>
                    Amount
                  </Typography>
                  <Grid container direction='column'>
                    <Typography
                      className={classes.reviewContentAmount}
                      align='left'
                    >
                      {transferAmount} {getCryptoSymbol(cryptoSelection)}
                    </Typography>
                    <Typography
                      className={classes.reviewContentCurrencyAmount}
                      align='left'
                    >
                      ≈ {currencyAmount.transferAmount}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item className={classes.reviewItem}>
                  <Typography className={classes.reviewSubtitle} align='left'>
                    Transaction Fee
                  </Typography>
                  <Grid container direction='column'>
                    <Typography
                      className={classes.reviewContentAmount}
                      align='left'
                    >
                      {`${txFee.costInStandardUnit} ${getCryptoSymbol(
                        getTxFeesCryptoType(cryptoSelection)
                      )}`}
                    </Typography>
                    <Typography
                      className={classes.reviewContentCurrencyAmount}
                      align='left'
                    >
                      ≈ {currencyAmount.txFee}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item className={classes.reviewItem}>
                  <Typography className={classes.reviewSubtitle} align='left'>
                    Sent on
                  </Typography>
                  <Typography className={classes.reviewContent} align='left'>
                    {sendTime}
                  </Typography>
                </Grid>
                <Grid item className={classes.reviewItem}>
                  <Typography className={classes.reviewSubtitle} align='left'>
                    Security Answer
                  </Typography>
                  <Typography className={classes.reviewContent} align='left'>
                    {password}
                    <CopyToClipboard
                      text={password}
                      onCopy={() => {
                        this.setState({ copied: true }, () =>
                          setTimeout(
                            () => this.setState({ copied: false }),
                            1500
                          )
                        )
                      }}
                    >
                      <Tooltip placement='right' open={copied} title='Copied'>
                        <IconButton disableRipple className={classes.iconBtn}>
                          <FileCopyIcon fontSize='small' />
                        </IconButton>
                      </Tooltip>
                    </CopyToClipboard>
                  </Typography>
                </Grid>
                {sendMessage &&
                sendMessage.length > 0 && ( // only show message when available
                    <Grid item className={classes.reviewItem}>
                      <Typography
                        className={classes.reviewSubtitle}
                        align='left'
                      >
                        Message
                      </Typography>
                      <Typography
                        className={classes.reviewContentMessage}
                        align='left'
                      >
                        {sendMessage}
                      </Typography>
                    </Grid>
                  )}
                <Grid item className={classes.reviewItem}>
                  <Typography
                    variant='body2'
                    className={classes.informReceiverText}
                    align='left'
                  >
                    Please inform receiver the security answer to complete the
                    transaction.
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item className={classes.btnSection}>
          <Grid container direction='row' justify='center' spacing={3}>
            <Grid item>
              <Button
                id='back'
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
  reviewContentEmail: {
    color: '#777777',
    fontSize: '14px',
    lineHeight: '24px',
    fontWeight: 'bold'
  },
  reviewContentMessage: {
    color: '#333333',
    fontSize: '18px',
    lineHeight: '24px',
    maxWidth: '300px',
    // prevent overflow for long messages
    wordWrap: 'break-word'
  },
  reviewContentAmount: {
    color: '#333333',
    fontSize: '18px',
    lineHeight: '24px',
    fontWeight: 'bold'
  },
  reviewContentCurrencyAmount: {
    color: '#777777',
    fontSize: '14px',
    lineHeight: '24px',
    fontWeight: 'bold',
    marginLeft: '5px'
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

export default withStyles(styles)(ReceiptComponent)
