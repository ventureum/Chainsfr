import React from 'react'
import { withStyles } from '@material-ui/core'
import Stepper from '@material-ui/core/Stepper'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'
import paths from '../Paths'

const routeMap = {
  [paths.walletSelection]: 0,
  [paths.recipient]: 1,
  [paths.review]: 2
}

function getSteps () {
  return ['Access My Wallet', 'Set Recipient and PIN', 'Review']
}

class TransferStepper extends React.Component {
  render () {
    const { step } = this.props
    const activeStep = routeMap[step]
    const steps = getSteps()
    return (
      <Stepper activeStep={activeStep}>
        {steps.map((label, index) => (
          <Step key={index}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    )
  }
}

const style = theme => ({
})

export default withStyles(style)(TransferStepper)
