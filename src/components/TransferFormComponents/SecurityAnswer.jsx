// @flow
import React from 'react'
import TextField from '@material-ui/core/TextField'
import InputAdornment from '@material-ui/core/InputAdornment'
import Button from '@material-ui/core/Button'
import Tooltip from '@material-ui/core/Tooltip'
import { makeStyles } from '@material-ui/core/styles'
import validator from 'validator'
import utils from '../../utils'


type Props = {
  password: string,
  updateForm: Function,
  formError: Object
}

export default function SecurityAnswer (props: Props) {
  const classes = useStyles()
  const { password, updateForm, formError } = props

  const generateSecurityAnswer = () => {
    return utils.generatePassphrase(6).join(' ')
  }

  const validatePassword = value => {
    if (!validator.isLength(value, { min: 6, max: undefined })) {
      return 'Length must be greater or equal than 6'
    }
  }

  const updatePassword = password => {
    updateForm({
      password: { $set: password },
      formError: {
        password: {
          $set: validatePassword(password)
        }
      }
    })
  }

  return (
    <TextField
      fullWidth
      id='password'
      label='Security Answer'
      margin='normal'
      variant='outlined'
      error={!!formError.password}
      helperText={formError.password || 'We recommend you to use auto-generated security answer.'}
      onChange={e => updatePassword(e.target.value)}
      value={password || ''}
      InputProps={{
        endAdornment: (
          <InputAdornment position='end'>
            <Tooltip title='Generate Security Answer' position='left'>
              <Button
                className={classes.generateBtn}
                color='primary'
                onClick={() => updatePassword(generateSecurityAnswer())}
              >
                Generate
              </Button>
            </Tooltip>
          </InputAdornment>
        )
      }}
    />
  )
}

const useStyles = makeStyles({
  generateBtn: {
    background: `rgba(57, 51, 134, 0.1)`,
    borderRadis: '4px',
    fontSize: '12px',
    padding: '6px 10px 6px 10px'
  }
})
