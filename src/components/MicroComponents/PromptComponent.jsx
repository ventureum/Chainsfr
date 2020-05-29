import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Prompt } from 'react-router-dom'

const PromptComponent = props => {
  const actionsPending = useSelector(state => state.loadingReducer)
  const shouldPromt =
    !!actionsPending.DIRECT_TRANSFER ||
    !!actionsPending.SUBMIT_TX ||
    !!actionsPending.VERIFY_ACCOUNT ||
    !!actionsPending.CHECK_WALLET_CONNECTION ||
    !!actionsPending.SET_TOKEN_ALLOWANCE ||
    !!actionsPending.ACCEPT_TRANSFER ||
    !!actionsPending.CANCEL_TRANSFER
  useEffect(() => {
    if (shouldPromt) {
      window.onbeforeunload = () => true
    } else {
      window.onbeforeunload = undefined
    }
  })
  return <Prompt message='Transfer in progress, please wait...' when={shouldPromt} />
}

export default PromptComponent
