// @flow
import React from 'react'
import AccountCircle from '@material-ui/icons/AccountCircle'
import AccountBalanceIcon from '@material-ui/icons/AccountBalance'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import ChainsfrLogo from '../images/chainsfr_logo_white.svg'
import clsx from 'clsx'
import ContactsIcon from '@material-ui/icons/Contacts'
import Divider from '@material-ui/core/Divider'
import Drawer from '@material-ui/core/Drawer'
import ExitIcon from '@material-ui/icons/ExitToApp'
import FormatListBulletedIcon from '@material-ui/icons/FormatListBulleted'
import GitHubIcon from '@material-ui/icons/GitHub'
import { Link } from 'react-router-dom'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import path from '../Paths.js'
import Typography from '@material-ui/core/Typography'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import { useTheme, makeStyles } from '@material-ui/core/styles'
import UserAvatar from './MicroComponents/UserAvatar'
import WalletIcon from '../images/logo-white-square.svg'

const NAV_BTNS = [
  {
    name: 'Overview',
    path: path.home,
    icon: <FormatListBulletedIcon />
  },
  {
    name: 'Accounts',
    path: path.accounts,
    icon: <AccountBalanceIcon />
  },
  {
    name: 'Recipients',
    path: path.recipients,
    icon: <ContactsIcon />
  },
  {
    name: 'Wallet',
    path: path.wallet,
    icon: <img src={WalletIcon} width='100%' alt='wallet_icon'></img>
  }
]

const useStyles = makeStyles(theme => ({
  drawer: {
    width: 240
  },
  desktopDrawerContainer: {
    backgroundColor: '#45407E'
  },
  chainsfrLogo: {
    width: 110
  },
  listItem: {
    padding: '0px 0px 0px 25px',
    color: '#ffffff',
    height: 57
  },
  listItemSelected: {
    backgroundColor: '#396EC8'
  },
  listItemText: {
    fontWeight: '600',
    fontSize: '14px'
  },
  listItemIcon: {
    width: 22,
    height: 22,
    minWidth: 22,
    paddingRight: 10
  },
  baseListColor: {
    color: '#ffffff'
  },
  copyright: {
    fontSize: '12px',
    fontWeight: '600',
    lineHeight: '14px',
    color: '#ffffff',
    marginTop: '5px'
  },
  buildText: {
    fontSize: '10px',
    color: '#ffffff'
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
  onLogout: Function,
  backToHome: Function
}

const MobileDrawer = (props: Props) => {
  const { open, profile, location, handleDrawerToggle, onLogout } = props
  const classes = useStyles()
  return (
    <Drawer
      variant='temporary'
      anchor='left'
      open={open}
      classes={{
        paper: classes.drawer
      }}
      onClose={handleDrawerToggle}
      ModalProps={{
        keepMounted: true // Better open performance on mobile.
      }}
    >
      <Box height={1} display='flex'>
        <List style={{ display: 'flex', flexGrow: 1, flexDirection: 'column' }}>
          {profile && profile.profileObj && profile.profileObj.imageUrl ? (
            <>
              <ListItem alignItems='center'>
                <UserAvatar
                  src={profile.profileObj.imageUrl}
                  style={{ marginLeft: 'auto', marginRight: 'auto', width: 32 }}
                />
              </ListItem>
              <ListItem alignItems='center'>
                <Typography variant='body2' align='center' style={{ width: '100%' }}>
                  {profile.profileObj.name}
                </Typography>
              </ListItem>
              <ListItem alignItems='center'>
                <Typography variant='body2' align='center' style={{ width: '100%' }}>
                  {profile.profileObj.email}
                </Typography>
              </ListItem>{' '}
            </>
          ) : (
            <ListItem alignItems='center'>
              <AccountCircle className={classes.userIcon} id='accountCircle' />
            </ListItem>
          )}
          <Divider variant='middle' />
          {NAV_BTNS.map((btn, i) => (
            <ListItem key={`${btn.name}_i_mobile`}>
              <Box
                width='95%'
                borderRadius='4px'
                className={
                  location.pathname === btn.path ? classes.NaviBtnListItemMobileActive : undefined
                }
              >
                <Button
                  className={
                    location.pathname === btn.path ? classes.NaviBtnMobileActive : classes.NaviBtn
                  }
                  component={Link}
                  to={btn.path}
                >
                  {btn.name}
                </Button>
              </Box>
            </ListItem>
          ))}
          <ListItem style={{ marginTop: 'auto' }}>
            <Button
              onClick={() => {
                onLogout()
              }}
              id='logout'
              className={classes.logoutBtn}
            >
              <ExitIcon className={classes.logoutIcon} id='exitIcon' />
              <Typography>Logout</Typography>
            </Button>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  )
}

const DesktopDrawer = props => {
  const { location, backToHome } = props
  const classes = useStyles()
  return (
    <Drawer
      variant='permanent'
      open
      classes={{
        paper: classes.drawer
      }}
    >
      <Box
        height={1}
        display='flex'
        className={classes.desktopDrawerContainer}
        flexDirection='column'
        alignItems='stretch'
      >
        <Box height='60px' padding='20px 0px 0px 0px'>
          <Button
            classes={{ root: classes.homeButton }}
            component={Link}
            to={path.home}
            onClick={() => {
              backToHome()
            }}
            id='back'
          >
            <img className={classes.chainsfrLogo} src={ChainsfrLogo} alt='Chainsfr Logo' />
          </Button>
        </Box>
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
              >
                <ListItemIcon className={clsx(classes.baseListColor, classes.listItemIcon)}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.name}
                  primaryTypographyProps={{
                    className: clsx(classes.baseListColor, classes.listItemText)
                  }}
                />
              </ListItem>
            )
          })}
        </List>
        <Box height='60px' display='flex' flexDirection='column' alignItems='center'>
          <Typography className={classes.copyright}>
            &copy; {'2018 - '}
            {new Date().getFullYear()} Ventureum Inc.
          </Typography>
          <Box display='flex' flexDirection='row' alignItems='center'>
            <GitHubIcon style={{ width: 12, color: '#ffffff', marginRight: 10 }} />
            <Typography className={classes.buildText}>
              Build {process.env.REACT_APP_VERSION}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Drawer>
  )
}

const NavDrawerComponent = (props: Props) => {
  const theme = useTheme()
  const classes = useStyles()
  const match = useMediaQuery(theme.breakpoints.up('sm'))

  return match ? (
    <Box className={classes.drawer}>
      <DesktopDrawer {...props} />
    </Box>
  ) : (
    <MobileDrawer {...props} />
  )
}

export default NavDrawerComponent
