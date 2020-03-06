// @flow
import React from 'react'
import Box from '@material-ui/core/Box'
import ToggleButton from '@material-ui/lab/ToggleButton'
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup'
import { makeStyles } from '@material-ui/core/styles'

export default function AccountSwitch (props: { transferOut: boolean, onChange: Function }) {
  const { transferOut, onChange } = props
  const classes = useStyles()

  return (
    <Box mb={4} display='flex' flexDirection='row' justifyContent='center' alignItems='center'>
      <ToggleButtonGroup
        value={transferOut}
        exclusive
        aria-label='text alignment'
        classes={{ grouped: classes.grouped }}
      >
        <ToggleButton
          value={false}
          onClick={() => onChange(false)}
          aria-label='transfer-in'
          style={{
            borderTopLeftRadius: '5em',
            borderBottomLeftRadius: '5em'
          }}
          className={classes.toggleBtn}
        >
          Transfer In
        </ToggleButton>
        <ToggleButton
          value={true}
          onClick={() => onChange(true)}
          aria-label='transfer-out'
          style={{
            borderTopRightRadius: '5em',
            borderBottomRightRadius: '5em'
          }}
          className={classes.toggleBtn}
        >
          Transfer Out
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  )
}

const useStyles = makeStyles(theme => {
  return {
    toggleBtn: {
      width: '105px',
      backgroundColor: 'white',
      color: theme.palette.primary.main,
      border: `1px solid ${theme.palette.primary.main}`,
      '&.Mui-selected': {
        backgroundColor: theme.palette.primary.main,
        color: 'white',
        border: `1px solid ${theme.palette.primary.main}`
      },
      '&.Mui-selected:hover': {
        backgroundColor: theme.palette.primary.main,
        color: 'white',
        border: `1px solid ${theme.palette.primary.main}`
      }
    },
    grouped: {
      '&:not(:first-child)': {
        borderLeft: `1px solid ${theme.palette.primary.main}`
      }
    }
  }
})
