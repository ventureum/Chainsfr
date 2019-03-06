import Web3 from 'web3'
import LedgerNanoS from '../ledgerSigner'
import utils from '../utils'
import BN from 'bn.js'
import { goToStep } from './navigationActions'
import { Base64 } from 'js-base64'
import { getTransferData } from '../drive.js'

const ledgerNanoS = new LedgerNanoS()

async function _checkMetamaskConnection (dispatch) {
  let rv = {
    connected: false,
    network: null,
    accounts: null
  }

  if (typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask) {
    rv.connected = true
    rv.network = window.ethereum.networkVersion

    window._web3 = new Web3(window.ethereum)

    // request the user logs in
    rv.accounts = []

    let addresses = await window.ethereum.enable()
    for (let addr of addresses) {
      rv.accounts.push({
        address: addr,
        balance: {}
      })
    }

    // retrieve eth balance
    rv.accounts[0].balance['ethereum'] = new BN(await window._web3.eth.getBalance(rv.accounts[0].address))

    // listen for accounts changes
    window.ethereum.on('accountsChanged', function (accounts) {
      dispatch(onMetamaskAccountsChanged(accounts))
    })
  }
  return rv
}

async function _checkLedgerNanoSConnection () {
  const deviceConnected = await ledgerNanoS.deviceConnected()
  if (deviceConnected === null) {
    const msg = 'Ledger not connected'
    throw msg
  }
  return deviceConnected
}

async function _verifyPassword (sendingId, encriptedWallet, password) {
  if (sendingId) {
    // retrieve password from drive
    let transferData = await getTransferData(sendingId)
    password = Base64.decode(transferData.password) + transferData.destination
  }

  let decryptedWallet = utils.decryptWallet(encriptedWallet, password)
  if (!decryptedWallet) {
    // wrong password
    throw new Error('WALLET_DECRYPTION_FAILED')
  }
  return decryptedWallet
}

function checkMetamaskConnection (dispatch) {
  return {
    type: 'CHECK_METAMASK_CONNECTION',
    payload: _checkMetamaskConnection(dispatch)
  }
}

function onMetamaskAccountsChanged (accounts) {
  return {
    type: 'UPDATE_METAMASK_ACCOUNTS',
    payload: accounts
  }
}

function checkLedgerNanoSConnection () {
  return {
    type: 'CHECK_LEDGER_NANOS_CONNECTION',
    payload: _checkLedgerNanoSConnection()
  }
}

function verifyPassword (sendingId, encriptedWallet, password, nextStep) {
  return (dispatch, getState) => {
    return dispatch({
      type: 'VERIFY_PASSWORD',
      payload: _verifyPassword(sendingId, encriptedWallet, password)
    }).then(() => {
      if (nextStep) {
        return dispatch(goToStep(nextStep.transferAction, nextStep.n))
      }
    }).catch(error => {
      console.warn(error)
    })
  }
}

function clearDecryptedWallet () {
  return {
    type: 'CLEAR_DECRYPTED_WALLET'
  }
}

// TODO cloud wallet actions
function getWallet () {
  return {
    type: 'GET_WALLET'
  }
}

export {
  checkMetamaskConnection,
  onMetamaskAccountsChanged,
  checkLedgerNanoSConnection,
  verifyPassword,
  clearDecryptedWallet,
  getWallet
}
