import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import AccountCircle from '@material-ui/icons/AccountCircle'
import Button from '@material-ui/core/Button'
import { Link } from 'react-router-dom'
import path from '../Paths.js'
import Menu from '@material-ui/core/Menu'
import ExitIcon from '@material-ui/icons/ExitToApp'
import Container from '@material-ui/core/Container'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Avatar from '@material-ui/core/Avatar'
import Divider from '@material-ui/core/Divider'
import { uiColors, fontColors } from '../styles/color'
import Drawer from '@material-ui/core/Drawer'
import Hidden from '@material-ui/core/Hidden'
import IconButton from '@material-ui/core/IconButton'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import MenuIcon from '@material-ui/icons/Menu'
import Box from '@material-ui/core/Box'
import ChainsfrLogo from '../images/chainsfr_logo.svg'
import Stepper from './Stepper'

class NavBarComponent extends Component {
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
    }

    this.setState({ anchorEl: null })
  }

  handleDrawerToggle = () => {
    this.setState({ mobileOpen: !this.state.mobileOpen })
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
          {profile && profile.profileObj && profile.profileObj.imageUrl ? (
            <Avatar alt='' src={profile.profileObj.imageUrl} className={classes.avatar} />
          ) : (
            <AccountCircle className={classes.userIcon} id='accountCircle' />
          )}
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
          <Container className={classes.menuContainer}>
            {profile && profile.profileObj && profile.profileObj.imageUrl ? (
              <Avatar alt='' src={profile.profileObj.imageUrl} className={classes.avatar} />
            ) : (
              <AccountCircle className={classes.userIcon} id='accountCircle' />
            )}
            <Typography className={classes.menuItemUserName}>{profile.profileObj.name}</Typography>
            <Typography className={classes.menuItemEmail}>{profile.profileObj.email}</Typography>
            <Divider />
            <Button onClick={this.handleClose('logout')} id='logout' className={classes.logoutBtn}>
              <ExitIcon className={classes.logoutIcon} id='exitIcon' />
              <Typography>Logout</Typography>
            </Button>
          </Container>
        </Menu>
      </>
    )
  }

  renderDrawer = () => {
    const { classes, profile } = this.props
    return (
      <Box height={1} display='flex'>
        <List style={{ display: 'flex', flexGrow: 1, flexDirection: 'column' }}>
          <ListItem alignItems='center'>
            {profile && profile.profileObj && profile.profileObj.imageUrl ? (
              // add margin auto to center avatar horizontally
              <Avatar
                alt=''
                src={profile.profileObj.imageUrl}
                className={classes.avatar}
                style={{ marginLeft: 'auto', marginRight: 'auto' }}
              />
            ) : (
              <AccountCircle className={classes.userIcon} id='accountCircle' />
            )}
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
          </ListItem>
          <Divider variant='middle' />
          <ListItem>
            <Button
              className={classes.NaviBtn}
              component={Link}
              to={path.home}
              onClick={this.handleDrawerToggle}
            >
              Home
            </Button>
          </ListItem>
          <ListItem>
            <Button
              className={classes.NaviBtn}
              component={Link}
              to={path.recipients}
              onClick={this.handleDrawerToggle}
            >
              Recipients
            </Button>
          </ListItem>
          <ListItem>
            <Button
              className={classes.NaviBtn}
              component={Link}
              to={path.accounts}
              onClick={this.handleDrawerToggle}
            >
              Accounts
            </Button>
          </ListItem>
          <ListItem>
            <Button
              className={classes.NaviBtn}
              component={Link}
              to={path.wallet}
              onClick={this.handleDrawerToggle}
            >
              Chainsfr Wallet
            </Button>
          </ListItem>
          <ListItem style={{ marginTop: 'auto' }}>
            <Button onClick={this.handleClose('logout')} id='logout' className={classes.logoutBtn}>
              <ExitIcon className={classes.logoutIcon} id='exitIcon' />
              <Typography>Logout</Typography>
            </Button>
          </ListItem>
        </List>
      </Box>
    )
  }

  render () {
    const {
      classes,
      backToHome,
      profile,
      disabled,
      location,
      step,
      cloudWalletConnected
    } = this.props

    return (
      <>
        <Drawer
          variant='temporary'
          anchor={'left'}
          open={this.state.mobileOpen}
          onClose={this.handleDrawerToggle}
          classes={{
            paper: classes.drawerPaper
          }}
          ModalProps={{
            keepMounted: true // Better open performance on mobile.
          }}
        >
          {this.renderDrawer()}
        </Drawer>
        <AppBar position='static' color='primary' className={classes.appBar}>
          <Toolbar className={classes.toolbar}>
            <Grid container justify='center' alignItems='center'>
              <Grid item className={classes.sectionContainer}>
                <Grid container direction='row' justify='space-between' alignItems='center'>
                  <Grid item>
                    <Hidden only={['md', 'lg', 'xl']}>
                      <IconButton
                        color='secondary'
                        aria-label='Open drawer'
                        edge='start'
                        onClick={this.handleDrawerToggle}
                        disabled={disabled}
                        className={classes.drawerButton}
                      >
                        <MenuIcon />
                      </IconButton>
                    </Hidden>
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
                      <img
                        className={classes.chainsfrLogo}
                        src={ChainsfrLogo}
                        alt='Chainsfr Logo'
                      />
                    </Button>
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
                            {location.pathname === path.receive && (
                              <Stepper actionType='receive' step={step} />
                            )}
                          </Grid>
                          <Grid item xs={12} sm='auto'>
                            {this.renderProfileButton()}
                          </Grid>
                        </>
                      ) : (
                        <Grid item>
                          <Grid container alignItems='center'>
                            <Grid item xs={12} sm='auto'>
                              <Button className={classes.NaviBtn} component={Link} to={path.home}>
                                Home
                              </Button>
                            </Grid>
                            <Grid item xs={12} sm='auto'>
                              <Button
                                className={classes.NaviBtn}
                                component={Link}
                                to={path.recipients}
                              >
                                Recipients
                              </Button>
                            </Grid>
                            <Grid item xs={12} sm='auto'>
                              <Button
                                className={classes.NaviBtn}
                                component={Link}
                                to={path.accounts}
                              >
                                Accounts
                              </Button>
                            </Grid>
                            <Grid item xs={12} sm='auto'>
                              <Button className={classes.NaviBtn} component={Link} to={path.wallet}>
                                Chainsfr Wallet
                              </Button>
                            </Grid>
                            <Grid item xs={12} sm='auto'>
                              {this.renderProfileButton()}
                            </Grid>
                          </Grid>
                        </Grid>
                      ))}
                  </Hidden>
                </Grid>
              </Grid>
            </Grid>
          </Toolbar>
        </AppBar>
      </>
    )
  }
}

const styles = theme => ({
  drawerPaper: {
    width: '240px'
  },
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
    borderColor: uiColors.border,
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
  profileRoot: {
    display: 'flex',
    direction: 'row',
    alignItems: 'center'
  },
  NaviBtn: {
    fontWeight: '500',
    textTransform: 'none',
    fontSize: '14px'
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
  logoutBtn: {
    color: '#3a4b6c',
    margin: '10px'
  },
  logoutIcon: {
    color: '#3a4b6c',
    marginRight: '10px'
  }
})

export default withStyles(styles)(NavBarComponent)
