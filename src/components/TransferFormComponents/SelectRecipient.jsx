// @flow
import React, { useState, useRef, useEffect } from 'react'
import OutlinedInput from '@material-ui/core/OutlinedInput'
import Select from '@material-ui/core/Select'
import InputLabel from '@material-ui/core/InputLabel'
import FormControl from '@material-ui/core/FormControl'
import MenuItem from '@material-ui/core/MenuItem'
import Typography from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import Divider from '@material-ui/core/Divider'
import AddIcon from '@material-ui/icons/AddRounded'
import Skeleton from '@material-ui/lab/Skeleton'
import UserAvatar from '../MicroComponents/UserAvatar'
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
  const [recipientsFetchStarted, setRecipientsFetchStarted] = useState(false)
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

  const { actionsPending, actionsFulfilled } = useActionTracker(
    ['getRecipients', 'addRecipient'],
    [['GET_RECIPIENTS'], ['ADD_RECIPIENT']]
  )

  useEffect(() => {
    if (actionsPending['getRecipients']) {
      setRecipientsFetchStarted(true)
    }
    if (actionsFulfilled['addRecipient'] && openAddRecipientDialog) {
      // close dialog
      toggleAddRecipientDialog()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionsPending, actionsFulfilled])

  const toggleAddRecipientDialog = () => {
    setOpenAddRecipientDialog(!openAddRecipientDialog)
  }

  const pending = !recipientsFetchStarted || actionsPending['getRecipients']

  const skeletonRecipients = [
    { skeletonOnly: true },
    { skeletonOnly: true },
    { skeletonOnly: true }
  ]

  return (
    <>
      <FormControl variant='outlined' fullWidth margin='normal'>
        <InputLabel ref={inputLabelRef} htmlFor='destination-helper'>
          Select Contact
        </InputLabel>
        <Select
          value={destination || ''}
          onChange={e => updateDestination(e.target.value)}
          input={
            <OutlinedInput
              labelWidth={inputLabelRef.current ? inputLabelRef.current.offsetWidth : undefined}
              name='Select Contact'
            />
          }
          error={!!formError.destination}
          id={'destination'}
          inputProps={{ 'data-test-id': 'destination' }}
        >
          {pending &&
            skeletonRecipients.map((recipient, idx) => {
              return (
                <MenuItem key={idx} value={null}>
                  <Box display='flex' alignItems='flex-top'>
                    <Skeleton variant='circle' width={32} height={32} />
                    <Box ml={1}>
                      <Skeleton height={20} width={35} />
                      <Skeleton height={12} width={80} />
                    </Box>
                  </Box>
                </MenuItem>
              )
            })}
          {!pending &&
            recipients.map(recipient => {
              return (
                <MenuItem
                  key={recipient.name}
                  value={recipient.email}
                  data-test-id={`recipient_list_item_${recipient.email}`}
                >
                  <Box display='flex' alignItems='flex-top'>
                    <UserAvatar
                      style={{ width: 32 }}
                      name={recipient.name}
                      src={recipient.imageUrl}
                    />
                    <Box ml={1}>
                      <Typography variant='body2'>{recipient.name}</Typography>
                      <Typography variant='caption'>{recipient.email}</Typography>
                    </Box>
                  </Box>
                </MenuItem>
              )
            })}
          {!pending && recipients.length !== 0 && <Divider />}
          <MenuItem value='AddRecipient'>
            <Button
              onClick={() => toggleAddRecipientDialog()}
              variant='text'
              color='primary'
              fullWidth
            >
              <AddIcon fontSize='small' />
              Add Contact
            </Button>
          </MenuItem>
        </Select>
      </FormControl>
      <AddRecipientDialog
        open={openAddRecipientDialog}
        handleClose={() => toggleAddRecipientDialog()}
        online={online}
        updateForm
      />
    </>
  )
}
