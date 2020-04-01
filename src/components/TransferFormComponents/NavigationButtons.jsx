// @flow
import React from 'react'
import Box from '@material-ui/core/Box'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'

type Props = {
  validated: boolean,
  onClickNext: Function,
  onClickPrevious: Function
}

export default function NavigationButtons (props: Props) {
  const { validated, onClickNext, onClickPrevious } = props

  return (
    <Grid container direction='row' justify='center' spacing={2}>
      <Grid item>
        <Box my={3}>
          <Button
            color='primary'
            variant='text'
            onClick={onClickPrevious}
            id='back'
            data-test-id='back'
          >
            Cancel
          </Button>
        </Box>
      </Grid>
      <Grid item>
        <Box my={3}>
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
        </Box>
      </Grid>
    </Grid>
  )
}
