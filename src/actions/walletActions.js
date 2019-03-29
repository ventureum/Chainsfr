import Web3 from 'web3'
import LedgerNanoS from '../ledgerSigner'
import utils from '../utils'
import { goToStep } from './navigationActions'
import { Base64 } from 'js-base64'
import { getTransferData, saveWallet, getWallet } from '../drive.js'
import ERC20 from '../ERC20'
import axios from 'axios'
import bitcore from 'bitcore-lib'
import BN from 'bn.js'

let ledgerApiUrl: string = ''
if (process.env.REACT_APP_LEDGER_API_URL) {
  ledgerApiUrl = process.env.REACT_APP_LEDGER_API_URL
}
const ledgerNanoS = new LedgerNanoS()

if (process.env.REACT_APP_NETWORK_NAME && process.env.REACT_APP_INFURA_API_KEY) {
  var infuraApi = `https://${process.env.REACT_APP_NETWORK_NAME}.infura.io/v3/${process.env.REACT_APP_INFURA_API_KEY}`
}

function syncLedgerAccountInfo (cryptoType, accountIndex = 0, progress) {
  return {
    type: 'SYNC_LEDGER_ACCOUNT_INFO',
    payload: ledgerNanoS.syncAccountBaseOnCryptoType(cryptoType, accountIndex, progress)
  }
}

function updateBtcAccountInfo (progress) {
  return (dispatch, getState) => {
    const accountInfo = getState().walletReducer.wallet.ledger.crypto.bitcoin
    return dispatch({
      type: 'UPDATE_BTC_ACCOUNT_INFO',
      payload: ledgerNanoS.updateBtcAccountInfo(0, accountInfo, progress)
    })
  }
}

async function _checkMetamaskConnection (cryptoType, dispatch) {
  let rv = {
    connected: false,
    network: null,
    crypto: null
  }

  if (typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask) {
    rv.connected = true
    rv.network = window.ethereum.networkVersion

    window._web3 = new Web3(window.ethereum)

    // request the user logs in
    rv.crypto = {}

    let addresses = await window.ethereum.enable()
    if (addresses) {
      for (let i = 0; i < addresses.length; i++) {
        rv.crypto = {
          [cryptoType]: {
            [i]: {
              address: addresses[i],
              balance: cryptoType === 'ethereum' ? await window._web3.eth.getBalance(addresses[i]) : await ERC20.getBalance(addresses[i], cryptoType)
            }
          }
        }
      }
    }

    // listen for accounts changes
    window.ethereum.on('accountsChanged', function (accounts) {
      dispatch(onMetamaskAccountsChanged(accounts))
    })
  }
  return rv
}

async function _checkLedgerNanoSConnection (cryptoType) {
  const deviceConnected = await ledgerNanoS.deviceConnected(cryptoType)
  if (deviceConnected === null) {
    const msg = 'Ledger not connected'
    throw msg
  }
  return deviceConnected
}

async function _verifyPassword ({ sendingId, encriptedWallet, password, cryptoType }) {
  if (sendingId) {
    // retrieve password from drive
    let transferData = await getTransferData(sendingId)
    password = Base64.decode(transferData.password) + transferData.destination
  }

  let decryptedWallet = utils.decryptWallet(encriptedWallet, password, cryptoType)
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
  return {
    type: 'CHECK_LEDGER_NANOS_CONNECTION',
    payload: _checkLedgerNanoSConnection(cryptoType)
  }
}

function verifyPassword (transferInfo, nextStep) {
  return (dispatch, getState) => {
    return dispatch({
      type: 'VERIFY_PASSWORD',
      payload: _verifyPassword(transferInfo)
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
async function _getUtxoForEscrowWallet (address) {
  const addressData = (await axios.get(`${ledgerApiUrl}/addresses/${address}/transactions?noToken=true&truncated=true`)).data
  const utxos = ledgerNanoS.getUtxosFromTxs(addressData.txs, address)
  return { utxos }
}

function getUtxoForEscrowWallet () {
  return (dispatch, getState) => {
    const { address } = getState().walletReducer.escrowWallet.decryptedWallet
    return dispatch({
      type: 'GET_UTXO_FOR_ESCROW_WALLET',
      payload: _getUtxoForEscrowWallet(address)
    })
  }
}

// cloud wallet actions
async function _createCloudWallet (password) {
  // ethereum based wallet
  // ETH and erc20 tokens will use the same address
  let _web3 = new Web3(new Web3.providers.HttpProvider(infuraApi))
  let ethWallet = _web3.eth.accounts.create()

  // wallet encryption with user-provided password
  let ethWalletEncrypted = utils.encryptWallet(ethWallet, password, 'ethereum')

  // bitcoin wallet
  let btcWallet = new bitcore.PrivateKey(undefined, process.env.REACT_APP_BTC_NETWORK)
  let btcWalletEncrypted = utils.encryptWallet({ wif: btcWallet.toWIF() }, password, 'bitcoin')

  // save the encrypted wallet into drive
  await saveWallet({
    'password': Base64.encode(password),
    'ethereum': Base64.encode(JSON.stringify(ethWalletEncrypted)),
    'bitcoin': Base64.encode(JSON.stringify(btcWalletEncrypted))
  })

  return _getCloudWallet()
}

function createCloudWallet (password) {
  return {
    type: 'CREATE_CLOUD_WALLET',
    payload: _createCloudWallet(password)
  }
}

/*
 * Retrieve wallet from drive
 * as well as fetching wallet balance
 */
async function _getCloudWallet () {
  let wallet = await getWallet()
  if (!wallet) {
    throw new Error('WALLET_NOT_EXIST')
  }

  let password = Base64.decode(wallet.password)

  // decrypt wallet
  let ethWalletDecrypted = utils.decryptWallet(
    (JSON.parse(Base64.decode(wallet.ethereum))),
    password,
    'ethereum')

  let btcWalletDecrypted = utils.decryptWallet(
    (JSON.parse(Base64.decode(wallet.bitcoin))),
    password,
    'bitcoin')

  // fetch balance
  // 1. fetch ETH balance in string
  let _web3 = new Web3(new Web3.providers.HttpProvider(infuraApi))
  let ethBalance = await _web3.eth.getBalance(ethWalletDecrypted.address)
  // 2. fetch DAI balance in string
  let daiBalance = (await ERC20.getBalance(ethWalletDecrypted.address, 'dai')).toString()
  // 3. fetch BTC balance in string
  const addressData = (await axios.get(`${ledgerApiUrl}/addresses/${btcWalletDecrypted.address}/transactions?noToken=true&truncated=true`)).data
  const utxos = ledgerNanoS.getUtxosFromTxs(addressData.txs, btcWalletDecrypted.address)
  let btcBalance = (utxos.reduce((accu, utxo) => {
    return new BN(utxo.value).add(accu)
  }, new BN(0))).toString()

  // wrap wallets into an array to denote the first account
  return {
    connected: true,
    password: password,
    crypto: {
      'ethereum': [{ ...ethWalletDecrypted, balance: ethBalance }],
      'dai': [{ ...ethWalletDecrypted, balance: daiBalance }],
      'bitcoin': [{ ...btcWalletDecrypted, balance: btcBalance }]
    }
  }
}

function getCloudWallet () {
  return (dispatch, getState) => {
    return dispatch({
      type: 'GET_CLOUD_WALLET',
      payload: _getCloudWallet(),
      meta: {
        // handle wallet exceptions locally
        // necessary for checking if cloud wallet exists
        localErrorHandling: true
      }
    }).catch(error => {
      console.warn(error)
    })
  }
}

async function _checkCloudWalletConnection (cryptoType) {
  return _getCloudWallet()
}

function checkCloudWalletConnection (cryptoType) {
  return {
    type: 'CHECK_CLOUD_WALLET_CONNECTION',
    payload: _checkCloudWalletConnection(cryptoType)
  }
}

export {
  checkMetamaskConnection,
  onMetamaskAccountsChanged,
  checkLedgerNanoSConnection,
  verifyPassword,
  clearDecryptedWallet,
  getCloudWallet,
  createCloudWallet,
  syncLedgerAccountInfo,
  updateBtcAccountInfo,
  getUtxoForEscrowWallet,
  checkCloudWalletConnection
}
