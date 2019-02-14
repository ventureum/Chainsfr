import React from 'react'

import { withStyles } from '@material-ui/core/styles'
import Stepper from './Stepper'
import Grid from '@material-ui/core/Grid'
import WalletSelection from '../containers/WalletSelectionContainer'
import Recipient from '../containers/RecipientContainer'
import Review from '../containers/ReviewContainer'
import Receipt from '../containers/ReceiptContainer'

class TransferComponent extends React.Component {
  render () {
    const { classes, step } = this.props
    return (
      <Grid
        container
        direction='column'
        className={step === 3 && classes.rootReceipt}>
        <Grid item>
          {step <= 2 && <Stepper actionType='transfer' step={step} />}
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
              {step === 0 && <WalletSelection />}
              {step === 1 && <Recipient />}
              {step === 2 && <Review />}
              {step === 3 && <Receipt />}
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

export default withStyles(styles)(TransferComponent)
