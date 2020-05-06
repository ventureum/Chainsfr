// @flow
import React, { Component } from 'react'

import { withStyles } from '@material-ui/core/styles'
import Alert from '@material-ui/lab/Alert'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import LinearProgress from '@material-ui/core/LinearProgress'
import { WalletButton } from './WalletSelectionButtons'
import InputAdornment from '@material-ui/core/InputAdornment'
import Tooltip from '@material-ui/core/Tooltip'
import WalletErrors from '../wallets/walletErrors'
import { getWalletTitle } from '../wallet'
import path from '../Paths.js'
import { getCryptoSymbol, getCryptoDecimals, getCryptoTitle, isERC20 } from '../tokens'
import MuiLink from '@material-ui/core/Link'
import utils from '../utils'
import url from '../url'
import BN from 'bn.js'
import { Prompt } from 'react-router'

// Icons
import CropFreeIcon from '@material-ui/icons/CropFreeRounded'
import OpenInBrowser from '@material-ui/icons/OpenInBrowserRounded'
import ResetIcon from '@material-ui/icons/ReplayRounded'
import UsbIcon from '@material-ui/icons/UsbRounded'

type Props = {
  classes: Object,
  transferForm: Object,
  actionsPending: Object,
  accountSelection: Object,
  setTokenAllowanceTxHash: string,
  checkWalletConnection: Function,
  setTokenAllowanceAmount: Function,
  insufficientAllowance: boolean,
  clearError: Function,
  errors: Object,
  push: Function,
  online: boolean,
  directTransfer: boolean
}

type State = {
  tokenAllowanceAmount: string,
  minTokenAllowanceAmount: string,
  tokenAllowanceError: ?string
}

class WalletAuthorizationComponent extends Component<Props, State> {
  state = {
    tokenAllowanceAmount: '0',
    minTokenAllowanceAmount: '0',
    tokenAllowanceError: null
  }

  componentDidMount () {
    const { transferForm } = this.props
    if (transferForm) {
      const { transferAmount } = transferForm
      if (transferAmount) {
        const modifiedTransferAmount = parseFloat(transferAmount).toString()
        this.setState({
          tokenAllowanceAmount: modifiedTransferAmount,
          minTokenAllowanceAmount: modifiedTransferAmount
        })
        // update container state
        this.props.setTokenAllowanceAmount(modifiedTransferAmount)
      }
    }
  }

  handleSetTokenAllowanceAmount = (amount: string) => {
    const { minTokenAllowanceAmount, tokenAllowanceError } = this.state
    this.setState({ tokenAllowanceAmount: amount })
    this.props.setTokenAllowanceAmount(amount)

    if (new BN(amount).lt(new BN(minTokenAllowanceAmount))) {
      this.setState({ tokenAllowanceError: 'Cannot be less than the transfer amount' })
    } else if (tokenAllowanceError) {
      this.setState({ tokenAllowanceError: null })
    }
  }

  handleChange = (prop: any) => (event: any) => {
    const { errors, clearError } = this.props
    this.setState({ [prop]: event.target.value })
    if (errors.submitTx || errors.verifyAccount || errors.checkWalletConnection) {
      clearError()
    }
  }

  renderWalletConnectSteps = (walletType: string) => {
    const { checkWalletConnection, actionsPending, online } = this.props
    return (
      <Tooltip title={'Connect via ' + getWalletTitle(walletType)} arrow>
        <Button
          disabled={actionsPending.submitTx || !online}
          onClick={() => {
            checkWalletConnection()
          }}
          variant='contained'
          color='primary'
          startIcon={<CropFreeIcon />}
        >
          Connect to Authorize
        </Button>
      </Tooltip>
    )
  }

  renderDriveConnectSteps = () => {
    const { checkWalletConnection, actionsPending, online } = this.props
    return (
      <Button
        disabled={actionsPending.submitTx || !online}
        onClick={() => {
          checkWalletConnection()
        }}
        variant='contained'
        color='primary'
      >
        Connect to Authorize
      </Button>
    )
  }

  renderLedgerConnectSteps = () => {
    const { checkWalletConnection, accountSelection, actionsPending, online } = this.props
    return (
      !accountSelection.connected && (
        <Tooltip title='Connect via Ledger device' arrow>
          <Button
            disabled={actionsPending.submitTx || !online}
            onClick={() => {
              checkWalletConnection()
            }}
            variant='contained'
            color='primary'
            startIcon={<UsbIcon />}
          >
            Connect to Ledger
          </Button>
        </Tooltip>
      )
    )
  }

  renderMetamaskConnectSteps = () => {
    const { checkWalletConnection, actionsPending, online } = this.props

    return (
      <Tooltip title='Connect via browser extension' arrow>
        <Button
          disabled={actionsPending.submitTx || !online}
          onClick={() => {
            checkWalletConnection()
          }}
          variant='contained'
          color='primary'
          startIcon={<OpenInBrowser />}
        >
          Connect to Authorize
        </Button>
      </Tooltip>
    )
  }

  renderCoinbaseWalletLinkConnectSteps = () => {
    const { checkWalletConnection, actionsPending, online } = this.props
    return (
      <Tooltip title='Connect via Coinbase WalletLink mobile app' arrow>
        <Button
          disabled={actionsPending.submitTx || !online}
          onClick={() => {
            checkWalletConnection()
          }}
          variant='contained'
          color='primary'
          startIcon={<CropFreeIcon />}
        >
          Connect to Authorize
        </Button>
      </Tooltip>
    )
  }

  renderSetTokenAllowanceSection = () => {
    const { accountSelection, actionsPending } = this.props
    const { tokenAllowanceAmount, tokenAllowanceError } = this.state

    const disabled =
      actionsPending.submitTx ||
      actionsPending.verifyAccount ||
      actionsPending.checkWalletConnection ||
      actionsPending.setTokenAllowance

    return (
      <>
        <Box mb={3}>
          <Alert severity='info'>
            <Typography display='inline' style={{ whiteSpace: 'pre-line' }}>
              Insufficient transaction limit to complete the transaction.
              <MuiLink>{`\n What's Transaction Limit?`}</MuiLink>
            </Typography>
          </Alert>
        </Box>
        <TextField
          label={
            (accountSelection && getCryptoSymbol(accountSelection.cryptoType)) +
            ' Transaction Limit'
          }
          margin='normal'
          fullWidth
          id='allowance'
          variant='outlined'
          type='number'
          onChange={event => this.handleSetTokenAllowanceAmount(event.target.value)}
          value={tokenAllowanceAmount}
          disabled={disabled}
          error={tokenAllowanceError}
          helperText={tokenAllowanceError}
          InputProps={{
            endAdornment: (
              <InputAdornment position='end'>
                <Tooltip title='Reset to minimum' position='bottom' arrow>
                  <Button
                    disabled={disabled}
                    onClick={() =>
                      this.handleSetTokenAllowanceAmount(this.state.minTokenAllowanceAmount)
                    }
                    color='primary'
                    startIcon={<ResetIcon />}
                  >
                    Reset
                  </Button>
                </Tooltip>
              </InputAdornment>
            )
          }}
        />
      </>
    )
  }

  renderWalletAuthorizationSteps = () => {
    const {
      actionsPending,
      accountSelection,
      errors,
      insufficientAllowance,
      setTokenAllowanceTxHash,
      directTransfer
    } = this.props
    const { walletType, cryptoType, multiSigAllowance } = accountSelection
    const multiSigAllowanceStandardTokenUnit = utils
      .toHumanReadableUnit(multiSigAllowance, getCryptoDecimals(accountSelection.cryptoType))
      .toString()
    let instruction = ''
    let errorInstruction
    switch (walletType) {
      case 'metamask':
        if (actionsPending.checkWalletConnection) {
          instruction = 'Checking if MetaMask extension is installed and enabled...'
        } else if (actionsPending.verifyAccount) {
          instruction = 'Waiting for authorization...'
        }
        if (errors.checkWalletConnection === WalletErrors.metamask.extendsionNotFound) {
          errorInstruction = 'MetaMask extension is not available'
        } else if (errors.verifyAccount === WalletErrors.metamask.incorrectAccount) {
          errorInstruction = `Incorrect wallet connected. Please connect to the correct wallet: \n ${accountSelection.address.slice(
            0,
            10
          )}...${accountSelection.address.slice(-10)}`
        } else if (errors.verifyAccount === WalletErrors.metamask.authorizationDenied) {
          errorInstruction = 'MetaMask authorization denied'
        } else if (errors.verifyAccount === WalletErrors.metamask.incorrectNetwork) {
          errorInstruction = 'Incorrect MetaMask network'
        }
        break
      case 'trustWalletConnect':
      case 'metamaskWalletConnect':
        if (actionsPending.checkWalletConnection) {
          instruction = 'Creating connection...'
        } else if (actionsPending.verifyAccount) {
          instruction = `Please scan the QR code with the ${getWalletTitle(walletType)}...`
        }
        if (errors.checkWalletConnection) {
          errorInstruction = 'WalletConnect loading failed'
        } else if (errors.verifyAccount === WalletErrors.metamaskWalletConnect.incorrectAccount) {
          errorInstruction = `Incorrect wallet connected. Please connect to the correct wallet: \n ${accountSelection.address.slice(
            0,
            10
          )}...${accountSelection.address.slice(-10)}`
        }
        break
      case 'ledger':
        if (actionsPending.checkWalletConnection) {
          instruction = 'Please connect your Ledger Device and connect it through popup window...'
        } else if (actionsPending.verifyAccount) {
          instruction = 'Please navigate to selected crypto app on your Ledger device...'
        }
        if (errors.checkWalletConnection === WalletErrors.ledger.deviceNotConnected) {
          errorInstruction = 'Ledger device is not connected'
        } else if (errors.verifyAccount === WalletErrors.ledger.ledgerAppCommunicationFailed) {
          errorInstruction = `Ledger ${cryptoType} app is not available`
        } else if (errors.verifyAccount === WalletErrors.ledger.incorrectAccount) {
          let address = ''
          if (accountSelection.platformType === 'ethereum') {
            address = accountSelection.address
          } else if (accountSelection.platformType === 'bitcoin') {
            address = accountSelection.hdWalletVariables.xpub
          }
          errorInstruction = `Incorrect wallet connected. Please connect to the correct Ledger device: \n 
          ${address.slice(0, 10)}...${address.slice(-10)}`
        } else if (errors.setTokenAllowance === WalletErrors.ledger.contractDataDisabled) {
          errorInstruction = 'Please enable Contract data on the Ethereum app Settings'
        } else if (errors.submitTx === WalletErrors.ledger.incorrectSigningKey) {
          errorInstruction = `Please make sure you have selected the correct 
          ${getCryptoTitle(cryptoType)} network`
        }
        break
      case 'drive':
        if (actionsPending.checkWalletConnection) {
          instruction = 'Loading Chainfr wallet...'
        } else if (actionsPending.verifyAccount) {
          instruction = 'Verifying Google account...'
        }
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
          errorInstruction = `Incorrect wallet connected. Please connect to the correct wallet: \n ${accountSelection.address.slice(
            0,
            10
          )}...${accountSelection.address.slice(-10)}`
        }
        break
      default:
        return null
    }
    if (actionsPending.submitTx) instruction = 'Transfer processing...'
    if (actionsPending.setTokenAllowance || actionsPending.setTokenAllowanceWaitForConfirmation) {
      instruction = (
        <>
          Approving your account, waiting for the transaction to confirm
          <br />
          {setTokenAllowanceTxHash && (
            <Typography display='inline'>
              You can track the transaction
              <MuiLink
                target='_blank'
                rel='noopener'
                href={url.getExplorerTx(cryptoType, setTokenAllowanceTxHash)}
              >
                {' here.'}
              </MuiLink>
            </Typography>
          )}
        </>
      )
    }
    return (
      <Grid container spacing={2} direction='column'>
        {!insufficientAllowance &&
          !accountSelection.connected &&
          isERC20(accountSelection.cryptoType) &&
          !directTransfer && (
            <Grid item>
              <Alert severity='info'>
                {`Your remaining ${getCryptoSymbol(
                  accountSelection.cryptoType
                )} transaction limit is ${multiSigAllowanceStandardTokenUnit}.`}
              </Alert>
            </Grid>
          )}
        {insufficientAllowance && !accountSelection.connected && (
          <Grid item>{this.renderSetTokenAllowanceSection()}</Grid>
        )}
        {accountSelection.connected && (
          <Grid item>
            <Alert severity='success'>Wallet connected</Alert>
          </Grid>
        )}
        {(errors.checkWalletConnection ||
          errors.verifyAccount ||
          errors.setTokenAllowance ||
          errors.setTokenAllowanceWaitForConfirmation ||
          errors.submitTx) && (
          <Grid item>
            <Alert severity='error'>{errorInstruction}</Alert>
          </Grid>
        )}
        {(actionsPending.submitTx ||
          actionsPending.checkWalletConnection ||
          actionsPending.verifyAccount ||
          actionsPending.setTokenAllowance ||
          actionsPending.setTokenAllowanceWaitForConfirmation) && (
          <Grid item>
            <Alert severity='info'>
              {instruction}
              <Box mt={1}>
                <LinearProgress />
              </Box>
            </Alert>
          </Grid>
        )}
      </Grid>
    )
  }

  renderConnectToWalletButton = () => {
    const { accountSelection } = this.props
    const { walletType } = accountSelection
    let walletSteps
    switch (walletType) {
      case 'metamask':
        walletSteps = this.renderMetamaskConnectSteps()
        break
      case 'trustWalletConnect':
      case 'metamaskWalletConnect':
        walletSteps = this.renderWalletConnectSteps(walletType)
        break
      case 'ledger':
        walletSteps = this.renderLedgerConnectSteps()
        break
      case 'drive':
        walletSteps = this.renderDriveConnectSteps()
        break
      case 'coinbaseWalletLink':
        walletSteps = this.renderCoinbaseWalletLinkConnectSteps()
        break
      default:
        return null
    }
    return <Box>{walletSteps}</Box>
  }

  render () {
    const { accountSelection, actionsPending, push, directTransfer } = this.props

    return (
      <>
        <Prompt
          when={
            actionsPending.submitDirectTransferTx ||
            actionsPending.submitTx ||
            actionsPending.verifyAccount ||
            actionsPending.checkWalletConnection ||
            actionsPending.setTokenAllowance
          }
          message={
            'You are currently confirming your transaction. Rejecting the transaction on your device or the popup window' +
            ' to cancel the transaction.'
          }
        />
        <Grid container direction='column' spacing={3}>
          <Grid item>
            <Typography variant='h3' display='inline'>
              Wallet Authorization
            </Typography>
          </Grid>

          <Grid item>
            <Box display='flex' alignItems='center' my={-4}>
              <Box>
                <WalletButton walletType={accountSelection.walletType} />
              </Box>
              <Box ml={2}>
                <Typography variant='body1' display='block'>
                  {accountSelection.name}
                </Typography>
                <Typography variant='caption'>
                  {`${getWalletTitle(accountSelection.walletType)}, ${getCryptoTitle(
                    accountSelection.platformType
                  )}`}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item>{this.renderWalletAuthorizationSteps()}</Grid>

          <Grid item>
            <Grid container direction='row' justify='center' spacing={2}>
              <Grid item>
                <Box my={3}>
                  <Button
                    onClick={() =>
                      push(`${directTransfer ? path.directTransfer : path.transfer}?step=1`)
                    }
                    color='primary'
                    disabled={
                      actionsPending.submitDirectTransferTx ||
                      actionsPending.submitTx ||
                      actionsPending.verifyAccount ||
                      actionsPending.checkWalletConnection ||
                      actionsPending.setTokenAllowance
                    }
                  >
                    Back
                  </Button>
                </Box>
              </Grid>
              <Grid item>
                <Box my={3}>{this.renderConnectToWalletButton()}</Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </>
    )
  }
}

const styles = theme => ({})

export default withStyles(styles)(WalletAuthorizationComponent)
