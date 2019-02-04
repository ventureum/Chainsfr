const errorReducer = (state = {}, action) => {
  const { type, payload } = action
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
