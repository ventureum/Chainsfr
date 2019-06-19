import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import SquareButton from './SquareButtonComponent'
import Button from '@material-ui/core/Button'
import {
  walletSelections,
  walletDisabledByCrypto,
  getWalletTitle
} from '../wallet'
import ErrorIcon from '@material-ui/icons/Error'
import LinearProgress from '@material-ui/core/LinearProgress'
import CheckIcon from '@material-ui/icons/CheckCircle'
import url from '../url'
import IconButton from '@material-ui/core/IconButton'
import OpenInNewIcon from '@material-ui/icons/OpenInNew'
import env from '../typedEnv'

const WalletConnectionErrorMessage = {
  'metamask': 'Please make sure MetaMask is installed and authorization is accepted',
  ledger: 'Please make sure your Ledger device is connected, and you are in correct crypto app'
}

class ReceiveWalletSelectionComponent extends Component {
  static propTypes = {
    walletType: PropTypes.string,
    onWalletSelected: PropTypes.func
  }

  renderWalletSelection = () => {
    const { walletType, onWalletSelected, transfer, actionsPending } = this.props
    return (
      <Grid container direction='row' justify='center' alignItems='center'>
        {walletSelections.map(w =>
          (<Grid item key={w.walletType}>
            <SquareButton
              disabled={w.disabled || walletDisabledByCrypto(w.walletType, transfer.cryptoType) || actionsPending.getLastUsedAddress}
              onClick={() => onWalletSelected(w.walletType)}
              logo={w.logo}
              title={w.title}
              desc={w.desc}
              selected={w.walletType === walletType}
              id={w.walletType}
            />
          </Grid>))}
      </Grid>
    )
  }

  renderWalletConnectionNotification = () => {
    let { classes, actionsPending, walletType, wallet, transfer, lastUsedWallet, useAnotherAddress } = this.props
    const { cryptoType } = transfer
    var getExplorerLink = null
    if (cryptoType === 'ethereum') {
      getExplorerLink = url.getEthExplorerAddress
    } else if (cryptoType === 'dai') {
      getExplorerLink = url.getEthExplorerToken
    } else if (cryptoType === 'bitcoin') {
      getExplorerLink = url.getBtcExplorerAddress
    }
    if (walletType && lastUsedWallet) {
      return (
        <Grid container direction='row' alignItems='center' className={classes.balanceSection} justify='space-between'>
          <Grid item>
            <Grid container direction='column'>
              <Grid item>
                <Typography className={classes.connectedtext}>
                  Last used {getWalletTitle(walletType)} {walletType === 'ledger' ? 'Device' : 'Account'}
                </Typography>
              </Grid>
              <Grid item>
                <Grid container direction='row' alignItems='center'>
                  <Grid item>
                    <Typography className={classes.addressInfoText}>
                      Wallet Address: {lastUsedWallet.crypto[cryptoType][0].address}
                    </Typography>
                  </Grid>
                  <IconButton
                    className={classes.explorerButton}
                    aria-label='Explorer'
                    target='_blank' href={getExplorerLink(lastUsedWallet.crypto[cryptoType][0].address)}
                  >
                    <OpenInNewIcon className={classes.explorerIcon} />
                  </IconButton>
                </Grid>
              </Grid>
              <Grid
                item
                onClick={() => { useAnotherAddress() }}
                className={classes.connectAnotherAddressContainer}
                id='useAnotherAddress'
              >
                <Typography className={classes.connectAnotherAddressText} >
                  Connect with another {getWalletTitle(walletType)} account
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            <CheckIcon className={classes.connectedIcon} />
          </Grid>
        </Grid>
      )
    } else if ((walletType === 'metamask' && actionsPending.checkMetamaskConnection) ||
        (walletType === 'ledger' && actionsPending.checkLedgerNanoSConnection) ||
        (walletType === 'drive' && actionsPending.checkCloudWalletConnection)) {
      // waiting for connection
      return (
        <Grid container direction='column' justify='center' className={classes.balanceSection}>
          <Grid item>
            <Typography className={classes.connectedtext}>
              {(walletType === 'metamask' || walletType === 'ledger') &&
              'Please connect and unlock your wallet with the selected coin.'}
              {walletType === 'drive' && 'Connecting to Drive wallet ...'}
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
            <Typography id='walletNotConnectedText' className={classes.notConnectText}>{WalletConnectionErrorMessage[walletType]}</Typography>
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
    } else if (wallet && wallet.crypto[transfer.cryptoType]) {
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
                <Grid container direction='row' alignItems='center'>
                  <Grid item>
                    <Typography className={classes.addressInfoText}>
                      Wallet address: {wallet.crypto[cryptoType][0].address}
                    </Typography>
                  </Grid>
                  <IconButton
                    aria-label='Explorer'
                    className={classes.explorerButton}
                    target='_blank' href={
                      cryptoType === 'ethereum'
                        ? getExplorerLink(wallet.crypto[cryptoType][0].address)
                        : getExplorerLink(env.REACT_APP_DAI_ADDRESS, wallet.crypto[cryptoType][0].address)
                    }
                  >
                    <OpenInNewIcon className={classes.explorerIcon} />
                  </IconButton>
                </Grid>
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
    const { classes, walletType, transfer, wallet, lastUsedWallet } = this.props
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
                id='cancel'
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
                  (!wallet.crypto[cryptoType] && !lastUsedWallet)
                }
                id='continue'
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
  },
  connectAnotherAddressContainer: {
    marginTop: '10px',
    '&:hover': {
      cursor: 'pointer'
    }
  },
  connectAnotherAddressText: {
    color: '#4285f4',
    fontSize: '12px',
    fontWeight: '500'
  },
  explorerIcon: {
    fontSize: '16px'
  },
  explorerButton: {
    padding: '0px 0px 0px 0px',
    marginLeft: '10px'
  }
})

export default withStyles(styles)(ReceiveWalletSelectionComponent)
