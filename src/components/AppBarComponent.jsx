// @flow
import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Box from '@material-ui/core/Box'
import Toolbar from '@material-ui/core/Toolbar'
import Button from '@material-ui/core/Button'
import { Link } from 'react-router-dom'
import path from '../Paths.js'
import Menu from '@material-ui/core/Menu'
import ExitIcon from '@material-ui/icons/ExitToApp'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import UserAvatar from './MicroComponents/UserAvatar'
import Divider from '@material-ui/core/Divider'
import { fontColors } from '../styles/color'
import Hidden from '@material-ui/core/Hidden'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import ChainsfrLogo from '../images/chainsfr_logo.svg'
import Stepper from './Stepper'
import SettingsIcon from '@material-ui/icons/Settings'

type Props = {
  disabled: boolean,
  classes: Object,
  backToHome: Function,
  onLogout: Function,
  profile: Object,
  location: Object,
  step: string,
  cloudWalletConnected: boolean,
  handleDrawerToggle: Function,
  onSetting: Function,
  navigatable: boolean // used to show Chainsfr Icon but disable top app bar
}

type State = {
  mobileOpen: boolean,
  anchorEl: any
}
class AppBarComponent extends Component<Props, State> {
  state = {
    anchorEl: null,
    mobileOpen: false
  }

  handleToggle = event => {
    this.setState({ anchorEl: event.currentTarget })
  }

  handleClose = action => event => {
    if (action === 'logout') {
      this.props.onLogout()
    } else if (action === 'setting') {
      this.props.onSetting()
    }

    this.setState({ anchorEl: null })
  }

  handleDrawerToggle = () => {
    this.setState({ mobileOpen: !this.state.mobileOpen })
  }

  renderChainsfrLogo = () => {
    const { disabled, classes, backToHome } = this.props

    return (
      <Button
        classes={{ root: classes.homeButton }}
        component={Link}
        to={path.home}
        onClick={() => {
          backToHome()
        }}
        id='back'
        disabled={disabled}
      >
        <img className={classes.chainsfrLogo} src={ChainsfrLogo} alt='Chainsfr Logo' />
      </Button>
    )
  }

  renderProfileButton = () => {
    const { classes, profile, disabled } = this.props
    const { anchorEl } = this.state
    return (
      <>
        <Button
          aria-owns={anchorEl ? 'simple-menu' : undefined}
          aria-haspopup='true'
          onClick={this.handleToggle}
          id='avatarBtn'
          style={{ textTransform: 'none' }}
          disabled={disabled}
        >
          <Box mr={1}>
            <UserAvatar
              src={profile && profile.profileObj && profile.profileObj.imageUrl}
              style={{
                width: '32px'
              }}
              name={profile && profile.profileObj && profile.profileObj.name}
            />
          </Box>
          <Typography variant='body2'>{profile.profileObj.name}</Typography>
        </Button>
        <Menu
          id='simple-menu'
          anchorEl={anchorEl}
          getContentAnchorEl={null}
          open={Boolean(anchorEl)}
          onClose={this.handleClose()}
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
                  src={profile.profileObj.imageUrl}
                  style={{
                    width: '32px'
                  }}
                  name={profile.profileObj.name}
                />
              </Box>
              <Box display='flex' flexDirection='column'>
                <Typography variant='h4'>{profile.profileObj.name}</Typography>
                <Typography variant='caption'>{profile.profileObj.email}</Typography>
              </Box>
            </Box>
            <Divider />
            <Box display='flex' flexDirection='column'>
              <MenuItem
                onClick={this.handleClose('setting')}
                id='setting'
                component='button'
                className={classes.menuItem}
              >
                <SettingsIcon color='primary' className={classes.icon} />
                Setting
              </MenuItem>
              <MenuItem
                onClick={this.handleClose('logout')}
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

  render () {
    const {
      classes,
      profile,
      disabled,
      location,
      step,
      cloudWalletConnected,
      handleDrawerToggle,
      navigatable
    } = this.props

    return (
      <AppBar position='static' color='primary' className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <Grid container justify='center' alignItems='center'>
            <Grid item className={classes.sectionContainer}>
              <Grid container direction='row' justify='space-between' alignItems='center'>
                <Grid item>
                  {navigatable ? (
                    location.pathname === path.userSetting ? (
                      <Box ml={5}>
                        <Typography variant='h2'>Setting</Typography>
                      </Box>
                    ) : (
                      <Hidden only={['md', 'lg', 'xl']}>
                        <IconButton
                          color='secondary'
                          aria-label='Open drawer'
                          edge='start'
                          onClick={handleDrawerToggle}
                          disabled={disabled}
                          className={classes.drawerButton}
                        >
                          <MenuIcon />
                        </IconButton>
                        {this.renderChainsfrLogo()}
                      </Hidden>
                    )
                  ) : (
                    this.renderChainsfrLogo()
                  )}
                </Grid>
                <Hidden only={['xs', 'sm']}>
                  {profile.isAuthenticated &&
                    cloudWalletConnected &&
                    ([path.receive, path.transfer].includes(location.pathname) ? (
                      <>
                        <Grid item xs style={{ maxWidth: '480px' }}>
                          {location.pathname === path.transfer && (
                            <Stepper actionType='transfer' step={step} />
                          )}
                        </Grid>
                        <Grid item xs={12} sm='auto'>
                          {this.renderProfileButton()}
                        </Grid>
                      </>
                    ) : (
                      <Grid item xs={12} sm='auto'>
                        {this.renderProfileButton()}
                      </Grid>
                    ))}
                </Hidden>
              </Grid>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
    )
  }
}

const styles = theme => ({
  appBar: {
    backgroundColor: '#ffffff',
    boxShadow: `0px 2px 2px  rgba(51, 51, 51, 0.1)`
  },
  toolbar: {
    paddingLeft: '10px',
    paddingRight: '10px'
  },
  homeButton: {
    '&:hover': {
      backgroundColor: 'transparent'
    }
  },
  userIcon: {
    color: '#ffffff'
  },
  avatar: {
    width: '32px',
    height: '32px',
    border: 'solid 1px',
    borderColor: 'transparent',
    marginRight: '10px',
    marginLeft: '10px'
  },
  chainsfrLogo: {
    width: 120
  },
  sectionContainer: {
    width: '100%',
    maxWidth: '1200px'
  },
  menuItemUserName: {
    color: '#3a4b6c',
    margin: '10px 10px 5px 10px'
  },
  menuItemEmail: {
    color: fontColors.placeholder,
    margin: '0px 10px 20px 10px'
  },
  menuContainer: {
    padding: '15px 10px 0px 10px'
  },
  icon: {
    marginRight: '10px',
    marginLeft: '10px'
  },
  menuItem: {
    justifyContent: 'flex-start'
  }
})

export default withStyles(styles)(AppBarComponent)
