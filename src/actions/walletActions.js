// @flow
import Web3 from 'web3'
import LedgerNanoS from '../ledgerSigner'
import { goToStep } from './navigationActions'
import { Base64 } from 'js-base64'
import { getTransferData, saveWallet, getWallet } from '../drive.js'
import axios from 'axios'
import env from '../typedEnv'
import API from '../apis'
import url from '../url'
import { walletCryptoSupports } from '../wallet.js'
import { networkIdMap } from '../ledgerSigner/utils'
import WalletFactory from '../wallets/factory'
import type { WalletData, Account, AccountEthereum, AccountBitcoin } from '../types/wallet.flow.js'

const ledgerNanoS = new LedgerNanoS()

function syncLedgerAccountInfo (cryptoType: string, accountIndex: number = 0, progress: ?Function) {
  return {
    type: 'SYNC_LEDGER_ACCOUNT_INFO',
    payload: ledgerNanoS.syncAccountBaseOnCryptoType(cryptoType, accountIndex, progress)
  }
}

function updateBtcAccountInfo (xpub: string, progress: ?Function) {
  return (dispatch: Function, getState: Function) => {
    const accountInfo = getState().walletReducer.wallet.ledger.crypto.bitcoin
    return dispatch({
      type: 'UPDATE_BTC_ACCOUNT_INFO',
      payload: ledgerNanoS.updateBtcAccountInfo(0, accountInfo, xpub, progress)
    })
  }
}

class WalletUtils {
  static toWalletData = (walletType, cryptoType, accounts): WalletData => {
    return {
      walletType,
      cryptoType,
      accounts: accounts.map(account => this._normalizeAccount(cryptoType, account))
    }
  }

  static _normalizeAccount = (cryptoType, account): Account => {
    if (cryptoType === 'ethereum') {
      let { balance, ethBalance, address, privateKey, encryptedPrivateKey } = account

      // some variables must not be null
      if (!address) {
        throw new Error('Account normaliztion failed due to null values')
      }

      let _account: AccountEthereum = {
        balance: balance || '0',
        ethBalance: ethBalance || '0',
        address: address,
        privateKey: privateKey,
        encryptedPrivateKey: encryptedPrivateKey
      }
      return _account
    } else if (cryptoType === 'bitcoin') {
      let { balance, address, privateKey, encryptedPrivateKey, hdWalletVariables } = account

      // some variables must not be null
      if (!address || !hdWalletVariables) {
        throw new Error('Account normaliztion failed due to null values')
      }
      let _account: AccountBitcoin = {
        balance: balance || '0',
        address: address,
        privateKey: privateKey,
        encryptedPrivateKey: encryptedPrivateKey,
        hdWalletVariables: hdWalletVariables
      }
      return _account
    } else {
      throw new Error(`Invalid cryptoType: ${cryptoType}`)
    }
  }
}

async function _checkMetamaskConnection (
  cryptoType: string,
  dispatch: Function
): Promise<WalletData> {
  if (typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask) {
    window._web3 = new Web3(window.ethereum)
    let wallet = WalletFactory.createWallet(WalletUtils.toWalletData('metamask', cryptoType, []))
    await wallet.retrieveAddress()
    // listen for accounts changes
    window.ethereum.on('accountsChanged', function (accounts) {
      dispatch(onMetamaskAccountsChanged(accounts))
    })
    return wallet.getWalletData()
  } else {
    throw new Error('Metamask not found')
  }
}

async function _checkLedgerNanoSConnection (cryptoType: string, throwError: ?boolean = true) {
  let deviceConnected = await ledgerNanoS.deviceConnected(cryptoType)
  if (deviceConnected === null && throwError) {
    const msg = 'Ledger not connected'
    throw msg
  }
  return deviceConnected
}

async function _verifyPassword (transferInfo: {
  sendingId: ?string,
  encryptedWallet: WalletData,
  password: string
}) {
  let { sendingId, encryptedWallet, password } = transferInfo
  let wallet = WalletFactory.createWallet(encryptedWallet)

  if (sendingId) {
    // retrieve password from drive
    let transferData = await getTransferData(sendingId)
    password = Base64.decode(transferData.password)
  }

  await wallet.decryptAccount(password)

  return {
    [encryptedWallet.cryptoType]: wallet.getAccount()
  }
}

function checkMetamaskConnection (crypoType: string) {
  return (dispatch: Function, getState: Function) => {
    return dispatch({
      type: 'CHECK_METAMASK_CONNECTION',
      payload: _checkMetamaskConnection(crypoType, dispatch)
    })
  }
}

function onMetamaskAccountsChanged (accounts: any) {
  return {
    type: 'UPDATE_METAMASK_ACCOUNTS',
    payload: accounts
  }
}

function checkLedgerNanoSConnection (cryptoType: string, throwError: ?boolean) {
  return {
    type: 'CHECK_LEDGER_NANOS_CONNECTION',
    payload: _checkLedgerNanoSConnection(cryptoType, throwError)
  }
}

function verifyPassword (
  transferInfo: {
    sendingId: ?string,
    encryptedWallet: WalletData,
    password: string
  },
  nextStep: ?{
    transferAction: string,
    n: number
  }
) {
  return (dispatch: Function, getState: Function) => {
    return dispatch({
      type: 'VERIFY_PASSWORD',
      payload: _verifyPassword(transferInfo)
    })
      .then(() => {
        if (nextStep) {
          return dispatch(goToStep(nextStep.transferAction, nextStep.n))
        }
      })
      .catch(error => {
        console.warn(error)
      })
  }
}

function clearDecryptedWallet () {
  return {
    type: 'CLEAR_DECRYPTED_WALLET'
  }
}

async function _getUtxoForEscrowWallet (
  address: string
): Promise<{
  utxos: Array<{
    value: number,
    script: string,
    outputIndex: number,
    txHash: string
  }>
}> {
  const addressData = (await axios.get(
    `${url.LEDGER_API_URL}/addresses/${address}/transactions?noToken=true&truncated=true`
  )).data
  const utxos = ledgerNanoS.getUtxosFromTxs(addressData.txs, address)
  return { utxos }
}

function getUtxoForEscrowWallet () {
  return (dispatch: Function, getState: Function) => {
    const { address } = getState().walletReducer.escrowWallet.decryptedWallet
    return dispatch({
      type: 'GET_UTXO_FOR_ESCROW_WALLET',
      payload: _getUtxoForEscrowWallet(address)
    })
  }
}

// cloud wallet actions
async function _createCloudWallet (password: string) {
  var walletFileData = {}
  for (const { cryptoType, disabled } of walletCryptoSupports['drive']) {
    let wallet = await WalletFactory.generateWallet({
      walletType: 'drive',
      cryptoType: cryptoType
    })
    await wallet.encryptAccount(password)
    walletFileData[cryptoType] = Base64.encode(JSON.stringify(wallet.getWalletData()))
  }

  // save the encrypted wallet into drive
  await saveWallet(walletFileData)

  return _getCloudWallet()
}

function createCloudWallet (password: string) {
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
  let walletFile = await getWallet()
  if (!walletFile) {
    throw new Error('WALLET_NOT_EXIST')
  }

  let rv = {}

  for (const { cryptoType, disabled } of walletCryptoSupports['drive']) {
    let wallet = WalletFactory.createWallet(JSON.parse(Base64.decode(walletFile[cryptoType])))
    await wallet.sync()
    rv[cryptoType] = [wallet.getAccount()]
  }

  return {
    connected: true,
    crypto: rv
  }
}

function getCloudWallet () {
  return (dispatch: Function, getState: Function) => {
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

async function _checkCloudWalletConnection (cryptoType: string) {
  return _getCloudWallet()
}

function checkCloudWalletConnection (cryptoType: string) {
  return {
    type: 'CHECK_CLOUD_WALLET_CONNECTION',
    payload: _checkCloudWalletConnection(cryptoType)
  }
}

async function _decryptCloudWallet ({
  encryptedWallet,
  password
}: {
  encryptedWallet: WalletData,
  password: string
}) {

  let wallet = WalletFactory.createWallet(encryptedWallet)
  await wallet.decryptAccount(password)

  return wallet.getWalletData()
}

function decryptCloudWallet ({
  encryptedWallet,
  password
}: {
  encryptedWallet: WalletData,
  password: string
}) {
  return (dispatch: Function, getState: Function) => {
    return dispatch({
      type: 'DECRYPT_CLOUD_WALLET',
      payload: _decryptCloudWallet({ encryptedWallet, password })
    }).catch(error => {
      console.warn(error)
    })
  }
}

function unlockCloudWallet (
  unlockRequestParams: ?{
    cryptoType: string,
    onClose: ?Function
  }
) {
  return {
    type: 'UNLOCK_CLOUD_WALLET',
    payload: unlockRequestParams
  }
}

function getLastUsedAddress (googleId: string) {
  return {
    type: 'GET_LAST_USED_ADDRESS',
    payload: API.getLastUsedAddress(googleId)
  }
}

function notUseLastAddress () {
  return {
    type: 'NOT_USED_LAST_ADDRESS'
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
  checkCloudWalletConnection,
  decryptCloudWallet,
  unlockCloudWallet,
  getLastUsedAddress,
  notUseLastAddress
}
