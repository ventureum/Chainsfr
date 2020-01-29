// @flow
import React from 'react'

import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import TransferForm from '../containers/FormContainer'
import WalletAuthorization from '../containers/WalletAuthorizationContainer'
import Review from '../containers/ReviewContainer'
import queryString from 'query-string'
import paths from '../Paths'
import { Redirect } from 'react-router'

type Props = {
  classes: Object,
  step: number,
  history: Object,
  transferForm: Object,
  online: boolean
}

class TransferComponent extends React.Component<Props> {
  render () {
    const { classes, history, transferForm, online } = this.props
    const urlParams = queryString.parse(history.location.search)
    let step = urlParams.step

    let renderStep

    if (!step || step === 0) {
      renderStep = (
        <Grid item className={classes.formContainer}>
          <TransferForm
            walletSelectionPrefilled={urlParams && urlParams.walletSelection}
            addressPrefilled={urlParams && urlParams.address}
            cryptoTypePrefilled={urlParams && urlParams.cryptoType}
            destinationPrefilled={urlParams && (urlParams.destination || '')}
            receiverNamePrefilled={urlParams && (urlParams.receiverName || '')}
            form='email_transfer'
            online={online}
          />
        </Grid>
      )
    } else if ((step === '1' || step === '2') && !transferForm.validated) {
      renderStep = <Redirect to={paths.transfer} />
    } else if (step === '1') {
      renderStep = (
        <Grid item className={classes.subContainer}>
          <Review online={online} />
        </Grid>
      )
    } else if (step === '2') {
      renderStep = (
        <Grid item className={classes.walletAuthorizationContainer}>
          <WalletAuthorization online={online} />
        </Grid>
      )
    } else if (step === '3') {
      renderStep = <Redirect push to={paths.receipt} />
    }
    return (
      <Grid container direction='column' alignItems='center'>
        <Grid item className={classes.sectionContainer}>
          <Grid container direction='column' alignItems='stretch'>
            <Grid item>
              <Grid container direction='column' alignItems='center'>
                {renderStep}
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
    maxWidth: '540px',
    marginTop: 30,
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
