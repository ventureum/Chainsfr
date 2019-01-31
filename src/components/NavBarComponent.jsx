import React, { Component } from 'react'

import { withStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import AccountCircle from '@material-ui/icons/AccountCircle'
import Typography from '@material-ui/core/Typography'

class NavBarComponent extends Component {
  render () {
    const { classes } = this.props
    return (
      <AppBar position='static'>
        <Toolbar>
          <Typography variant='h6' color='inherit' className={classes.grow}>
            Chainsfer
          </Typography>
          <AccountCircle />
        </Toolbar>
      </AppBar>
    )
  }
}

const styles = theme => ({
  grow: {
    flexGrow: 1
  }
})

export default withStyles(styles)(NavBarComponent)
