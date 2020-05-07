// @flow
import React from 'react'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import clsx from 'clsx'
import Drawer from '@material-ui/core/Drawer'
import IconButton from '@material-ui/core/IconButton'
import { Link } from 'react-router-dom'
import MuiLink from '@material-ui/core/Link'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import path from '../Paths.js'
import Typography from '@material-ui/core/Typography'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import { useTheme, makeStyles } from '@material-ui/core/styles'
import UserAvatar from './MicroComponents/UserAvatar'
import env from '../typedEnv'

// Icon
import AccountIcon from '@material-ui/icons/CreditCardRounded'
import CloseIcon from '@material-ui/icons/CloseRounded'
import ContactsIcon from '@material-ui/icons/PeopleRounded'
import GitHubIcon from '@material-ui/icons/GitHub'
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRightRounded'
import PaymentsIcon from '@material-ui/icons/SwapHorizRounded'
import WalletIcon from '@material-ui/icons/AccountBalanceWalletRounded'

//Assets
import ChainsfrLogoSVG from '../images/logo_chainsfr_617_128.svg'
import ChainsfrLogoDemoSVG from '../images/logo_chainsfr_demo_852_128.svg'

const NAV_BTNS = [
  {
    name: 'Payments',
    id: 'overview',
    path: path.home,
    icon: <PaymentsIcon color='primary' />
  },
  {
    name: 'Wallet',
    id: 'wallet',
    path: path.wallet,
    icon: <WalletIcon color='primary' />
  },
  {
    name: 'Connections',
    id: 'connections',
    path: path.connections,
    icon: <AccountIcon color='primary' />
  },
  {
    name: 'Contacts',
    id: 'contacts',
    path: path.contacts,
    icon: <ContactsIcon color='primary' />
  }
]

const useStyles = makeStyles(theme => ({
  drawerPermanent: {
    width: 240
  },
  drawerTemporary: {
    width: '100%',
    height: '100%'
  },
  chainsfrLogo: {
    height: 24
  },
  listItem: {
    padding: '0px 0px 0px 25px',
    color: '#ffffff',
    height: 57
  },
  listItemSelected: {
    backgroundColor: '#DADAE7'
  },
  copyright: {
    fontSize: '12px',
    fontWeight: '600',
    lineHeight: '14px',
    color: '#ffffff',
    marginTop: '5px'
  },
  homeButton: {
    '&:hover': {
      backgroundColor: 'transparent'
    }
  }
}))

type Props = {
  open: boolean,
  profile: Object,
  location: Object,
  handleDrawerToggle: Function,
  onSetting: Function,
  backToHome: Function,
  isMainNet: boolean
}

const NavDrawerComponent = (props: Props) => {
  const theme = useTheme()
  const match = useMediaQuery(theme.breakpoints.up('sm'))

  const { isMainNet, backToHome, profile, onSetting, location, open, handleDrawerToggle } = props
  const classes = useStyles()

  if (!profile || !profile.profileObj) return null
  const { profileObj } = profile
  const gitDescribe = env.REACT_APP_VERSION.split('-')
  let versionPart = gitDescribe.slice(0, gitDescribe.length - 2)
  let version = versionPart[0]
  if (versionPart.length > 1) {
    for (let i = 1; i < versionPart.length; i++) {
      version = version + '-' + versionPart[i]
    }
  }
  const commit = gitDescribe[gitDescribe.length - 1]
  return (
    <Box className={match ? classes.drawerPermanent : undefined}>
      <Drawer
        variant={match ? 'permanent' : 'temporary'}
        open={open || match}
        anchor={match ? 'left' : 'top'}
        classes={{
          paper: match ? classes.drawerPermanent : classes.drawerTemporary
        }}
        onClose={handleDrawerToggle}
      >
        <Box height={1} display='flex' flexDirection='column' alignItems='stretch'>
          {match ? (
            <Box
              height='60px'
              mx={0.5}
              display='flex'
              alignItems='center'
              justifyContent='space-between'
            >
              <Button
                classes={{ root: classes.homeButton }}
                component={Link}
                to={path.home}
                onClick={() => {
                  backToHome()
                }}
                id='back'
              >
                <img
                  className={classes.chainsfrLogo}
                  src={isMainNet ? ChainsfrLogoSVG : ChainsfrLogoDemoSVG}
                  alt='Chainsfr Logo'
                />
              </Button>
            </Box>
          ) : (
            <Box display='flex' justifyContent='space-between' alignItems='center' ml={2} mt={1}>
              <img
                className={classes.chainsfrLogo}
                src={isMainNet ? ChainsfrLogoSVG : ChainsfrLogoDemoSVG}
                alt='Chainsfr Logo'
              />
              <IconButton
                color='secondary'
                aria-label='Close'
                edge='start'
                onClick={handleDrawerToggle}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          )}
          <List style={{ flex: 1 }}>
            {NAV_BTNS.map((item, i) => {
              const selected = location.pathname === item.path
              return (
                <ListItem
                  key={i}
                  button
                  className={
                    selected ? clsx(classes.listItem, classes.listItemSelected) : classes.listItem
                  }
                  component={Link}
                  to={item.path}
                  onClick={() => {
                    handleDrawerToggle()
                  }}
                  data-test-id={`${item.id}_nav_btn`}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.name} className='nav' />
                </ListItem>
              )
            })}
          </List>

          <Box mx={1} mb={2}>
            <Button
              fullWidth
              className='profile-button'
              onClick={() => {
                handleDrawerToggle()
                onSetting()
              }}
            >
              <Box display='flex' justifyContent='space-between' flexGrow='1' alignItems='center'>
                <Box display='flex' alignItems='center'>
                  <Box display='inline' ml={1}>
                    <UserAvatar
                      src={profileObj.imageUrl}
                      style={{
                        width: '32px'
                      }}
                      name={profileObj.name}
                    />
                  </Box>
                  <Box ml={1} display='inline'>
                    <Typography variant='h5' color='textPrimary' display='inline'>
                      {profileObj.name}
                    </Typography>
                  </Box>
                </Box>
                <KeyboardArrowRightIcon color='secondary' />
              </Box>
            </Button>
          </Box>
          <Box display='flex' flexDirection='column' alignItems='center' mb={match ? 2 : 3}>
            <Box mx={1} display='flex' alignItems='center'>
              <Box display='flex' alignItems='center'>
                <GitHubIcon style={{ width: 12, color: '#c4c4c4', marginRight: 4 }} />
                <Typography variant='caption'>
                  <Box color='text.disabled' display='inline' data-test-id='build_version'>
                    Build: {version}-{commit}
                  </Box>
                </Typography>
              </Box>
            </Box>
            <Typography variant='caption' color='textSecondary'>
              <Box color='text.disabled' display='inline' data-test-id='copy_right'>
                <MuiLink target='_blank' rel='noopener noreferrer' href={env.REACT_APP_TERMS_URL}>
                  <Box ml={0.5} color='text.disabled' display='inline'>
                    Terms
                  </Box>
                </MuiLink>
                <Box ml={0.5} color='text.disabled' display='inline'>
                  |
                </Box>
                <MuiLink target='_blank' rel='noopener noreferrer' href={env.REACT_APP_PRIVACY_URL}>
                  <Box ml={0.5} mr={0.5} color='text.disabled' display='inline'>
                    {'Privacy '}
                  </Box>
                </MuiLink>
                &copy;
                {new Date().getFullYear()}
                <MuiLink target='_blank' rel='noopener noreferrer' href='https://ventureum.io/'>
                  <Box ml={0.5} color='text.disabled' display='inline'>
                    Ventureum Inc.
                  </Box>
                </MuiLink>
              </Box>
            </Typography>
          </Box>
        </Box>
      </Drawer>
    </Box>
  )
}

export default NavDrawerComponent
