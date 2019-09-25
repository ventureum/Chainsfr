import React from 'react'

import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import CancelReview from '../containers/CancelReviewContainer'
import CancelReceipt from '../containers/CancelReceiptContainer'
import queryString from 'query-string'

class CancelComponent extends React.Component {
  render () {
    const { classes, step, history } = this.props
    const value = queryString.parse(history.location.search)

    return (
      <Grid container direction='column'>
        <Grid item>
          {/* receipt page requires a different background color */}
          <Grid container direction='column' alignItems='center'>
            <Grid item className={classes.subComponent}>
              {step === 0 && <CancelReview transferId={value && value.id} />}
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
    maxWidth: '550px',
    margin: '50px 0px 50px 0px',
    padding: '30px'
  }
})

export default withStyles(styles)(CancelComponent)
