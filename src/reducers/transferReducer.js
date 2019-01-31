const initialState = {
  walletSelection: null,
  cryptoSelection: null,
  transferForm: {
    transferAmount: '',
    password: 'wallet state title logo',
    destination: '',
    sender: ''
  }
}

export default function (state = initialState, action) {
  switch (action.type) {
    case 'SELECT_CRYPTO':
      return {
        ...state,
        cryptoSelection: state.cryptoSelection === action.payload ? null : action.payload
      }
    case 'SELECT_WALLET':
      return {
        ...state,
        walletSelection: state.walletSelection === action.payload ? null : action.payload,
        cryptoSelection: null
      }
    case 'UPDATE_TRANSFER_FORM':
      return {
        ...state,
        transferForm: action.payload
      }
    default: // need this for default case
      return state
  }
}
