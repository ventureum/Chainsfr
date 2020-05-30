// @flow
import type { AccountData } from '../types/account.flow.js'
import { Base64 } from 'js-base64'
import { createWallet } from '../wallets/WalletFactory.js'
import { saveWallet, getWallet } from '../drive.js'
import { walletCryptoSupports } from '../wallet.js'
import API from '../apis'
import { enqueueSnackbar } from './notificationActions.js'
import WalletErrors from '../wallets/walletErrors'
import utils from '../utils'
import { createAccount } from '../accounts/AccountFactory.js'
import { erc20TokensList } from '../erc20Tokens'

// cloud wallet actions
async function _createCloudWallet (password: string, progress: ?Function) {
  let walletFileData = {}
  let encryptedWalletFileData = {}
  let ethereumBasedAccountData
  if (progress) progress('CREATE')

  // the following creation process should never fail (which blocks the onboarding process),
  // warn silently for any errors
  try {
    // always create eth account first to
    let _wallet = createWallet({ walletType: 'drive' })
    await _wallet.newAccount('Wallet', 'ethereum', {
      getPrefilled: true
    })
    ethereumBasedAccountData = JSON.parse(JSON.stringify(_wallet.getAccount().getAccountData()))

    let newAccountList = await Promise.all(
      walletCryptoSupports['drive']
        .filter(e => !e.disabled)
        .map(async ({ cryptoType }) => {
          let account
          let accountData
          let _wallet = createWallet({ walletType: 'drive' })
          let privateKey
          if (
            (ethereumBasedAccountData && [...erc20TokensList].includes(cryptoType)) ||
            cryptoType === 'ethereum'
          ) {
            // share the same privateKey for ethereum based coins
            privateKey = ethereumBasedAccountData.privateKey
          }
          await _wallet.newAccount('Wallet', cryptoType, {
            privateKey
          })
          account = _wallet.getAccount()
          accountData = account.getAccountData()

          if (accountData.cryptoType === 'bitcoin') {
            walletFileData[accountData.hdWalletVariables.xpub] = JSON.parse(
              JSON.stringify(account.getAccountData())
            )
            await account.encryptAccount(password)
            encryptedWalletFileData[accountData.hdWalletVariables.xpub] = account.getAccountData()
          } else {
            walletFileData[accountData.address] = JSON.parse(
              JSON.stringify(account.getAccountData())
            )
            await account.encryptAccount(password)
            encryptedWalletFileData[accountData.address] = account.getAccountData()
          }
          return account.getAccountData()
        })
    )
    await API.addCryptoAccounts(newAccountList)
  } catch (error) {
    console.warn(error)
  }

  walletFileData = { accounts: Base64.encode(JSON.stringify(walletFileData)) }
  encryptedWalletFileData = { accounts: Base64.encode(JSON.stringify(encryptedWalletFileData)) }
  // save the encrypted wallet into drive
  if (progress) progress('STORE')
  // this never fails
  await saveWallet(walletFileData, encryptedWalletFileData)
}

function createCloudWallet (password: string, progress: ?Function) {
  return (dispatch: Function, getState: Function) => {
    return dispatch({
      type: 'CREATE_CLOUD_WALLET',
      payload: async () => {
        await _createCloudWallet(password, progress)
        // dispatch getCloudWallet after createCloudWallet to
        // reduce onboarding time
        dispatch(getCloudWallet())
      },
      meta: {
        // do not show errors
        // errors are warned in the console
        localErrorHandling: true
      }
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
    })
  }
}

function clearCloudWalletCryptoAccounts () {
  return {
    type: 'CLEAR_CLOUD_WALLET_CRYPTO_ACCOUNTS',
    payload: API.clearCloudWalletCryptoAccounts()
  }
}

async function _changeChainsfrWalletPassword (oldPassword, newPassword) {
  let accountDataList = await _getCloudWallet()
  if (!accountDataList) throw new Error('Chainsfr does not exist')

  let walletFileData = {}

  await Promise.all(
    Object.values(accountDataList).map(async accountData => {
      const account = createAccount(accountData)
      await account.decryptAccount(oldPassword)
      await account.encryptAccount(newPassword)
      const newAccountData = account.getAccountData()
      if (newAccountData.cryptoType === 'bitcoin') {
        walletFileData[newAccountData.hdWalletVariables.xpub] = newAccountData
      } else {
        walletFileData[newAccountData.address] = newAccountData
      }
    })
  )

  walletFileData = { accounts: Base64.encode(JSON.stringify(walletFileData)) }
  await saveWallet(walletFileData)
}

function changeChainsfrWalletPassword (oldPassword: string, newPassword: string) {
  return (dispatch: Function, getState: Function) => {
    return dispatch({
      type: 'CHANGE_CHAINSFR_WALLET_PASSWORD',
      payload: _changeChainsfrWalletPassword(oldPassword, newPassword)
    }).then(() => {
      dispatch(
        enqueueSnackbar({
          message: 'Your password has been changed successfully.',
          key: new Date().getTime() + Math.random(),
          options: { variant: 'success', autoHideDuration: 3000 }
        })
      )
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

function newCryptoAccountsFromWallet (
  name: string,
  cryptoTypes: Array<string>,
  walletType: string,
  platformType: string
) {
  return (dispatch: Function, getState: Function) => {
    const cryptoAccounts = getState().accountReducer.cryptoAccounts
    return dispatch({
      type: 'NEW_CRYPTO_ACCOUNTS_FROM_WALLET',
      payload: async () => {
        // check wallet connection
        await dispatch(checkWalletConnection({ walletType: walletType, cryptoType: platformType }))
        let newAccounts = []
        for (let i = 0; i < cryptoTypes.length; i++) {
          const cryptoType = cryptoTypes[i]
          let _wallet = createWallet({ walletType: walletType })
          let _account = await _wallet.newAccount(name, cryptoType)
          let _newAccountData = _account.getAccountData()

          if (cryptoAccounts.findIndex(item => utils.accountsEqual(item, _newAccountData)) >= 0) {
            throw new Error('Account already exists')
          }

          if (cryptoType === 'bitcoin') {
            await _account.syncWithNetwork()
          }
          newAccounts.push(_account.getAccountData())
        }
        return newAccounts
      }
    }).catch(err => {
      if (err.message === 'Account already exists')
        dispatch(
          enqueueSnackbar({
            message: err.message,
            key: new Date().getTime() + Math.random(),
            options: { variant: 'error', autoHideDuration: 3000 }
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
  newCryptoAccountsFromWallet,
  changeChainsfrWalletPassword,
  clearCloudWalletCryptoAccounts
}
