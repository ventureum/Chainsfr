// @flow
import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles'

import Button from '@material-ui/core/Button'
import Box from '@material-ui/core/Box'
import CropFreeIcon from '@material-ui/icons/CropFree'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import CloseIcon from '@material-ui/icons/Close'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import LinearProgress from '@material-ui/core/LinearProgress'
import IconButton from '@material-ui/core/IconButton'
import UsbIcon from '@material-ui/icons/Usb'
import OpenInBrowser from '@material-ui/icons/OpenInBrowser'
import { WalletButton } from './WalletSelectionButtons.jsx'
import { walletSelections, walletCryptoSupports } from '../wallet'
import { getCryptoTitle } from '../tokens'
import Radio from '@material-ui/core/Radio'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import TextField from '@material-ui/core/TextField'

type Props = {
  walletType: string,
  cryptoType: string,
  classes: Object,
  name: string,
  open: boolean,
  actionsPending: Object,
  handleClose: Function,
  onConnect: Function,
  newCryptoAccount: Object,
  checkWalletConnection: Function,
  checkWalletConnectionError: string,
  newCryptoAccountFromWalletError: string,
  onSubmit: Function
}

type State = {
  step: number,
  walletType: string,
  cryptoType: string,
  name: string
}

class AddAccountModalComponent extends Component<Props, State> {
  state = {
    step: 0,
    walletType: '',
    cryptoType: '',
    name: ''
  }

  componentDidUpdate (prevProps) {
    const { walletType, cryptoType } = this.state
    const {
      onConnect,
      actionsPending,
      checkWalletConnectionError,
      newCryptoAccountFromWalletError
    } = this.props
    if (
      prevProps.actionsPending.checkWalletConnection &&
      !actionsPending.checkWalletConnection &&
      !checkWalletConnectionError
    ) {
      onConnect('default', cryptoType, walletType)
    } else if (
      prevProps.actionsPending.newCryptoAccountFromWallet &&
      !actionsPending.newCryptoAccountFromWallet &&
      !newCryptoAccountFromWalletError
    ) {
      this.setState({ step: 2 })
    }
  }

  handleWalletSelect = walletType => {
    this.setState({ step: 1, walletType })
  }

  handleCryptoSelect = cryptoType => {
    this.setState({ cryptoType })
  }

  handleAccountNameChange = accountName => {
    this.setState({ name: accountName })
  }

  renderWalletSelections = () => {
    return (
      <Grid container spacing={3} direction='row' align='center'>
        {walletSelections
          .filter(w => {
            return w.walletType !== 'drive' && !w.hide
          })
          .map((w, i) => {
            return (
              <Grid item xs={4} key={i}>
                <WalletButton walletType={w.walletType} handleClick={this.handleWalletSelect} />
              </Grid>
            )
          })}
      </Grid>
    )
  }

  renderCryptoSelections = () => {
    const { actionsPending } = this.props
    const { walletType, cryptoType } = this.state
    if (walletType === '') {
      return null
    }

    return (
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <WalletButton walletType={walletType} />
        </Grid>
        <Grid item xs>
          <Grid container spacing={1} direction='column'>
            <Grid item>
              <Typography>Select coin type</Typography>
            </Grid>
            <Grid item>
              <List>
                {walletCryptoSupports[walletType].map((c, i) => {
                  return (
                    <ListItem
                      key={i}
                      button
                      onClick={() => {
                        this.handleCryptoSelect(c.cryptoType)
                      }}
                    >
                      <Radio checked={cryptoType === c.cryptoType} />
                      <ListItemText primary={getCryptoTitle(c.cryptoType)} />
                    </ListItem>
                  )
                })}
              </List>
            </Grid>
            {cryptoType !== '' &&
              !actionsPending.checkWalletConnection &&
              !actionsPending.newCryptoAccountFromWallet && (
                <Grid item>{this.renderWalletConnect()}</Grid>
              )}
            {(actionsPending.checkWalletConnection ||
              actionsPending.newCryptoAccountFromWallet) && (
              <Grid item>{this.renderCheckWalletConnectionInstruction()}</Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
    )
  }

  renderCheckWalletConnectionInstruction = () => {
    const { actionsPending } = this.props
    const { walletType } = this.state
    let instruction = ''
    switch (walletType) {
      case 'metamask':
        if (actionsPending.checkWalletConnection) {
          instruction = 'Checking if MetaMask extension is installed and enabled...'
        } else {
          instruction = 'Waiting for authorization...'
        }
        break
      case 'ledger':
        if (actionsPending.checkWalletConnection) {
          instruction = 'Please connect your Ledger Device and connect it through popup window...'
        } else {
          instruction = 'Please navigate to selected crypto on your Ledger device...'
        }
        break
      case 'trustWalletConnect':
      case 'metamaskWalletConnect':
        if (actionsPending.checkWalletConnection) {
          instruction = 'Creating connection...'
        } else {
          instruction = 'Please scan the QR code with MetaMask Mobile app...'
        }
        break
      default:
        instruction = 'Please wait...'
    }

    return (
      <Box style={{ width: '100%' }}>
        <Typography variant='body2'>{instruction}</Typography>
        <LinearProgress style={{ marginTop: '10px' }} />
      </Box>
    )
  }

  renderWalletConnect = () => {
    const { checkWalletConnection } = this.props
    const { walletType, cryptoType } = this.state
    let connectText, buttonText, buttonIcon

    switch (walletType) {
      case 'metamask':
        connectText = 'Connect your wallet via browser extendsion'
        buttonText = 'Connect to MetaMask'
        buttonIcon = <OpenInBrowser />
        break
      case 'ledger':
        connectText = 'Plug-in and connect to your ledger divice'
        buttonText = 'Connect to Ledger'
        buttonIcon = <UsbIcon />
        break
      case 'trustWalletConnect':
      case 'metamaskWalletConnect':
        connectText = 'Connect your wallet via Wallet Connect'
        buttonText = 'Scan QR Code'
        buttonIcon = <CropFreeIcon />
        break
      case 'coinbaseWalletLink':
        connectText = 'Connect your wallet via WalletLink'
        buttonText = 'Scan QR Code'
        buttonIcon = <CropFreeIcon />
        break
      default:
        throw new Error('Invalid wallet type')
    }
    return (
      <Grid container spacing={1} direction='column'>
        <Grid item>
          <Typography variant='body2'>{connectText}</Typography>
        </Grid>
        <Grid item>
          <Button
            color='primary'
            onClick={() => {
              checkWalletConnection({ walletType: walletType, cryptoType: cryptoType })
            }}
          >
            {buttonIcon}
            {buttonText}
          </Button>
        </Grid>
      </Grid>
    )
  }

  renderNameNewAccount = () => {
    const { newCryptoAccount, actionsPending } = this.props
    const { name, walletType } = this.state
    if (newCryptoAccount && !actionsPending.newCryptoAccountFromWallet) {
      return (
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <WalletButton walletType={walletType} />
          </Grid>
          <Grid item xs>
            <Grid container spacing={3} direction='column'>
              <Grid item>
                <Typography>Wallet Connected</Typography>
                {newCryptoAccount.cryptoType !== 'bitcoin' ? (
                  <Typography variant='body2'>
                    Wallet address: {newCryptoAccount.address}
                  </Typography>
                ) : (
                  <Typography variant='caption'>
                    Account xpub: {newCryptoAccount.hdWalletVariables.xpub.slice(0, 16)}...
                    {newCryptoAccount.hdWalletVariables.xpub.slice(-24)}
                  </Typography>
                )}
              </Grid>
              <Grid item>
                <TextField
                  margin='normal'
                  fullWidth
                  id='account name'
                  variant='outlined'
                  label='Account Name'
                  onChange={event => {
                    this.handleAccountNameChange(event.target.value)
                  }}
                  value={name}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      )
    }
  }

  renderSteps = () => {
    const { step } = this.state
    switch (step) {
      case 0:
        return this.renderWalletSelections()
      case 1:
        return this.renderCryptoSelections()
      case 2:
        return this.renderNameNewAccount()
      default:
        return this.renderWalletSelections()
    }
  }

  render () {
    const { open, handleClose, onSubmit, newCryptoAccount, classes } = this.props
    const { step, name } = this.state
    return (
      <Dialog open={open} onClose={handleClose} maxWidth='md'>
        <DialogTitle disableTypography>
          <Typography variant='h2'>Connect to Account</Typography>
          <IconButton onClick={handleClose} className={classes.closeButton}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent style={{ height: '400px', width: '680px' }}>
          {this.renderSteps()}
        </DialogContent>
        <DialogActions style={{ justifyContent: 'center', marginBottom: '10px' }}>
          <Button
            onClick={() => {
              handleClose()
            }}
          >
            Cancel
          </Button>
          <Button
            variant='contained'
            color='primary'
            disabled={step !== 2}
            onClick={() => {
              onSubmit({ ...newCryptoAccount, name: name })
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

const styles = theme => ({
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500]
  }
})

export default withStyles(styles)(AddAccountModalComponent)
