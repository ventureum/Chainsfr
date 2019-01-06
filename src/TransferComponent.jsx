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

function getSteps() {
  return ['Access My Wallet', 'Set Recipient and PIN', 'Initiate Transfer'];
}


class TransferComponent extends Component {

  state = {
    activeStep: 0,
  };

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


  renderWalletSelection () {
    const { classes } = this.props
    return (
      <Grid container direction='row' justify='center' alignItems='center'>
        <Grid item>
          <Paper className={classes.walletBtn} elevation={1}>
            <Grid container direction='column' jutify='center' alignItems='center'>
              <Grid item>
                <img className={classes.walletBtnLogo} src={MetamaskLogo} alt="metamask-logo" />
              </Grid>
              <Grid item>
                <Typography className={classes.walletBtnTittle} align='center'>
                  MetaMask
                </Typography>
              </Grid>
              <Grid item>
                <Typography className={classes.walletBtnDesc} align='center'>
                  Use the MetaMask extension.
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item>
          <Paper className={classes.walletBtn} elevation={1}>
            <Grid container direction='column' jutify='center' alignItems='center'>
              <Grid item>
                <img className={classes.walletBtnLogo} src={HardwareWalletLogo} alt="metamask-logo" />
              </Grid>
              <Grid item>
                <Typography className={classes.walletBtnTittle} align='center'>
                  Ledger Wallet
                </Typography>
              </Grid>
              <Grid item>
                <Typography className={classes.walletBtnDesc} align='center'>
                  Ledger Hardware Wallet
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    )
  }


  getStepContent  = (step) => {
    switch (step) {
      case 0:
        return this.renderWalletSelection()
      case 1:
        return 'An ad group contains one or more ads which target a shared set of keywords.';
      case 2:
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
    height: '200px',
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
  }
});

export default withStyles(styles)(TransferComponent)
