// @flow
import React, { useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import validator from 'validator'
import Typography from '@material-ui/core/Typography'
import LinearProgress from '@material-ui/core/LinearProgress'
import CloseIcon from '@material-ui/icons/Close'
import IconButton from '@material-ui/core/IconButton'
import { addRecipient } from '../../actions/userActions'
import { useActionTracker } from '../../hooksUtils'
import type { Recipient } from '../../types/transfer.flow'

type Props = {
  open: boolean,
  handleClose: Function,
  handleSubmit: Function,
  loading: boolean,
  online: boolean
}

const defaultRecipient = {
  name: '',
  email: '',
  imageUrl: null,
  imageUrlUpdatedAt: null,
  validEmail: true,
  validName: true
}

function AddRecipientDialog (props: Props) {
  const { open, online, handleClose } = props

  const [recipient, setRecipient] = useState<Recipient>(defaultRecipient)

  const dispatch = useDispatch()
  const handleSubmit = useCallback(() => dispatch(addRecipient(recipient)), [dispatch, recipient])

  const { actionsPending } = useActionTracker(['addRecipient'], [['ADD_RECIPIENT']])
  const loading = actionsPending.addRecipient

  const handleChange = (prop: string) => event => {
    if (prop === 'email') {
      setRecipient({
        ...recipient,
        email: event.target.value,
        validEmail: validator.isEmail(event.target.value)
      })
    } else if (prop === 'name') {
      setRecipient({
        ...recipient,
        name: event.target.value,
        validName: !!event.target.value && event.target.value === event.target.value.trim()
      })
    }
  }

  const { name, email, validEmail, validName } = recipient

  return (
    <Dialog open={open} onClose={handleClose} aria-labelledby='form-dialog-title'>
      <DialogTitle id='form-dialog-title'>
        <Box display='flex' justifyContent='space-between' alignItems='flex-end'>
          <Typography variant='h3'>Add Contact</Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon fontSize='small' color='secondary' />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <form noValidate data-test-id='add_recipient_form'>
          <TextField
            id='name'
            variant='outlined'
            fullWidth
            margin='normal'
            label='Name'
            value={name}
            onChange={handleChange('name')}
            error={!validName}
            disabled={loading}
            helperText={!validName ? 'Invalid contact name' : ''}
            name='name'
          />
          <TextField
            id='email'
            variant='outlined'
            fullWidth
            margin='normal'
            disabled={loading}
            error={!validEmail}
            label='Email'
            value={email}
            onChange={handleChange('email')}
            helperText={!validEmail ? 'Invalid Email format' : ''}
            name='email'
          />
        </form>
        {loading && <LinearProgress />}
      </DialogContent>
      <DialogActions>
        <Box mr={2}>
          <Button
            disabled={loading}
            onClick={handleClose}
            variant='outlined'
            color='secondary'
            id='cancel'
            data-test-id='cancel'
          >
            Cancel
          </Button>
        </Box>
        <Button
          variant='contained'
          disabled={loading || !name || !email || !validEmail || !online}
          onClick={handleSubmit}
          color='primary'
          id='add'
          data-test-id='add'
        >
          Add
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddRecipientDialog
