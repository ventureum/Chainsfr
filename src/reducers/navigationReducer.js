/*
 *  Navigate through steps
 */

import update from 'immutability-helper'

const initialState = {
  send: 0,
  receive: 0,
  cancel: 0
}

export default function (state = initialState, action) {
  switch (action.type) {
    case 'GO_TO_STEP':
      let { transferAction, n } = action.payload
      let idx = state[transferAction] + n
      return update(state, { [transferAction]: { $set: idx } })
    default:
      return state
  }
}
