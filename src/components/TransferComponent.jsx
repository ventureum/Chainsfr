import React from 'react'

import { withStyles } from '@material-ui/core/styles'
import Stepper from './Stepper'
import Grid from '@material-ui/core/Grid'

class TransferComponent extends React.Component {
  render () {
    const { classes, component: Component, location } = this.props
    console.log(this.props)
    return (
      <Grid container direction='column'>
        <Grid item>
          <Stepper step={location.pathname} />
        </Grid>
        <Grid item>
          <Grid container direction='column' alignItems='center' >
            <Grid item className={classes.subComponent}>
              {this.props.children}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    )
  }
}

const styles = theme => ({
  subComponent: {
    width: '100%',
    maxWidth: '680px',
    margin: '0px 0px 16px 0px'
  }
})

export default withStyles(styles)(TransferComponent)
