// @flow
import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Box from '@material-ui/core/Box'
import CloseIcon from '@material-ui/icons/Close'
import Toolbar from '@material-ui/core/Toolbar'
import Button from '@material-ui/core/Button'
import { Link } from 'react-router-dom'
import path from '../Paths.js'
import Menu from '@material-ui/core/Menu'
import ExitIcon from '@material-ui/icons/ExitToApp'
import Typography from '@material-ui/core/Typography'
import UserAvatar from './MicroComponents/UserAvatar'
import Divider from '@material-ui/core/Divider'
import Hidden from '@material-ui/core/Hidden'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import ChainsfrLogoSvg from '../images/chainsfr_logo.svg'
import Stepper from './Stepper'
import SettingsIcon from '@material-ui/icons/Settings'

type Props = {
  disabled?: boolean,
  backToHome: Function,
  onLogout: Function,
  profile: Object,
  location: Object,
  isolate: boolean,
  step: number,
  handleDrawerToggle: Function,
  onSetting: Function
}

type ProfileButtonProps = {
  disabled?: boolean,
  onLogout?: Function,
  profile: Object,
  onSetting?: Function
}

const profileBtnStyle = makeStyles({
  avatar: {
    width: '32px',
    height: '32px',
    border: 'solid 1px #ffffff',
    borderColor: 'transparent'
  },
  iconButton: {
    padding: 0
  }
})

const ProfileButton = (props: ProfileButtonProps) => {
  const classes = profileBtnStyle()
  const { profile, disabled, onLogout, onSetting } = props
  const [anchorEl, setAnchorEl] = useState(null)

  if (!profile || !profile.profileObj) return null
  const { profileObj } = profile

  const handleClose = action => event => {
    if (action === 'logout') {
      onLogout && onLogout()
    } else if (action === 'setting') {
      onSetting && onSetting()
    }
    setAnchorEl(null)
  }

  return (
    <>
      <IconButton
        aria-owns={anchorEl ? 'simple-menu' : undefined}
        aria-haspopup='true'
        onClick={event => setAnchorEl(event.currentTarget)}
        id='avatarBtn'
        style={{ textTransform: 'none' }}
        disabled={disabled}
        className={classes.iconButton}
      >
        <UserAvatar
          src={profileObj.imageUrl}
          style={{
            width: '32px'
          }}
          name={profileObj.name}
        />
      </IconButton>
      <Menu
        id='simple-menu'
        anchorEl={anchorEl}
        getContentAnchorEl={null}
        open={Boolean(anchorEl)}
        onClose={handleClose()}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        <Box display='flex' flexDirection='column'>
          <Box padding={2} display='flex' flexDirection='row' alignItems='center'>
            <Box mr={1}>
              <UserAvatar
                src={profileObj.imageUrl}
                style={{
                  width: '32px'
                }}
                name={profileObj.name}
              />
            </Box>
            <Box display='flex' flexDirection='column'>
              <Typography variant='h4'>{profileObj.name}</Typography>
              <Typography variant='caption'>{profileObj.email}</Typography>
            </Box>
          </Box>
          <Divider />
          <Box display='flex' flexDirection='column'>
            <MenuItem
              onClick={handleClose('setting')}
              id='setting'
              component='button'
              className={classes.menuItem}
            >
              <SettingsIcon color='primary' className={classes.icon} />
              Setting
            </MenuItem>
            <MenuItem
              onClick={handleClose('logout')}
              id='logout'
              component='button'
              className={classes.menuItem}
            >
              <ExitIcon color='primary' className={classes.icon} />
              Logout
            </MenuItem>
          </Box>
        </Box>
      </Menu>
    </>
  )
}

const ChainsfrLogoStyle = makeStyles({
  chainsfrLogo: {
    width: 120
  }
})

type ChainsfrLogoProps = {
  disabled: ?boolean,
  onClick: Function
}

const ChainsfrLogo = (props: ChainsfrLogoProps) => {
  const { onClick, disabled } = props
  const classes = ChainsfrLogoStyle()
  return (
    <Button
      classes={{ root: classes.homeButton }}
      component={Link}
      to={path.home}
      onClick={() => {
        onClick()
      }}
      id='back'
      disabled={disabled}
    >
      <img className={classes.chainsfrLogo} src={ChainsfrLogoSvg} alt='Chainsfr Logo' />
    </Button>
  )
}

const IsolateAppBarContent = (props: Props) => {
  const { profile, disabled, backToHome, step, location } = props
  return (
    <Box
      display='flex'
      flexDirection='row'
      alignItems='center'
      justifyContent='space-between'
      width='100%'
    >
      <Box display='flex' flexDirection='row' alignItems='center' flex='1'>
        <ChainsfrLogo disabled onClick={() => {}} />
        {/* vertical divider does not work in our Material UI version */}
        <Box borderLeft='0.5px solid #A8A8A8' pr={2} height='24px' />
        <ProfileButton profile={profile} disabled />
      </Box>
      <Hidden only={['xs', 'sm']}>
        <Box flex='2'>
          {location.pathname === path.transfer && <Stepper actionType='transfer' step={step} />}
        </Box>
      </Hidden>
      <Box flex='1' display='flex' justifyContent='flex-end'>
        <IconButton
          onClick={() => {
            backToHome()
          }}
          component={Link}
          to={path.home}
          disabled={disabled}
        >
          <CloseIcon fontSize='small' color='secondary' />
        </IconButton>
      </Box>
    </Box>
  )
}

const NormalAppBarContent = (props: Props) => {
  const { handleDrawerToggle, profile, disabled, onLogout, onSetting, backToHome } = props
  return (
    <Box
      display='flex'
      flexDirection='row'
      alignItems='center'
      justifyContent='space-between'
      width='100%'
    >
      <IconButton
        color='secondary'
        aria-label='Open drawer'
        edge='start'
        onClick={handleDrawerToggle}
      >
        <MenuIcon />
      </IconButton>
      <ChainsfrLogo
        onClick={() => {
          backToHome()
        }}
        disabled={disabled}
      />
      <ProfileButton
        profile={profile}
        disabled={disabled}
        onLogout={onLogout}
        onSetting={onSetting}
      />
    </Box>
  )
}

const AppBarStyle = makeStyles({
  appBar: {
    backgroundColor: '#ffffff',
    boxShadow: `0px 2px 2px  rgba(51, 51, 51, 0.1)`
  },
  toolbar: {
    paddingLeft: '20px',
    paddingRight: '20px'
  }
})

const AppBarComponent = (props: Props) => {
  const classes = AppBarStyle()
  const { isolate } = props
  return (
    <AppBar position='static' color='primary' className={classes.appBar}>
      <Toolbar className={classes.toolbar}>
        {isolate ? <IsolateAppBarContent {...props} /> : <NormalAppBarContent {...props} />}
      </Toolbar>
    </AppBar>
  )
}

export default AppBarComponent
