import React from 'react'

import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import ReceiveForm from '../containers/ReceiveFormContainer'
import ReceiveReview from '../containers/ReceiveReviewContainer'
import { Redirect } from 'react-router'
import paths from '../Paths'

class ReceiveComponent extends React.Component {
  render () {
    const { classes, step, history } = this.props

    return (
      <Grid container direction='column' alignItems='center'>
        <Grid item className={classes.sectionContainer}>
          <Grid container direction='column'>
            <Grid item>
              <Grid container direction='column' alignItems='center'>
                <Grid item className={classes.subComponent}>
                  {step === 0 && <ReceiveForm location={history.location} />}
                  {step === 1 && <ReceiveReview />}
                  {step === 2 && <Redirect push to={paths.receipt} />}
                </Grid>
              </Grid>
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
    margin: '0px 0px 16px 0px',
    padding: '30px'
  },
  sectionContainer: {
    width: '100%',
    maxWidth: '1200px'
  },
  walletSelectionContainer: {
    width: '100%',
    maxWidth: '1080px',
    margin: '0px 0px 16px 0px'
  }
})

export default withStyles(styles)(ReceiveComponent)
