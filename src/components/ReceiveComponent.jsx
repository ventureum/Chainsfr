import React from 'react'

import Box from '@material-ui/core/Box'
import ReceiveForm from '../containers/ReceiveFormContainer'
import ReceiveReview from '../containers/ReceiveReviewContainer'
import { Redirect } from 'react-router'
import paths from '../Paths'
import queryString from 'query-string'

class ReceiveComponent extends React.Component {
  componentDidMount () {
    let { location } = this.props.history
    // recover '&' from encoded '&amp;'
    // used for intercom product tour
    const urlParams = queryString.parse(location.search.replace(/amp%3B|amp;/g, ''))
    this.props.getTransfer(urlParams.id)
  }

  render () {
    const { history, escrowAccount, transfer, accountSelection, receipt } = this.props
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
      <Box display='flex' flexDirection='column' alignItems='center'>
        <Box width='100%' maxWidth='560px' pt={3}>
          {renderStep}
        </Box>
      </Box>
    )
  }
}

export default ReceiveComponent
