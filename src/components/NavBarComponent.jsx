import React, { Component } from 'react'

import { withStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import AccountCircle from '@material-ui/icons/AccountCircle'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import { Link } from 'react-router-dom'
import path from '../Paths.js'

class NavBarComponent extends Component {
  render () {
    const { classes } = this.props
    return (
      <AppBar position='static'>
        <Toolbar>
          <Button classes={{ root: classes.button }} component={Link} to={path.home} >
            <Typography variant='h6' color='inherit' className={classes.grow}>
              Chainsfer
            </Typography>
          </Button>
          <AccountCircle />
        </Toolbar>
      </AppBar>
    )
  }
}

const styles = theme => ({
  grow: {
    flexGrow: 1
  },
  button: {
    '&:hover': {
      backgroundColor: 'transparent'
    }
  }
})

export default withStyles(styles)(NavBarComponent)
