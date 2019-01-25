import React, { Component } from 'react'
import './App.css'

import { withStyles } from '@material-ui/core/styles'
import Stepper from '@material-ui/core/Stepper'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'
import StepContent from '@material-ui/core/StepContent'
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

function getSteps() {
  return ['Choose Cryptocurrency', 'Access My Wallet', 'Set Recipient and PIN', 'Review']
}

const cryptoAbbreviationMap = {
  'ethereum': 'ETH',
  'bitcoin': 'BTC',
  'dai': 'DAI'
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
    disabled: false
  },
  {
    walletType: 'ledger',
    title: 'Ledger',
    desc: 'Ledger Hardware Wallet',
    logo: HardwareWalletLogo,
    disabled: true
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
    activeStep: 0,
  }

  handleNext = () => {
    this.setState(state => ({
      activeStep: state.activeStep + 1,
    }));
  };

  handleBack = () => {
    this.setState(state => ({
      activeStep: state.activeStep - 1,
    }));
  };

  handleReset = () => {
    this.setState({
      activeStep: 0,
    });
  };

  handleCryptoTypeOnClick = (cryptoType) => {
    this.setState({
      activeStep: 1,
      cryptoType: cryptoType
    })
  }

  handleWalletOnClick = (walletType) => {
    this.setState({
      activeStep: 2,
      walletType: walletType
    })
  }

  handleTransferFormChange = name => event => {
    console.log(name, event.target.value)
    this.setState({
      [name]: event.target.value,
    })
  }

  renderCryptoSelection = () => {
    const { classes } = this.props
    return (
      <Grid container direction='row' justify='center' alignItems='center'>
        { cryptoSelections.map(c =>
          (<Grid item key={c.cryptoType}>
            <Button className={classes.walletBtn} disabled={c.disabled} variant='outlined' onClick={() => this.handleCryptoTypeOnClick(c.cryptoType)}>
              <Grid container direction='column' jutify='center' alignItems='center'>
                <Grid item>
                  <img className={classes.walletBtnLogo} src={c.logo} alt="wallet-logo" />
                </Grid>
                <Grid item>
                  <Typography className={classes.walletBtnTittle} align='center'>
                    {c.title}
                  </Typography>
                </Grid>
              </Grid>
            </Button>
          </Grid>))}
      </Grid>
    )
  }

  renderWalletSelection = () => {
    const { classes } = this.props
    return (
      <Grid container direction='row' justify='center' alignItems='center'>
        { walletSelections.map(w =>
          (<Grid item key={w.walletType}>
            <Button className={classes.walletBtn} disabled={w.disabled} variant='outlined' onClick={() => this.handleWalletOnClick(w.walletType)}>
              <Grid container direction='column' jutify='center' alignItems='center'>
                <Grid item>
                  <img className={classes.walletBtnLogo} src={w.logo} alt="wallet-logo" />
                </Grid>
                <Grid item>
                  <Typography className={classes.walletBtnTittle} align='center'>
                    {w.title}
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography className={classes.walletBtnDesc} align='center'>
                    {w.desc}
                  </Typography>
                </Grid>
              </Grid>
            </Button>
          </Grid>))}
      </Grid>
    )
  }


  renderRecipientSetting  = () => {
    const { classes } = this.props
    const { cryptoType } = this.state
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
              defaultValue="wallet title item next"
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

  getStepContent  = (step) => {
    switch (step) {
      case 0:
        return this.renderCryptoSelection()
      case 1:
        return this.renderWalletSelection()
      case 2:
        return this.renderRecipientSetting()
      case 3:
        return `Try out different ad text to see what brings in the most customers,
              and learn how to enhance your ads using features like ad extensions.
              If you run into any problems with your ads, find out how to tell if
              they're running and how to resolve approval issues.`;
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
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
              <StepContent>
                {this.getStepContent(index)}
                <div className={classes.actionsContainer}>
                  <div>
                    <Button
                      disabled={activeStep === 0}
                      onClick={this.handleBack}
                      className={classes.button}
                    >
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={this.handleNext}
                      className={classes.button}
                    >
                      {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                    </Button>
                  </div>
                </div>
              </StepContent>
            </Step>
          ))}
        </Stepper>
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
});

export default withStyles(styles)(TransferComponent)
