// @flow
import type {
  WalletData,
  WalletDataEthereum,
  WalletDataBitcoin,
  Wallet
} from '../types/wallet.flow'
import WalletBitcoin from './bitcoin'
import WalletEthereum from './ethereum'
import WalletLibra from './libra'
import WalletUtils from './utils'
import ReferralWallet from './referralWallet.js'
export default class WalletFactory {
  static createWallet = (walletData: WalletData): Wallet => {
    if (['ethereum', 'dai'].includes(walletData.cryptoType)) {
      // type casting
      if (walletData.walletType === 'referralWallet') {
        return new ReferralWallet(((walletData: any): WalletDataEthereum))
      }
      return new WalletEthereum(((walletData: any): WalletDataEthereum))
    } else if (['bitcoin'].includes(walletData.cryptoType)) {
      // type casting
      return new WalletBitcoin(((walletData: any): WalletDataBitcoin))
    } else if (['libra'].includes(walletData.cryptoType)) {
      return new WalletLibra(((walletData: any): WalletDataEthereum))
    } else {
      throw new Error(`Invalid cryptoType: ${walletData.cryptoType}`)
    }
  }

  static createWalletFromState = (
    walletType: string,
    cryptoType: string,
    walletState: any
  ): Wallet => {
    return this.createWallet(
      WalletUtils.toWalletData(
        walletType,
        cryptoType,
        walletState[walletType].crypto[cryptoType].accounts
      )
    )
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
      wallet = new WalletEthereum()
    } else if (cryptoType === 'bitcoin') {
      wallet = new WalletBitcoin()
    } else if (cryptoType === 'libra') {
      wallet = new WalletLibra()
    }
    if (wallet) {
      await wallet.generateWallet({ walletType, cryptoType })
      return wallet
    } else {
      throw new Error(`Invalid cryptoType: ${cryptoType}`)
    }
  }
}
