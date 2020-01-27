// @flow
import React, { Component } from 'react'

import { withStyles } from '@material-ui/core/styles'
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
import InputAdornment from '@material-ui/core/InputAdornment'
import Tooltip from '@material-ui/core/Tooltip'
import WalletErrors from '../wallets/walletErrors'
import ReplayIcon from '@material-ui/icons/Replay'
import { getWalletTitle } from '../wallet'
import path from '../Paths.js'
import { getCryptoSymbol, getCryptoDecimals } from '../tokens'
import MuiLink from '@material-ui/core/Link'
import utils from '../utils'
import url from '../url'
import BN from 'bn.js'

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
  push: Function
}

type State = {
  password: string,
  tokenAllowanceAmount: string,
  minTokenAllowanceAmount: string,
  tokenAllowanceError: ?string
}

class WalletAuthorizationComponent extends Component<Props, State> {
  state = {
    password: '',
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
      this.setState({tokenAllowanceError: 'Cannot be less than the transfer amount'})
    } else if (tokenAllowanceError) {
      this.setState({tokenAllowanceError: null})
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
    const { checkWalletConnection, actionsPending } = this.props
    return (
      <Grid container direction='column' spacing={2}>
        <Grid item>
          <Typography variant='body1'>
            Connect your wallet via {getWalletTitle(walletType)}
          </Typography>
        </Grid>
        <Grid item>
          <Button
            disabled={actionsPending.submitTx}
            onClick={() => {
              checkWalletConnection()
            }}
            color='primary'
          >
            <CropFreeIcon />
            Connect to {getWalletTitle(walletType)}
          </Button>
        </Grid>
      </Grid>
    )
  }

  renderDriveConnectSteps = () => {
    const { checkWalletConnection, actionsPending, errors } = this.props
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
            disabled={actionsPending.submitTx}
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
    const { checkWalletConnection, accountSelection, actionsPending } = this.props
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
                  disabled={actionsPending.submitTx}
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
    const { checkWalletConnection, actionsPending } = this.props

    return (
      <Grid container direction='column'>
        <Grid item>
          <Typography variant='body1'>Connect your wallet via browser extension</Typography>
        </Grid>
        <Grid item>
          <Button
            disabled={actionsPending.submitTx}
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
    const { checkWalletConnection, actionsPending } = this.props
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
            disabled={actionsPending.submitTx}
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

  renderSetTokenAllowanceSection = () => {
    const { classes, accountSelection, actionsPending } = this.props
    const { tokenAllowanceAmount, tokenAllowanceError } = this.state

    const disabled =  actionsPending.submitTx ||
                      actionsPending.verifyAccount ||
                      actionsPending.checkWalletConnection ||
                      actionsPending.setTokenAllowance
                    
    return (
      <>
        <Box
          mb={4}
          style={{
            backgroundColor: 'rgba(57, 51, 134, 0.05)',
            borderRadius: '4px',
            padding: '20px'
          }}
        >
          <Typography variant='body2' style={{ whiteSpace: 'pre-line' }}>
            Please approve a transaction limit before being able to continue. Learn more about the approve process
            <MuiLink
              target='_blank'
              rel='noopener'
              href={'https://help.chainsfr.com/en/articles/3651983-erc20-approve'}
            >
              {' here.'}
            </MuiLink>
          </Typography>
        </Box>
        <Typography variant='body2'>
          {accountSelection && getCryptoSymbol(accountSelection.cryptoType)} Approve Transfer Limit
        </Typography>
        <TextField
          margin='normal'
          fullWidth
          id='cryptoAmount'
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
                <Tooltip title='Generate Security Answer' position='left'>
                  <Button
                    className={classes.setTokenAllowanceBtn}
                    color='primary'
                    disabled={disabled}
                    onClick={() =>
                      this.handleSetTokenAllowanceAmount(this.state.minTokenAllowanceAmount)
                    }
                  >
                    <ReplayIcon className={classes.setTokenAllowanceBtnIcon} />
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
      setTokenAllowanceTxHash
    } = this.props
    const { walletType, cryptoType, multiSigAllowance } = accountSelection
    const multiSigAllowanceStandardTokenUnit = utils
      .toHumanReadableUnit(multiSigAllowance, getCryptoDecimals(accountSelection.cryptoType))
      .toString()
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
      case 'trustWalletConnect':
      case 'metamaskWalletConnect':
        if (actionsPending.checkWalletConnection) {
          instruction = 'Creating connection...'
        } else if (actionsPending.verifyAccount) {
          instruction = `Please scan the QR code with the ${getWalletTitle(walletType)}...`
        }
        walletSteps = this.renderWalletConnectSteps(walletType)
        if (errors.checkWalletConnection) {
          errorInstruction = 'WalletConnect loading failed'
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
        } else if (errors.setTokenAllowance === WalletErrors.ledger.contractDataDisabled) {
          errorInstruction = 'Please enable Contract data on the Ethereum app Settings'
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
    if (actionsPending.setTokenAllowance || actionsPending.setTokenAllowanceWaitForConfirmation) {
      instruction = (
        <>
          Approving your account, waiting for the transaction to confirm
          <br />
          {setTokenAllowanceTxHash && (
            <>
              You can track the transaction
              <MuiLink
                target='_blank'
                rel='noopener'
                href={url.getExplorerTx(cryptoType, setTokenAllowanceTxHash)}
              >
                {' here'}
              </MuiLink>
            </>
          )}
        </>
      )
    }

    return (
      <Grid container spacing={2} direction='column'>
        {insufficientAllowance && <Grid item>{this.renderSetTokenAllowanceSection()}</Grid>}
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

        {(errors.checkWalletConnection ||
          errors.verifyAccount ||
          errors.setTokenAllowance ||
          errors.setTokenAllowanceWaitForConfirmation) && (
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
          actionsPending.verifyAccount ||
          actionsPending.setTokenAllowance ||
          actionsPending.setTokenAllowanceWaitForConfirmation) && (
          <Grid item>
            <Box
              style={{
                backgroundColor: 'rgba(57, 51, 134, 0.05)',
                borderRadius: '4px',
                padding: '20px'
              }}
            >
              <Typography variant='body2' style={{ whiteSpace: 'pre-line' }}>
                {instruction}
              </Typography>
              <LinearProgress style={{ marginTop: '10px' }} />
            </Box>
          </Grid>
        )}
        {!insufficientAllowance && (
          <Grid item>
            <Typography variant='body2'>
              {`Your remaining authorized ${getCryptoSymbol(
                accountSelection.cryptoType
              )} transfer limit is ${multiSigAllowanceStandardTokenUnit}`}
            </Typography>
          </Grid>
        )}
      </Grid>
    )
  }

  render () {
    const { accountSelection, actionsPending, push } = this.props

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
                    onClick={() => push(`${path.transfer}?step=1`)}
                    color='primary'
                    disabled={
                      actionsPending.submitTx ||
                      actionsPending.verifyAccount ||
                      actionsPending.checkWalletConnection ||
                      actionsPending.setTokenAllowance
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

const styles = theme => ({
  setTokenAllowanceBtn: {
    borderRadis: '4px',
    fontSize: '14px',
    padding: '6px 10px 6px 10px',
    margin: '0px 2px 0px 2px'
  },
  setTokenAllowanceBtnIcon: {
    height: '15px',
    width: '15px'
  }
})

export default withStyles(styles)(WalletAuthorizationComponent)
