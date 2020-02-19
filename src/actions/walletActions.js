// @flow
import type { AccountData } from '../types/account.flow.js'
import { Base64 } from 'js-base64'
import { createWallet } from '../wallets/WalletFactory.js'
import { saveWallet, getWallet } from '../drive.js'
import { getCryptoTitle } from '../tokens'
import { walletCryptoSupports } from '../wallet.js'
import API from '../apis'
import { enqueueSnackbar, closeSnackbar } from './notificationActions.js'
import WalletErrors from '../wallets/walletErrors'
import utils from '../utils'

// cloud wallet actions
async function _createCloudWallet (password: string, progress: ?Function) {
  var walletFileData = {}
  let ethereumBasedAccountData
  if (progress) progress('CREATE')

  // the following creation process should never fail (which blocks the onboarding process),
  // warn silently for any errors
  try {
    let newAccountList = []
    for (const { cryptoType, disabled } of walletCryptoSupports['drive']) {
      if (!disabled) {
        let account
        let accountData
        let _wallet = createWallet({ walletType: 'drive' })

        if (ethereumBasedAccountData && ['ethereum', 'dai'].includes(cryptoType)) {
          // share the same privateKey for ethereum based coins
          await _wallet.newAccount(`${getCryptoTitle(cryptoType)} Cloud Wallet`, cryptoType, {
            privateKey: ethereumBasedAccountData.privateKey
          })
          account = _wallet.getAccount()
          accountData = account.getAccountData()
        } else {
          await _wallet.newAccount(`${getCryptoTitle(cryptoType)} Cloud Wallet`, cryptoType, {
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

        newAccountList.push(account.getAccountData())
      }
    }
    await API.addCryptoAccounts(newAccountList)
  } catch (error) {
    console.warn(error)
  }

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
    throw new Error(WalletErrors.drive.walletNotExist)
  }

  let accountDataList = JSON.parse(Base64.decode(walletFile.accounts))

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
      if (error.message === WalletErrors.drive.walletNotExist) {
        console.warn(error)
        dispatch({
          type: 'CLEAR_CLOUD_WALLET_CRYPTO_ACCOUNTS',
          payload: API.clearCloudWalletCryptoAccounts()
        })
      } else {
        throw error
      }
    })
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

async function _newCryptoAccountsFromWallet (
  name: string,
  cryptoTypes: Array<string>,
  walletType: string,
  cryptoAccounts: Array<AccountData>,
  options: Object
) {
  let newAccounts = await Promise.all(
    cryptoTypes.map(async cryptoType => {
      let _wallet = createWallet({ walletType: walletType })
      let _account = await _wallet.newAccount(name, cryptoType, options)
      let _newAccountData = _account.getAccountData()

      if (cryptoAccounts.findIndex(item => utils.accountsEqual(item, _newAccountData)) >= 0) {
        throw new Error('Account already exists')
      }

      if (cryptoType === 'bitcoin') {
        await _account.syncWithNetwork()
      }
      return _account.getAccountData()
    })
  )
  return newAccounts
}

function newCryptoAccountsFromWallet (
  name: string,
  cryptoTypes: Array<string>,
  walletType: string,
  options: Object
) {
  return (dispatch: Function, getState: Function) => {
    const cryptoAccounts = getState().accountReducer.cryptoAccounts
    return dispatch({
      type: 'NEW_CRYPTO_ACCOUNTS_FROM_WALLET',
      payload: _newCryptoAccountsFromWallet(name, cryptoTypes, walletType, cryptoAccounts, options)
    }).catch(err => {
      if (err.message === 'Account already exists')
        dispatch(
          enqueueSnackbar({
            message: err.message,
            key: new Date().getTime() + Math.random(),
            options: { autoHideDuration: 3000 }
          })
        )
    })
  }
}

export {
  getCloudWallet,
  createCloudWallet,
  verifyAccount,
  checkWalletConnection,
  newCryptoAccountsFromWallet
}
