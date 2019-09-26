import API from '../apis'

export default class ReferralWallet implements IWallet<WalletDataEthereum, AccountEthereum> {
  walletData: WalletDataEthereum

  constructor (walletData?: WalletDataEthereum) {
    if (walletData) {
      this.walletData = walletData
    }
  }

  getWalletData = (): WalletDataEthereum => this.walletData

  generateWallet = async ({
    walletType,
    cryptoType
  }: {
    walletType: string,
    cryptoType: string
  }) => {
    this.walletData = {
      walletType: walletType,
      cryptoType: cryptoType,
      accounts: [await this.createAccount()]
    }
  }

  createAccount = async (): Promise<AccountEthereum> => {
    const balance = '0'
    return {
      address: 'your referral wallet',
      balance: balance,
      ethBalance: balance
    }
  }

  // get account (default first account)
  getAccount = (accountIdx?: number): AccountEthereum => {
    if (!accountIdx) accountIdx = 0
    return this.walletData.accounts[accountIdx]
  }

  encryptAccount = async (password: string) => {
    // suppress flow warning
    // Not implemented
  }

  decryptAccount = async (password: string) => {
    // suppress flow warning
    // Not implemented
  }

  clearPrivateKey = (): void => {
    // suppress flow warning
    // Not implemented
  }

  retrieveAddress = async (): Promise<void> => {
    // suppress flow warning
    // Not implemented
  }

  sync = async (progress: any) => {
    // use the first account only
    let account = this.walletData.accounts[0]
    const { balance } = await API.referralBalance()
    account.balance = balance
  }

  getTxFee = async ({
    to,
    value,
    options
  }: {
    to?: string,
    value: BasicTokenUnit,
    options?: Object
  }): Promise<TxFee> => {
    return {
      price: '0',
      gas: '0',
      costInBasicUnit: '0',
      costInStandardUnit: '0'
    }
  }

  sendTransaction = async ({
    to,
    value,
    txFee,
    options
  }: {
    to: Address,
    value: BasicTokenUnit,
    txFee?: TxFee,
    options?: Object
  }): Promise<TxHash | Array<TxHash>> => {
    const rv = await API.referralSend({ destination: to, transferAmount: value })

    return rv.txHash
  }
}
