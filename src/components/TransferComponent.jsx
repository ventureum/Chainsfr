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
          <Grid container direction='column' alignItems='stretch'>
            <Grid item>{step <= 2 && <Stepper actionType='transfer' step={step} />}</Grid>
            <Grid item>
              {/* receipt page requires a different background color */}
              <Grid container direction='column' alignItems='center'>
                {step === 0 && (
                  <Grid item className={classes.walletSelectionContainer}>
                    <WalletSelection
                      walletSelectionPrefilled={urlParams && urlParams.walletSelection}
                      cryptoSelectionPrefilled={urlParams && urlParams.cryptoSelection}
                    />
                  </Grid>
                )}
                {step === 1 ? (
                  <Grid item className={classes.formContainer}>
                    <TransferForm
                      destinationPrefilled={urlParams && (urlParams.destination || '')}
                    />
                  </Grid>
                ) : (
                  <Grid item className={classes.subContainer}>
                    {step === 2 && <Review />}
                    {step === 3 && <Receipt />}
                  </Grid>
                )}
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
  formContainer: {
    width: '100%',
    maxWidth: '680px',
    margin: '0px 0px 16px 0px',
    padding: '30px'
  },
  subContainer: {
    width: '100%',
    maxWidth: '550px',
    margin: '0px 0px 16px 0px',
    padding: '30px'
  },
  walletSelectionContainer: {
    width: '100%',
    maxWidth: '1080px',
    margin: '0px 0px 16px 0px'
  },
  sectionContainer: {
    width: '100%',
    maxWidth: '1080px'
  }
})

export default withStyles(styles)(TransferComponent)
