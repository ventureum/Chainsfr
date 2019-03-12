import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { withStyles } from '@material-ui/core/styles'
import MetamaskLogo from '../images/metamask-button.svg'
import HardwareWalletLogo from '../images/hardware-wallet-button.svg'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import SquareButton from './SquareButtonComponent'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'

const walletCryptoSupports = {
  'basic': [{ cryptoType: 'ethereum', disabled: true },
    { cryptoType: 'dai', disabled: true },
    { cryptoType: 'bitcoin', disabled: true }],
  'metamask': [{ cryptoType: 'ethereum', disabled: false },
    { cryptoType: 'dai', disabled: true }],
  'ledger': [{ cryptoType: 'ethereum', disabled: false },
    { cryptoType: 'dai', disabled: false },
    { cryptoType: 'bitcoin', disabled: true }]
}

const walletSelections = [
  {
    walletType: 'basic',
    title: 'Basic',
    desc: 'Use Basic Wallet',
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
    disabled: false
  }
]

class ReceiveWalletSelectionComponent extends Component {
  static propTypes = {
    walletType: PropTypes.string,
    onWalletSelected: PropTypes.func,
    handleNext: PropTypes.func
  }

  cryptoInWallet = (crypto, walletType) => {
    for (let item of walletCryptoSupports[walletType]) {
      if (item.cryptoType === crypto.cryptoType) return true
    }
    return false
  }

  cryptoDisabled = (crypto, walletType) => {
    for (let item of walletCryptoSupports[walletType]) {
      if (item.cryptoType === crypto.cryptoType && item.disabled) return true
    }
    return false
  }

  renderWalletSelection = () => {
    const { walletType, onWalletSelected } = this.props
    return (
      <Grid container direction='row' justify='center' alignItems='center'>
        {walletSelections.map(w =>
          (<Grid item key={w.walletType}>
            <SquareButton
              disabled={w.disabled}
              onClick={() => onWalletSelected(w.walletType)}
              logo={w.logo}
              title={w.title}
              desc={w.desc}
              selected={w.walletType === walletType}
            />
          </Grid>))}
      </Grid>
    )
  }

  renderWalletConnectionNotification = () => {
    let { classes, actionsPending, walletType, wallet, transfer } = this.props

    if ((walletType === 'metamask' && actionsPending.checkMetamaskConnection) ||
        (walletType === 'ledger' && actionsPending.checkLedgerNanoSConnection)) {
      // waiting for connection
      return (
        <Grid
          container
          direction='row'
          justify='center'
          alignItems='center'
          spacing={8}
          className={classes.notificationContainer}
        >
          <Grid item>
            <CircularProgress color='primary' size={20} />
          </Grid>
          <Grid item>
            <Grid container direction='column' justify='center'>
              <Grid item>
                <Typography className={classes.notificationTitle}>
                  { walletType === 'metamask' && 'Connecting to Metamask ...'}
                  { walletType === 'ledger' && 'Please make sure your device is connected'}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      )
    } else if (wallet && ((walletType === 'metamask') || (walletType === 'ledger'))) {
      return (
        <Grid
          container
          direction='row'
          justify='center'
          alignItems='center'
          spacing={8}
          className={classes.notificationContainer}
        >
          <Grid item>
            <CheckCircleIcon className={classes.checkCircleIcon} />
          </Grid>
          <Grid item>
            <Grid container direction='column' justify='center'>
              <Grid item>
                <Typography className={classes.notificationTitle}>
                  { walletType === 'metamask' && 'Metamask connected'}
                  { walletType === 'ledger' && 'Ledger connected'}
                </Typography>
              </Grid>
              <Grid item>
                <Typography className={classes.notificationAddress}>
                  Wallet address:
                  { wallet.crypto[transfer.cryptoType][0].address }
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      )
    }
  }

  render () {
    const { classes, walletType } = this.props
    return (
      <Grid container direction='column' justify='center' alignItems='flex-start' spacing={24}>
        <Grid item>
          <Typography align='left' className={classes.title}>
            Connect with your wallet
          </Typography>
        </Grid>
        <Grid item>
          {this.renderWalletSelection()}
        </Grid>
        <Grid item>
          {this.renderWalletConnectionNotification()}
        </Grid>
        <Grid item className={classes.btnSection}>
          <Grid container direction='row' justify='center' alignItems='center' spacing={24}>
            <Grid item>
              <Button
                color='primary'
                onClick={() => this.props.goToStep(-2)}
              >
                Cancel
              </Button>
            </Grid>
            <Grid item>
              <Button
                fullWidth
                variant='contained'
                color='primary'
                onClick={() => this.props.goToStep(1)}
                disabled={!walletType}
              >
                Continue
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
  faqIcon: {
    marginRight: theme.spacing.unit
  },
  checkCircleIcon: {
    color: '#0CCD70',
    fontSize: '25px'
  },
  notificationContainer: {
    marginTop: '60px',
    marginBottom: '60px'
  },
  notificationTitle: {
    color: '#333333',
    fontSize: '14px',
    fontWeight: '600'
  },
  notificationAddress: {
    color: '#666666',
    fontSize: '12px'
  },
  btnSection: {
    width: '100%'
  }
})

export default withStyles(styles)(ReceiveWalletSelectionComponent)
