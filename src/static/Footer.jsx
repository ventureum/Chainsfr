import React from 'react'
import { withStyles } from '@material-ui/core'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'

class FooterComponent extends React.Component {
  render () {
    const { classes } = this.props
    return (
      <footer className={classes.root}>
        <Grid container direction='column' alignItems='center' justify='center' className={classes.copyRightContainer}>
          <Grid item >
            <Typography className={classes.copyright}>
            &copy; {'2018 - '}{1900 + new Date().getYear()} All rights reserved.
            </Typography>
          </Grid>
          <Typography className={classes.copyright}>
            Build {process.env.REACT_APP_VERSION}-{process.env.REACT_APP_ENV}
          </Typography>
        </Grid>
      </footer>
    )
  }
}

const style = theme => ({
  root: {
    backgroundColor: '#333333',
    height: '60px'
  },
  copyright: {
    fontSize: '12px',
    letterSpacing: '0.2px',
    lineHeight: '18px',
    color: '#a8a8a8'
  },
  copyRightContainer: {
    height: '100%'
  }
})

export default withStyles(style)(FooterComponent)
