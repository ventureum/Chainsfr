// @flow
import React from 'react'

import { withStyles } from '@material-ui/core/styles'
import Stepper from './Stepper'
import Grid from '@material-ui/core/Grid'
import WalletSelection from '../containers/WalletSelectionContainer'
import TransferForm from '../containers/TransferFormContainer'
import Review from '../containers/ReviewContainer'
import Receipt from '../containers/ReceiptContainer'
import queryString from 'query-string'

type Props = {
  classes: Object,
  step: number,
  history: Object
}

class TransferComponent extends React.Component<Props> {
  render () {
    const { classes, step, history } = this.props
    const urlParams = queryString.parse(history.location.search)
    return (
      <Grid
        container
        direction='column'
        alignItems='center'
        className={step === 3 ? classes.rootReceipt : undefined}
      >
        <Grid item className={classes.sectionContainer}>
          <Grid container direction='column'>
            <Grid item>{step <= 2 && <Stepper actionType='transfer' step={step} />}</Grid>
            <Grid item>
              {/* receipt page requires a different background color */}
              <Grid container direction='column' alignItems='center'>
                <Grid item className={classes.subComponent}>
                  {step === 0 && (
                    <WalletSelection
                      walletSelectionPrefilled={urlParams && urlParams.walletSelection}
                      cryptoSelectionPrefilled={urlParams && urlParams.cryptoSelection}
                    />
                  )}
                  {step === 1 && (
                    <TransferForm
                      destinationPrefilled={urlParams && (urlParams.destination || '')}
                    />
                  )}
                  {step === 2 && <Review />}
                  {step === 3 && <Receipt />}
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

export default withStyles(styles)(TransferComponent)
