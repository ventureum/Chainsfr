import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { withStyles } from '@material-ui/core/styles'
import MetamaskLogo from '../images/metamask-button.svg'
import HardwareWalletLogo from '../images/hardware-wallet-button.svg'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import SquareButton from './SquareButtonComponent'
import Button from '@material-ui/core/Button'
import { walletDisabledByCrypto, getWalletTitle } from '../wallet'
import BN from 'bn.js'
import ErrorIcon from '@material-ui/icons/Error'
import LinearProgress from '@material-ui/core/LinearProgress'
import CheckIcon from '@material-ui/icons/CheckCircle'

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

const WalletConnectionErrorMessage = {
  'metamask': 'Please make sure MetaMask is installed and authorization is accepted',
  ledger: 'Please make sure your Ledger device is connected, and you are in correct crypto app'
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
    const { walletType, onWalletSelected, transfer } = this.props
    return (
      <Grid container direction='row' justify='center' alignItems='center'>
        {walletSelections.map(w =>
          (<Grid item key={w.walletType}>
            <SquareButton
              disabled={w.disabled || walletDisabledByCrypto(w.walletType, transfer.cryptoType)}
              onClick={() => {
                if (w.walletType !== walletType) { onWalletSelected(w.walletType) } else { onWalletSelected(null) }
              }}
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
    const { cryptoType } = transfer
    if ((walletType === 'metamask' && actionsPending.checkMetamaskConnection) ||
        (walletType === 'ledger' && actionsPending.checkLedgerNanoSConnection)) {
      // waiting for connection
      return (
        <Grid container direction='column' justify='center' className={classes.balanceSection}>
          <Grid item>
            <Typography className={classes.connectedtext}>
              Please connect and unlock your wallet with the selected coin.
            </Typography>
          </Grid>
          <Grid item>
            <LinearProgress className={classes.linearProgress} />
          </Grid>
        </Grid>
      )
    } else if (wallet && !wallet.connected && !wallet.crypto[cryptoType]) {
      return (
        <Grid container direction='row' alignItems='center' className={classes.balanceSection}>
          <Grid item>
            <ErrorIcon className={classes.notConnectIcon} />
          </Grid>
          <Grid item>
            <Typography className={classes.notConnectText}>{WalletConnectionErrorMessage[walletType]}</Typography>
          </Grid>
        </Grid>
      )
    } else if (actionsPending.syncAccountInfo) {
      return (
        <Grid container direction='column' justify='center' className={classes.balanceSection}>
          <Grid item>
            <Typography className={classes.connectedtext}>
              Synchronizing Account Info
            </Typography>
            <Grid item>
              <LinearProgress className={classes.linearProgress} />
            </Grid>
          </Grid>
        </Grid>
      )
    } else if (actionsPending.updateBtcAccountInfo) {
      return (
        <Grid container direction='column' justify='center' className={classes.balanceSection}>
          <Grid item>
            <Typography className={classes.connectedtext}>
            Updating Acoount Info
            </Typography>
          </Grid>
          <Grid item>
            <LinearProgress className={classes.linearProgress} />
          </Grid>
        </Grid>
      )
    } else if (wallet && ((walletType === 'metamask') || (walletType === 'ledger')) && wallet.crypto[transfer.cryptoType]) {
      return (
        <Grid container direction='row' alignItems='center' className={classes.balanceSection} justify='space-between'>
          <Grid item>
            <Grid container direction='column'>
              <Grid item>
                <Typography className={classes.connectedtext}>
                  {getWalletTitle(walletType)} wallet connected
                </Typography>
              </Grid>
              <Grid item>
                <Typography className={classes.addressInfoText}>
                  Wallet address: {wallet.crypto[cryptoType][0].address}
                </Typography>
              </Grid>

            </Grid>
          </Grid>
          <Grid item>
            <CheckIcon className={classes.connectedIcon} />
          </Grid>
        </Grid>
      )
    }
  }

  render () {
    const { classes, walletType, transfer, wallet } = this.props
    const { cryptoType } = transfer
    return (
      <Grid container direction='column' justify='center' spacing={24}>
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
                onClick={() => {
                  this.props.onWalletSelected(null)
                  this.props.goToStep(-2)
                }}
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
                disabled={
                  !walletType ||
                  !wallet.crypto[cryptoType] ||
                  (new BN(wallet.crypto[cryptoType][0].balance)).lte(new BN(0))
                }
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
  },
  balanceSection: {
    backgroundColor: 'rgba(66,133,244,0.05)',
    padding: '20px',
    margin: '30px 0px 30px 0px',
    borderRadius: '4px'
  },
  notConnectText: {
    color: '#333333',
    fontSize: '14px',
    fontWeight: 600
  },
  notConnectIcon: {
    color: '#B00020',
    marginRight: '8px'
  },
  connectedtext: {
    color: '#333333',
    fontSize: '14px',
    fontWeight: 600
  },
  linearProgress: {
    marginTop: '20px'
  },
  addressInfoText: {
    color: '#666666',
    fontSize: '12px'
  },
  connectedIcon: {
    color: '#2E7D32',
    marginRight: '8px'
  }
})

export default withStyles(styles)(ReceiveWalletSelectionComponent)
