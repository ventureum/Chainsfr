// @flow
import type {
  WalletData,
  WalletDataEthereum,
  WalletDataBitcoin,
  AccountEthereum,
  AccountBitcoin,
  Wallet
} from '../types/wallet.flow'
import WalletBitcoin from './bitcoin.js'
import WalletEthereum from './ethereum.js'

export default class WalletFactory {
  static createWallet = (walletData: WalletData): Wallet => {
    if (walletData.cryptoType === 'ethereum') {
      // type casting
      return new WalletEthereum(((walletData: any): WalletDataEthereum))
    } else if (walletData.cryptoType === 'bitcoin') {
      // type casting
      return new WalletBitcoin(((walletData: any): WalletDataBitcoin))
    } else {
      throw new Error(`Invalid cryptoType: ${walletData.cryptoType}`)
    }
  }

  // generate a new wallet
  static generateWallet = async ({
    walletType,
    cryptoType
  }: {
    walletType: string,
    cryptoType: string
  }): Promise<Wallet> => {
    if (['ethereum', 'dai'].includes(cryptoType)) {
      let account: AccountEthereum = await new WalletEthereum().createAccount()
      let walletData: WalletDataEthereum = {
        walletType,
        cryptoType,
        accounts: [account]
      }
      return this.createWallet(walletData)
    } else if (cryptoType === 'bitcoin') {
      let account: AccountBitcoin = await new WalletBitcoin().createAccount()
      let walletData: WalletDataEthereum = {
        walletType,
        cryptoType,
        accounts: [account]
      }
      return this.createWallet(walletData)
    } else {
      throw new Error(`Invalid cryptoType: ${cryptoType}`)
    }
  }
}
