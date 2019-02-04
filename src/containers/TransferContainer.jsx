import React, { Component } from 'react'
import TransferComponent from '../components/TransferComponent'
import WalletSelection from './WalletSelectionContainer'
import Recipient from './RecipientContainer'
import Review from './ReviewContainer'
import paths from '../Paths'

class TransferContainer extends Component {
  render () {
    let stepComponent = null
    let {step} = this.props.match.params

    if (step === paths.walletSelectionStep.slice(1)) {
      stepComponent = WalletSelection
      console.log('fuck')
    }
    if (step === paths.recipientStep.slice(1)) {
      stepComponent = Recipient
      console.log('fuck')
    }
    if (step === paths.reviewStep.slice(1)) {
      stepComponent = Review
      console.log('fuck')
    }

    return (
      <TransferComponent>
      {stepComponent}
      </TransferComponent>
    )
  }
}

export default TransferContainer
