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
import { walletSelections, getWalletConfig, getWalletSupportedPlatforms } from '../wallet'
import { getCryptoTitle, getPlatformCryptos, getCryptoLogo, getCryptoSymbol } from '../tokens'
import Radio from '@material-ui/core/Radio'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import TextField from '@material-ui/core/TextField'
import walletErrors from '../wallets/walletErrors'
import withMobileDialog from '@material-ui/core/withMobileDialog'
import { Avatar } from '@material-ui/core'

type Props = {
  walletType: string,
  classes: Object,
  name: string,
  open: boolean,
  actionsPending: Object,
  handleClose: Function,
  onConnect: Function,
  newCryptoAccounts: Object,
  checkWalletConnection: Function,
  errors: Object,
  onSubmit: Function,
  online: boolean,
  fullScreen: boolean
}

type State = {
  step: number,
  walletType: string,
  platformType: string,
  name: string
}

class AddAccountModalComponent extends Component<Props, State> {
  state = {
    step: 0,
    walletType: '',
    platformType: '',
    name: ''
  }

  componentDidUpdate (prevProps) {
    const { walletType, platformType, name } = this.state
    const { onConnect, newCryptoAccounts, actionsPending, errors } = this.props
    if (
      prevProps.actionsPending.checkWalletConnection &&
      !actionsPending.checkWalletConnection &&
      !errors.checkWalletConnection
    ) {
      const cryptoTypes = getPlatformCryptos(platformType).map(crypto => crypto.cryptoType)
      onConnect('default', cryptoTypes, walletType)
    } else if (
      prevProps.actionsPending.newCryptoAccountsFromWallet &&
      !actionsPending.newCryptoAccountsFromWallet &&
      !errors.newCryptoAccountsFromWallet
    ) {
      this.setState({ step: 2 })
    }

    if (
      newCryptoAccounts.length > 0 &&
      newCryptoAccounts[0].walletType === 'coinbaseOAuthWallet' &&
      newCryptoAccounts[0].email &&
      name.length === 0
    ) {
      // for coinbaseOAuthWallet, fill name with email address if email is provided
      this.setState({ name: newCryptoAccounts[0].email })
    }

    if (walletType && !platformType && getWalletSupportedPlatforms(walletType).length === 1) {
      this.handlePlatformSelect(getWalletSupportedPlatforms(walletType)[0])
    }
  }

  handleWalletSelect = walletType => {
    this.setState({ step: 1, walletType })
  }

  handlePlatformSelect = platformType => {
    this.setState({ platformType })
  }

  handleAccountNameChange = accountName => {
    this.setState({ name: accountName })
  }

  locked = () => {
    const { actionsPending } = this.props
    return actionsPending.checkWalletConnection || actionsPending.newCryptoAccountsFromWallet
  }

  renderWalletSelections = () => {
    return (
      <Grid container spacing={3} direction='row' align='center'>
        {walletSelections
          .filter(w => {
            return w.walletType !== 'drive' && !w.hide && w.walletType !== 'metamaskOne'
          })
          .map((w, i) => {
            return (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <WalletButton
                  walletType={w.walletType}
                  handleClick={this.handleWalletSelect}
                  disabled={!getWalletConfig(w.walletType).addable}
                  disabledReason={getWalletConfig(w.walletType).disabledReason}
                  containerStyle={{ height: 140, width: 180, border: '1px solid #e9e9e9' }}
                />
              </Grid>
            )
          })}
      </Grid>
    )
  }

  renderPlatformSelection = () => {
    const { classes, actionsPending } = this.props
    const { walletType, platformType } = this.state
    if (walletType === '') {
      return null
    }

    const listOfPlatform = getWalletSupportedPlatforms(walletType)
    return (
      <Grid container spacing={3}>
        <Grid item sm={4} xs={12}>
          <WalletButton
            walletType={walletType}
            containerStyle={{ height: 140, width: 180, border: '1px solid #e9e9e9' }}
          />
        </Grid>
        <Grid item xs>
          <Grid container direction='column'>
            {listOfPlatform.length > 1 && (
              <>
                <Grid item>
                  <Typography className={classes.subtitle}>Select blockchain network</Typography>
                </Grid>
                <Grid item>
                  <List>
                    {listOfPlatform.map((p, i) => {
                      return (
                        <ListItem
                          key={`${i} platform`}
                          button
                          onClick={() => {
                            this.handlePlatformSelect(p)
                          }}
                          disabled={this.locked()}
                        >
                          <Radio checked={platformType === p} />
                          <Typography variant='body2'>{getCryptoTitle(p)} </Typography>
                        </ListItem>
                      )
                    })}
                  </List>
                </Grid>
              </>
            )}
            {platformType !== '' && (
              <>
                <Grid item>
                  <Typography className={classes.subtitle}>Supported coin types</Typography>
                </Grid>
                <Grid item style={{ marginLeft: 10, marginTop: 10 }}>
                  <Grid container spacing={1}>
                    {getPlatformCryptos(platformType).map((crypto, i) => {
                      return (
                        <Grid item xs={2} key={`${i} crypto`}>
                          <Box
                            display='flex'
                            flexDirection='column'
                            alignItems='center'
                            width='100%'
                          >
                            <Avatar src={getCryptoLogo(crypto.cryptoType)} />
                            <Typography variant='h6'>
                              {getCryptoSymbol(crypto.cryptoType)}
                            </Typography>
                          </Box>
                        </Grid>
                      )
                    })}
                  </Grid>
                </Grid>
              </>
            )}
            {platformType !== '' &&
              !actionsPending.checkWalletConnection &&
              !actionsPending.newCryptoAccountsFromWallet && (
                <Grid item>{this.renderWalletConnect()}</Grid>
              )}
            {(actionsPending.checkWalletConnection ||
              actionsPending.newCryptoAccountsFromWallet) && (
              <Grid item>{this.renderCheckWalletConnectionInstruction()}</Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
    )
  }

  renderCheckWalletConnectionInstruction = () => {
    const { actionsPending } = this.props
    const { walletType, platformType } = this.state
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
        if (actionsPending.newCryptoAccountsFromWallet && platformType === 'bitcoin') {
          instruction = 'Please wait while we sync your Bitcoin account with the network...'
        } else if (actionsPending.checkWalletConnection) {
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
    const { checkWalletConnection, errors, online, classes } = this.props
    const { walletType, platformType } = this.state
    let connectText, buttonText, buttonIcon
    let errorInstruction
    switch (walletType) {
      case 'metamask':
        connectText = 'Connect your wallet via browser extendsion'
        buttonText = 'Connect to MetaMask'
        buttonIcon = <OpenInBrowser />
        if (errors.checkWalletConnection === walletErrors.metamask.extendsionNotFound) {
          errorInstruction = 'MetaMask extension is not available'
        } else if (errors.newCryptoAccountsFromWallet === walletErrors.metamask.incorrectNetwork) {
          errorInstruction = 'Incorrect MetaMask network'
        } else if (
          errors.newCryptoAccountsFromWallet === walletErrors.metamask.authorizationDenied
        ) {
          errorInstruction = 'MetaMask authorization denied'
        }
        break
      case 'ledger':
        connectText = 'Plug-in and connect to your ledger divice'
        buttonText = 'Connect to Ledger'
        buttonIcon = <UsbIcon />
        if (errors.checkWalletConnection === walletErrors.ledger.deviceNotConnected) {
          errorInstruction = 'Ledger device is not connected'
        } else if (
          errors.newCryptoAccountsFromWallet === walletErrors.ledger.ledgerAppCommunicationFailed
        ) {
          errorInstruction = `Ledger ${platformType} app is not available`
        }
        break
      case 'trustWalletConnect':
      case 'metamaskWalletConnect':
        connectText = 'Connect your wallet via Wallet Connect'
        buttonText = 'Scan QR Code'
        buttonIcon = <CropFreeIcon />
        if (errors.checkWalletConnection) {
          errorInstruction = 'WalletConnect loading failed'
        } else if (
          errors.newCryptoAccountsFromWallet === walletErrors.metamaskWalletConnect.modalClosed
        ) {
          errorInstruction = `User denied account authorization`
        }
        break
      case 'coinbaseWalletLink':
        connectText = 'Connect your wallet via WalletLink'
        buttonText = 'Scan QR Code'
        buttonIcon = <CropFreeIcon />
        if (errors.checkWalletConnection) {
          errorInstruction = 'WalletLink loading failed'
        } else if (
          errors.newCryptoAccountsFromWallet === walletErrors.coinbaseWalletLink.authorizationDenied
        ) {
          errorInstruction = `User denied account authorization`
        }
        break
      case 'coinbaseOAuthWallet':
        connectText = `Fetch Coinbase ${getCryptoTitle(platformType)} accounts`
        buttonText = 'Authorize Chainsfr'
        buttonIcon = <OpenInBrowser />
        if (errors.checkWalletConnection) {
          errorInstruction = 'Failed to get authorization from Coinbase'
        } else if (
          errors.newCryptoAccountsFromWallet === walletErrors.coinbaseOAuthWallet.accountNotFound
        ) {
          errorInstruction = `Please select the proper account in the Coinbase pop window`
        } else if (
          errors.newCryptoAccountsFromWallet === walletErrors.coinbaseOAuthWallet.noAddress
        ) {
          errorInstruction = `No address is available from Coinbase`
        } else if (
          errors.newCryptoAccountsFromWallet ===
          walletErrors.coinbaseOAuthWallet.cryptoTypeNotMatched
        ) {
          errorInstruction = errors.newCryptoAccountsFromWallet
        }
        break
      default:
        throw new Error('Invalid wallet type')
    }
    return (
      <Grid container spacing={1} direction='column'>
        <Grid item>
          <Typography className={classes.subtitle}>{connectText}</Typography>
        </Grid>
        <Grid item>
          <Button
            color='primary'
            onClick={() => {
              checkWalletConnection({ walletType: walletType, platformType: platformType })
            }}
            disabled={this.locked() || !online}
          >
            {buttonIcon}
            {buttonText}
          </Button>
        </Grid>
        {errorInstruction && (
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
      </Grid>
    )
  }

  renderNameNewAccount = () => {
    const { newCryptoAccounts, actionsPending, classes } = this.props
    const { name, walletType } = this.state

    if (newCryptoAccounts.length > 0 && !actionsPending.newCryptoAccountsFromWallet) {
      const firstNewCryptoAccount = newCryptoAccounts[0]
      return (
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <WalletButton
              walletType={walletType}
              containerStyle={{ height: 140, width: 180, border: '1px solid #e9e9e9' }}
            />
          </Grid>
          <Grid item xs>
            <Grid container spacing={3} direction='column'>
              <Grid item>
                <Typography className={classes.subtitle}>Wallet Connected</Typography>
                <Typography variant='caption'>
                  {firstNewCryptoAccount.hdWalletVariables &&
                  firstNewCryptoAccount.hdWalletVariables.xpub
                    ? `Account xpub: ${firstNewCryptoAccount.hdWalletVariables.xpub.slice(0, 16)}...
                    ${firstNewCryptoAccount.hdWalletVariables.xpub.slice(-24)}`
                    : `Wallet address: ${firstNewCryptoAccount.address}`}
                </Typography>
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
                  disabled={firstNewCryptoAccount.email} // force using email as name
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
        return this.renderPlatformSelection()
      case 2:
        return this.renderNameNewAccount()
      default:
        return this.renderWalletSelections()
    }
  }

  render () {
    const { open, handleClose, onSubmit, newCryptoAccounts, fullScreen, classes } = this.props
    const { step, name } = this.state
    return (
      <Dialog
        open={open}
        fullScreen={fullScreen}
        onClose={() => {
          if (!this.locked) handleClose()
        }}
        classes={{ paperScrollPaper: classes.dialogRoot }}
        fullWidth
      >
        <DialogTitle disableTypography className={classes.titleRoot}>
          <Typography variant='h3'>Connect to Account</Typography>
          <IconButton
            onClick={handleClose}
            className={classes.closeButton}
            disabled={this.locked()}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.contentRoot}>{this.renderSteps()}</DialogContent>
        <DialogActions style={{ justifyContent: 'center' }}>
          <Button
            onClick={() => {
              handleClose()
            }}
            disabled={this.locked()}
          >
            Cancel
          </Button>
          <Button
            variant='contained'
            color='primary'
            // name cannot be empty
            disabled={step !== 2 && name.length > 0}
            onClick={() => {
              onSubmit(newCryptoAccounts, name)
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
  },
  dialogRoot: {
    maxWidth: '640px'
  },
  titleRoot: {
    paddingTop: '30px'
  },
  contentRoot: {
    paddingTop: '0px',
    paddingBottom: '20px',
    minHeight: '370px'
  },
  subtitle: {
    fontSize: '14px',
    fontWeight: 600
  }
})

export default withStyles(styles)(withMobileDialog()(AddAccountModalComponent))
