// @flow
import React, { useState, useRef, useEffect } from 'react'
import OutlinedInput from '@material-ui/core/OutlinedInput'
import Select from '@material-ui/core/Select'
import InputLabel from '@material-ui/core/InputLabel'
import FormControl from '@material-ui/core/FormControl'
import MenuItem from '@material-ui/core/MenuItem'
import AccountCircle from '@material-ui/icons/AccountCircleRounded'
import Typography from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import Divider from '@material-ui/core/Divider'
import AddIcon from '@material-ui/icons/AddRounded'
import { AddRecipientDialog } from '../../components/RecipientActionComponents'
import { useActionTracker } from '../../hooksUtils'
import type { EmailType } from '../../types/user.flow'

type Props = {
  destination: EmailType,
  recipients: Object,
  updateForm: Function,
  formError: Object,
  online: boolean
}

export default function SelectRecipient (props: Props) {
  const [openAddRecipientDialog, setOpenAddRecipientDialog] = useState(false)
  const inputLabelRef = useRef()

  const { online, destination, recipients, updateForm, formError } = props

  const updateDestination = (destination: EmailType) => {
    const recipient = recipients.find(recipient => recipient.email === destination)
    if (recipient) {
      updateForm({
        destination: { $set: recipient.email },
        receiverName: { $set: recipient.name }
      })
    }
  }

  const { actionsFulfilled } = useActionTracker(['addRecipient'], [['ADD_RECIPIENT']])

  useEffect(() => {
    if (actionsFulfilled['addRecipient']) {
      // close dialog
      toggleAddRecipientDialog()
    }
  }, [actionsFulfilled])

  const toggleAddRecipientDialog = () => {
    setOpenAddRecipientDialog(!openAddRecipientDialog)
  }

  return (
    <>
      <FormControl variant='outlined' fullWidth margin='normal'>
        <InputLabel ref={inputLabelRef} htmlFor='destination-helper'>
          Select Recipient
        </InputLabel>
        <Select
          value={destination || ''}
          onChange={e => updateDestination(e.target.value)}
          input={
            <OutlinedInput
              labelWidth={inputLabelRef.current ? inputLabelRef.current.offsetWidth : undefined}
              name='Select Recipient'
            />
          }
          error={!!formError.destination}
          id={'destination'}
        >
          {recipients.map(recipient => {
            return (
              <MenuItem key={recipient.name} value={recipient.email}>
                <Box display='flex' alignItems='flex-top'>
                  <AccountCircle fontSize='large' color='secondary' id='accountCircle' />
                  <Box ml={1}>
                    <Typography variant='body2'>{recipient.name}</Typography>
                    <Typography variant='caption'>{recipient.email}</Typography>
                  </Box>
                </Box>
              </MenuItem>
            )
          })}
          {recipients.length !== 0 && <Divider />}
          <MenuItem value='AddRecipient'>
            <Button
              onClick={() => toggleAddRecipientDialog()}
              variant='text'
              color='primary'
              fullWidth
            >
              <AddIcon fontSize='small' />
              Add Recipient
            </Button>
          </MenuItem>
        </Select>
      </FormControl>
      <AddRecipientDialog
        open={openAddRecipientDialog}
        handleClose={() => toggleAddRecipientDialog()}
        online={online}
      />
    </>
  )
}
