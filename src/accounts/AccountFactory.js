// @flow

import type { AccountData, IAccount } from '../types/account.flow.js'
import BitcoinAccount from './BitcoinAccount'
import EthereumAccount from './EthereumAccount'

export function createAccount (accountData: AccountData): IAccount {
  if (accountData.cryptoType === 'bitcoin') {
    return new BitcoinAccount(accountData)
  } else {
    return new EthereumAccount(accountData)
  }
}
