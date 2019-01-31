import React from 'react'

import { withStyles } from '@material-ui/core/styles'
import Stepper from './Stepper'

class TransferComponent extends React.Component {
  render () {
    const { classes, component: Component, location, ...rest } = this.props
    return (
      <div className={classes.root}>
        <Stepper step={location.pathname} />
        <Component {...rest} />
      </div>
    )
  }
}

const styles = theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column'
  }
})

export default withStyles(styles)(TransferComponent)
