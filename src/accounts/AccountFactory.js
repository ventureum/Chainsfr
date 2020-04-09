// @flow

import type { AccountData, IAccount } from '../types/account.flow.js'
import BitcoinAccount from './BitcoinAccount'
import EthereumAccount from './EthereumAccount'
import { erc20TokensList } from '../erc20Tokens'

export function createAccount (accountData: AccountData): IAccount {
  if (['ethereum', ...erc20TokensList].includes(accountData.cryptoType)) {
    return new EthereumAccount(accountData)
  } else if (['bitcoin'].includes(accountData.cryptoType)) {
    return new BitcoinAccount(accountData)
  } else {
    throw new Error(`Invalid cryptoType: ${accountData.cryptoType}`)
  }
}
