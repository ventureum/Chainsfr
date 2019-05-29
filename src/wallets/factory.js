// @flow
import type {
  WalletData,
  WalletDataEthereum,
  WalletDataBitcoin,
  Wallet
} from '../types/wallet.flow'
import WalletBitcoin from './bitcoin'
import WalletEthereum from './ethereum'
import WalletUtils from './utils'

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

  static createWalletFromState = (walletType: string, cryptoType: string, walletState: any): Wallet => {
    return this.createWallet(WalletUtils.toWalletData(walletType, cryptoType, walletState[walletType].crypto[cryptoType].accounts))
  }

  // generate a new wallet
  static generateWallet = async ({
    walletType,
    cryptoType
  }: {
    walletType: string,
    cryptoType: string
  }): Promise<Wallet> => {
    let wallet = null
    if (['ethereum', 'dai'].includes(cryptoType)) {
      wallet = new WalletBitcoin()
    } else if (cryptoType === 'bitcoin') {
      wallet = new WalletEthereum()
    }
    if (wallet) {
      await wallet.generateWallet({ walletType, cryptoType })
      return wallet
    } else {
      throw new Error(`Invalid cryptoType: ${cryptoType}`)
    }
  }
}
