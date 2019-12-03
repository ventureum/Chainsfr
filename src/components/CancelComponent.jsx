import React from 'react'

import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import CancelReview from '../containers/CancelReviewContainer'
import queryString from 'query-string'
import { Redirect } from 'react-router'
import paths from '../Paths'

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
              {step === 1 && <Redirect push to={paths.receipt} />}
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
