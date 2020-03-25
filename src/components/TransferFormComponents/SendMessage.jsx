// @flow
import React from 'react'
import TextField from '@material-ui/core/TextField'

export default function SendMessage (props: {
  password: string,
  sendMessage: string,
  updateForm: Function,
  formError: Object
}) {
  const { password, sendMessage, updateForm, formError } = props

  const validateSendMessage = value => {
    const crossCheck = (stringA, stringB) => {
      let _stringA = stringA.split(' ')
      let _stringB = stringB.split(' ')
      // check if there is a word in stringA appears in stringB
      return _stringA.reduce((accumulator, currentValue) => {
        return accumulator || (_stringB.includes(currentValue) && currentValue !== '')
      }, false)
    }
    if (password && crossCheck(value, password)) {
      // only crosscheck if password is available
      return 'Message cannot contain words from the security answer'
    }
  }

  const updateSendMessage = message => {
    updateForm({
      sendMessage: { $set: message },
      formError: {
        sendMessage: {
          $set: validateSendMessage(message)
        }
      }
    })
  }

  return (
    <TextField
      fullWidth
      id='message'
      label='Message (Optional)'
      margin='normal'
      variant='outlined'
      error={!!formError.sendMessage}
      helperText={formError.sendMessage}
      onChange={e => updateSendMessage(e.target.value)}
      value={sendMessage || ''}
      data-test-id='send_msg'
      inputProps={{ maxLength: 100 }} // message max length
    />
  )
}
