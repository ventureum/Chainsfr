import type { AccountData } from '../types/account.flow.js'
import { createAccount } from '../accounts/AccountFactory'
import utils from '../utils'
import { getCryptoDecimals } from '../tokens'
import { getWallet } from '../drive.js'
import { Base64 } from 'js-base64'
import { accountStatus } from '../types/account.flow'

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
      throw new Error('WALLET_NOT_EXIST')
    }
    let accountDataList = JSON.parse(Base64.decode(walletFile.accounts))
    let privateKey
    if (accountData.cryptoType === 'bitcoin') {
      privateKey = accountDataList[accountData.xpub]
    } else {
      privateKey = accountDataList[accountData.address]
    }
    if (!privateKey) throw new Error('Account does not exist')
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

export { syncWithNetwork, getTxFee, decryptCloudWalletAccount }
