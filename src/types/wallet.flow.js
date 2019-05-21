// @flow

export type AddressEthereum = string

export type AccountEthereum = {
  balance: string,
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
  lastUpdate: number,
  xpub: string
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

export type WalletDataEthereum = {
  walletType: string,
  // necessary for supporting ERC20 tokens
  cryptoType: string,
  accounts: AccountEthereum[]
}

export type WalletDataBitcoin = {
  walletType: string,
  accounts: AccountBitcoin[]
}

export type TxHash = string
export type TxFee = {
  price: string,
  gas: string,
  costInBasicUnit: string,
  costInStandardUnit: string,
  costByType?: {
    txCostEth: TxFee,
    txCostERC20: TxFee,
    ethTransfer: string
  }
}

export interface IWallet<WalletData, Account> {
  walletData?: WalletData;
  ledger?: any;
  constructor(walletData?: WalletData): void;
  createAccount(): Promise<Account>;
  getAccount(accountIdx?: number): Account;
  getPrivateKey(accountIdx?: number): ?string;
  getTxFee({ to: string, value: string }): Promise<TxFee>;
  sendTransaction({
    to: string,
    value: string,
    txFee?: TxFee
  }): Promise<TxHash>;
}
