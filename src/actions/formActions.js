import utils from '../utils'

function selectWallet (walletSelected) {
  return {
    type: 'SELECT_WALLET',
    payload: walletSelected
  }
}

function selectCrypto (cryptoSelected) {
  return {
    type: 'SELECT_CRYPTO',
    payload: cryptoSelected
  }
}

function updateTransferForm (form) {
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

export {
  selectWallet,
  selectCrypto,
  updateTransferForm,
  generateSecurityAnswer,
  clearSecurityAnswer
}
