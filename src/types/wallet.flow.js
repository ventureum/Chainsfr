// @flow
import WalletBitcoin from '../wallets/bitcoin.js'
import WalletEthereum from '../wallets/ethereum.js'

export type AddressEthereum = string

export type AccountEthereum = {
  // eth/btc balance for ethereum/bitcoin
  // token balance for erc20 tokens
  balance: string,
  // eth balance only
  ethBalance: string,
  address: AddressEthereum,
  privateKey: ?string,
  encryptedPrivateKey: ?string
}

export type Utxos = Array<{
  value: number,
  script: string,
  outputIndex: number,
  txHash: string
}>

export type AddressBitcoin = {
  address: string,
  path: string,
  utxos: Utxos
}

export type HDWalletVariables = {
  nextAddressIndex: number,
  nextChangeIndex: number,
  changeAddress: string,
  addresses: Array<AddressBitcoin>,
  lastBlockHeight: number,
  lastUpdate: number
}

export type AccountBitcoin = {
  balance: string,
  // address in hardware wallet is the next receiving address
  address: string,
  // not available for hardware wallet
  // nor metamask
  //
  // xPriv for hd wallet
  privateKey: ?string,
  encryptedPrivateKey: ?string,

  // optional hd wallet variables
  hdWalletVariables: HDWalletVariables
}

export type Account = AccountEthereum | AccountBitcoin

export type WalletDataEthereum = {
  walletType: string,
  // necessary for supporting ERC20 tokens
  cryptoType: string,
  accounts: AccountEthereum[]
}

export type WalletDataBitcoin = {
  walletType: string,
  cryptoType: string,
  accounts: AccountBitcoin[],
  xpub: string
}

export type WalletData = WalletDataEthereum | WalletDataBitcoin

export type TxHash = string
export type TxFee = {
  price: string,
  gas: string,
  costInBasicUnit: string,
  costInStandardUnit: string,
  // for erc20 tx
  costByType?: {
    txCostEth: {
      price: string,
      gas: string,
      costInBasicUnit: string,
      costInStandardUnit: string
    },
    txCostERC20: {
      price: string,
      gas: string,
      costInBasicUnit: string,
      costInStandardUnit: string
    },
    ethTransfer: string
  }
}

export interface IWallet<WalletData, Account> {
  walletData?: WalletData;
  ledger?: any;
  constructor(walletData?: WalletData): void;
  getWalletData(): WalletData;
  createAccount(): Promise<Account>;
  getAccount(accountIdx?: number): Account;
  encryptAccount(password: string): void;
  decryptAccount(password: string): void;
  sync(): Promise<void>;
  getTxFee({ to?: string, value: string }): Promise<TxFee>;
  sendTransaction({
    to: string,
    value: string,
    txFee?: TxFee
  }): Promise<TxHash>;
}

export type Wallet = WalletEthereum | WalletBitcoin
