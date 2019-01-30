import React, { Component } from 'react'

import { withStyles } from '@material-ui/core/styles'
import Stepper from '@material-ui/core/Stepper'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import MetamaskLogo from './images/metamask-button.svg'
import HardwareWalletLogo from './images/hardware-wallet-button.svg'
import EthereumLogo from './images/eth.svg'
import BitcoinLogo from './images/btc.svg'
import DaiLogo from './images/dai.svg'
import TextField from '@material-ui/core/TextField'
import Divider from '@material-ui/core/Divider'
import SquareButton from './SquareButtonComponent'
import NavBar from './NavBarComponent'

function getSteps () {
  return ['Access My Wallet', 'Set Recipient and PIN', 'Review']
}

const cryptoAbbreviationMap = {
  'ethereum': 'ETH',
  'bitcoin': 'BTC',
  'dai': 'DAI'
}

const walletCryptoSupports = {
  'chainsfer': ['ethereum', 'bitcoin', 'dai'],
  'metamask': ['ethereum'],
  'ledger': ['ethereum', 'bitcoin', 'dai']
}

const walletSelections = [
  {
    walletType: 'chainsfer',
    title: 'C-Wallet',
    desc: 'Use Chainsfer Wallet',
    logo: MetamaskLogo,
    disabled: true
  },
  {
    walletType: 'metamask',
    title: 'Metamask',
    desc: 'MetaMask Extension',
    logo: MetamaskLogo,
    disabled: false,
    supportedCrypto: ['ethereum']
  },
  {
    walletType: 'ledger',
    title: 'Ledger',
    desc: 'Ledger Hardware Wallet',
    logo: HardwareWalletLogo,
    disabled: true,
    supportedCrypto: ['ethereum', 'bitcoin', 'dai']
  }
]

const cryptoSelections = [
  {
    cryptoType: 'ethereum',
    title: 'Ethereum',
    logo: EthereumLogo,
    disabled: false
  },
  {
    cryptoType: 'bitcoin',
    title: 'Bitcoin',
    logo: BitcoinLogo,
    disabled: true
  },
  {
    cryptoType: 'dai',
    title: 'DAI',
    logo: DaiLogo,
    disabled: true
  }
]

class TransferComponent extends Component {
  state = {
    requestedNextStep: null,
    activeStep: 0,
    cryptoType: '',
    walletType: '',
    transferAmount: '0',
    password: 'wallet state title logo',
    destination: '',
    sender: ''
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevProps.metamask && prevProps.metamask.connected && prevState.walletType === 'metamask') {
      // metamask selected and connected
      // move to next step
      if (prevState.activeStep === 0 && prevState.requestedNextStep === 1) {
        this.setState({ activeStep: 1 })
      }
    } else if (prevProps.ledgerNanoS.connected && prevState.walletType === 'ledger') {
      if (prevState.activeStep === 0 && prevState.requestedNextStep === 1) {
        this.setState({ activeStep: 1 })
      }
    }
  }

  handleNext = () => {
    this.setState(state => ({
      activeStep: state.activeStep + 1
    }))
  };

  handleBack = () => {
    this.setState(state => ({
      activeStep: state.activeStep - 1,
      requestedNextStep: null
    }))
  };

  handleReset = () => {
    this.setState({
      activeStep: 0
    })
  };

  handleWalletAndCryptoSelectionNext = () => {
    this.setState({ requestedNextStep: 1 })
    if (this.state.walletType === 'metamask') {
      this.props.checkMetamaskConnection()
    } else if (this.state.walletType === 'ledger') {
      this.props.checkLedgerNanoSConnection()
    }
  }

  handleRecipientSettingNext = () => {
    this.setState({ activeStep: 2 })
  }

  handleReviewNext = () => {
    let { walletType, cryptoType, transferAmount, destination, sender, password } = this.state
    let { metamask } = this.props
    // submit tx
    this.props.submitTx({
      fromWallet: metamask,
      walletType: walletType,
      cryptoType: cryptoType,
      transferAmount: transferAmount,
      destination: destination,
      sender: sender,
      password: password
    })
  }

  handleCryptoTypeOnClick = (cryptoType) => {
    this.setState((state) => {
      return {
        cryptoType: state.cryptoType !== cryptoType ? cryptoType : '',
        requestedNextStep: null
      }
    })
  }

  handleWalletTypeOnClick = (walletType) => {
    this.setState((state) => {
      return {
        walletType: state.walletType !== walletType ? walletType : '',
        cryptoType: null, // reset crypto selection
        requestedNextStep: null
      }
    })
  }

  handleTransferFormChange = name => event => {
    console.log(name, event.target.value)
    this.setState({
      [name]: event.target.value
    })
  }

  renderWalletSelection = () => {
    const { walletType } = this.state

    return (
      <Grid container direction='row' justify='center' alignItems='center'>
        {walletSelections.map(w =>
          (<Grid item key={w.walletType}>
            <SquareButton
              disabled={w.disabled}
              onClick={() => this.handleWalletTypeOnClick(w.walletType)}
              logo={w.logo}
              title={w.title}
              desc={w.desc}
              selected={w.walletType === walletType}
            />
          </Grid>))}
      </Grid>
    )
  }

  renderCryptoSelection = () => {
    const { walletType, cryptoType } = this.state
    return (
      <Grid container direction='row' justify='center' alignItems='center'>
        {cryptoSelections.filter(c => walletCryptoSupports[walletType].includes(c.cryptoType)).map(c =>
          (<Grid item key={c.cryptoType}>
            <SquareButton
              disabled={c.disabled}
              onClick={() => this.handleCryptoTypeOnClick(c.cryptoType)}
              logo={c.logo}
              title={c.title}
              selected={c.cryptoType === cryptoType}
            />
          </Grid>))}
      </Grid>
    )
  }

  renderWalletAndCryptoSelection = () => {
    const { walletType, cryptoType } = this.state
    return (
      <Grid container direction='column' justify='center' alignItems='stretch' spacing={24}>
        <Grid item>
          <Typography variant='h6' align='left'>
            Choose your wallet
          </Typography>
        </Grid>
        <Grid item>
          {this.renderWalletSelection()}
        </Grid>
        {walletType && <div>
          <Grid item>
            <Typography variant='h6' align='left'>
              Choose cryptocurrency
            </Typography>
          </Grid>
          <Grid item>
            {this.renderCryptoSelection()}
          </Grid>
        </div>}
        <Grid item>
          <Button
            fullWidth
            variant='contained'
            color='primary'
            size='large'
            onClick={this.handleWalletAndCryptoSelectionNext}
            disabled={!walletType || !cryptoType}
          >
            Continue
          </Button>
        </Grid>
      </Grid>
    )
  }

  renderRecipientSetting = () => {
    const { classes } = this.props
    const { transferAmount, destination, password } = this.state
    return (
      <Grid container direction='column' justify='center' alignItems='stretch' spacing={24}>
        <form className={classes.recipientSettingForm} noValidate autoComplete='off'>
          <Grid item>
            <TextField
              fullWidth
              required
              id='amount'
              label='Amount'
              className={classes.textField}
              margin='normal'
              variant='outlined'
              onChange={this.handleTransferFormChange('transferAmount')}
            />
          </Grid>
          <Grid item>
            <TextField
              fullWidth
              required
              id='sender'
              label='Your Email'
              placeholder='john@gmail.com'
              className={classes.textField}
              margin='normal'
              variant='outlined'
              helperText='A tracking number will be sent to this email. It will also be shown to the recipient'
              onChange={this.handleTransferFormChange('sender')}
            />
          </Grid>
          <Grid item>
            <TextField
              fullWidth
              required
              id='destination'
              label='Recipient Email'
              placeholder='john@gmail.com'
              className={classes.textField}
              margin='normal'
              variant='outlined'
              onChange={this.handleTransferFormChange('destination')}
            />
          </Grid>
          <Grid item>
            <TextField
              fullWidth
              required
              id='password'
              label='Security Answer'
              defaultValue={password}
              className={classes.textField}
              margin='normal'
              variant='outlined'
              helperText='Use the offline auto-generated password for maximum security'
              onChange={this.handleTransferFormChange('password')}
            />
          </Grid>
          <Grid item>
            <Button
              className={classes.continueBtn}
              fullWidth
              variant='contained'
              color='primary'
              size='large'
              onClick={this.handleRecipientSettingNext}
              disabled={!transferAmount || !destination || !password}
            >
              Continue
            </Button>
            <Button
              className={classes.backBtn}
              fullWidth
              variant='contained'
              color='primary'
              size='large'
              onClick={this.handleBack}
            >
              Back
            </Button>
          </Grid>
        </form>
      </Grid>
    )
  }

  renderReview = () => {
    const { classes } = this.props
    const { walletType, cryptoType, transferAmount, sender, destination, password } = this.state
    return (
      <Grid container direction='column' justify='center' alignItems='stretch'>
        <Grid item>
          <Typography className={classes.title} variant='h6' align='center'>
            Review details of your transfer
          </Typography>
        </Grid>
        <Grid item>
          <Paper className={classes.reviewPaper} elevation={1}>
            <Grid container direction='row' justify='space-between' alignItems='center'>
              <Grid item lg={6}>
                <Typography className={classes.reviewLeftTitle} align='left'>
                  Transfer details
                </Typography>
              </Grid>
            </Grid>
            <Grid container direction='row' justify='space-between' alignItems='center'>
              <Grid item lg={6}>
                <Typography className={classes.reviewLeftSubtitle} align='left'>
                  You send
                </Typography>
              </Grid>
              <Grid item lg={6}>
                <Typography className={classes.reviewRightSubtitleLarge} align='right'>
                  {transferAmount} {cryptoAbbreviationMap[cryptoType]}
                </Typography>
              </Grid>
            </Grid>
            <Grid container direction='row' justify='space-between' alignItems='center'>
              <Grid item lg={6}>
                <Typography className={classes.reviewLeftSubtitle} align='left'>
                  Your email
                </Typography>
              </Grid>
              <Grid item lg={6}>
                <Typography className={classes.reviewRightSubtitleSmall} align='right'>
                  {sender}
                </Typography>
              </Grid>
            </Grid>
            <Divider className={classes.reviewDivider} variant='middle' />
            <Grid container direction='row' justify='space-between' alignItems='center'>
              <Grid item lg={6}>
                <Typography className={classes.reviewLeftTitle} align='left'>
                  Recipient details
                </Typography>
              </Grid>
            </Grid>
            <Grid container direction='row' justify='space-between' alignItems='center'>
              <Grid item lg={6}>
                <Typography className={classes.reviewLeftSubtitle} align='left'>
                  Email
                </Typography>
              </Grid>
              <Grid item lg={6}>
                <Typography className={classes.reviewRightSubtitleSmall} align='right'>
                  {destination}
                </Typography>
              </Grid>
            </Grid>
            <Grid container direction='row' justify='space-between' alignItems='center'>
              <Grid item lg={6}>
                <Typography className={classes.reviewLeftSubtitle} align='left'>
                  Security Answer
                </Typography>
              </Grid>
              <Grid item lg={6}>
                <Typography className={classes.reviewRightSubtitleSmall} align='right'>
                  {password}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item>
          <Button
            className={classes.submitBtn}
            fullWidth
            variant='contained'
            color='primary'
            size='large'
            onClick={this.handleReviewNext}
          >
            Confirm and submit
          </Button>
          <Button
            className={classes.backBtn}
            fullWidth
            variant='contained'
            color='primary'
            size='large'
            onClick={this.handleBack}
          >
            Back
          </Button>
        </Grid>
      </Grid>
    )
  }

  getStepContent = (step) => {
    switch (step) {
      case 0:
        return this.renderWalletAndCryptoSelection()
      case 1:
        return this.renderRecipientSetting()
      case 2:
        return this.renderReview()
      default:
        return 'Unknown step'
    }
  }

  render () {
    const { classes } = this.props
    const steps = getSteps()
    const { activeStep } = this.state

    return (
      <div className={classes.root}>
        <NavBar />
        <Stepper activeStep={activeStep}>
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <div>
          <Grid container className={classes.root} direction='column' justify='center' alignItems='center'>
            <Grid item>
              <Grid container direction='column' justify='center' alignItems='center'>
                <Grid item>
                  {this.getStepContent(activeStep)}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </div>
        {activeStep === steps.length && (
           <Paper square elevation={0} className={classes.resetContainer}>
             <Typography>All steps completed - you&apos;re finished</Typography>
             <Button onClick={this.handleReset} className={classes.button}>
               Reset
             </Button>
           </Paper>
        )}
      </div>
    )
  }
}

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  grow: {
    flexGrow: 1,
  },
  button: {
    marginTop: theme.spacing.unit,
    marginRight: theme.spacing.unit
  },
  actionsContainer: {
    marginBottom: theme.spacing.unit * 2
  },
  resetContainer: {
    padding: theme.spacing.unit * 3
  },
  stepper: {
    background: '#f1f1f1'
  },
  walletBtn: {
    width: '180px',
    height: '230px',
    padding: '10px 15px 25px',
    marginLeft: '10px',
    marginRight: '10px',
    borderRadius: '5px',
    backgroundColor: '#fff',
    transition: 'all .3s ease'
  },
  walletBtnLogo: {
    height: '100px'
  },
  walletBtnTittle: {
    fontWeight: '500',
    fontSize: '20px',
    marginBottom: '10px'
  },
  walletBtnDesc: {
    lineHeight: '20px',
    color: '#506175',
    fontSize: '14px'
  },
  cryptoIcon: {
    height: '100px',
    margin: theme.spacing.unit * 2
  },
  recipientSettingForm: {
    maxWidth: '400px'
  },
  reviewPaper: {
    minWidth: '339px',
    border: 'solid 1px #e2e6e8',
    borderRadius: '4px',
    padding: '24px'
  },
  stepContentContainer: {
    maxWidth: '400px'
  },
  continueBtn: {
    marginTop: '16px'
  },
  backBtn: {
    marginTop: '16px'
  },
  submitBtn: {
    marginTop: '16px',
    color: '#fff',
    backgroundColor: '#2ED06E'
  },
  title: {
    color: '#2e4369',
    fontSize: '28px',
    fontWeight: '800',
    lineHeight: '32px',
    fontFamily: 'Averta,Avenir W02,Avenir,Helvetica,Arial,sans-serif',
    padding: '48px 0 24px 0'
  },
  reviewLeftTitle: {
    color: '#829ca9',
    fontWeight: '600',
    letterSpacaing: '0',
    fontSize: '14px',
    lineHeight: '24px',
    fontFamily: 'Averta,Avenir W02,Avenir,Helvetica,Arial,sans-serif'
  },
  reviewLeftSubtitle: {
    color: '#5d7079',
    fontWeight: '400',
    letterSpacaing: '.016em',
    fontSize: '14px',
    lineHeight: '24px',
    fontFamily: 'Averta,Avenir W02,Avenir,Helvetica,Arial,sans-serif'
  },
  reviewRightSubtitleLarge: {
    color: '#2e4369',
    fontWeight: '600',
    letterSpacaing: '0',
    fontSize: '22px',
    lineHeight: '30px',
    fontFamily: 'Averta,Avenir W02,Avenir,Helvetica,Arial,sans-serif'
  },
  reviewRightSubtitleSmall: {
    color: '#2e4369',
    fontWeight: '400',
    letterSpacaing: '016em',
    fontSize: '16px',
    lineHeight: '24px',
    fontFamily: 'Averta,Avenir W02,Avenir,Helvetica,Arial,sans-serif'
  },
  reviewDivider: {
    marginTop: '16px',
    marginBottom: '16px'
  }
})

export default withStyles(styles)(TransferComponent)
