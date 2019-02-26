import React from 'react'

import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import CancelReceipt from '../containers/CancelReceiptContainer'
import CancelReview from '../containers/CancelReviewContainer'

class CancelComponent extends React.Component {
  render () {
    const { classes, step } = this.props
    return (
      <Grid
        container
        direction='column'>
        <Grid item>
          {/* receipt page requires a different background color */}
          <Grid
            container
            direction='column'
            alignItems='center'
          >
            <Grid item className={classes.subComponent}>
              {step === 0 && <CancelReview />}
              {step === 1 && <CancelReceipt />}
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

export default withStyles(styles)(CancelComponent)
