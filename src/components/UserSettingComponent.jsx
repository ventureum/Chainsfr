import React, { useState, useEffect } from 'react'
import Alert from '@material-ui/lab/Alert'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import CalendarTodayIcon from '@material-ui/icons/CalendarToday'
import CircularProgress from '@material-ui/core/CircularProgress'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
// import CloseIcon from '@material-ui/icons/Close'
// import Dialog from '@material-ui/core/Dialog'
// import DialogActions from '@material-ui/core/DialogActions'
// import DialogContent from '@material-ui/core/DialogContent'
// import DialogTitle from '@material-ui/core/DialogTitle'
// import Divider from '@material-ui/core/Divider'
import GoogleIcon from '../images/google-icon.svg'
import GoogleDrive from '../images/googleDrive.svg'
// import IconButton from '@material-ui/core/IconButton'
import LaunchRoundedIcon from '@material-ui/icons/LaunchRounded'
import { makeStyles, useTheme, withStyles } from '@material-ui/core/styles'
import moment from 'moment'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
// import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import UserAvatar from './MicroComponents/UserAvatar'
import useMediaQuery from '@material-ui/core/useMediaQuery'
// import { useActionTracker } from '../hooksUtils'

// const ChangePasswordDialog = props => {
//   const { open, handleClose, handleSubmit, loading } = props

//   const [currentPassword, setCurrentPassword] = useState('')
//   const [newPassword, setNewPassword] = useState('')
//   const [newPasswordConfirm, setNewPasswordConfirm] = useState('')
//   const [newPasswordError, setNewPasswordError] = useState('')

//   useEffect(() => {
//     if (!open) {
//       setCurrentPassword('')
//       setNewPassword('')
//       setNewPasswordConfirm('')
//     }
//   })

//   const handleChange = action => event => {
//     if (action === 'currentPassword') {
//       setCurrentPassword(event.target.value)
//     } else if (action === 'newPassword') {
//       setNewPassword(event.target.value)
//     } else if (action === 'newPasswordConfirm') {
//       setNewPasswordConfirm(event.target.value)
//     }
//     setNewPasswordError('')
//   }

//   const preSubmitCheck = (currentP, newP, newPC) => {
//     if (newP !== newPC) {
//       return setNewPasswordError('New password must match')
//     }
//     handleSubmit(currentP, newP)
//   }

//   return (
//     <Dialog open={open} onClose={handleClose} aria-labelledby='form-dialog-title'>
//       <DialogTitle id='form-dialog-title'>
//         <Box display='flex' justifyContent='space-between' alignItems='flex-end'>
//           <Typography variant='h3'>Change Password</Typography>
//           <IconButton onClick={handleClose} disabled={loading}>
//             <CloseIcon fontSize='small' color='secondary' />
//           </IconButton>
//         </Box>
//       </DialogTitle>
//       <DialogContent>
//         <Box mb={3}>
//           <Typography variant='h6'>Password description goes here</Typography>
//         </Box>
//         <form noValidate>
//           <TextField
//             id='currentPassword'
//             variant='outlined'
//             fullWidth
//             margin='normal'
//             value={currentPassword}
//             onChange={handleChange('currentPassword')}
//             placeholder='Current Password'
//             label='Current Password'
//             type='password'
//             disabled={loading}
//           />
//           <TextField
//             id='newPassword'
//             variant='outlined'
//             fullWidth
//             margin='normal'
//             value={newPassword}
//             onChange={handleChange('newPassword')}
//             placeholder='New Password'
//             label='New Password'
//             error={!!newPasswordError}
//             helperText={newPasswordError}
//             type='password'
//             disabled={loading}
//           />
//           <TextField
//             id='newPasswordConfirm'
//             variant='outlined'
//             fullWidth
//             margin='normal'
//             value={newPasswordConfirm}
//             onChange={handleChange('newPasswordConfirm')}
//             placeholder='Confirm New Password'
//             label='Confirm New Password'
//             error={!!newPasswordError}
//             helperText={newPasswordError}
//             type='password'
//             disabled={loading}
//           />
//         </form>
//       </DialogContent>
//       <DialogActions>
//         <Box mr={2}>
//           <Button
//             onClick={handleClose}
//             variant='outlined'
//             color='secondary'
//             id='cancel'
//             disabled={loading}
//           >
//             Cancel
//           </Button>
//         </Box>
//         <Button
//           variant='contained'
//           onClick={() => {
//             preSubmitCheck(currentPassword, newPassword, newPasswordConfirm)
//           }}
//           color='primary'
//           id='add'
//           disabled={loading || !newPasswordConfirm || !currentPassword || !newPassword}
//         >
//           Save
//         </Button>
//       </DialogActions>
//     </Dialog>
//   )
// }

const SettingTabs = props => {
  const { currentTab, handleChange } = props
  return (
    <Tabs value={currentTab} onChange={handleChange} indicatorColor='primary' textColor='primary'>
      <Tab label='Account Info' data-test-td='account_info' />
      <Tab label='Security' data-test-id='security' />
      <Tab label='Backup' data-test-id='backup' />
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
  // const { changeChainsfrWalletPassword } = props
  // const [openChangePasswordDialog, setOpenChangePasswordDialog] = useState(false)

  // const toggleDialog = currentValue => {
  //   setOpenChangePasswordDialog(!currentValue)
  // }

  // const { actionsPending, actionsFulfilled, errors } = useActionTracker(
  //   ['changeChainsfrWalletPassword'],
  //   [['CHANGE_CHAINSFR_WALLET_PASSWORD']]
  // )

  // const loading = actionsPending.changeChainsfrWalletPassword
  // const error = errors.changeChainsfrWalletPassword

  // useEffect(() => {
  //   if (actionsFulfilled['changeChainsfrWalletPassword']) {
  //     // close dialog
  //     toggleDialog(openChangePasswordDialog)
  //   }
  // })

  const classes = securityStyle()

  const TextButton = withStyles({
    root: {
      padding: 0
    }
  })(Button)

  return (
    <>
      <Box maxWidth={640} display='flex' flexDirection='column'>
        {/* <Box mb={1}>
          <Typography variant='h3'>Chainsfr Wallet Password</Typography>
        </Box>
        <Box mb={2}>
          <Typography variant='body1' color='textSecondary'>
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
        <Divider /> */}
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

const backUpStyle = makeStyles({
  greenBox: {
    backgroundColor: 'rgba(67, 179, 132, 0.1)'
  },
  greenIcon: {
    width: 20,
    color: '#43B384',
    marginRight: 10
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
      <Box mb={1}>
        <Typography variant='h3'>Google Drive Backup</Typography>
      </Box>
      <Box mb={2} maxWidth={480}>
        <Typography variant='body1' color='textSecondary'>
          All wallet data is automatically encrypted and backuped in you personal Google drive
          folder. To learn more, please check the related topics our help center
        </Typography>
      </Box>

      <Box mb={3} display='flex' alignItems='center' maxWidth={480}>
        {lastModified ? (
          <Alert icon={<CheckCircleIcon />} severity='success' data-test-id='backup_date'>
            Your account was backed up on {lastModified}
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
      </Box>
    </Box>
  )
}

const UserSettingComponent = props => {
  const [currentTab, setCurrentTab] = useState(0)
  const tabContents = [<AccountInfo {...props} />, <Security {...props} />, <Backup {...props} />]

  const theme = useTheme()
  const large = useMediaQuery(theme.breakpoints.up('sm'))

  useEffect(() => {
    props.getUserCloudWalletFolderMeta()
    props.getUserRegisterTime()
  }, [])

  return (
    <Box>
      <Box bgcolor='background.default' px={large ? 6 : 3} pt={6} pb={8}>
        <Typography variant='h2'>Account Settings</Typography>
      </Box>
      <Box display='flex' flexDirection='column' px={large ? 6 : 3} mt={-5}>
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
    </Box>
  )
}

export default UserSettingComponent
