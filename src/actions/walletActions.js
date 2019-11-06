// @flow
import type { AccountData } from '../types/account.flow.js'

import Web3 from 'web3'
import { goToStep } from './navigationActions'
import { Base64 } from 'js-base64'
import { createWallet } from '../wallets/WalletFactory.js'

import { getTransferData, saveWallet, getWallet } from '../drive.js'
import { walletCryptoSupports, cryptoInWallet } from '../wallet.js'
import WalletFactory from '../wallets/factory'
import API from '../apis'
// import WalletUtils from '../wallets/utils'
// import type { WalletData, AccountEthereum } from '../types/wallet.flow.js'
import { enqueueSnackbar, closeSnackbar } from './notificationActions.js'
import LedgerNanoS from '../ledgerSigner'
import env from '../typedEnv'

// metamask
async function _checkMetamaskConnection (cryptoType: string, dispatch: Function): Promise<any> {
  // if (typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask) {
  //   window._web3 = new Web3(window.ethereum)
  //   let wallet = WalletFactory.createWallet(WalletUtils.toWalletData('metamask', cryptoType, []))
  //   await wallet.retrieveAddress()
  //   // listen for accounts changes
  //   window.ethereum.on('accountsChanged', accounts => {
  //     dispatch(onMetamaskAccountsChanged(accounts, cryptoType))
  //   })
  //   return wallet.getWalletData()
  // } else {
  //   throw new Error('Metamask not found')
  // }
  return {}
}

function checkMetamaskConnection (crypoType: string) {
  return (dispatch: Function, getState: Function) => {
    return dispatch({
      type: 'CHECK_METAMASK_CONNECTION',
      payload: _checkMetamaskConnection(crypoType, dispatch)
    }).catch(error => {
      console.warn(error)
    })
  }
}

function onMetamaskAccountsChanged (accounts: Array<string>, cryptoType: string) {
  return {
    type: 'UPDATE_METAMASK_ACCOUNTS',
    payload: async () => {
      // const account: AccountEthereum = { balance: '0', ethBalance: '0', address: accounts[0] }
      // let newWallet = WalletFactory.createWallet(
      //   // WalletUtils.toWalletData('metamask', cryptoType, [account])
      // )
      // await newWallet.sync()
      // return newWallet.getWalletData()
      return {}
    }
  }
}

// walletConnect
async function _checkWalletConnectConnection (
  walletType: string,
  cryptoType: string,
  address: string,
  dispatch: Function
): Promise<any> {
  let wallet = WalletFactory
    .createWallet
    // WalletUtils.toWalletData(walletType, cryptoType, [
    //   {
    //     address: address,
    //     balance: '0',
    //     ethBalance: '0'
    //   }
    // ])
    ()

  return wallet.getWalletData()
}

function checkWalletConnectConnection (walletType: string, crypoType: string) {
  return (dispatch: Function, getState: Function) => {
    return dispatch({
      type: 'CHECK_WALLETCONNECT_CONNECTION',
      payload: _checkWalletConnectConnection(
        walletType,
        crypoType,
        // default first address
        getState().walletReducer.wallet[walletType].accounts[0]
      )
    }).catch(error => {
      console.warn(error)
    })
  }
}

// use async to ensure consistency for actionsPending values
async function _onWalletConnectConnected (
  walletType: string,
  accounts: Array<string>,
  network: number,
  peerId: string
) {
  return {
    walletType,
    accounts,
    network,
    peerId
  }
}

function onWalletConnectConnected (
  walletType: string,
  accounts: Array<string>,
  network: number,
  peerId: string
) {
  return {
    type: 'ON_WALLETCONNECT_CONNECTED',
    payload: _onWalletConnectConnected(walletType, accounts, network, peerId)
  }
}

// walletLink
async function _checkWalletLinkConnection (
  walletType: string,
  cryptoType: string,
  dispatch: Function
): Promise<any> {
  let wallet = WalletFactory.createWallet()
  // let wallet = WalletFactory.createWallet(WalletUtils.toWalletData(walletType, cryptoType, []))
  window.walletLinkProvider.on('accountsChanged', accounts => {
    dispatch(onWalletLinkAccountsChanged(accounts, walletType, cryptoType))
  })
  window._walletLinkWeb3 = new Web3(window.walletLinkProvider)
  await wallet.retrieveAddress()
  return wallet.getWalletData()
}

function checkWalletLinkConnection (walletType: string, crypoType: string) {
  return (dispatch: Function, getState: Function) => {
    return dispatch({
      type: 'CHECK_WALLETLINK_CONNECTION',
      payload: _checkWalletLinkConnection(walletType, crypoType, dispatch)
    }).catch(error => {
      console.warn(error)
    })
  }
}

// use async to ensure consistency for actionsPending values
async function _onWalletLinkConnected (walletType: string) {
  // Initialize a Web3 Provider object
  window.walletLinkProvider = window.walletLink.makeWeb3Provider(
    `https://mainnet.infura.io/v3/${env.REACT_APP_INFURA_API_KEY}`,
    env.REACT_APP_ETHEREUM_NETWORK !== 'mainnet' ? 4 : 1
  )
  const accounts = await window.walletLinkProvider.enable()
  const network = window.walletLinkProvider.networkVersion
  return {
    walletType,
    accounts,
    network
  }
}

function onWalletLinkConnected (walletType: string) {
  return {
    type: 'ON_WALLETLINK_CONNECTED',
    payload: _onWalletLinkConnected(walletType)
  }
}

function onWalletLinkAccountsChanged (
  accounts: Array<string>,
  walletType: string,
  cryptoType: string
) {
  return {
    type: 'UPDATE_WALLETLINK_ACCOUNTS',
    payload: async () => {
      // const account: AccountEthereum = { balance: '0', ethBalance: '0', address: accounts[0] }
      // let newWallet = WalletFactory.createWallet(
      //   // WalletUtils.toWalletData(walletType, cryptoType, [account])
      // )
      // await newWallet.sync()
      // return newWallet.getWalletData()
      return {}
    }
  }
}

async function _getLedgerWalletData (cryptoType: string, walletState: Object) {
  let wallet = WalletFactory
    .createWallet
    // WalletUtils.toWalletDataFromState('ledger', cryptoType, walletState)
    ()
  await wallet.retrieveAddress()
  return wallet.getWalletData()
}

async function _sync (walletData: any, progress: Function) {
  let wallet = WalletFactory.createWallet(walletData)
  await wallet.sync(progress)
  return wallet.getWalletData()
}

async function _verifyPassword (transferInfo: {
  transferId: ?string,
  fromWallet: any,
  password: string
}) {
  let { transferId, fromWallet, password } = transferInfo
  let wallet = WalletFactory.createWallet(fromWallet)

  if (transferId) {
    // retrieve password from drive
    let transferData = await getTransferData(transferId)
    password = Base64.decode(transferData.password)
  }

  await wallet.decryptAccount(password)
  await wallet.sync()
  return wallet.getWalletData()
}

function getLedgerWalletData (cryptoType: string) {
  return (dispatch: Function, getState: Function) => {
    let walletState = getState().walletReducer.wallet.ledger
    return dispatch({
      type: 'GET_LEDGER_WALLET_DATA',
      payload: _getLedgerWalletData(cryptoType, walletState)
    })
  }
}

function checkLedgerDeviceConnection () {
  return {
    type: 'CHECK_LEDGER_DEVICE_CONNECTION',
    payload: async () => {
      let ledger = new LedgerNanoS()
      try {
        if (!LedgerNanoS.webUsbTransport) {
          await ledger.getWebUsbTransport()
        }
      } catch (e) {
        if (e.name !== 'TransportInterfaceNotAvailable') {
          return Promise.reject(e)
        }
      }
    }
  }
}

function checkLedgerAppConnection (cryptoType: string) {
  return {
    type: 'CHECK_LEDGER_APP_CONNECTION',
    payload: async () => {
      function sleep (time) {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve()
          }, time)
        })
      }
      if (!cryptoInWallet(cryptoType, 'ledger')) {
        throw new Error('Invalid cryptoType for Ledger')
      }
      let ledger = new LedgerNanoS()
      while (true) {
        try {
          if (['ethereum', 'dai'].includes(cryptoType)) {
            await ledger.getEthAddress(0)
            break
          } else {
            await ledger.getBtcAddresss(0)
            break
          }
        } catch (e) {
          console.warn(e)
          await sleep(2000)
        }
      }
    }
  }
}

function sync (walletData: any, progress?: Function) {
  return {
    type: 'SYNC',
    payload: _sync(walletData, progress)
  }
}

function verifyPassword (
  transferInfo: {
    transferId: ?string,
    fromWallet: any,
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

function clearDecryptedWallet (walletData: any) {
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
async function _createCloudWallet (password: string, progress: ?Function) {
  var walletFileData = {}
  let ethereumBasedAccountData
  if (progress) progress('CREATE')

  // the following creation process should never fail (which blocks the onboarding process),
  // warn silently for any errors
  try {
    for (const { cryptoType, disabled } of walletCryptoSupports['drive']) {
      if (!disabled) {
        let account
        let accountData
        let _wallet = createWallet({ walletType: 'drive' })

        if (ethereumBasedAccountData && ['ethereum', 'dai'].includes(cryptoType)) {
          // share the same privateKey for ethereum based coins
          await _wallet.newAccount(`Cloud Wallet ${cryptoType}`, cryptoType, {
            privateKey: ethereumBasedAccountData.privateKey
          })
          account = _wallet.getAccount()
          accountData = account.getAccountData()
        } else {
          await _wallet.newAccount(`Cloud Wallet ${cryptoType}`, cryptoType, {
            getPrefilled: true
          })
          account = _wallet.getAccount()
          accountData = account.getAccountData()
          if (['ethereum', 'dai'].includes(cryptoType)) {
            ethereumBasedAccountData = JSON.parse(JSON.stringify(accountData))
          }
        }

        await account.encryptAccount(password)
        if (accountData.cryptoType === 'bitcoin') {
          walletFileData[accountData.hdWalletVariables.xpub] = accountData
        } else {
          walletFileData[accountData.address] = accountData
        }
        try {
          await API.addCryptoAccount(account.getAccountData())
        } catch (err) {
          console.warn('Add new Cloud wallet account to backend failed')
        }
      }
    }
  } catch (error) {
    console.warn(error)
  }
  console.log('walletFileData', walletFileData)
  walletFileData = { accounts: Base64.encode(JSON.stringify(walletFileData)) }
  // save the encrypted wallet into drive
  if (progress) progress('STORE')
  // this never fails
  await saveWallet(walletFileData)
  // this never fails
  return _getCloudWallet()
}

function createCloudWallet (password: string, progress: ?Function) {
  return (dispatch: Function, getState: Function) => {
    const key = new Date().getTime() + Math.random()
    dispatch(
      enqueueSnackbar({
        message: 'We are setting up your drive wallet. Please do not close the page.',
        key,
        options: { variant: 'info', persist: true }
      })
    )
    return dispatch({
      type: 'CREATE_CLOUD_WALLET',
      payload: _createCloudWallet(password, progress),
      meta: {
        // do not show errors
        // errors are warned in the console
        localErrorHandling: true
      }
    }).then(() => {
      dispatch(closeSnackbar(key))
    })
  }
}

/*
 * Retrieve wallet from drive
 * as well as fetching wallet balance
 *
 * This action never fails, errors are logged in the console,
 * which prevents blocking onboarding or logging in process
 */
async function _getCloudWallet () {
  let walletFile = await getWallet()
  if (!walletFile) {
    throw new Error('WALLET_NOT_EXIST')
  }
  console.log('walletFile', walletFile)
  let accountDataList = Base64.decode(walletFile.accounts)

  return accountDataList
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
      if (error.message === 'WALLET_NOT_EXIST') {
        console.warn(error)
      } else {
        throw error
      }
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

async function _checkReferralWalletConnection () {
  let wallet = WalletFactory
    .createWallet
    // WalletUtils.toWalletData('referralWallet', 'ethereum', [])
    ()
  await wallet.generateWallet({
    walletType: 'referralWallet',
    cryptoType: 'ethereum'
  })
  return wallet.getWalletData()
}

function checkReferralWalletConnection () {
  return {
    type: 'CHECK_REFERRAL_WALLET_CONNECTION',
    payload: _checkReferralWalletConnection()
  }
}

async function _decryptCloudWallet ({
  encryptedWallet,
  password
}: {
  encryptedWallet: any,
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
  encryptedWallet: any,
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

function clearDecryptCloudWalletError () {
  return {
    type: 'DECRYPT_CLOUD_WALLET_CLEAR'
  }
}

async function _getLastUsedAddress (idToken: string) {
  let response = await API.getLastUsedAddress({ idToken })
  let rv = {}
  const walletTypeList = [
    'drive',
    'metamask',
    'ledger',
    'metamaskWalletConnect',
    'coinbaseWalletLink'
  ]
  const cryptoTypeList = ['bitcoin', 'ethereum', 'dai', 'libra']
  // convert response to our wallet struct
  if (response) {
    walletTypeList.forEach(walletType => {
      if (response[walletType]) {
        rv[walletType] = { crypto: {} }
        cryptoTypeList.forEach(cryptoType => {
          if (response[walletType][cryptoType]) {
            rv[walletType].crypto[cryptoType] = [response[walletType][cryptoType]]
          }
        })
      }
    })
  }
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

async function _verifyAccount (accountData: AccountData, options: ?Object) {
  let wallet = createWallet(accountData)
  await wallet.verifyAccount(options)
  return wallet.getAccount().getAccountData()
}

function verifyAccount (accountData: AccountData, options: ?Object) {
  return {
    type: 'VERIFY_ACCOUNT',
    payload: _verifyAccount(accountData, options)
  }
}

async function _checkWalletConnection (accountData: AccountData, additionalInfo: ?Object) {
  let wallet = createWallet(accountData)
  const connection = await wallet.checkWalletConnection(additionalInfo)
  if (connection) {
    return wallet.getAccount().getAccountData()
  }
  return Promise.reject(new Error('Check wallet connection failed'))
}

function checkWalletConnection (accountData: AccountData, additionalInfo: Object) {
  return {
    type: 'CHECK_WALLET_CONNECTION',
    payload: _checkWalletConnection(accountData, additionalInfo)
  }
}

async function _newCryptoAccountFromWallet (
  name: string,
  cryptoType: string,
  walletType: string,
  options: Object
) {
  let _wallet = createWallet({ walletType: walletType })
  let _account = await _wallet.newAccount(name, cryptoType, options)
  return _account.getAccountData()
}

function newCryptoAccountFromWallet (
  name: string,
  cryptoType: string,
  walletType: string,
  options: Object
) {
  return {
    type: 'NEW_CRYPTO_ACCOUNT_FROM_WALLET',
    payload: _newCryptoAccountFromWallet(name, cryptoType, walletType, options)
  }
}

export {
  // metamask
  checkMetamaskConnection,
  onMetamaskAccountsChanged,
  // walletConnect
  onWalletConnectConnected,
  checkWalletConnectConnection,
  // walletLink
  onWalletLinkConnected,
  checkWalletLinkConnection,
  // others
  getLedgerWalletData,
  sync,
  verifyPassword,
  clearDecryptedWallet,
  getCloudWallet,
  createCloudWallet,
  checkCloudWalletConnection,
  decryptCloudWallet,
  unlockCloudWallet,
  getLastUsedAddress,
  notUseLastAddress,
  clearDecryptCloudWalletError,
  checkLedgerDeviceConnection,
  checkLedgerAppConnection,
  checkReferralWalletConnection,
  verifyAccount,
  checkWalletConnection,
  newCryptoAccountFromWallet
}
