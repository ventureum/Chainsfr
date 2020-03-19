// @flow
import React from 'react'
import AccountBalanceIcon from '@material-ui/icons/AccountBalance'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import ChainsfrLogo from '../images/chainsfr_logo_white.svg'
import clsx from 'clsx'
import ContactsIcon from '@material-ui/icons/Contacts'
import Drawer from '@material-ui/core/Drawer'
import FormatListBulletedIcon from '@material-ui/icons/FormatListBulleted'
import GitHubIcon from '@material-ui/icons/GitHub'
import { Link } from 'react-router-dom'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import { ProfileButton } from './AppBarComponent'
import path from '../Paths.js'
import Typography from '@material-ui/core/Typography'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import { useTheme, makeStyles } from '@material-ui/core/styles'
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
    name: 'Contacts',
    path: path.contacts,
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
    fontSize: '12px',
    color: '#ffffff'
  },
  homeButton: {
    '&:hover': {
      backgroundColor: 'transparent'
    }
  },
  link: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '12px',
    fontFamily: 'Lato',
    marginRight: 5,
    marginLeft: 5
  }
}))

type Props = {
  open: boolean,
  profile: Object,
  location: Object,
  handleDrawerToggle: Function,
  onLogout: Function,
  onSetting: Function,
  backToHome: Function
}

const NavDrawerComponent = (props: Props) => {
  const theme = useTheme()
  const match = useMediaQuery(theme.breakpoints.up('sm'))

  const { backToHome, profile, onLogout, onSetting, location, open, handleDrawerToggle } = props
  const classes = useStyles()

  return (
    <Box className={match ? classes.drawer : undefined}>
      <Drawer
        variant={match ? 'permanent' : 'temporary'}
        open={open || match}
        classes={{
          paper: classes.drawer
        }}
        onClose={handleDrawerToggle}
      >
        <Box
          height={1}
          display='flex'
          className={classes.desktopDrawerContainer}
          flexDirection='column'
          alignItems='stretch'
        >
          <Box
            height='60px'
            padding='0px 20px 0px 0px'
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
              <img className={classes.chainsfrLogo} src={ChainsfrLogo} alt='Chainsfr Logo' />
            </Button>
            {match && <ProfileButton profile={profile} onLogout={onLogout} onSetting={onSetting} />}
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
                  onClick={() => {
                    handleDrawerToggle()
                  }}
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
          <Box display='flex' flexDirection='column' alignItems='center'>
            <Typography className={classes.copyright}>
              &copy; {'2018 - '}
              {new Date().getFullYear()} Ventureum Inc.
            </Typography>
            <Box mt={1} mb={1} display='flex' alignItems='center'>
              <a
                target='_blank'
                rel='noopener noreferrer'
                href='https://help.chainsfr.com/en/'
                className={classes.link}
              >
                Help Center
              </a>
              <Box borderLeft='0.5px solid #ffffff' width='1px' height='14px' />
              <a
                target='_blank'
                rel='noopener noreferrer'
                href='https://help.chainsfr.com/en/articles/3303336'
                className={classes.link}
              >
                Terms
              </a>
            </Box>
            <Box display='flex' flexDirection='row' alignItems='center'>
              <GitHubIcon style={{ width: 12, color: '#ffffff', marginRight: 10 }} />
              <Typography className={classes.buildText}>
                Build {process.env.REACT_APP_VERSION}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Drawer>
    </Box>
  )
}

export default NavDrawerComponent
