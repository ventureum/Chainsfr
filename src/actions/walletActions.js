// @flow
import Web3 from 'web3'
import { goToStep } from './navigationActions'
import { Base64 } from 'js-base64'
import { getTransferData, saveWallet, getWallet } from '../drive.js'
import { walletCryptoSupports } from '../wallet.js'
import WalletFactory from '../wallets/factory'
import API from '../apis'
import WalletUtils from '../wallets/utils'
import type { WalletData, AccountEthereum } from '../types/wallet.flow.js'

async function _checkMetamaskConnection (
  cryptoType: string,
  dispatch: Function
): Promise<WalletData> {
  if (typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask) {
    window._web3 = new Web3(window.ethereum)
    let wallet = WalletFactory.createWallet(WalletUtils.toWalletData('metamask', cryptoType, []))
    await wallet.retrieveAddress()
    // listen for accounts changes
    window.ethereum.on('accountsChanged', (accounts) => {
      dispatch(onMetamaskAccountsChanged(accounts, cryptoType))
    })
    return wallet.getWalletData()
  } else {
    throw new Error('Metamask not found')
  }
}

async function _checkLedgerNanoSConnection (cryptoType: string, walletState: Object, throwError: ?boolean = true) {
  let wallet = WalletFactory.createWallet(WalletUtils.toWalletDataFromState('ledger', cryptoType, walletState))
  await wallet.retrieveAddress()
  return wallet.getWalletData()
}

async function _sync (walletData: WalletData, progress: function) {
  let wallet = WalletFactory.createWallet(walletData)
  await wallet.sync(progress)
  return wallet.getWalletData()
}

async function _verifyPassword (transferInfo: {
  sendingId: ?string,
  fromWallet: WalletData,
  password: string
}) {
  let { sendingId, fromWallet, password } = transferInfo
  let wallet = WalletFactory.createWallet(fromWallet)

  if (sendingId) {
    // retrieve password from drive
    let transferData = await getTransferData(sendingId)
    password = Base64.decode(transferData.password)
  }

  await wallet.decryptAccount(password)
  return wallet.getWalletData()
}

function checkMetamaskConnection (crypoType: string) {
  return (dispatch: Function, getState: Function) => {
    return dispatch({
      type: 'CHECK_METAMASK_CONNECTION',
      payload: _checkMetamaskConnection(crypoType, dispatch)
    })
  }
}

function onMetamaskAccountsChanged (accounts: Array<string>, cryptoType: string) {
  return {
    type: 'UPDATE_METAMASK_ACCOUNTS',
    payload: async () => {
      const account: AccountEthereum = { balance: '0', ethBalance: '0', address: accounts[0] }
      let newWallet = WalletFactory.createWallet(WalletUtils.toWalletData('metamask', cryptoType, [account]))
      await newWallet.sync()
      return newWallet.getWalletData()
    }
  }
}

function checkLedgerNanoSConnection (cryptoType: string, throwError: ?boolean) {
  return (dispatch: Function, getState: Function) => {
    let walletState = getState().walletReducer.wallet.ledger
    return dispatch({
      type: 'CHECK_LEDGER_NANOS_CONNECTION',
      payload: _checkLedgerNanoSConnection(cryptoType, walletState, throwError)
    })
  }
}

function sync (walletData: WalletData, progress?: function) {
  return {
    type: 'SYNC',
    payload: _sync(walletData, progress)
  }
}

function verifyPassword (
  transferInfo: {
    sendingId: ?string,
    fromWallet: WalletData,
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

function clearDecryptedWallet (walletData: WalletData) {
  return {
    type: 'CLEAR_DECRYPTED_WALLET',
    payload: () => {
      let wallet = WalletFactory.createWallet(walletData)
      wallet.clearPrivateKey()
      return wallet.getWalletData()
    }
  }
}

// cloud wallet actions
async function _createCloudWallet (password: string) {
  var walletFileData = {}
  let ethereumBasedWalletData = null
  for (const { cryptoType, disabled } of walletCryptoSupports['drive']) {
    if (!disabled) {
      let wallet = await WalletFactory.generateWallet({
        walletType: 'drive',
        cryptoType: cryptoType
      })
      if (['ethereum', 'dai'].includes(cryptoType)) {
        if (ethereumBasedWalletData) {
          // share the same privateKey for ethereum based coins
          // deep-copy walletData
          wallet.walletData = JSON.parse(JSON.stringify(ethereumBasedWalletData))
          wallet.walletData.cryptoType = cryptoType
        } else {
          // deep-copy walletData
          // otherwise, privateKey will be cleared in the next step
          ethereumBasedWalletData = JSON.parse(JSON.stringify(wallet.getWalletData()))
        }
      }
      await wallet.encryptAccount(password)
      wallet.clearPrivateKey()
      walletFileData[cryptoType] = Base64.encode(JSON.stringify(wallet.getWalletData()))
    }
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

  let walletDataList = []
  for (const { cryptoType, disabled } of walletCryptoSupports['drive']) {
    if (!disabled) {
      if (walletFile[cryptoType]) {
        var wallet = WalletFactory.createWallet(JSON.parse(Base64.decode(walletFile[cryptoType])))
        await wallet.sync()
        walletDataList.push(wallet.getWalletData())
      }
    }
  }

  return walletDataList
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

async function _getLastUsedAddress (idToken: string) {
  let response = await API.getLastUsedAddress(idToken)
  let rv = {}
  const walletTypeList = ['drive', 'metamask', 'ledger']
  const cryptoTypeList = ['bitcoin', 'ethereum', 'dai', 'libra']
  // convert response to our wallet struct
  walletTypeList.forEach((walletType) => {
    if (response[walletType]) {
      rv[walletType] = { crypto: {} }
      cryptoTypeList.forEach((cryptoType) => {
        if (response[walletType].crypto && response[walletType].crypto[cryptoType]) {
          rv[walletType].crypto[cryptoType] = [
            response[walletType].crypto[cryptoType]
          ]
        }
      })
    }
  })
  return rv
}

function getLastUsedAddress (idToken: string) {
  return {
    type: 'GET_LAST_USED_ADDRESS',
    payload: _getLastUsedAddress(idToken)
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
  sync,
  verifyPassword,
  clearDecryptedWallet,
  getCloudWallet,
  createCloudWallet,
  checkCloudWalletConnection,
  decryptCloudWallet,
  unlockCloudWallet,
  getLastUsedAddress,
  notUseLastAddress
}
