// @flow
import React from 'react'
import Grid from '@material-ui/core/Grid'
import path from '../../Paths.js'
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import { Link } from 'react-router-dom'

type Props = {
  validated: boolean,
  onClick: Function
}

export default function NavigationButtons (props: Props) {
  const classes = useStyles()
  const { validated, onClick } = props

  return (
    <Grid container direction='row' justify='center' spacing={2} className={classes.btnSection}>
      <Grid item>
        <Button
          color='primary'
          variant='text'
          onClick={() => this.props.backToHome()}
          id='back'
          to={path.home}
          component={Link}
        >
          Back to Previous
        </Button>
      </Grid>
      <Grid item>
        <Button
          id='continue'
          variant='contained'
          color='primary'
          onClick={onClick}
          disabled={!validated}
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