import React, { useState, useEffect } from 'react'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import CalendarTodayIcon from '@material-ui/icons/CalendarToday'
import CircularProgress from '@material-ui/core/CircularProgress'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import CloseIcon from '@material-ui/icons/Close'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Divider from '@material-ui/core/Divider'
import GoogleIcon from '../images/google-icon.svg'
import GoogleDrive from '../images/googleDrive.svg'
import IconButton from '@material-ui/core/IconButton'
import LaunchRoundedIcon from '@material-ui/icons/LaunchRounded'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import moment from 'moment'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import UserAvatar from './MicroComponents/UserAvatar'
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useActionTracker } from '../hooksUtils'

const ChangePasswordDialog = props => {
  const { open, handleClose, handleSubmit, loading } = props

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('')
  const [newPasswordError, setNewPasswordError] = useState('')

  useEffect(() => {
    if (!open) {
      setCurrentPassword('')
      setNewPassword('')
      setNewPasswordConfirm('')
    }
  })

  const handleChange = action => event => {
    if (action === 'currentPassword') {
      setCurrentPassword(event.target.value)
    } else if (action === 'newPassword') {
      setNewPassword(event.target.value)
    } else if (action === 'newPasswordConfirm') {
      setNewPasswordConfirm(event.target.value)
    }
    setNewPasswordError('')
  }

  const preSubmitCheck = (currentP, newP, newPC) => {
    if (newP !== newPC) {
      return setNewPasswordError('New password must match')
    }
    handleSubmit(currentP, newP)
  }

  return (
    <Dialog open={open} onClose={handleClose} aria-labelledby='form-dialog-title'>
      <DialogTitle id='form-dialog-title'>
        <Box display='flex' justifyContent='space-between' alignItems='flex-end'>
          <Typography variant='h3'>Change Password</Typography>
          <IconButton onClick={handleClose} disabled={loading}>
            <CloseIcon fontSize='small' color='secondary' />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box mb={3}>
          <Typography variant='h6'>Password description goes here</Typography>
        </Box>
        <form noValidate>
          <TextField
            id='currentPassword'
            variant='outlined'
            fullWidth
            margin='normal'
            value={currentPassword}
            onChange={handleChange('currentPassword')}
            placeholder='Current Password'
            label='Current Password'
            type='password'
            disabled={loading}
          />
          <TextField
            id='newPassword'
            variant='outlined'
            fullWidth
            margin='normal'
            value={newPassword}
            onChange={handleChange('newPassword')}
            placeholder='New Password'
            label='New Password'
            error={!!newPasswordError}
            helperText={newPasswordError}
            type='password'
            disabled={loading}
          />
          <TextField
            id='newPasswordConfirm'
            variant='outlined'
            fullWidth
            margin='normal'
            value={newPasswordConfirm}
            onChange={handleChange('newPasswordConfirm')}
            placeholder='Confirm New Password'
            label='Confirm New Password'
            error={!!newPasswordError}
            helperText={newPasswordError}
            type='password'
            disabled={loading}
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Box mr={2}>
          <Button
            onClick={handleClose}
            variant='outlined'
            color='secondary'
            id='cancel'
            disabled={loading}
          >
            Cancel
          </Button>
        </Box>
        <Button
          variant='contained'
          onClick={() => {
            preSubmitCheck(currentPassword, newPassword, newPasswordConfirm)
          }}
          color='primary'
          id='add'
          disabled={loading || !newPasswordConfirm || !currentPassword || !newPassword}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const SettingTabs = props => {
  const { currentTab, handleChange } = props
  return (
    <Tabs value={currentTab} onChange={handleChange} indicatorColor='primary' textColor='primary'>
      <Tab label='Account Info' />
      <Tab label='Security' />
      <Tab label='Backup' />
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
  const { profile, registerTime } = props
  if (!profile) return null
  const { profileObj } = profile
  const classes = accountInfoStyle(props)
  let date
  if (registerTime) date = moment.unix(registerTime).format('MMMM Do YYYY')
  return (
    <Box display='flex' flexDirection='column'>
      <Box display='flex' alignItems='center'>
        <UserAvatar
          style={{ width: 64, height: 64 }}
          src={profileObj.imageUrl}
          name={profileObj.name}
        />
        <Box ml={2} display='flex' flexDirection='column'>
          <Typography variant='h3'>{profileObj.name}</Typography>
          <Typography variant='h6'>{profileObj.email}</Typography>
        </Box>
      </Box>
      <Box display='flex' alignItems='center' mt={3}>
        <img src={GoogleIcon} style={{ width: 18, marginRight: 10 }} alt='googleIcon' />
        <Typography variant='h6'>Connected with Google account</Typography>
      </Box>
      <Box display='flex' alignItems='center' mt={2}>
        <CalendarTodayIcon className={classes.icon} />
        <Typography variant='h6'>Joined on {date}</Typography>
      </Box>
    </Box>
  )
}

const securityStyle = makeStyles({
  icon: {
    width: 20,
    marginRight: 10
  },
  lightbtn: {
    backgroundColor: 'rgba(57, 51, 134, 0.05)'
  }
})

const Security = props => {
  const { changeChainsfrWalletPassword } = props
  const [openChangePasswordDialog, setOpenChangePasswordDialog] = useState(false)

  const toggleDialog = currentValue => {
    setOpenChangePasswordDialog(!currentValue)
  }

  const { actionsPending, actionsFulfilled, errors } = useActionTracker(
    ['changeChainsfrWalletPassword'],
    [['CHANGE_CHAINSFR_WALLET_PASSWORD']]
  )

  const loading = actionsPending.changeChainsfrWalletPassword
  const error = errors.changeChainsfrWalletPassword

  useEffect(() => {
    if (actionsFulfilled['changeChainsfrWalletPassword']) {
      // close dialog
      toggleDialog(openChangePasswordDialog)
    }
  })

  const classes = securityStyle()
  return (
    <>
      <Box maxWidth={640} display='flex' flexDirection='column'>
        <Box mb={1}>
          <Typography variant='h3'>Chainsfr Wallet Password</Typography>
        </Box>
        <Box mb={2}>
          <Typography variant='h6'>
            The Security Password is set to encrypt the Wallet and transfer data in your Google
            drive. It CANNOT be recovered once it is lost. Make sure to keep it safe
          </Typography>
        </Box>
        <Box mb={3}>
          <Button
            variant='contained'
            color='primary'
            onClick={() => {
              toggleDialog(openChangePasswordDialog)
            }}
          >
            Change Password
          </Button>
        </Box>
        <Divider />
        <Box mb={1} mt={3}>
          <Typography variant='h3'>Two-Factor Authentication</Typography>
        </Box>
        <Box mb={2}>
          <Typography variant='h6'>2FA description goes here...</Typography>
          <Typography variant='h6'>
            To learn more, please check the related topics our help center.
          </Typography>
        </Box>
        <Box>
          <Button
            target='_blank'
            className={classes.lightbtn}
            color='primary'
            href='https://support.google.com/accounts/answer/185839'
          >
            <LaunchRoundedIcon className={classes.icon} />
            Google Two-Factor Authentication
          </Button>
        </Box>
      </Box>
      <ChangePasswordDialog
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
      />
    </>
  )
}

const backUpStyle = makeStyles({
  greenBox: {
    backgroundColor: 'rgba(67, 179, 132, 0.1)'
  },
  greenIcon: {
    width: 20,
    color: '#43B384',
    marginRight: 10
  },
  lightbtn: {
    backgroundColor: 'rgba(57, 51, 134, 0.05)'
  }
})

const Backup = props => {
  const { cloudWalletFolderMeta } = props
  const classes = backUpStyle()
  let fileId, lastModified
  if (cloudWalletFolderMeta) {
    fileId = cloudWalletFolderMeta.fileId
    lastModified = moment.unix(cloudWalletFolderMeta.lastModified).format('MMM Do YYYY, HH:mm:ss')
  }
  return (
    <Box maxWidth={640} display='flex' flexDirection='column'>
      <Box mb={2}>
        <Typography variant='h3'>Google Drive Backup</Typography>
      </Box>
      <Box
        mb={2}
        className={classes.greenBox}
        padding={2}
        display='flex'
        alignItems='center'
        maxWidth={480}
      >
        {lastModified ? (
          <>
            <CheckCircleIcon className={classes.greenIcon} />
            <Typography variant='body2'>Your account was backed up on {lastModified}</Typography>
          </>
        ) : (
          <CircularProgress className={classes.greenIcon} />
        )}
      </Box>
      <Box mb={3} maxWidth={480}>
        <Typography variant='h6'>
          All wallet data is automatically encrypted and backuped in you personal Google drive
          folder. To learn more, please check the related topics our help center
        </Typography>
      </Box>
      <Box>
        <Button
          color='primary'
          className={classes.lightbtn}
          target='_blank'
          href={`https://drive.google.com/drive/folders/${fileId}`}
          disabled={!fileId}
        >
          <img src={GoogleDrive} style={{ width: 22, marginRight: 10 }} alt='driveIcon' />
          Go to Backup Folder
        </Button>
      </Box>
    </Box>
  )
}

const UserSettingComponent = props => {
  const [currentTab, setCurrentTab] = useState(2)
  const tabContents = [<AccountInfo {...props} />, <Security {...props} />, <Backup {...props} />]

  const theme = useTheme()
  const large = useMediaQuery(theme.breakpoints.up('sm'))

  useEffect(() => {
    props.getUserCloudWalletFolderMeta()
    props.getUserRegisterTime()
  }, [])

  return (
    <Box display='flex' flexDirection='column' padding={large ? 6 : 3}>
      <Box borderBottom='1px solid #E9E9E9' width='100%'>
        <SettingTabs
          currentTab={currentTab}
          handleChange={(event, newValue) => {
            setCurrentTab(newValue)
          }}
        />
      </Box>
      <Box pt={3}>{tabContents[currentTab]}</Box>
    </Box>
  )
}

export default UserSettingComponent
