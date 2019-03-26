import React, { Component } from 'react'

import { withStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import AccountCircle from '@material-ui/icons/AccountCircle'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import { Link } from 'react-router-dom'
import path from '../Paths.js'
import Grow from '@material-ui/core/Grow'
import Paper from '@material-ui/core/Paper'
import Popper from '@material-ui/core/Popper'
import MenuItem from '@material-ui/core/MenuItem'
import MenuList from '@material-ui/core/MenuList'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import IconButton from '@material-ui/core/IconButton'
import Grid from '@material-ui/core/Grid'
import Avatar from '@material-ui/core/Avatar'

class NavBarComponent extends Component {
  state = {
    open: false
  }

  handleToggle = () => {
    const { profile } = this.props
    this.setState(state => ({ open: profile.isAuthenticated && !state.open }))
  };

  handleClose = (event, action) => {
    if (this.anchorEl.contains(event.target)) {
      return
    }

    if (action === 'logout') {
      this.props.onLogout()
    }

    this.setState({ open: false })
  }

  render () {
    const { classes, backToHome, profile } = this.props
    const { open } = this.state
    return (
      <AppBar position='static'>
        <Toolbar>
          <Grid container direction='row' justify='space-between' alignItems='center'>
            <Grid item>
              <Button classes={{ root: classes.homeButton }} component={Link} to={path.home} onClick={() => { backToHome() }}>
                <Typography className={classes.appNameText} >
                  Chainsfer
                </Typography>
              </Button>
            </Grid>
            {profile.isAuthenticated &&
            <Grid item>
              <IconButton
                buttonRef={node => {
                  this.anchorEl = node
                }}
                aria-owns={open ? 'menu-list-grow' : undefined}
                aria-haspopup='true'
                onClick={this.handleToggle}
              >
                {profile && profile.profileObj && profile.profileObj.imageUrl
                  ? <Avatar alt='' src={profile.profileObj.imageUrl} className={classes.avatar} />
                  : <AccountCircle className={classes.userIcon} />
                }
              </IconButton>
              <Popper open={open} anchorEl={this.anchorEl} transition disablePortal>
                {({ TransitionProps, placement }) => (
                  <Grow
                    {...TransitionProps}
                    id='menu-list-grow'
                    style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
                  >
                    <Paper>
                      <ClickAwayListener onClickAway={this.handleClose}>
                        <MenuList>
                          <MenuItem onClick={(event) => { this.handleClose(event, 'logout') }}>Logout</MenuItem>
                        </MenuList>
                      </ClickAwayListener>
                    </Paper>
                  </Grow>
                )}
              </Popper>

            </Grid>}
          </Grid>
        </Toolbar>

      </AppBar>
    )
  }
}

const styles = theme => ({
  grow: {
    flexGrow: 1
  },
  appNameText: {
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: 600
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
    height: '32px'
  }
})

export default withStyles(styles)(NavBarComponent)
