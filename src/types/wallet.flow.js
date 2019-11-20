// @flow
import WalletLibra from '../wallets/libra.js'
import type { IAccount, Account } from './account.flow.js'

import type { TxFee, TxHash } from './transfer.flow'
import type { Address, BasicTokenUnit } from './token.flow'

export interface IWallet<IAccount> {
  account: IAccount;

  constructor(account?: Account): void;

  getAccount(): Account;
  newAccount(name: string, cryptoType: string, options?: Object): Promise<Account>;

  // check if Chainsfr has access to the wallet
  checkWalletConnection(additionalInfo: ?Object): Promise<boolean>;

  // check if the wallet contains the correct address/private key
  verifyAccount(additionalInfo: ?Object): Promise<boolean>;

  sendTransaction({
    to: Address,
    value: BasicTokenUnit,
    txFee?: TxFee,
    options?: Object
  }): Promise<TxHash | Array<TxHash>>;

  getTxFee({ value: BasicTokenUnit, options: Object }): Promise<TxFee>;
}
