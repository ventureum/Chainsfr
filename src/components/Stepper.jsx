import React from 'react'
import { withStyles } from '@material-ui/core'
import Stepper from '@material-ui/core/Stepper'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'

function getSteps () {
  return ['Wallet', 'Recipient', 'Review']
}

class TransferStepper extends React.Component {
  render () {
    const { step } = this.props
    const steps = getSteps()
    return (
      <Stepper activeStep={step}>
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
