// @flow
import React, { Component } from 'react'

import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import CropFreeIcon from '@material-ui/icons/CropFree'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import OpenInBrowser from '@material-ui/icons/OpenInBrowser'
import TextField from '@material-ui/core/TextField'
import LinearProgress from '@material-ui/core/LinearProgress'
import Radio from '@material-ui/core/Radio'
import UsbIcon from '@material-ui/icons/Usb'
import LockOpenIcon from '@material-ui/icons/LockOpen'
import { WalletButton } from './WalletSelectionButtons'

type Props = {
  transferForm: Object,
  actionsPending: Object,
  checkWalletConnection: Function,
  clearError: Function,
  decryptCloudWalletAccount: Function,
  checkWalletConnectionError: string
}

type State = {
  password: string
}

export default class WalletAuthorizationComponent extends Component<Props, State> {
  state = {
    password: ''
  }

  handleChange = (prop: any) => (event: any) => {
    const { checkWalletConnectionError, clearError } = this.props
    this.setState({ [prop]: event.target.value })
    if (checkWalletConnectionError) {
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
        MetaMask
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
    const {
      transferForm,
      actionsPending,
      checkWalletConnection,
      checkWalletConnectionError,
      decryptCloudWalletAccount
    } = this.props
    const { accountSelection } = transferForm
    const { walletType } = accountSelection
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
              error={!!checkWalletConnectionError}
              type={'password'}
              label='Password'
              value={password}
              onChange={this.handleChange('password')}
              helperText={checkWalletConnectionError ? 'Incorrect password' : ''}
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
    const { transferForm, actionsPending, checkWalletConnection } = this.props
    const { accountSelection } = transferForm
    const { walletType } = accountSelection

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
    const { transferForm, actionsPending, checkWalletConnection } = this.props
    const { accountSelection } = transferForm
    const { walletType } = accountSelection

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
    const { transferForm, actionsPending } = this.props
    const { accountSelection } = transferForm
    const { walletType } = accountSelection
    let instruction = ''
    let walletSteps
    switch (walletType) {
      case 'metamask':
        if (actionsPending.checkWalletConnection) {
          instruction = 'Checking if MetaMask extension is installed and enabled...'
        } else if (actionsPending.verifyAccount) {
          instruction = 'Waiting for authorization...'
        }
        walletSteps = this.renderMetamaskConnectSteps()
        break
      case 'metamaskWalletConnect':
        if (actionsPending.checkWalletConnection) {
          instruction = 'Creating connection...'
        } else if (actionsPending.verifyAccount) {
          instruction = 'Please scan the QR code with MetaMask Mobile app...'
        }
        walletSteps = this.renderMetamaskWalletConnectSteps()
        break
      case 'ledger':
        if (actionsPending.checkWalletConnection) {
          instruction = 'Please connect your Ledger Device and connect it through popup window...'
        } else if (actionsPending.verifyAccount) {
          instruction = 'Please navigate to selected crypto on your Ledger device...'
        }
        walletSteps = this.renderLedgerConnectSteps()
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
    const { transferForm } = this.props
    const { accountSelection } = transferForm

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
                  <Typography variant='body2'>{accountSelection.name}</Typography>
                </Grid>
                <Grid item>
                  <Typography variant='caption'>
                    {`${accountSelection.address.slice(0, 10)}...${accountSelection.address.slice(
                      -10
                    )}`}
                  </Typography>
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
