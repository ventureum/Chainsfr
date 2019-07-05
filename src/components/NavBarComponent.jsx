import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import AccountCircle from '@material-ui/icons/AccountCircle'
import Button from '@material-ui/core/Button'
import { Link } from 'react-router-dom'
import path from '../Paths.js'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import IconButton from '@material-ui/core/IconButton'
import Grid from '@material-ui/core/Grid'
import Avatar from '@material-ui/core/Avatar'
import { uiColors } from '../styles/color'
import ChainsfrLogo from '../images/chainsfr_logo.svg'

class NavBarComponent extends Component {
  state = {
    anchorEl: null
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

  render () {
    const { classes, backToHome, profile } = this.props
    const { anchorEl } = this.state

    return (
      <AppBar position='static' color='primary' className={classes.appBar}>
        <Toolbar>
          <Grid container justify='center' alignItems='center'>
            <Grid item className={classes.sectionContainer}>
              <Grid
                container
                direction='row'
                justify='space-between'
                alignItems='center'
              >
                <Grid item>
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
                </Grid>
                {profile.isAuthenticated && (
                  <Grid item>
                    <IconButton
                      buttonRef={node => {
                        this.anchorEl = node
                      }}
                      aria-owns={anchorEl ? 'simple-menu' : undefined}
                      aria-haspopup='true'
                      onClick={this.handleToggle}
                      id='avatarBtn'
                    >
                      {profile &&
                        profile.profileObj &&
                        profile.profileObj.imageUrl
                        ? <Avatar
                          alt=''
                          src={profile.profileObj.imageUrl}
                          className={classes.avatar}
                        />
                        : <AccountCircle className={classes.userIcon} id='accountCircle' />
                      }
                    </IconButton>
                    <Menu
                      id='simple-menu'
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={this.handleClose()}
                    >
                      <MenuItem disabled > {profile.profileObj.email} </MenuItem>
                      <MenuItem onClick={this.handleClose('logout')} id='logout'>
                        Logout
                      </MenuItem>
                    </Menu>
                  </Grid>
                )}
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
    borderColor: uiColors.border
  },
  chainsfrLogo: {
    width: 120
  },
  sectionContainer: {
    width: '100%',
    maxWidth: '1200px'
  }
})

export default withStyles(styles)(NavBarComponent)
