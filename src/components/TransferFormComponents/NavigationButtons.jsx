// @flow
import React from 'react'
import Grid from '@material-ui/core/Grid'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'

type Props = {
  validated: boolean,
  onClickNext: Function,
  onClickPrevious: Function
}

export default function NavigationButtons (props: Props) {
  const classes = useStyles()
  const { validated, onClickNext, onClickPrevious } = props

  return (
    <Grid container direction='row' justify='center' spacing={2} className={classes.btnSection}>
      <Grid item>
        <Button
          color='primary'
          variant='text'
          onClick={onClickPrevious}
          id='back'
        >
          Back to Previous
        </Button>
      </Grid>
      <Grid item>
        <Button
          id='continue'
          variant='contained'
          color='primary'
          onClick={onClickNext}
          disabled={!validated}
          data-test-id='continue'
        >
          Continue
        </Button>
      </Grid>
    </Grid>
  )
}

const useStyles = makeStyles({
  btnSection: {
    marginTop: 30,
    marginBottom: 30
  }
})
