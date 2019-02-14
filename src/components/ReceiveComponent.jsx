import React from 'react'

import { withStyles } from '@material-ui/core/styles'
import Stepper from './Stepper'
import Grid from '@material-ui/core/Grid'
import ReceivePassword from '../containers/ReceivePasswordContainer'
import ReceiveWalletSelection from '../containers/ReceiveWalletSelectionContainer'

class ReceiveComponent extends React.Component {
  render () {
    const { classes, step } = this.props
    return (
      <Grid
        container
        direction='column'
        className={step === 3 && classes.rootReceipt}>
        <Grid item>
          {step <= 2 && <Stepper actionType='receive' step={step} />}
        </Grid>
        <Grid item>
          {/* receipt page requires a different background color */}
          <Grid
            container
            direction='column'
            alignItems='center'
            className={step === 3 && classes.receiptContainer}
          >
            <Grid item className={classes.subComponent}>
              {step === 0 && <ReceivePassword />}
              {step === 1 && <ReceiveWalletSelection />}
            </Grid>
          </Grid>
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
  }
})

export default withStyles(styles)(ReceiveComponent)
