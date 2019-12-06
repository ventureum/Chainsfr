import type { AccountData } from '../types/account.flow.js'
import { createAccount } from '../accounts/AccountFactory'
import utils from '../utils'
import { getCryptoDecimals } from '../tokens'
import { getWallet } from '../drive.js'
import { Base64 } from 'js-base64'
import { getTransferData } from '../drive.js'
import { accountStatus } from '../types/account.flow'
import { enqueueSnackbar } from './notificationActions.js'
import API from '../apis.js'
import WalletErrors from '../wallets/walletErrors'

async function _syncWithNetwork (accountData: AccountData) {
  let account = createAccount(accountData)
  await account.syncWithNetwork()
  return account.getAccountData()
}

function syncWithNetwork (accountData: AccountData) {
  return {
    type: 'SYNC_WITH_NETWORK',
    payload: _syncWithNetwork(accountData),
    meta: { ...accountData, status: accountStatus.syncing }
  }
}

async function _getTxFee (txRequest: {
  fromAccount: AccountData,
  transferAmount: StandardTokenUnit,
  options: Object
}) {
  const { fromAccount, transferAmount, options } = txRequest
  let account = createAccount(fromAccount)
  return account.getTxFee({
    value: utils
      .toBasicTokenUnit(transferAmount, getCryptoDecimals(fromAccount.cryptoType))
      .toString(),
    options: options
  })
}

function getTxFee (txRequest: {
  fromAccount: AccountData,
  transferAmount: StandardTokenUnit,
  options: Object
}) {
  return {
    type: 'GET_TX_FEE',
    payload: _getTxFee(txRequest)
  }
}

async function _decryptCloudWalletAccount (accountData: AccountData, password: string) {
  // if private key is undefined
  if (!accountData.privateKey) {
    let walletFile = await getWallet()
    if (!walletFile) {
      throw new Error(WalletErrors.drive.walletNotExist)
    }
    let accountDataList = JSON.parse(Base64.decode(walletFile.accounts))
    let privateKey
    if (accountData.cryptoType === 'bitcoin') {
      privateKey = accountDataList[accountData.xpub]
    } else {
      privateKey = accountDataList[accountData.address]
    }
    if (!privateKey) throw new Error(WalletErrors.drive.accountNotExist)
    accountData.privateKey = privateKey
  }

  let account = createAccount(accountData)
  await account.decryptAccount(password)
  return account.getAccountData()
}

function decryptCloudWalletAccount (accountData: AccountData, password: string) {
  return {
    type: 'DECRYPT_CLOUD_WALLET_ACCOUNT',
    payload: _decryptCloudWalletAccount(accountData, password)
  }
}

async function _verifyEscrowAccountPassword (transferInfo: {
  transferId: ?string,
  account: AccountData,
  password: string
}) {
  let { transferId, account, password } = transferInfo

  if (transferId) {
    // retrieve password from drive
    let transferData = await getTransferData(transferId)
    password = Base64.decode(transferData.password)
  }

  let _account = createAccount(account)
  await _account.decryptAccount(password)
  return _account.getAccountData()
}

function verifyEscrowAccountPassword (transferInfo: {
  transferId: ?string,
  account: AccountData,
  password: string
}) {
  return (dispatch: Function, getState: Function) => {
    return dispatch({
      type: 'VERIFY_ESCROW_ACCOUNT_PASSWORD',
      payload: _verifyEscrowAccountPassword(transferInfo)
    }).catch(error => {
      console.warn(error)
    })
  }
}

function markAccountDirty (accountData: AccountData) {
  return {
    type: 'MARK_ACCOUNT_DIRTY',
    payload: {
      ...accountData,
      status: accountStatus.dirty,
      connected: false
    }
  }
}

function syncHelper (dispatch, accounts) {
  accounts.forEach(cryptoAccount => {
    if ([accountStatus.initialized, accountStatus.dirty].includes(cryptoAccount.status)) {
      dispatch(syncWithNetwork(cryptoAccount))
    }
  })
}

async function _addCryptoAccount (accountData: AccountData): Promise<Array<AccountData>> {
  let cryptoAccounts = (await API.addCryptoAccount(accountData)).cryptoAccounts
  // transform to front-end accountData type
  cryptoAccounts = cryptoAccounts.map(cryptoAccount =>
    createAccount(cryptoAccount).getAccountData()
  )
  return cryptoAccounts
}

function addCryptoAccount (accountData: AccountData) {
  return (dispatch: Function, getState: Function) => {
    return dispatch({
      type: 'ADD_CRYPTO_ACCOUNT',
      payload: _addCryptoAccount(accountData)
    })
      .then(data =>
        syncHelper(dispatch, [
          // only sync one account
          data.value.find(account => utils.accountsEqual(accountData, account))
        ])
      )
      .then(() => {
        dispatch(
          enqueueSnackbar({
            message: 'Account added successfully.',
            key: new Date().getTime() + Math.random(),
            options: { variant: 'success', autoHideDuration: 3000 }
          })
        )
      })
      .catch(error => {
        dispatch(
          enqueueSnackbar({
            message: error.message,
            key: new Date().getTime() + Math.random(),
            options: { variant: 'info', autoHideDuration: 3000 }
          })
        )
      })
  }
}

function getCryptoAccounts () {
  return (dispatch: Function, getState: Function) => {
    return dispatch({
      type: 'GET_CRYPTO_ACCOUNTS',
      payload: _getCryptoAccounts()
    })
      .then(data => syncHelper(dispatch, data.value))
      .catch(error => {
        dispatch(
          enqueueSnackbar({
            message: error.message,
            key: new Date().getTime() + Math.random(),
            options: { variant: 'info', autoHideDuration: 3000 }
          })
        )
      })
  }
}

async function _getCryptoAccounts (accountData: AccountData): Promise<Array<AccountData>> {
  let cryptoAccounts = (await API.getCryptoAccounts()).cryptoAccounts
  // transform to front-end accountData type
  cryptoAccounts = cryptoAccounts.map(cryptoAccount =>
    createAccount(cryptoAccount).getAccountData()
  )
  return cryptoAccounts
}

function removeCryptoAccount (accountData: AccountData) {
  return (dispatch: Function, getState: Function) => {
    return dispatch({
      type: 'REMOVE_CRYPTO_ACCOUNT',
      payload: _removeCryptoAccount(accountData)
    })
      .then(() => {
        dispatch(
          enqueueSnackbar({
            message: 'Account is removed successfully.',
            key: new Date().getTime() + Math.random(),
            options: { variant: 'success', autoHideDuration: 3000 }
          })
        )
      })
      .catch(error => {
        dispatch(
          enqueueSnackbar({
            message: error.message,
            key: new Date().getTime() + Math.random(),
            options: { variant: 'info', autoHideDuration: 3000 }
          })
        )
      })
  }
}

async function _removeCryptoAccount (accountData: AccountData): Promise<Array<AccountData>> {
  let cryptoAccounts = (await API.removeCryptoAccount(accountData)).cryptoAccounts
  // transform to front-end accountData type
  cryptoAccounts = cryptoAccounts.map(cryptoAccount =>
    createAccount(cryptoAccount).getAccountData()
  )
  return cryptoAccounts
}

function _clearAccountPrivateKey (accountData: AccountData) {
  let _account = createAccount(accountData)
  _account.clearPrivateKey()
  return _account.getAccountData()
}

function clearAccountPrivateKey (accountData: AccountData) {
  return {
    type: 'CLEAR_ACCOUNT_PRIVATE_KEY',
    payload: _clearAccountPrivateKey(accountData)
  }
}

export {
  syncWithNetwork,
  getTxFee,
  decryptCloudWalletAccount,
  verifyEscrowAccountPassword,
  markAccountDirty,
  getCryptoAccounts,
  addCryptoAccount,
  removeCryptoAccount,
  clearAccountPrivateKey
}
