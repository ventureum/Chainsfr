// @flow
import WalletConnect from './walletConnect'
import type { IWallet } from '../types/wallet.flow.js'
import type { AccountData } from '../types/account.flow.js'

export default class TrustWalletConnect extends WalletConnect implements IWallet<AccountData> {
  constructor (accountData?: AccountData) {
    super(accountData)
    this.WALLET_TYPE = 'trustWalletConnect'
  }
}
