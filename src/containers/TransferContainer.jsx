import React, { Component } from 'react'
import TransferComponent from '../components/TransferComponent'

import paths from '../Paths'

const path2Step = {
  [paths.walletSelectionStep]: 0,
  [paths.recipientStep]: 1,
  [paths.reviewStep]: 2
}

class TransferContainer extends Component {
  render () {
    let stepParam = this.props.match.params.step

    return (
      <TransferComponent step={path2Step['/' + stepParam]} />
    )
  }
}

export default TransferContainer
