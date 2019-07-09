import React from 'react'

import { withStyles } from '@material-ui/core/styles'
import Stepper from './Stepper'
import Grid from '@material-ui/core/Grid'
import ReceivePassword from '../containers/ReceivePasswordContainer'
import ReceiveWalletSelection from '../containers/ReceiveWalletSelectionContainer'
import ReceiveReview from '../containers/ReceiveReviewContainer'
import ReceiveReceipt from '../containers/ReceiveReceiptContainer'
import ReceiveLandingPage from '../containers/ReceiveLandingPageContainer'

class ReceiveComponent extends React.Component {
  render () {
    const { classes, step, history } = this.props

    return (
      <Grid
        container
        direction='column'
        alignItems='center'
        className={step === 4 ? classes.rootReceipt : undefined}>
        <Grid item className={classes.sectionContainer}>
          {step === 0
            ? <ReceiveLandingPage location={history.location} />
            : <Grid container direction='column'>
              <Grid item>
                {step <= 3 && step >= 1 && <Stepper actionType='receive' step={step - 1} />}
              </Grid>
              <Grid item>
                {/* receipt page requires a different background color */}
                <Grid
                  container
                  direction='column'
                  alignItems='center'
                  className={step === 4 ? classes.receiptContainer : undefined}
                >
                  <Grid item className={classes.subComponent}>
                    {step === 1 && <ReceivePassword />}
                    {step === 2 && <ReceiveWalletSelection />}
                    {step === 3 && <ReceiveReview />}
                    {step === 4 && <ReceiveReceipt />}
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          }
        </Grid>
      </Grid>
    )
  }
}

const styles = theme => ({
  rootReceipt: {
    minHeight: '100vh',
    backgroundColor: '#fafafa'
  },
  subComponent: {
    width: '100%',
    maxWidth: '680px',
    margin: '0px 0px 16px 0px'
  },
  sectionContainer: {
    width: '100%',
    maxWidth: '1200px'
  }
})

export default withStyles(styles)(ReceiveComponent)
