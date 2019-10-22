// @flow
import WalletBitcoin from '../wallets/bitcoin.js'
import WalletEthereum from '../wallets/ethereum.js'
import WalletLibra from '../wallets/libra.js'
import type { IAccount, Account } from './account.flow.js'

import type { TxFee, TxHash } from './transfer.flow'

// export type AccountEthereum = {
//   // eth/btc balance for ethereum/bitcoin
//   // token balance for erc20 tokens
//   balance: string,
//   balanceInStandardUnit: string,
//   // eth balance only
//   ethBalance: string,
//   address: AddressEthereum,
//   privateKey?: string,
//   encryptedPrivateKey?: string
// }

// export type Utxos = Array<{
//   value: number,
//   script: string,
//   outputIndex: number,
//   txHash: string
// }>

// export type AddressBitcoin = {
//   address: string,
//   path: string,
//   utxos: Utxos
// }

// export type HDWalletVariables = {
//   xpub: string,
//   xpriv?: string,
//   nextAddressIndex: number,
//   nextChangeIndex: number,
//   addresses: Array<AddressBitcoin>,
//   lastBlockHeight: number,
//   lastUpdate: number,
//   endAddressIndex: number,
//   endChangeIndex: number
// }

// export type AccountBitcoin = {
//   balance: string,
//   balanceInStandardUnit: string,
//   // address in hardware wallet is the next receiving address
//   address: string,
//   // not available for hardware wallet
//   // nor metamask
//   //
//   // xPriv for hd wallet
//   privateKey?: string,
//   encryptedPrivateKey?: string,

//   // optional hd wallet variables
//   hdWalletVariables: HDWalletVariables
// }

// export type Account = AccountEthereum | AccountBitcoin

// export type WalletDataEthereum = {
//   walletType: string,
//   // necessary for supporting ERC20 tokens
//   cryptoType: string,
//   accounts: AccountEthereum[]
// }

// export type WalletDataBitcoin = {
//   walletType: string,
//   cryptoType: string,
//   accounts: AccountBitcoin[]
// }

// export type WalletData = WalletDataEthereum | WalletDataBitcoin

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
    to: string,
    value: string,
    txFee?: TxFee,
    options?: Object
  }): Promise<TxHash | Array<TxHash>>;
}

// export type Wallet = WalletEthereum | WalletBitcoin | WalletLibra
