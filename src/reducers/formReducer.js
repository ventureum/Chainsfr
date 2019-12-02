/*
 *  Handle UI and form states
 */

import update from 'immutability-helper'

/*
  accountId: {
    cryptoType: string,
    walletType: string,
    address: string
  },
  destination: string | Object<{
    walletType: string,
    cryptoType: string,
    address: string
  }>,
*/

const initialState = {
  transferForm: {
    accountId: {},
    transferAmount: '',
    transferCurrencyAmount: '',
    password: '',
    destination: '',
    sender: '',
    sendMessage: '',
    formError: {
      sender: null,
      senderName: null,
      destination: null,
      transferAmount: null,
      password: null,
      sendMessage: null
    }
  }
}

export default function (state = initialState, action) {
  switch (action.type) {
    case 'UPDATE_TRANSFER_FORM':
      return {
        ...state,
        transferForm: action.payload
      }
    case 'GENERATE_SECURITY_ANSWER':
      return update(state, { transferForm: { password: { $set: action.payload } } })
    case 'CLEAR_TRANSFER_FORM':
    case 'BACK_TO_HOME':
      return initialState
    default:
      // need this for default case
      return state
  }
}
