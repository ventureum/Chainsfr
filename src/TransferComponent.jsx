import React, { Component } from 'react'
import './App.css'

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
import InputAdornment from '@material-ui/core/InputAdornment'
import Divider from '@material-ui/core/Divider'
import SquareButton from './SquareButtonComponent'

function getSteps() {
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
    destination: ''
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.metamask && prevProps.metamask.connected && prevState.walletType === 'metamask') {
      // metamask selected and connected
      // move to next step
      if (prevState.activeStep === 0 && prevState.requestedNextStep === 1) {
        this.setState({activeStep: 1})
      }
    }
  }

  handleNext = () => {
      this.setState(state => ({
      activeStep: state.activeStep + 1,
    }));
  };

  handleBack = () => {
    this.setState(state => ({
      activeStep: state.activeStep - 1,
      requestedNextStep: null
    }));
  };

  handleReset = () => {
    this.setState({
      activeStep: 0,
    });
  };

  handleWalletAndCryptoSelectionNext = () => {
    this.setState({requestedNextStep: 1})
    this.props.checkMetamaskConnection()
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
        cryptoType: null, //reset crypto selection
        requestedNextStep: null
      }
    })
  }

  handleTransferFormChange = name => event => {
    console.log(name, event.target.value)
    this.setState({
      [name]: event.target.value,
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
    const { classes } = this.props
    const { walletType, cryptoType } = this.state
    return (
      <Grid container direction='row' justify='center' alignItems='center'>
      { cryptoSelections.filter(c => walletCryptoSupports[walletType].includes(c.cryptoType)).map(c =>
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
    const { classes } = this.props
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
        { walletType && <div>
        <Grid item>
          <Typography variant='h6' align='left'>
            Choose cryptocurrency
          </Typography>
        </Grid>
        <Grid item>
          {this.renderCryptoSelection()}
        </Grid>
        </div> }
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


  renderRecipientSetting  = () => {
    const { classes } = this.props
    const { cryptoType, password } = this.state
    return (
      <Grid container direction='row' justify='center' alignItems='center'>
        <form className={classes.container} noValidate autoComplete="off">
          <Grid item>
            <TextField
              required
              id="amount"
              label="Amount"
              className={classes.textField}
              margin="normal"
              variant="outlined"
              InputProps={{
                endAdornment: <InputAdornment position="start"> {cryptoAbbreviationMap[cryptoType]} </InputAdornment>,
              }}
              onChange={this.handleTransferFormChange('transferAmount')}
            />
          </Grid>
          <Grid item>
            <TextField
              required
              id="destination"
              label="Recipient Email"
              placeholder="john@gmail.com"
              className={classes.textField}
              margin="normal"
              variant="outlined"
              onChange={this.handleTransferFormChange('destination')}
            />
          </Grid>
          <Grid item>
            <TextField
              required
              id="password"
              label="Password"
              defaultValue={password}
              className={classes.textField}
              margin="normal"
              variant="outlined"
              helperText='Use the auto-generated password for maximum security'
              onChange={this.handleTransferFormChange('password')}
            />
          </Grid>
        </form>
      </Grid>
    )
  }

  renderReview = () => {
    const { classes } = this.props
    const { walletType, cryptoType, transferAmount, destination, password } = this.state
    return (
      <Grid container direction='column' justify='center' alignItems='center'>
        <Grid item>
          <Typography variant='h6' align='center'>
            Review details of your transfer
          </Typography>
        </Grid>
        <Grid item>
          <Paper className={classes.reviewPaper} elevation={1}>
            <Grid container direction='row' justify='space-between' alignItems='center'>
              <Grid item lg={6}>
                <Typography align='left'>
                  Transfer details
                </Typography>
              </Grid>
            </Grid>
            <Grid container direction='row' justify='space-between' alignItems='center'>
              <Grid item lg={6}>
                <Typography align='left'>
                  You send
                </Typography>
              </Grid>
              <Grid item lg={6}>
                <Typography align='right'>
                  {transferAmount} {cryptoAbbreviationMap[cryptoType]}
                </Typography>
              </Grid>
            </Grid>
            <Divider variant="middle" />
            <Grid container direction='row' justify='space-between' alignItems='center'>
              <Grid item lg={6}>
                <Typography align='left'>
                  Recipient details
                </Typography>
              </Grid>
            </Grid>
            <Grid container direction='row' justify='space-between' alignItems='center'>
              <Grid item lg={6}>
                <Typography align='left'>
                  Email
                </Typography>
              </Grid>
              <Grid item lg={6}>
                <Typography align='right'>
                  {destination}
                </Typography>
              </Grid>
            </Grid>
            <Grid container direction='row' justify='space-between' alignItems='center'>
              <Grid item lg={6}>
                <Typography align='left'>
                  Password
                </Typography>
              </Grid>
              <Grid item lg={6}>
                <Typography align='right'>
                  {password}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item>
          <Button
            fullWidth
            variant='contained'
            size='large'
            className={classes.button}
            onClick={this.handleNext}
          >
            Confirm and contniue
          </Button>
        </Grid>
      </Grid>
    )

  }

  getStepContent  = (step) => {
    switch (step) {
      case 0:
        return this.renderWalletAndCryptoSelection()
      case 1:
        return this.renderRecipientSetting()
      case 2:
        return this.renderReview();
      default:
        return 'Unknown step';
    }
  }

  render () {
    const { classes } = this.props;
    const steps = getSteps();
    const { activeStep } = this.state;

    return (
      <div className={classes.root}>
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
    );
  }
}

const styles = theme => ({
  root: {
  },
  button: {
    marginTop: theme.spacing.unit,
    marginRight: theme.spacing.unit,
  },
  actionsContainer: {
    marginBottom: theme.spacing.unit * 2,
  },
  resetContainer: {
    padding: theme.spacing.unit * 3,
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
    margin: theme.spacing.unit * 2,
  },
  reviewPaper: {
    width: '500px'
  },
  stepContentContainer: {
    maxWidth: '600px'
  }
});

export default withStyles(styles)(TransferComponent)
