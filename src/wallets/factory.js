// @flow
import type {
  WalletData,
  WalletDataEthereum,
  WalletDataBitcoin,
  AccountEthereum,
  AccountBitcoin
} from '../types/wallet.flow'
import WalletBitcoin from './bitcoin.js'
import WalletEthereum from './ethereum.js'

export default class WalletFactory {
  static createWallet = (walletData: WalletData) => {
    if (walletData.cryptoType === 'ethereum') {
      // type casting
      return new WalletEthereum(((walletData: any): WalletDataEthereum))
    } else {
      // type casting
      return new WalletBitcoin(((walletData: any): WalletDataBitcoin))
    }
  }

  // generate a new wallet
  static generateWallet = async ({
    walletType,
    cryptoType
  }: {
    walletType: string,
    cryptoType: string
  }) => {
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
    }
  }
}
