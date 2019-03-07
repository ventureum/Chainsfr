import Web3 from 'web3'
import LedgerNanoS from '../ledgerSigner'
import utils from '../utils'
import BN from 'bn.js'
import { goToStep } from './navigationActions'
import { Base64 } from 'js-base64'
import { getTransferData } from '../drive.js'
import ERC20 from '../ERC20'

const ledgerNanoS = new LedgerNanoS()
const LEDGER_ACCOUNT_INFO_KEYS = {
  'bitcoin': 'bitcoin',
  'etherum': 'etherum',
  'dai': 'dai'
}

async function _syncLedgerAccountInfo (cryptoType, accountIndex = 0) {
  let accountInfo = await ledgerNanoS.syncAccountBaseOnCryptoType(cryptoType, accountIndex)

  // save to localStorage
  window.localStorage.setItem(
    LEDGER_ACCOUNT_INFO_KEYS[cryptoType],
    JSON.stringify({
      ...accountInfo,
      balance: { [cryptoType]: accountInfo.balance[cryptoType].toString(10) }
    })
  )

  return accountInfo
}

function syncLedgerAccountInfo (cryptoType, accountIndex = 0) {
  return (dispatch, getState) => {
    return dispatch({
      type: 'SYNC_LEDGER_ACCOUNT_INFO',
      payload: _syncLedgerAccountInfo(cryptoType, accountIndex)
    })
  }
}

async function _loadLedgerAccountInfo (cryptoType, accountIndex, dispatch) {
  // load data from localStorage
  const rv = window.localStorage.getItem(LEDGER_ACCOUNT_INFO_KEYS[cryptoType])
  let accountInfo = null
  if (rv) {
    accountInfo = JSON.parse(rv)
    if (accountInfo.balance[cryptoType]) {
      accountInfo.balance[cryptoType] = new BN(accountInfo.balance[cryptoType])
    }
  } else {
    dispatch(syncLedgerAccountInfo(cryptoType, accountIndex))
  }
  return accountInfo
}

function loadLedgerAccountInfo (cryptoType, accountIndex = 0) {
  return (dispatch, getState) => {
    return dispatch({
      type: 'LOAD_LEDGER_ACCOUNT_INFO',
      payload: _loadLedgerAccountInfo(cryptoType, accountIndex, dispatch)
    })
  }
}

async function _checkMetamaskConnection (cryptoType, dispatch) {
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

    // retrieve eth balance, mandatory step, necessary for tx fees
    rv.accounts[0].balance[cryptoType] = new BN(await window._web3.eth.getBalance(rv.accounts[0].address))

    if (cryptoType !== 'ethereum') {
      // retrieve erc20 token balance
      rv.accounts[0].balance[cryptoType] = new BN(await ERC20.getBalance(rv.accounts[0].address, cryptoType))
    }

    // listen for accounts changes
    window.ethereum.on('accountsChanged', function (accounts) {
      dispatch(onMetamaskAccountsChanged(accounts))
    })
  }
  return rv
}

async function _checkLedgerNanoSConnection (cryptoType, dispatch) {
  const deviceConnected = await ledgerNanoS.deviceConnected(cryptoType)
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

function checkMetamaskConnection (crypoType) {
  return (dispatch, getState) => {
    return dispatch({
      type: 'CHECK_METAMASK_CONNECTION',
      payload: _checkMetamaskConnection(crypoType, dispatch)
    })
  }
}

function onMetamaskAccountsChanged (accounts) {
  return {
    type: 'UPDATE_METAMASK_ACCOUNTS',
    payload: accounts
  }
}

function checkLedgerNanoSConnection (cryptoType) {
  return (dispatch, getState) => {
    return dispatch({
      type: 'CHECK_LEDGER_NANOS_CONNECTION',
      payload: _checkLedgerNanoSConnection(cryptoType, dispatch)
    }).then(() => {
      dispatch(loadLedgerAccountInfo(cryptoType))
    })
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
  getWallet,
  syncLedgerAccountInfo,
  loadLedgerAccountInfo
}
