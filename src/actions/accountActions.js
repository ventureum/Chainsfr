import type { AccountData } from '../types/account.flow.js'
import { createAccount } from '../accounts/AccountFactory'
import { getCryptoPrice } from './cryptoPriceActions'
import { getWallet } from '../drive.js'
import { Base64 } from 'js-base64'
import { getTransferData } from '../drive.js'
import { accountStatus } from '../types/account.flow'
import { enqueueSnackbar } from './notificationActions.js'
import API from '../apis.js'
import WalletErrors from '../wallets/walletErrors'
import { getTxFee } from './transferActions'
import utils from '../utils'

async function _syncWithNetwork (accountData: AccountData) {
  let account = createAccount(accountData)
  await account.syncWithNetwork()
  return account.getAccountData()
}

async function syncCryptoPrice (dispatch, cryptoAccounts) {
  let cryptoTypes = new Set()
  cryptoAccounts.forEach(cryptoAccount => cryptoTypes.add(cryptoAccount.cryptoType))
  const cryptoTypesList = Array.from(cryptoTypes)
  dispatch(getCryptoPrice(cryptoTypesList))
}

function syncWithNetwork (accountData: AccountData) {
  return {
    type: 'SYNC_WITH_NETWORK',
    payload: _syncWithNetwork(accountData),
    meta: { ...accountData, status: accountStatus.syncing }
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
  return {
    type: 'VERIFY_ESCROW_ACCOUNT_PASSWORD',
    payload: _verifyEscrowAccountPassword(transferInfo),
    meta: { localErrorHandling: true }
  }
}

async function _onEscrowPasswordEntered (
  dispatch,
  getState,
  transferInfo: {
    transferId: ?string,
    account: AccountData,
    password: string
  }
) {
  await dispatch(verifyEscrowAccountPassword(transferInfo))
  const escrowAccount = getState().accountReducer.escrowAccount
  const transfer = getState().transferReducer.transfer
  await dispatch(syncWithNetwork(escrowAccount))
  await dispatch(
    getTxFee({
      fromAccount: escrowAccount,
      transferAmount: transfer.transferAmount
    })
  )
}

function onEscrowPasswordEntered (transferInfo: {
  transferId: ?string,
  account: AccountData,
  password: string
}) {
  return (dispatch: Function, getState: Function) => {
    return dispatch({
      type: 'ON_ESCROW_PASSWORD_ENTERED',
      payload: _onEscrowPasswordEntered(dispatch, getState, transferInfo)
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

async function syncHelper (dispatch, accounts) {
  let syncList = []
  accounts.forEach(cryptoAccount => {
    if ([accountStatus.initialized, accountStatus.dirty].includes(cryptoAccount.status)) {
      syncList.push(dispatch(syncWithNetwork(cryptoAccount)))
    }
  })
  return Promise.all(syncList)
}

async function _addCryptoAccounts (accountData: Array<AccountData>): Promise<Array<AccountData>> {
  let cryptoAccounts = (await API.addCryptoAccounts(accountData)).cryptoAccounts
  // transform to front-end accountData type
  cryptoAccounts = cryptoAccounts.map(cryptoAccount =>
    createAccount(cryptoAccount).getAccountData()
  )
  return cryptoAccounts
}

// The 'addToken' flag is used to indicate when this function is
// used to add an ERC20 token account
function addCryptoAccounts (accountData: AccountData | Array<AccountData>, addToken?: boolean) {
  return (dispatch: Function, getState: Function) => {
    let accountDataList
    if (!Array.isArray(accountData)) {
      accountDataList = [accountData]
    } else {
      accountDataList = accountData
    }
    if (addToken) {
      const newAccount = accountDataList[0]
      if (newAccount.walletType !== 'drive') {
        // Need to add the same token to drive wallet as well
        const currentDriveEthAccounts = getState().accountReducer.cryptoAccounts.filter(
          accountData =>
            accountData.walletType === 'drive' && accountData.platformType === 'ethereum'
        )
        const exist = currentDriveEthAccounts.find(accountData => {
          return accountData.cryptoType === newAccount.cryptoType
        })
        if (!exist) {
          accountDataList.push(
            createAccount({
              walletType: 'drive',
              name: currentDriveEthAccounts[0].name,
              cryptoType: newAccount.cryptoType,
              platformType: newAccount.platformType,
              address: currentDriveEthAccounts[0].address
            }).getAccountData()
          )
        }
      }
    }
    return dispatch({
      type: 'ADD_CRYPTO_ACCOUNTS',
      payload: _addCryptoAccounts(accountDataList),
      meta: { track: utils.getTrackInfoFromAccount(accountDataList[0]), localErrorHandling: true }
    })
      .then(data => {
        if (data && data.value) {
          let dict = {}
          accountDataList.forEach((account: AccountData) => {
            dict[account.id] = account
          })
          syncCryptoPrice(dispatch, data.value)
          dispatch(
            enqueueSnackbar({
              message: addToken ? 'Token added successfully' : 'Wallet connected successfully.',
              key: new Date().getTime() + Math.random(),
              options: { variant: 'success', autoHideDuration: 3000 }
            })
          )
          syncHelper(
            dispatch,
            data.value.filter(account => dict[account.id] !== undefined)
          )
        }
      })
      .catch(error => {
        const msg = error.message.includes('exists') ? 'Already added' : error.message
        dispatch(
          enqueueSnackbar({
            message: msg,
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
      .then(data => {
        syncCryptoPrice(dispatch, data.value)
        return syncHelper(dispatch, data.value)
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

async function _getCryptoAccounts (accountData: AccountData): Promise<Array<AccountData>> {
  let cryptoAccounts = (await API.getCryptoAccounts()).cryptoAccounts
  // transform to front-end accountData type
  cryptoAccounts = cryptoAccounts.map(cryptoAccount =>
    createAccount(cryptoAccount).getAccountData()
  )
  return cryptoAccounts
}

function removeCryptoAccounts (accountData: AccountData | Array<AccountData>) {
  return (dispatch: Function, getState: Function) => {
    if (!Array.isArray(accountData)) {
      accountData = [accountData]
    }
    return dispatch({
      type: 'REMOVE_CRYPTO_ACCOUNTS',
      payload: _removeCryptoAccounts(accountData),
      meta: { track: utils.getTrackInfoFromAccount(accountData) }
    })
      .then(() => {
        dispatch(
          enqueueSnackbar({
            message: 'Connected wallet deleted.',
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

async function _removeCryptoAccounts (
  accountData: Array<AccountData>
): Promise<Array<AccountData>> {
  let cryptoAccounts = (await API.removeCryptoAccounts(accountData)).cryptoAccounts
  // transform to front-end accountData type
  cryptoAccounts = cryptoAccounts.map(cryptoAccount =>
    createAccount(cryptoAccount).getAccountData()
  )
  return cryptoAccounts
}

function modifyCryptoAccountsName (accountData: AccountData | Array<AccountData>, newName: string) {
  return (dispatch: Function, getState: Function) => {
    if (!Array.isArray(accountData)) {
      accountData = [accountData]
    }
    return dispatch({
      type: 'MODIFY_CRYPTO_ACCOUNTS_NAME',
      payload: _modifyCryptoAccountsName(accountData, newName),
      meta: { track: utils.getTrackInfoFromAccount(accountData) }
    })
      .then(() => {
        dispatch(
          enqueueSnackbar({
            message: 'Wallet name changed.',
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

async function _modifyCryptoAccountsName (
  accountData: Array<AccountData>,
  newName: string
): Promise<Array<AccountData>> {
  let cryptoAccounts = (await API.modifyCryptoAccountsName(accountData, newName)).cryptoAccounts
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

function _postTxAccountCleanUp (accountData: AccountData) {
  accountData = { ...accountData, status: accountStatus.dirty, connected: false }
  let _account = createAccount(accountData)
  _account.clearPrivateKey()
  return _account.getAccountData()
}

function postTxAccountCleanUp (accountData: AccountData) {
  return {
    type: 'POST_TX_ACCOUNT_CLEAN_UP',
    payload: _postTxAccountCleanUp(accountData)
  }
}

function getAllEthContracts () {
  return (dispatch: Function, getState: Function) => {
    const { ethContracts, ethContractsExpiry } = getState().accountReducer
    // fetch when !ethContract or contracts info has expired
    if (!ethContracts || ethContractsExpiry < Math.round(new Date().getTime() / 1000)) {
      return dispatch({
        type: 'GET_ALL_ETH_CONTRACTS',
        payload: async () => {
          return API.getAllEthContracts()
        }
      })
    }
  }
}

function getEthContract (address: string) {
  return {
    type: 'GET_ETH_CONTRACT',
    payload: async () => {
      return API.getEthContract(address)
    }
  }
}

export {
  syncWithNetwork,
  getTxFee,
  decryptCloudWalletAccount,
  verifyEscrowAccountPassword,
  onEscrowPasswordEntered,
  markAccountDirty,
  getCryptoAccounts,
  addCryptoAccounts,
  modifyCryptoAccountsName,
  removeCryptoAccounts,
  clearAccountPrivateKey,
  postTxAccountCleanUp,
  getAllEthContracts,
  getEthContract
}
