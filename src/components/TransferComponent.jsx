// @flow
import React from 'react'

import { withStyles } from '@material-ui/core/styles'
import Stepper from './Stepper'
import Grid from '@material-ui/core/Grid'
import TransferForm from '../containers/FormContainer'
import WalletAuthorization from '../containers/WalletAuthorizationContainer'
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
      <Grid container direction='column' alignItems='center'>
        <Grid item className={classes.sectionContainer}>
          <Grid container direction='column' alignItems='stretch'>
            <Grid item>
              <Stepper actionType='transfer' step={step} />
            </Grid>
            <Grid item>
              <Grid container direction='column' alignItems='center'>
                {step === 0 && (
                  <Grid item className={classes.formContainer}>
                    <TransferForm
                      walletSelectionPrefilled={urlParams && urlParams.walletSelection}
                      addressPrefilled={urlParams && urlParams.address}
                      cryptoTypePrefilled={urlParams && urlParams.cryptoType}
                      destinationPrefilled={urlParams && (urlParams.destination || '')}
                      receiverNamePrefilled={urlParams && (urlParams.receiverName || '')}
                      form='email_transfer'
                    />
                  </Grid>
                )}
                {step === 1 && (
                  <Grid item className={classes.subContainer}>
                    <Review />
                  </Grid>
                )}

                {step === 2 && (
                  <Grid item className={classes.walletAuthorizationContainer}>
                    <WalletAuthorization />
                  </Grid>
                )}
                {step === 3 && (
                  <Grid item className={classes.subContainer}>
                    <Receipt />
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
  walletAuthorizationContainer: {
    width: '100%',
    maxWidth: '750px',
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
