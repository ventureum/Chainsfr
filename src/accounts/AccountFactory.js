// @flow

import type { AccountData, IAccount } from '../types/account.flow.js'
import BitcoinAccount from './BitcoinAccount'
import EthereumAccount from './EthereumAccount'

export function createAccount (accountData: AccountData): IAccount {
  if (['ethereum', 'dai'].includes(accountData.cryptoType)) {
    return new EthereumAccount(accountData)
  } else if (['bitcoin'].includes(accountData.cryptoType)) {
    return new BitcoinAccount(accountData)
  } else {
    throw new Error(`Invalid cryptoType: ${accountData.cryptoType}`)
  }
}
