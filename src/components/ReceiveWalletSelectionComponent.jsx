import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Container from '@material-ui/core/Container'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { getWalletTitle } from '../wallet'
import ErrorIcon from '@material-ui/icons/Error'
import LinearProgress from '@material-ui/core/LinearProgress'
import CheckIcon from '@material-ui/icons/CheckCircle'
import url from '../url'
import IconButton from '@material-ui/core/IconButton'
import OpenInNewIcon from '@material-ui/icons/OpenInNew'
import WalletSelectionButtons, { WalletButton } from './WalletSelectionButtons'

const WalletConnectionErrorMessage = {
  metamask: 'Please make sure MetaMask is installed and authorization is accepted',
  ledger: 'Please make sure your Ledger device is connected, and you are in correct crypto app'
}

class ReceiveWalletSelectionComponent extends Component {
  static propTypes = {
    walletType: PropTypes.string,
    onWalletSelected: PropTypes.func
  }

  lock = () => {
    const { actionsPending } = this.props
    const {
      checkWalletConnection,
      checkLedgerDeviceConnection,
      checkLedgerAppConnection,
      sync,
      getLastUsedAddress
    } = actionsPending
    return (
      checkWalletConnection ||
      checkLedgerDeviceConnection ||
      checkLedgerAppConnection ||
      sync ||
      getLastUsedAddress
    )
  }

  renderWalletSection = () => {
    const { walletType, onWalletSelected, classes, transfer } = this.props
    return (
      <Container className={classes.topSectionContainer}>
        <Typography variant='h3' style={{ marginBottom: '10px' }}>
          Deposit with
        </Typography>
        {walletType ? (
          <Grid container spacing={3} justify='center'>
            <Grid item className={classes.walletBtnContainer}>
              <Grid container direction='column'>
                <WalletButton walletType={walletType} id={walletType} />
                <Button
                  color='primary'
                  style={{ alignSelf: 'center' }}
                  onClick={() => onWalletSelected('')}
                  disabled={this.lock()}
                >
                  Change
                </Button>
              </Grid>
            </Grid>
            <Grid item xs>
              <Grid container direction='column' alignItems='center'>
                <Grid item style={{ width: '90%' }}>
                  <Paper className={classes.balanceSection}>
                    {this.renderWalletConnectionNotification()}
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        ) : (
          <WalletSelectionButtons
            handleClick={onWalletSelected}
            walletSelection={walletType}
            cryptoType={transfer.cryptoType}
          />
        )}
      </Container>
    )
  }

  renderWalletConnectionNotification = () => {
    let {
      classes,
      actionsPending,
      walletType,
      wallet,
      transfer,
      lastUsedAddressByWalletType,
      useAnotherAddress
    } = this.props
    const { cryptoType } = transfer
    if (walletType && lastUsedAddressByWalletType) {
      return (
        <Grid container direction='row' alignItems='center' justify='space-between'>
          <Grid item>
            <Grid container direction='column'>
              <Grid item>
                <Typography variant='body2'>
                  Last used {getWalletTitle(walletType)}{' '}
                  {walletType === 'ledger' ? 'Device' : 'Account'}
                </Typography>
              </Grid>
              <Grid item>
                <Grid container direction='row' alignItems='center'>
                  <Grid item>
                    <Typography className={classes.addressInfoText}>
                      Wallet Address: {lastUsedAddressByWalletType.crypto[cryptoType][0].address}
                    </Typography>
                  </Grid>
                  <IconButton
                    className={classes.explorerButton}
                    aria-label='Explorer'
                    target='_blank'
                    href={url.getExplorerAddress(
                      transfer.cryptoType,
                      lastUsedAddressByWalletType.crypto[cryptoType][0].address
                    )}
                  >
                    <OpenInNewIcon className={classes.explorerIcon} />
                  </IconButton>
                </Grid>
              </Grid>
              <Grid
                item
                onClick={() => {
                  useAnotherAddress()
                }}
                className={classes.connectAnotherAddressContainer}
                id='useAnotherAddress'
              >
                <Typography className={classes.connectAnotherAddressText}>
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
    } else if (actionsPending.checkLedgerDeviceConnection) {
      return (
        <Grid container direction='column' justify='center'>
          <Grid item>
            <Typography variant='body2'>Please connect and unlock your Ledger device...</Typography>
          </Grid>
          <Grid item>
            <LinearProgress className={classes.linearProgress} />
          </Grid>
        </Grid>
      )
    } else if (actionsPending.checkLedgerAppConnection) {
      return (
        <Grid container direction='column' justify='center'>
          <Grid item>
            <Typography variant='body2'>
              Please navigate to selected crypto on your Ledger device...
            </Typography>
          </Grid>
          <Grid item>
            <LinearProgress className={classes.linearProgress} />
          </Grid>
        </Grid>
      )
    } else if (actionsPending.checkWalletConnection) {
      return (
        <Grid container direction='column' justify='center'>
          <Grid item>
            <Typography variant='body2'>Loading selected wallet data...</Typography>
          </Grid>
          <Grid item>
            <LinearProgress className={classes.linearProgress} />
          </Grid>
        </Grid>
      )
    } else if (actionsPending.sync) {
      return (
        <Grid container direction='column' justify='center'>
          <Grid item>
            <Typography variant='body2'>Synchronizing Account Info</Typography>
            <Grid item>
              <LinearProgress className={classes.linearProgress} />
            </Grid>
          </Grid>
        </Grid>
      )
    } else if (wallet && !wallet.connected && !wallet.crypto[cryptoType]) {
      return (
        <Grid container direction='row' alignItems='center'>
          <Grid item>
            <ErrorIcon className={classes.notConnectIcon} />
          </Grid>
          <Grid item>
            <Typography id='walletNotConnectedText' variant='body2'>
              {WalletConnectionErrorMessage[walletType]}
            </Typography>
          </Grid>
        </Grid>
      )
    } else if (
      wallet &&
      wallet.crypto[transfer.cryptoType] &&
      wallet.crypto[cryptoType][0] &&
      !this.lock()
    ) {
      return (
        <Grid container direction='row' alignItems='center' justify='space-between'>
          <Grid item>
            <Grid container direction='column'>
              <Grid item>
                <Typography variant='body2'>
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
                    target='_blank'
                    href={url.getExplorerAddress(
                      transfer.cryptoType,
                      wallet.crypto[cryptoType][0].address
                    )}
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

  render() {
    const { classes, walletType, transfer, wallet, lastUsedAddressByWalletType } = this.props
    const { cryptoType } = transfer
    return (
      <div style={{ padding: '10px' }}>
        <Grid container direction='column' justify='center' spacing={3}>
          <Grid item>{this.renderWalletSection()}</Grid>
          <Grid item className={classes.btnSection}>
            <Grid container direction='row' justify='center' alignItems='center' spacing={3}>
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
                    !walletType || (!wallet.crypto[cryptoType] && !lastUsedAddressByWalletType)
                  }
                  id='continue'
                >
                  Continue
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
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
    marginRight: theme.spacing(1)
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
  },
  topSectionContainer: {
    backgroundColor: '#FAFBFE',
    paddingBottom: '20px',
    paddingTop: '20px',
    borderRadius: '10px'
  },
  paper: {
    padding: '10px',
    marginTop: '10px'
  },
  walletBtnContainer: {
    width: '220px'
  }
})

export default withStyles(styles)(ReceiveWalletSelectionComponent)
