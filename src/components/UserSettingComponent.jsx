import React, { useState, useEffect } from 'react'
import Alert from '@material-ui/lab/Alert'
import AlertTitle from '@material-ui/lab/AlertTitle'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import CalendarTodayIcon from '@material-ui/icons/CalendarToday'
import CircularProgress from '@material-ui/core/CircularProgress'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import CloseIcon from '@material-ui/icons/Close'
import Checkbox from '@material-ui/core/Checkbox'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Divider from '@material-ui/core/Divider'
import env from '../typedEnv'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import GoogleIcon from '../images/google-icon.svg'
import GoogleDrive from '../images/googleDrive.svg'
import IconButton from '@material-ui/core/IconButton'
import InfoIcon from '@material-ui/icons/Info'
import LaunchRoundedIcon from '@material-ui/icons/LaunchRounded'
import { makeStyles, useTheme, withStyles } from '@material-ui/core/styles'
import moment from 'moment'
import MuiLink from '@material-ui/core/Link'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Typography from '@material-ui/core/Typography'
import UserAvatar from './MicroComponents/UserAvatar'
import useMediaQuery from '@material-ui/core/useMediaQuery'

const SettingTabs = props => {
  const { currentTab, handleChange } = props
  const theme = useTheme()
  const large = useMediaQuery(theme.breakpoints.up('md'))

  return (
    <Tabs
      value={currentTab}
      onChange={handleChange}
      indicatorColor='primary'
      textColor='primary'
      variant={large ? 'standard' : 'fullWidth'}
    >
      <Tab label='Account Info' data-test-td='account_info' />
      <Tab label='Security' data-test-id='security' />
      <Tab label='Advanced' data-test-id='advanced' />
    </Tabs>
  )
}

const accountInfoStyle = makeStyles({
  icon: {
    color: '#777777',
    width: 18,
    marginRight: 10
  }
})

const AccountInfo = props => {
  const { profile, registerTime, onLogout } = props
  if (!profile) return null
  const { profileObj } = profile
  const classes = accountInfoStyle(props)
  let date
  if (registerTime) date = moment.unix(registerTime).format('MMMM Do YYYY')
  return (
    <Box display='flex' flexDirection='column'>
      <Box display='flex' alignItems='center'>
        <UserAvatar
          style={{ width: 48, height: 48 }}
          src={profileObj.imageUrl}
          name={profileObj.name}
        />
        <Box ml={1} display='flex' flexDirection='column'>
          <Typography variant='h3' data-test-id='user_name'>
            {profileObj.name}
          </Typography>
          <Typography variant='body2' color='textSecondary' data-test-id='user_email'>
            {profileObj.email}
          </Typography>
        </Box>
      </Box>
      <Box display='flex' alignItems='center' mt={3}>
        <img src={GoogleIcon} style={{ width: 18, marginRight: 10 }} alt='googleIcon' />
        <Typography variant='body2'>Connected with Google account</Typography>
      </Box>
      <Box display='flex' alignItems='center' mt={2}>
        <CalendarTodayIcon className={classes.icon} />
        <Typography variant='body2' data-test-id='join_date'>
          Joined on {date}
        </Typography>
      </Box>
      <Box mt={3}>
        <Button
          variant='contained'
          size='small'
          color='default'
          id='signout'
          onClick={() => {
            onLogout()
          }}
          data-test-id='sign_out_btn'
        >
          Sign Out
        </Button>
      </Box>
    </Box>
  )
}

const securityStyle = makeStyles({
  icon: {
    width: 20,
    marginRight: 10
  }
})

const Security = props => {
  const classes = securityStyle()

  const TextButton = withStyles({
    root: {
      padding: 0
    }
  })(Button)

  return (
    <>
      <Box maxWidth={640} display='flex' flexDirection='column'>
        <Box mb={1}>
          <Typography variant='h3'>Two-Factor Authentication</Typography>
        </Box>
        <Box mb={2}>
          <Typography variant='body1' color='textSecondary'>
            Chainsfr is deeply integrated with Google service. Your google account is crucial for
            the security of your assets in chainsfr Wallet and payments. With Google Two-Factor
            Authentication, you’ll protect your Google account with both your password and your
            phone.
          </Typography>
          <Box mt={1}>
            <Typography variant='body1' color='textSecondary'>
              To learn more, please check the related topics at our{' '}
              <TextButton color='primary'>help center.</TextButton>
            </Typography>
          </Box>
        </Box>
        <Box>
          <Button
            target='_blank'
            variant='contained'
            color='default'
            href='https://support.google.com/accounts/answer/185839'
            data-test-id='google_two_factor_auth_btn'
          >
            <LaunchRoundedIcon className={classes.icon} />
            Google Two-Factor Authentication
          </Button>
        </Box>
      </Box>
      {/* <ChangePasswordDialog
        open={openChangePasswordDialog}
        handleClose={() => {
          toggleDialog(openChangePasswordDialog)
        }}
        handleSubmit={(oldPassword, newPassword) => {
          console.log('submit')
          changeChainsfrWalletPassword(oldPassword, newPassword)
        }}
        loading={loading}
        error={error}
      /> */}
    </>
  )
}
const exportStyle = makeStyles(theme => ({
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500]
  },
  dialogRoot: {
    [theme.breakpoints.up('sm')]: {
      maxWidth: '380px',
      height: '640px'
    }
  },
  contentRoot: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    paddingTop: 0,
    paddingBottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch'
  },
  titleRoot: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    borderBottom: '1px solid #E9E9E9'
  },
  closeIcon: {
    width: '16px',
    height: 'auto'
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#602323'
  },
  alertMessage: {
    fontSize: 12,
    color: '#602323'
  },
  alert: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    paddingTop: '5px',
    paddingBottom: '5px',
    marginTop: theme.spacing(2)
  },
  formControlLabel: {
    marginBottom: theme.spacing(2),
    marginRight: 0,
    alignItems: 'flex-start'
  },
  checkBox: {
    paddingTop: 0,
    borderRadius: 0
  },
  fextField: { marginBottom: theme.spacing(2) },
  dialogActions: {
    paddingBottom: theme.spacing(6)
  },
  address: {
    fontSize: '12px',
    color: '#333333',
    lineHeight: '20px'
  }
}))

const ExportWalletDialog = props => {
  const {
    open,
    handleClose,
    exportedCloundWalletData,
    exportCloudWallet,
    large,
    enqueueSnackbar
  } = props
  const [showPriavateKeys, setShowPrivateKeys] = useState(false)
  const [checkBox, setCheckBox] = React.useState({
    checkedA: false,
    checkedB: false,
    checkedC: false
  })
  const classes = exportStyle()

  const showable = checkBox.checkedA && checkBox.checkedB && checkBox.checkedC
  const handleChange = event => {
    setCheckBox({ ...checkBox, [event.target.name]: event.target.checked })
  }

  const showAgreement = () => {
    return (
      <>
        <Box mt={2} mb={1}>
          <Typography>To export the drive data, you agree to:</Typography>
        </Box>
        <FormControlLabel
          className={classes.formControlLabel}
          control={
            <Checkbox
              className={classes.checkBox}
              checked={checkBox.checkedA}
              onChange={handleChange}
              name='checkedA'
            />
          }
          label='Understand the risk that anyone with the exported data can steal assets held in your Chainsfr built-in wallets.'
        />
        <FormControlLabel
          className={classes.formControlLabel}
          control={
            <Checkbox
              checked={checkBox.checkedB}
              className={classes.checkBox}
              onChange={handleChange}
              name='checkedB'
            />
          }
          label='Own the management and security of the exported wallet data instead of Chainsfr.'
        />
        <FormControlLabel
          className={classes.formControlLabel}
          control={
            <Checkbox
              checked={checkBox.checkedC}
              className={classes.checkBox}
              onChange={handleChange}
              name='checkedC'
            />
          }
          label={
            <Typography>
              {'You have read and agree to the Chainsfr’s '}
              <MuiLink target='_blank' rel='noopener' href={env.REACT_APP_TERMS_URL}>
                Terms of Service
              </MuiLink>
              .
            </Typography>
          }
        />
      </>
    )
  }

  const renderPrivateKeys = () => {
    if (!exportedCloundWalletData)
      return (
        <Box pt={3} display='flex' alignItems='center' justifyContent='center'>
          <CircularProgress />
        </Box>
      )

    const { ethereum, bitcoin } = exportedCloundWalletData

    return (
      <>
        <Alert severity='error' className={classes.alert}>
          <AlertTitle className={classes.alertTitle}>Caution</AlertTitle>
          <Typography className={classes.alertMessage}>
            Do not take screenshot for private keys.
          </Typography>
        </Alert>
        <Box mt={2} display='flex' flexDirection='column'>
          <Typography className={classes.address}>{`Address: ${bitcoin.address.slice(
            0,
            14
          )}...${bitcoin.address.slice(-14)}`}</Typography>
          <Box border='1px solid #393386' height='100px' padding={1} mb={1} borderRadius='4px'>
            <Typography style={{ lineBreak: 'anywhere' }}>{bitcoin.privateKey}</Typography>
          </Box>
          <CopyToClipboard
            text={bitcoin.privateKey}
            onCopy={() => {
              enqueueSnackbar({
                message: 'Bitcoin private key copied!',
                options: { variant: 'success', autoHideDuration: 3000 }
              })
            }}
          >
            <Button variant='contained' color='primary'>
              Copy Private Key of Bitcoin
            </Button>
          </CopyToClipboard>
        </Box>

        <Box mt={3} display='flex' flexDirection='column'>
          <Typography className={classes.address}>{`Address: ${ethereum.address.slice(
            0,
            16
          )}...${ethereum.address.slice(-16)}`}</Typography>
          <Box border='1px solid #393386' height='100px' padding={1} mb={1} borderRadius='4px'>
            <Typography style={{ lineBreak: 'anywhere' }}>{ethereum.privateKey}</Typography>
          </Box>
          <CopyToClipboard
            text={ethereum.privateKey}
            onCopy={() => {
              enqueueSnackbar({
                message: 'Ethereum private key copied!',
                options: { variant: 'success', autoHideDuration: 3000 }
              })
            }}
          >
            <Button variant='contained' color='primary'>
              Copy Private Key of Ethereum
            </Button>
          </CopyToClipboard>
        </Box>
      </>
    )
  }

  return (
    <Dialog
      open={open}
      onClose={() => {
        handleClose()
      }}
      classes={{ paperScrollPaper: classes.dialogRoot }}
      fullWidth
      fullScreen={!large}
    >
      <DialogTitle disableTypography className={classes.titleRoot}>
        <Typography variant='h3'>Export</Typography>
        <IconButton onClick={handleClose} className={classes.closeButton}>
          <CloseIcon className={classes.closeIcon} />
        </IconButton>
      </DialogTitle>
      <DialogContent className={classes.contentRoot}>
        {showPriavateKeys ? renderPrivateKeys() : showAgreement()}
      </DialogContent>
      {!showPriavateKeys && (
        <DialogActions className={classes.dialogActions}>
          <Button
            variant='contained'
            color='primary'
            onClick={() => {
              exportCloudWallet()
              setShowPrivateKeys(true)
            }}
            style={{ width: '100%' }}
            disabled={!showable}
          >
            Show Private Keys
          </Button>
        </DialogActions>
      )}
    </Dialog>
  )
}

const advancedStyle = makeStyles({
  greenBox: {
    backgroundColor: 'rgba(67, 179, 132, 0.1)'
  },
  greenIcon: {
    width: 20,
    color: '#43B384',
    marginRight: 10
  }
})

const Advanced = props => {
  const {
    cloudWalletFolderMeta,
    exportCloudWallet,
    exportedCloundWalletData,
    clearCloudWalletExport,
    large,
    enqueueSnackbar
  } = props
  const [openExport, setOpenExport] = useState(false)
  const classes = advancedStyle()

  let fileId, lastModified, lastExported

  if (cloudWalletFolderMeta) {
    fileId = cloudWalletFolderMeta.fileId
    lastModified = moment.unix(cloudWalletFolderMeta.lastModified).format('MMM Do YYYY, HH:mm')
    if (cloudWalletFolderMeta.lastExported)
      lastExported = moment.unix(cloudWalletFolderMeta.lastExported).format('MMM Do YYYY, HH:mm')
  }

  return (
    <Box maxWidth={640} display='flex' flexDirection='column'>
      <Box mb={3}>
        <Typography variant='h3'>Google Drive Backup</Typography>
      </Box>
      <Box mb={3} display='flex' alignItems='center' maxWidth={480}>
        {lastModified ? (
          <Alert icon={<CheckCircleIcon />} severity='success' data-test-id='backup_date'>
            Your account was encrypted and backed up on {lastModified}
          </Alert>
        ) : (
          <CircularProgress className={classes.greenIcon} />
        )}
      </Box>
      <Box>
        <Button
          variant='contained'
          color='default'
          target='_blank'
          href={`https://drive.google.com/drive/folders/${fileId}`}
          disabled={!fileId}
          data-test-id='backup_folder_btn'
        >
          <img src={GoogleDrive} style={{ width: 22, marginRight: 10 }} alt='driveIcon' />
          Go to Backup Folder
        </Button>
        <Button id='backup_learn_more' style={{ marginLeft: '30px' }} color='primary'>
          Learn More
        </Button>
      </Box>
      <Box mt={3} mb={3}>
        <Divider />
      </Box>
      <Box mb={3}>
        <Typography variant='h3'>Export Data from Google Drive</Typography>
      </Box>
      <Box mb={3} display='flex' alignItems='center' maxWidth={540}>
        <Alert icon={<InfoIcon />} severity='info' data-test-id='export_alert'>
          {lastExported && (
            <>
              Exported on {lastExported} <br />
            </>
          )}
          The exported data will contain the private keys of Chainsfr build-in wallets.
        </Alert>
      </Box>
      <Box>
        <Button
          variant='contained'
          color='default'
          data-test-id='export_btn'
          onClick={() => {
            setOpenExport(true)
          }}
        >
          Start to Export
        </Button>
        <Button id='export_learn_more' style={{ marginLeft: '30px' }} color='primary'>
          Learn More
        </Button>
      </Box>
      {openExport && (
        <ExportWalletDialog
          open={openExport}
          handleClose={() => {
            clearCloudWalletExport()
            setOpenExport(false)
          }}
          exportCloudWallet={exportCloudWallet}
          exportedCloundWalletData={exportedCloundWalletData}
          clearCloudWalletExport={clearCloudWalletExport}
          large={large}
          enqueueSnackbar={enqueueSnackbar}
        />
      )}
    </Box>
  )
}

const UserSettingComponent = props => {
  const [currentTab, setCurrentTab] = useState(0)

  const theme = useTheme()
  const large = useMediaQuery(theme.breakpoints.up('sm'))
  const tabContents = [
    <AccountInfo {...props} />,
    <Security {...props} />,
    <Advanced {...props} large={large} />
  ]

  useEffect(() => {
    props.getUserCloudWalletFolderMeta()
    props.getUserRegisterTime()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Box>
      <Box bgcolor='background.default' px={large ? 6 : 3} pt={6} pb={8}>
        <Typography variant='h2'>Account Settings</Typography>
      </Box>
      <Box display='flex' flexDirection='column' px={large ? 6 : 3} mt={-5}>
        <Box borderBottom='1px solid #E9E9E9'>
          <SettingTabs
            currentTab={currentTab}
            handleChange={(event, newValue) => {
              setCurrentTab(newValue)
            }}
          />
        </Box>
        <Box pt={3}>{tabContents[currentTab]}</Box>
      </Box>
    </Box>
  )
}

export default UserSettingComponent
