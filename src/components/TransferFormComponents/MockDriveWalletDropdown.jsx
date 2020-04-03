// @flow
import React, { useRef, useState, useEffect } from 'react'
import Box from '@material-ui/core/Box'
import Avatar from '@material-ui/core/Avatar'
import Typography from '@material-ui/core/Typography'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import OutlinedInput from '@material-ui/core/OutlinedInput'
import { getWalletLogo, getWalletTitle } from '../../wallet'

export default function MockDriveWalletDropdown (props: { inputLabel: string }) {
  const [inputLabelWidth, setInputLabelWidth] = useState(undefined)

  const inputLabelRef = useRef()

  useEffect(() => {
    if (inputLabelRef.current) {
      setInputLabelWidth(inputLabelRef.current.offsetWidth)
    }
  }, [props.inputLabel])

  const renderAccountItem = () => {
    return (
      <Box display='flex' flexDirection='row' alignItems='center'>
        <Box mr={1} display='inline'>
          {/* wallet icon */}
          <Avatar style={{ borderRadius: '2px' }} src={getWalletLogo('drive')}></Avatar>
        </Box>
        <Box>
          {/* name and wallet title*/}
          <Typography variant='body2' data-test-id='drive_wallet_name'>
            Wallet
          </Typography>
          <Typography variant='caption' data-test-id='drive_wallet_title'>
            {getWalletTitle('drive')}
          </Typography>
        </Box>
      </Box>
    )
  }
  return (
    <FormControl variant='outlined' fullWidth margin='normal'>
      <InputLabel
        ref={inputLabelRef}
        id='mockDriveWalletInputLabel'
        data-test-id='drive_wallet_label'
      >
        {props.inputLabel}
      </InputLabel>
      <Select
        labelId='mockDriveWalletInputLabel'
        id='mockDriveWalletSelect'
        renderValue={renderAccountItem}
        value={{}}
        // must have outlinedInput for complete dropdown mock
        input={<OutlinedInput labelWidth={inputLabelWidth} name='Select Account' />}
        inputProps={{ 'data-test-id': 'drive_select' }}
      >
        {/* Must have a single menu item since the select is not disabled */}
        <MenuItem key={1} value={{}}>
          {renderAccountItem()}
        </MenuItem>
      </Select>
    </FormControl>
  )
}
