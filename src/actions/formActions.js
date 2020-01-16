// @flow

function updateTransferForm (form: {
  accountSelection: string,
  transferAmount: string,
  password: string,
  destination: string,
  sender: string,
  formError: {
    sender: ?string,
    destination: ?string,
    transferAmount: ?string,
    password: ?string
  }
}) {
  return {
    type: 'UPDATE_TRANSFER_FORM',
    payload: form
  }
}

function clearSecurityAnswer () {
  return {
    type: 'GENERATE_SECURITY_ANSWER',
    payload: undefined
  }
}

function clearTransferForm () {
  return {
    type: 'CLEAR_TRANSFER_FORM'
  }
}

export { updateTransferForm, clearSecurityAnswer, clearTransferForm }
