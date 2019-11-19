import React from 'react'

import { withStyles } from '@material-ui/core/styles'
import Stepper from './Stepper'
import Grid from '@material-ui/core/Grid'
import ReceiveForm from '../containers/ReceiveFormContainer'
import ReceiveReview from '../containers/ReceiveReviewContainer'
import ReceiveReceipt from '../containers/ReceiveReceiptContainer'
import ReceiveLandingPage from '../containers/ReceiveLandingPageContainer'

class ReceiveComponent extends React.Component {
  render () {
    const { classes, step, history } = this.props

    return (
      <Grid container direction='column' alignItems='center'>
        <Grid item className={classes.sectionContainer}>
          {step === 0 ? (
            <ReceiveLandingPage location={history.location} />
          ) : (
            <Grid container direction='column'>
              <Grid item>
                <Stepper actionType='receive' step={step - 1} />
              </Grid>
              <Grid item>
                {/* receipt page requires a different background color */}
                <Grid container direction='column' alignItems='center'>
                  <Grid item className={classes.subComponent}>
                    {step === 1 && <ReceiveForm />}
                    {step === 2 && <ReceiveReview />}
                    {step === 3 && <ReceiveReceipt />}
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          )}
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
