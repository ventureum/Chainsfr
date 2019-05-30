// @flow
import type { WalletData, AccountEthereum, AccountBitcoin, Account } from '../types/wallet.flow'

export default class WalletUtils {
  static toWalletData = (
    walletType: string,
    cryptoType: string,
    accounts: Array<Account>
  ): WalletData => {
    if (['ethereum', 'dai'].includes(cryptoType)) {
      return {
        walletType,
        cryptoType,
        accounts: accounts.map(account =>
          this._normalizeAccountEthereum(((account: any): AccountEthereum))
        )
      }
    } else if (['bitcoin'].includes(cryptoType)) {
      return {
        walletType,
        cryptoType,
        accounts: accounts.map(account =>
          this._normalizeAccountBitcoin(((account: any): AccountBitcoin))
        )
      }
    } else {
      throw new Error(`Invalid cryptoType: ${cryptoType}`)
    }
  }

  static toWalletDataFromState = (walletType: string, cryptoType: string, walletState: any) => {
    return this.toWalletData(walletType,cryptoType, walletState.crypto[cryptoType])
  }

  static _normalizeAccountEthereum = (account: AccountEthereum): any => {
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
  }

  static _normalizeAccountBitcoin = (account: AccountBitcoin): any => {
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
  }
}
