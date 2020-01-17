import React from 'react'

import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import ReceiveForm from '../containers/ReceiveFormContainer'
import ReceiveReview from '../containers/ReceiveReviewContainer'
import { Redirect } from 'react-router'
import paths from '../Paths'
import queryString from 'query-string'

class ReceiveComponent extends React.Component {
  componentDidMount () {
    let { location } = this.props.history
    const urlParams = queryString.parse(location.search)
    this.props.getTransfer(urlParams.id)
  }

  render () {
    const { classes, history, escrowAccount, transfer, accountSelection, receipt } = this.props
    const urlParams = queryString.parse(history.location.search)
    const id = urlParams.id
    let step = urlParams.step

    if (!id) {
      return <Redirect to={paths.home} />
    }
    let renderStep
    if (step === '0' || !step) {
      renderStep = <ReceiveForm id={id} />
    } else if (step === '1') {
      if (!escrowAccount || (!transfer && !receipt) || !accountSelection) {
        renderStep = <Redirect to={`${paths.receive}?id=${id}`} />
      } else {
        renderStep = <ReceiveReview id={id} />
      }
    } else if (step === '2') {
      renderStep = <Redirect push to={paths.receipt} />
    }
    return (
      <Grid container direction='column' alignItems='center'>
        <Grid item className={classes.sectionContainer}>
          <Grid container direction='column'>
            <Grid item>
              <Grid container direction='column' alignItems='center'>
                <Grid item className={classes.subComponent}>
                  {renderStep}
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
