import React from 'react'
import { useDispatch } from 'react-redux'
import { onLogout } from '../../actions/userActions'

// This component is intended to be used in test environment ONLY
const Disconnect = props => {
  const dispatch = useDispatch()
  return (
    <button
      id='disconnect'
      onClick={() => {
        dispatch(onLogout(true,true))
      }}
    >
      Disconnect
    </button>
  )
}
export default Disconnect
