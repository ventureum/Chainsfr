import update from 'immutability-helper'
import { initMetamaskController } from '../metamaskController'

/*
 *  Handle txController state
 */

const initState = {
  transactions: []
}

export default function (state = initState, action) {
  switch (action.type) {
    case 'TX_CONTROLLER_UPDATE_TRANSACTION':
      return action.payload
    case 'persist/REHYDRATE':
      if (action.payload && action.payload.txControllerReducer) {
        initMetamaskController(action.payload.txControllerReducer)
        return update(state, {
          transactions: { $set: action.payload.txControllerReducer.transactions }
        })
      } else {
        initMetamaskController(initState)
        return initState
      }
    default:
      return state
  }
}
