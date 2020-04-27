// @flow
import React, { useState, useEffect } from 'react'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import Avatar from '@material-ui/core/Avatar'
import Alert from '@material-ui/lab/Alert'
import Button from '@material-ui/core/Button'
import Box from '@material-ui/core/Box'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import Divider from '@material-ui/core/Divider'
import IconButton from '@material-ui/core/IconButton'
import LinearProgress from '@material-ui/core/LinearProgress'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import OpenInBrowser from '@material-ui/icons/OpenInBrowser'
import TextField from '@material-ui/core/TextField'
import Tooltip from '@material-ui/core/Tooltip'
import Typography from '@material-ui/core/Typography'
import UsbIcon from '@material-ui/icons/Usb'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import InputLabel from '@material-ui/core/InputLabel'
import FormControl from '@material-ui/core/FormControl'
import OutlinedInput from '@material-ui/core/OutlinedInput'
import {
  walletSelections,
  getWalletSupportedPlatforms,
  getWalletLogo,
  getWalletTitle,
  getWalletDescText,
  walletCryptoSupports
} from '../wallet'
import {
  getCryptoTitle,
  getPlatformCryptos,
  getCryptoLogo,
  getCryptoSymbol,
  getCryptoPlatformType
} from '../tokens'
import Radio from '@material-ui/core/Radio'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import walletErrors from '../wallets/walletErrors'
import { useActionTracker } from '../hooksUtils'
import MuiLink from '@material-ui/core/Link'

// Icons
import CheckCircleIcon from '@material-ui/icons/CheckCircleRounded'
import CloseIcon from '@material-ui/icons/CloseRounded'
import CropFreeIcon from '@material-ui/icons/CropFreeRounded'
import ErrorIcon from '@material-ui/icons/ErrorRounded'
import FileCopyIcon from '@material-ui/icons/FileCopyRounded'

const useStyles = makeStyles(theme => ({
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500]
  },
  dialogRoot: {
    [theme.breakpoints.up('sm')]: {
      maxWidth: '360px',
      height: '640px'
    }
  },
  contentRoot: {
    padding: 0
  },
  titleRoot: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    borderBottom: '1px solid #E9E9E9'
  },
  subtitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#777777'
  },
  closeIcon: {
    width: '16px',
    height: 'auto'
  },
  avatar: {
    borderRadius: '0px',
    width: '32px',
    height: 'auto'
  },
  bigAvatarContainer: {
    paddingTop: theme.spacing(6),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(12),
    paddingRight: theme.spacing(12)
  },
  listItem: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3)
  },
  denseListItem: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2)
  },
  bigAvatar: {
    borderRadius: '0px',
    width: '60px',
    height: 'auto'
  },
  radio: {
    padding: 0,
    marginRight: theme.spacing(1)
  },
  divider: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2)
  }
}))
type SelectCoinProps = {
  selectedCryptoType: string,
  cryptoTypeList: Array<string>,
  onSelect: Function
}

const SelectCoin = (props: SelectCoinProps) => {
  const { selectedCryptoType, onSelect, cryptoTypeList } = props
  return (
    <FormControl variant='outlined'>
      <InputLabel>Select Coin Type</InputLabel>
      <Select
        value={selectedCryptoType}
        input={
          <OutlinedInput labelWidth={100} name='Select Coin Type' value={selectedCryptoType} />
        }
        onChange={event => onSelect(event.target.value)}
        inputProps={{ 'data-test-id': 'select_crypto' }}
      >
        {cryptoTypeList.map((cryptoType, index) => {
          return (
            <MenuItem
              key={`cryptoType-${index}`}
              value={cryptoType}
              data_test-id={`crypto_item_${cryptoType}`}
            >
              <Box display='flex' alignItems='center'>
                <Box mr={1} display='inline'>
                  {/* wallet icon */}
                  <Avatar style={{ borderRadius: '2px' }} src={getCryptoLogo(cryptoType)}></Avatar>
                </Box>
                <Box>
                  {/* wallet symbol */}
                  <Typography variant='body2'>{getCryptoSymbol(cryptoType)}</Typography>
                </Box>
              </Box>
            </MenuItem>
          )
        })}
      </Select>
    </FormControl>
  )
}

type ErrorMessageProps = {
  walletType: string,
  platformType: string,
  errors: Object
}

const ErrorMessage = (props: ErrorMessageProps) => {
  const { walletType, errors, platformType } = props
  let errorInstruction
  if ((!errors.checkWalletConnection && !errors.newCryptoAccountsFromWallet) || !platformType) {
    return null
  }
  let error = errors.checkWalletConnection || errors.newCryptoAccountsFromWallet
  switch (walletType) {
    case 'metamask':
      if (error === walletErrors.metamask.extendsionNotFound) {
        errorInstruction = 'MetaMask extension is not available'
      } else if (error === walletErrors.metamask.incorrectNetwork) {
        errorInstruction = 'Incorrect MetaMask network'
      } else if (error === walletErrors.metamask.authorizationDenied) {
        errorInstruction = 'MetaMask authorization denied'
      } else {
        errorInstruction = error
      }
      break
    case 'ledger':
      if (error === walletErrors.ledger.deviceNotConnected) {
        errorInstruction = 'Ledger device is not connected'
      } else if (error === walletErrors.ledger.ledgerAppCommunicationFailed) {
        errorInstruction = `Ledger ${platformType} app is not available`
      } else {
        errorInstruction = error
      }
      break
    case 'trustWalletConnect':
    case 'metamaskWalletConnect':
      if (errors.checkWalletConnection) {
        errorInstruction = 'WalletConnect loading failed'
      } else if (error === walletErrors.metamaskWalletConnect.modalClosed) {
        errorInstruction = `User denied account authorization`
      } else {
        errorInstruction = error
      }
      break
    case 'coinbaseWalletLink':
      if (errors.checkWalletConnection) {
        errorInstruction = 'WalletLink loading failed'
      } else if (error === walletErrors.coinbaseWalletLink.authorizationDenied) {
        errorInstruction = `User denied account authorization`
      } else {
        errorInstruction = error
      }
      break
    case 'coinbaseOAuthWallet':
      if (errors.checkWalletConnection) {
        errorInstruction = 'Failed to get authorization from Coinbase'
      } else if (error === walletErrors.coinbaseOAuthWallet.accountNotFound) {
        errorInstruction = `Please select the proper account in the Coinbase pop window`
      } else if (error === walletErrors.coinbaseOAuthWallet.noAddress) {
        errorInstruction = `No address is available from Coinbase`
      } else if (error === walletErrors.coinbaseOAuthWallet.popupClosed) {
        errorInstruction = `User denied account authorization`
      } else {
        errorInstruction = error
      }
      break
    default:
      errorInstruction = 'Unknown error'
  }
  return (
    <Box mb={2}>
      <Alert icon={<ErrorIcon />} severity='error'>
        {errorInstruction}
      </Alert>
    </Box>
  )
}

type WalletListProps = {
  onSelect: Function
}

const WalletList = (props: WalletListProps) => {
  const { onSelect } = props
  const addableWallets = walletSelections.filter(w => {
    return w.addable
  })
  const classes = useStyles()
  return (
    <Box width='100%'>
      <List disablePadding>
        {addableWallets.map((w, i) => {
          return (
            <ListItem
              button
              key={`wallet-${i}`}
              divider
              className={classes.listItem}
              onClick={() => {
                onSelect(w.walletType)
              }}
              data-test-id={`wallet_item_${w.walletType}`}
            >
              <Box display='flex' flexDirection='row' alignItems='center'>
                <Box mr={1}>
                  <Avatar className={classes.avatar} src={getWalletLogo(w.walletType)} />
                </Box>
                <Box>
                  <Typography variant='body2'>{getWalletTitle(w.walletType)}</Typography>
                </Box>
              </Box>
            </ListItem>
          )
        })}
      </List>
    </Box>
  )
}

type SupportedCoinTypesProps = {
  platformType: string
}

const SupportedCoinTypes = (props: SupportedCoinTypesProps) => {
  const { platformType } = props
  const cryptoTypes = getPlatformCryptos(platformType).map(crypto => crypto.cryptoType)
  const classes = useStyles()
  if (!platformType) return null
  return (
    <Box width='100%' flexDirection='column' display='flex'>
      <Typography variant='h6'>Supported coin types</Typography>
      <Divider style={{ marginTop: 10 }} />
      <List disablePadding>
        {cryptoTypes.map((c, i) => {
          return (
            <ListItem key={`crypto-${i}`} divider className={classes.denseListItem}>
              <Box display='flex' flexDirection='row' alignItems='center'>
                <Box mr={1}>
                  <Avatar className={classes.avatar} src={getCryptoLogo(c)} />
                </Box>
                <Box>
                  <Typography variant='body2'>{getCryptoSymbol(c)}</Typography>
                </Box>
              </Box>
            </ListItem>
          )
        })}
      </List>
    </Box>
  )
}

type WalletConnectActionProps = {
  platformType: string,
  walletType: string,
  onConnect: Function,
  actionsPending: Object,
  selectedCryptoType: string
}

const WalletConnectAction = (props: WalletConnectActionProps) => {
  const classes = useStyles()
  const { onConnect, platformType, walletType, actionsPending, selectedCryptoType } = props
  if (!platformType || !walletType) return null
  let connectText, buttonText, buttonIcon, statusMessage
  switch (walletType) {
    case 'metamask':
      connectText = 'Connect your wallet via browser extension'
      buttonText = 'Connect to MetaMask'
      buttonIcon = <OpenInBrowser />
      if (actionsPending.checkWalletConnection) {
        statusMessage = 'Checking if MetaMask extension is installed and enabled...'
      } else {
        statusMessage = 'Waiting for authorization...'
      }
      break
    case 'ledger':
      connectText = 'Plug-in and connect to your ledger divice'
      buttonText = 'Connect to Ledger'
      buttonIcon = <UsbIcon />
      if (actionsPending.newCryptoAccountsFromWallet && platformType === 'bitcoin') {
        statusMessage = 'Please wait while we sync your Bitcoin account with the network...'
      } else if (actionsPending.checkWalletConnection) {
        statusMessage =
          'Please connect your Ledger Device and connect it through the popup window...'
      } else {
        statusMessage = 'Please navigate to the selected crypto app on your Ledger device...'
      }
      break
    case 'trustWalletConnect':
    case 'metamaskWalletConnect':
      connectText = 'Connect your wallet via WalletConnect'
      buttonText = 'Scan QR Code'
      buttonIcon = <CropFreeIcon />
      if (actionsPending.checkWalletConnection) {
        statusMessage = 'Creating connection...'
      } else {
        statusMessage = 'Please scan the QR code with MetaMask Mobile app...'
      }
      break
    case 'coinbaseWalletLink':
      connectText = 'Connect your wallet via WalletLink'
      buttonText = 'Scan QR Code'
      buttonIcon = <CropFreeIcon />
      break
    case 'coinbaseOAuthWallet':
      connectText = `Fetch Coinbase ${getCryptoTitle(platformType)} accounts`
      buttonText = 'Authorize Chainsfr'
      buttonIcon = <OpenInBrowser />
      if (actionsPending.checkWalletConnection) {
        statusMessage = 'Fetching your account...'
      } else {
        statusMessage =
          'Waiting for authorization...\nMake sure the login pop-up window is not blocked by the browser.'
      }
      break
    default:
      statusMessage = 'Please wait...'
  }
  let cryptoTypes = getPlatformCryptos(platformType).map(crypto => crypto.cryptoType)
  if (walletType === 'coinbaseOAuthWallet') {
    // coinbase OAuth wallet can only add one crypto at a time
    cryptoTypes = cryptoTypes.filter(cryptoType => {
      return selectedCryptoType === cryptoType
    })
  }
  if (actionsPending.checkWalletConnection || actionsPending.newCryptoAccountsFromWallet) {
    return (
      <Box display='flex' flexDirection='column'>
        <Typography className={classes.subtitle}>{statusMessage}</Typography>
        <Box mt={1} mb={1}>
          <LinearProgress />
        </Box>
      </Box>
    )
  }

  return (
    <Box display='flex' flexDirection='column'>
      <Box mb={1}>
        <Typography className={classes.subtitle}>{connectText}</Typography>
      </Box>
      <Button
        color='primary'
        onClick={() => {
          onConnect('default', cryptoTypes, walletType, platformType)
        }}
        variant='contained'
        disabled={cryptoTypes.length === 0}
        data-test-id='authorize_btn'
      >
        {buttonIcon}
        {buttonText}
      </Button>
    </Box>
  )
}

type SelectPlateformProps = {
  platformType: string,
  walletType: string,
  onSelect: Function
}

const SelectPlateform = (props: SelectPlateformProps) => {
  const classes = useStyles()
  const { walletType, platformType, onSelect } = props
  const listOfPlatform = getWalletSupportedPlatforms(walletType)
  if (listOfPlatform.length === 1) {
    onSelect(listOfPlatform[0])
    return null
  }
  return (
    <Box display='flex' flexDirection='column'>
      <Typography variant='body2'>
        {platformType ? 'Selected blockchain network' : 'Select blockchain network'}
      </Typography>
      <List disablePadding>
        {listOfPlatform.map((p, i) => {
          return (
            <ListItem
              key={`platform-${i}`}
              button
              onClick={() => {
                onSelect(p)
              }}
              disableGutters
            >
              <Radio checked={platformType === p} className={classes.radio} />
              <Typography variant='body2'>{getCryptoTitle(p)} </Typography>
            </ListItem>
          )
        })}
      </List>
    </Box>
  )
}

type WalletBigIconProps = {
  src: string,
  name: string
}

const WalletBigIcon = (props: WalletBigIconProps) => {
  const classes = useStyles()
  const { src, name } = props
  return (
    <Box display='flex' flexDirection='column' alignItems='center'>
      <Box className={classes.bigAvatarContainer}>
        <Avatar src={src} className={classes.bigAvatar} />
      </Box>
      <Typography variant='body2'>{name}</Typography>
    </Box>
  )
}

type ConnectWalletProps = {
  platformType: string,
  walletType: string,
  onConnect: Function,
  actionsPending: Object,
  actionsFulfilled: Object,
  errors: Object,
  cryptoType: string,
  setPlateformType: Function,
  setCryptoType: Function
}

const LEDGER_CONNECT_USB_DRIVER_INSTRUCTION = `For windows users, you may need to install a third-party USB 
driver in order to connect a Ledger device thorough Chrome browser.`

const ConnectWallet = (props: ConnectWalletProps) => {
  const {
    walletType,
    onConnect,
    actionsPending,
    actionsFulfilled,
    errors,
    cryptoType,
    platformType,
    setPlateformType,
    setCryptoType
  } = props
  if (walletType !== 'coinbaseOAuthWallet') {
    return (
      <Box display='flex' flexDirection='column'>
        <WalletBigIcon src={getWalletLogo(walletType)} name={getWalletDescText(walletType)} />
        <Box pt={2} pr={3} pb={2} pl={3} display='flex' flexDirection='column'>
          {/* We need to add extra instruction for ledger */}
          {walletType === 'ledger' && (
            <Box mb={2}>
              <Alert severity='info'>
                <Typography display='inline' style={{ whiteSpace: 'pre-line' }}>
                  {LEDGER_CONNECT_USB_DRIVER_INSTRUCTION}
                  <MuiLink>{`\n How to install?`}</MuiLink>
                </Typography>
              </Alert>
            </Box>
          )}
          <ErrorMessage errors={errors} walletType={walletType} platformType={platformType} />
          <SelectPlateform
            walletType={walletType}
            platformType={platformType}
            onSelect={setPlateformType}
          />
          <Box mt={1} width='100%'>
            <WalletConnectAction
              selectedCryptoType={cryptoType}
              walletType={walletType}
              platformType={platformType}
              onConnect={onConnect}
              actionsPending={actionsPending}
              actionsFulfilled={actionsFulfilled}
              errors={errors}
            />
          </Box>
          <Box mt={1} width='100%'>
            <SupportedCoinTypes platformType={platformType} />
          </Box>
        </Box>
      </Box>
    )
  } else {
    const cryptoTypeList = walletCryptoSupports['coinbaseOAuthWallet'].map(c => c.cryptoType)
    return (
      <Box display='flex' flexDirection='column'>
        <WalletBigIcon src={getWalletLogo(walletType)} name={getWalletDescText(walletType)} />
        <Box pt={2} pr={3} pb={2} pl={3} display='flex' flexDirection='column'>
          <ErrorMessage errors={errors} walletType={walletType} platformType={platformType} />
          <SelectCoin
            selectedCryptoType={cryptoType}
            cryptoTypeList={cryptoTypeList}
            onSelect={setCryptoType}
          />
          <Box mt={1} width='100%'>
            <WalletConnectAction
              selectedCryptoType={cryptoType}
              walletType={walletType}
              platformType={platformType}
              onConnect={onConnect}
              actionsPending={actionsPending}
              actionsFulfilled={actionsFulfilled}
              errors={errors}
            />
          </Box>
        </Box>
      </Box>
    )
  }
}

type NameNewAccountsProps = {
  walletType: string,
  name: string,
  newCryptoAccounts: Function,
  onNameChanged: Function
}

const NameNewAccounts = (props: NameNewAccountsProps) => {
  const { walletType, onNameChanged, name, newCryptoAccounts } = props
  const [toolipText, setTooltipText] = useState('Copy')
  const firstNewCryptoAccount = newCryptoAccounts[0]
  if (!firstNewCryptoAccount) return null
  useEffect(() => {
    if (
      firstNewCryptoAccount &&
      walletType === 'coinbaseOAuthWallet' &&
      firstNewCryptoAccount.email &&
      name.length === 0
    ) {
      onNameChanged(firstNewCryptoAccount.email)
    }
  }, [firstNewCryptoAccount])

  let addressInfo = ''
  if (firstNewCryptoAccount.hdWalletVariables && firstNewCryptoAccount.hdWalletVariables.xpub) {
    addressInfo = firstNewCryptoAccount.hdWalletVariables.xpub
  } else {
    addressInfo = firstNewCryptoAccount.address
  }

  return (
    <Box display='flex' flexDirection='column'>
      <WalletBigIcon src={getWalletLogo(walletType)} name={getWalletDescText(walletType)} />
      <Box pt={1} pr={3} pb={2} pl={3} display='flex' flexDirection='column'>
        <Box mb={2}>
          <Alert severity='success' iconMapping={{ success: <CheckCircleIcon /> }}>
            {`${getWalletTitle(walletType)} connected`}
          </Alert>
        </Box>
        <Box mt={1} width='100%'>
          <TextField
            fullWidth
            id='account name'
            variant='outlined'
            label='Account Name'
            onChange={event => {
              onNameChanged(event.target.value)
            }}
            value={name}
            disabled={walletType === 'coinbaseOAuthWallet'}
            InputProps={{
              'data-test-id': 'new_accounts_name_text_field'
            }}
          />
        </Box>
        <Box mt={1} display='flex' alignItems='center' justifyContent='space-between'>
          {firstNewCryptoAccount.hdWalletVariables &&
          firstNewCryptoAccount.hdWalletVariables.xpub ? (
            <Typography variant='caption'>
              {`Xpub: ${addressInfo.slice(0, 12)}...${addressInfo.slice(-18)}`}
            </Typography>
          ) : (
            <Typography variant='caption'>
              {`Address: ${addressInfo.slice(0, 12)}...${addressInfo.slice(-18)}`}
            </Typography>
          )}
          <CopyToClipboard
            text={addressInfo}
            onCopy={() => {
              setTooltipText('Copied')
            }}
          >
            <Tooltip placement='bottom' title={toolipText}>
              <IconButton style={{ padding: 0 }}>
                <FileCopyIcon color='primary' style={{ width: '16px' }} />
              </IconButton>
            </Tooltip>
          </CopyToClipboard>
        </Box>
        {firstNewCryptoAccount.hdWalletVariables && firstNewCryptoAccount.hdWalletVariables.xpub && (
          <Box display='flex' alignItems='center'>
            <ErrorIcon color='primary' style={{ width: '16px' }} />
            <Button
              target='_blank'
              rel='noopener noreferrer'
              href='https://support.ledger.com/hc/en-us/articles/360011069619-Extended-public-key'
              style={{ padding: 0, borderRadius: 0 }}
            >
              <Typography color='primary' variant='caption' style={{ fontStyle: 'italic' }}>
                What's xpub
              </Typography>
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  )
}

type AddAccountModalComponentProps = {
  open: boolean,
  handleClose: Function,
  onConnect: Function,
  newCryptoAccounts: Object,
  onSubmit: Function,
  online: boolean
}

const AddAccountModalComponent = (props: AddAccountModalComponentProps) => {
  const classes = useStyles()
  const { handleClose, open, onConnect, newCryptoAccounts, onSubmit } = props
  const [step, setStep] = useState(0)
  const [walletType, setWalletType] = useState('')
  const [name, setName] = useState('')
  const [platformType, setPlateformType] = useState('')
  const [cryptoType, setCryptoType] = useState('')

  useEffect(() => {
    if (cryptoType) setPlateformType(getCryptoPlatformType(cryptoType))
  }, [cryptoType])

  function handleWalletSelect (walletType) {
    setWalletType(walletType)
    setStep(1)
  }

  const { actionsPending, actionsFulfilled, errors } = useActionTracker(
    ['newCryptoAccountsFromWallet', 'checkWalletConnection'],
    [['NEW_CRYPTO_ACCOUNTS_FROM_WALLET'], ['CHECK_WALLET_CONNECTION]']]
  )
  const locked = actionsPending.newCryptoAccountsFromWallet || actionsPending.checkWalletConnection

  useEffect(() => {
    if (actionsFulfilled['newCryptoAccountsFromWallet']) {
      setStep(2)
    }
  }, [actionsFulfilled['newCryptoAccountsFromWallet']])

  function renderSteps () {
    switch (step) {
      case 0:
        return <WalletList onSelect={handleWalletSelect} />
      case 1:
        return (
          <ConnectWallet
            walletType={walletType}
            onConnect={onConnect}
            actionsPending={actionsPending}
            actionsFulfilled={actionsFulfilled}
            errors={errors}
            cryptoType={cryptoType}
            platformType={platformType}
            setPlateformType={setPlateformType}
            setCryptoType={setCryptoType}
          />
        )
      case 2:
        return (
          <NameNewAccounts
            walletType={walletType}
            name={name}
            onNameChanged={setName}
            newCryptoAccounts={newCryptoAccounts}
          />
        )
      default:
        return <WalletList onSelect={handleWalletSelect} />
    }
  }
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'))
  return (
    <Dialog
      open={open}
      fullScreen={fullScreen}
      onClose={() => {
        handleClose()
      }}
      classes={{ paperScrollPaper: classes.dialogRoot }}
      fullWidth
      disableBackdropClick={locked}
    >
      <DialogTitle disableTypography className={classes.titleRoot}>
        <Typography variant='h3'>Add account connection</Typography>
        <IconButton onClick={handleClose} className={classes.closeButton} disabled={locked}>
          <CloseIcon className={classes.closeIcon} />
        </IconButton>
      </DialogTitle>
      <DialogContent className={classes.contentRoot}>{renderSteps()}</DialogContent>
      {/* show buttons at last step */}
      {step === 2 && (
        <DialogActions style={{ justifyContent: 'center' }}>
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
            // name cannot be empty
            disabled={name.length === 0}
            onClick={() => {
              onSubmit(newCryptoAccounts, name)
            }}
            data-test-id='save_btn'
          >
            Save
          </Button>
        </DialogActions>
      )}
    </Dialog>
  )
}

export default AddAccountModalComponent
