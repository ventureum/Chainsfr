// @flow
import React from 'react'
import clsx from 'clsx'
import { withStyles, makeStyles } from '@material-ui/core'
import Stepper from '@material-ui/core/Stepper'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'
import StepConnector from '@material-ui/core/StepConnector'
import Check from '@material-ui/icons/Check'
import { uiColors } from '../styles/color.js'

const stepsByActionType = {
  receive: ['Security Answer', 'Review', 'Receipt'],
  transfer: ['Set up', 'Review', 'Authorize']
}

const MyStepConnector = withStyles({
  alternativeLabel: {
    top: 10,
    left: 'calc(-50% + 16px)',
    right: 'calc(50% + 16px)'
  },
  active: {
    '& $line': {
      borderColor: uiColors.primary
    }
  },
  completed: {
    '& $line': {
      borderColor: uiColors.primary
    }
  },
  line: {
    borderColor: '#eaeaf0',
    borderTopWidth: 3,
    borderRadius: 1
  }
})(StepConnector)

const useDotStepIconStyles = makeStyles({
  root: {
    color: '#eaeaf0',
    display: 'flex',
    height: 22,
    alignItems: 'center'
  },
  active: {
    color: uiColors.primary
  },
  circle: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: 'currentColor'
  },
  completed: {
    color: uiColors.primary,
    zIndex: 1,
    fontSize: 18
  }
})

function DotStepIcon (props) {
  const classes = useDotStepIconStyles()
  const { active, completed } = props

  return (
    <div
      className={clsx(classes.root, {
        [classes.active]: active
      })}
    >
      {completed ? <Check className={classes.completed} /> : <div className={classes.circle} />}
    </div>
  )
}

type Props = {
  actionType: string,
  step: number,
  classes: Object
}

class MyStepper extends React.Component<Props> {
  render () {
    const { actionType, step, classes } = this.props
    const steps = stepsByActionType[actionType]
    return (
      <Stepper
        alternativeLabel
        activeStep={step}
        connector={<MyStepConnector />}
        classes={{
          root: classes.stepperRoot
        }}
      >
        {steps.map((label, index) => (
          <Step key={index}>
            <StepLabel
              StepIconComponent={DotStepIcon}
              classes={{
                label: classes.alternativeLabel
              }}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    )
  }
}

const style = theme => ({
  stepperRoot: {
    padding: 0
  },
  alternativeLabel: {
    '&$alternativeLabel': {
      textAlign: 'center',
      marginTop: '0px'
    }
  }
})

export default withStyles(style)(MyStepper)
