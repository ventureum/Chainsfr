// @flow
import React, { Component } from 'react'

import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import CropFreeIcon from '@material-ui/icons/CropFree'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import OpenInBrowser from '@material-ui/icons/OpenInBrowser'
import TextField from '@material-ui/core/TextField'
import LinearProgress from '@material-ui/core/LinearProgress'
import UsbIcon from '@material-ui/icons/Usb'
import LockOpenIcon from '@material-ui/icons/LockOpen'
import { WalletButton } from './WalletSelectionButtons'
import WalletErrors from '../wallets/walletErrors'

type Props = {
  transferForm: Object,
  actionsPending: Object,
  accountSelection: Object,
  checkWalletConnection: Function,
  clearError: Function,
  errors: Object,
  goToStep: Function
}

type State = {
  password: string
}

export default class WalletAuthorizationComponent extends Component<Props, State> {
  state = {
    password: ''
  }

  handleChange = (prop: any) => (event: any) => {
    const { errors, clearError } = this.props
    this.setState({ [prop]: event.target.value })
    if (errors.submitTx || errors.verifyAccount || errors.checkWalletConnection) {
      clearError()
    }
  }

  renderMetamaskWalletConnectSteps = () => {
    const { checkWalletConnection } = this.props
    return (
      <Grid container direction='column' spacing={2}>
        <Grid item>
          <Typography variant='body1'>Connect your wallet via MetaMask App</Typography>
        </Grid>
        <Grid item>
          <Button
            onClick={() => {
              checkWalletConnection()
            }}
            color='primary'
          >
            <CropFreeIcon />
            Connect to MetaMask Mobile
          </Button>
        </Grid>
      </Grid>
    )
  }

  renderDriveConnectSteps = () => {
    const { checkWalletConnection, errors } = this.props
    const { password } = this.state
    return (
      <Grid container direction='column' spacing={2}>
        <Grid item>
          <Typography variant='body1'>Unlock Drive Wallet</Typography>
        </Grid>
        <Grid item>
          <form noValidate autoComplete='drive-wallet-independent-password-form'>
            <TextField
              id='drive-wallet-independent-password'
              autoComplete='drive-wallet-independent-password'
              variant='outlined'
              fullWidth
              error={!!errors.checkWalletConnection}
              type={'password'}
              label='Password'
              value={password}
              onChange={this.handleChange('password')}
              helperText={errors.checkWalletConnection ? 'Incorrect password' : ''}
              onKeyPress={ev => {
                if (ev.key === 'Enter') {
                  this.setState({ password: '' })
                  checkWalletConnection({ password })
                  ev.preventDefault()
                }
              }}
            />
          </form>
        </Grid>
        <Grid item>
          <Button
            onClick={() => {
              checkWalletConnection({ password })
            }}
            color='primary'
          >
            <LockOpenIcon />
            Unlock
          </Button>
        </Grid>
      </Grid>
    )
  }

  renderLedgerConnectSteps = () => {
    const { checkWalletConnection, accountSelection } = this.props
    return (
      <Grid container spacing={2} direction='column'>
        {!accountSelection.connected && (
          <Grid item>
            <Grid container direction='column'>
              <Grid item>
                <Typography variant='body1'>Connect your wallet via Ledger Device</Typography>
              </Grid>
              <Grid item>
                <Button
                  onClick={() => {
                    checkWalletConnection()
                  }}
                  color='primary'
                >
                  <UsbIcon />
                  Connect to Ledger
                </Button>
              </Grid>
            </Grid>
          </Grid>
        )}
      </Grid>
    )
  }

  renderMetamaskConnectSteps = () => {
    const { checkWalletConnection } = this.props

    return (
      <Grid container direction='column'>
        <Grid item>
          <Typography variant='body1'>Connect your wallet via browser extension</Typography>
        </Grid>
        <Grid item>
          <Button
            onClick={() => {
              checkWalletConnection()
            }}
            color='primary'
          >
            <OpenInBrowser />
            Connect to MetaMask
          </Button>
        </Grid>
      </Grid>
    )
  }

  renderCoinbaseWalletLinkConnectSteps = () => {
    const { checkWalletConnection } = this.props
    return (
      <Grid container direction='column' spacing={2}>
        <Grid item>
          <Typography variant='body1'>
            Connect your wallet via Coinbase WalletLink Mobile App
          </Typography>
        </Grid>
        <Grid item>
          <Button
            color='primary'
            onClick={() => {
              checkWalletConnection()
            }}
          >
            <CropFreeIcon />
            Connect to Coinbase WalletLink
          </Button>
        </Grid>
      </Grid>
    )
  }

  renderWalletAuthorizationSteps = () => {
    const { actionsPending, accountSelection, errors } = this.props
    const { walletType, cryptoType } = accountSelection
    let instruction = ''
    let walletSteps
    let errorInstruction
    switch (walletType) {
      case 'metamask':
        if (actionsPending.checkWalletConnection) {
          instruction = 'Checking if MetaMask extension is installed and enabled...'
        } else if (actionsPending.verifyAccount) {
          instruction = 'Waiting for authorization...'
        }
        walletSteps = this.renderMetamaskConnectSteps()
        if (errors.checkWalletConnection === WalletErrors.metamask.extendsionNotFound) {
          errorInstruction = 'MetaMask extension is not available'
        } else if (errors.verifyAccount === WalletErrors.metamask.incorrectAccount) {
          errorInstruction = 'Wrong account, please switch to the correct account'
        } else if (errors.verifyAccount === WalletErrors.metamask.authorizationDenied) {
          errorInstruction = 'MetaMask authorization denied'
        } else if (errors.verifyAccount === WalletErrors.metamask.incorrectNetwork) {
          errorInstruction = 'Incorrect MetaMask network'
        }
        break
      case 'metamaskWalletConnect':
        if (actionsPending.checkWalletConnection) {
          instruction = 'Creating connection...'
        } else if (actionsPending.verifyAccount) {
          instruction = 'Please scan the QR code with MetaMask Mobile app...'
        }
        walletSteps = this.renderMetamaskWalletConnectSteps()
        if (errors.checkWalletConnection) {
          errorInstruction = 'MetaMask WalletConnect loading failed'
        } else if (errors.verifyAccount === WalletErrors.metamaskWalletConnect.incorrectAccount) {
          errorInstruction = 'Wrong account, please switch to the correct account'
        }
        break
      case 'ledger':
        if (actionsPending.checkWalletConnection) {
          instruction = 'Please connect your Ledger Device and connect it through popup window...'
        } else if (actionsPending.verifyAccount) {
          instruction = 'Please navigate to selected crypto app on your Ledger device...'
        }
        walletSteps = this.renderLedgerConnectSteps()
        if (errors.checkWalletConnection === WalletErrors.ledger.deviceNotConnected) {
          errorInstruction = 'Ledger device is not connected'
        } else if (errors.verifyAccount === WalletErrors.ledger.ledgerAppCommunicationFailed) {
          errorInstruction = `Ledger ${cryptoType} app is not available`
        } else if (errors.verifyAccount === WalletErrors.ledger.incorrectAccount) {
          errorInstruction = 'Wrong Ledger account, please connect the correct Ledger device'
        }
        break
      case 'drive':
        if (actionsPending.checkWalletConnection) {
          instruction = 'Checking password...'
        } else if (actionsPending.verifyAccount) {
          instruction = 'Verifying account...'
        }
        walletSteps = this.renderDriveConnectSteps()
        break
      case 'coinbaseWalletLink':
        if (actionsPending.checkWalletConnection) {
          instruction = 'Creating connection...'
        } else if (actionsPending.verifyAccount) {
          instruction = 'Please scan the QR code with Coinbase WalletLink Mobile app...'
        }
        if (errors.checkWalletConnection) {
          errorInstruction = 'WalletLink loading failed'
        }
        if (errors.verifyAccount === WalletErrors.coinbaseWalletLink.incorrectAccount) {
          errorInstruction = `Incorrect WalletLink account, please switch to the correct account`
        }
        walletSteps = this.renderCoinbaseWalletLinkConnectSteps()
        break
      default:
        return null
    }
    if (actionsPending.submitTx) instruction = 'Transfer processing...'

    return (
      <Grid container spacing={2} direction='column'>
        {!accountSelection.connected && <Grid item>{walletSteps}</Grid>}
        {accountSelection.connected && (
          <Grid item>
            <Typography variant='body2'>Wallet connected</Typography>
            {accountSelection.address ? (
              <Typography variant='caption'>Wallet address: {accountSelection.address}</Typography>
            ) : (
              <Typography>Account xpub: {accountSelection.hdWalletVariables.xpub}</Typography>
            )}
          </Grid>
        )}

        {(errors.checkWalletConnection || errors.verifyAccount) && (
          <Grid item>
            <Box
              style={{
                backgroundColor: 'rgba(57, 51, 134, 0.05)',
                borderRadius: '4px',
                padding: '20px'
              }}
            >
              <Typography variant='body2' color='error'>
                {errorInstruction}
              </Typography>
            </Box>
          </Grid>
        )}

        {(actionsPending.submitTx ||
          actionsPending.checkWalletConnection ||
          actionsPending.verifyAccount) && (
          <Grid item>
            <Box
              style={{
                backgroundColor: 'rgba(57, 51, 134, 0.05)',
                borderRadius: '4px',
                padding: '20px'
              }}
            >
              <Typography variant='body2'>{instruction}</Typography>
              <LinearProgress style={{ marginTop: '10px' }} />
            </Box>
          </Grid>
        )}
      </Grid>
    )
  }

  render () {
    const { accountSelection, actionsPending } = this.props

    return (
      <Grid container direction='column' spacing={3}>
        <Grid item>
          <Typography variant='h3'>Wallet Authorization</Typography>
        </Grid>

        <Grid item>
          <Grid container direction='row' spacing={5}>
            <Grid item xs={4}>
              <Grid container direction='column' alignItems='center'>
                <Grid item style={{ width: '100%' }}>
                  <WalletButton walletType={accountSelection.walletType} />
                </Grid>
                <Grid item>
                  <Typography variant='body2'>{accountSelection.displayName}</Typography>
                </Grid>
                <Grid item>
                  <Typography variant='caption'>
                    {`${accountSelection.address.slice(0, 10)}...${accountSelection.address.slice(
                      -10
                    )}`}
                  </Typography>
                </Grid>
                <Grid item style={{ marginTop: '30px' }}>
                  <Button
                    onClick={() => this.props.goToStep(-1)}
                    color='primary'
                    disabled={
                      actionsPending.submitTx ||
                      actionsPending.verifyAccount ||
                      actionsPending.checkWalletConnection
                    }
                  >
                    Back to Previous
                  </Button>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs>
              {this.renderWalletAuthorizationSteps()}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    )
  }
}
