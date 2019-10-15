const errorReducer = (state = {}, action) => {
  const { type, payload } = action
  if (type === 'CLEAR_VERIFY_PASSWORD_ERROR') {
    return {
      ...state,
      VERIFY_PASSWORD: ''
    }
  } else if (type === 'SELECT_WALLET') {
    // to clear wallet error from privious wallet selection
    return {
      ...state,
      CHECK_METAMASK_CONNECTION: null,
      SYNC_LEDGER_ACCOUNT_INFO: null,
      GET_LEDGER_WALLET_DATA: null,
      CHECK_WALLETCONNECT_CONNECTION: null,
      CHECK_WALLETLINK_CONNECTION: null,
      CHECK_REFERRAL_WALLET_CONNECTION: null
    }
  }
  const matches = /(.*)_(PENDING|REJECTED|CLEAR)/.exec(type)

  // not a *_REQUEST / *_FAILURE actions, so we ignore them
  if (!matches) return state

  const [, requestName, requestState] = matches
  return {
    ...state,
    // Store errorMessage
    // e.g. stores errorMessage when receiving GET_TODOS_FAILURE
    //      else clear errorMessage when receiving GET_TODOS_REQUEST
    [requestName]: requestState === 'REJECTED' ? payload.message : ''
  }
}

export default errorReducer
