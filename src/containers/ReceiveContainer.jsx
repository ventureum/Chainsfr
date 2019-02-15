import React, { Component } from 'react'
import ReceiveComponent from '../components/ReceiveComponent'

import paths from '../Paths'

const path2Step = {
  [paths.receivePasswordStep]: 0,
  [paths.receiveWalletSelectionStep]: 1,
  [paths.receiveReviewStep]: 2,
  [paths.receiveReceiptStep]: 3
}

class ReceiveContainer extends Component {
  render () {
    let stepParam = this.props.match.params.step

    return (
      <ReceiveComponent step={path2Step['/' + stepParam]} history={this.props.history} />
    )
  }
}

export default ReceiveContainer
