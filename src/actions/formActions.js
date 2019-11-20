// @flow
import utils from '../utils'

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

function generateSecurityAnswer () {
  return {
    type: 'GENERATE_SECURITY_ANSWER',
    // 6 bytes, 48 bit, 4 words (12 bit per word)
    payload: utils.generatePassphrase(6).join(' ')
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

export { updateTransferForm, generateSecurityAnswer, clearSecurityAnswer, clearTransferForm }
