// @flow
import BN from 'bn.js'
import LedgerNanoS from '../ledgerSigner'
import utils from '../utils'
import axios from 'axios'
import url from '../url'
import env from '../typedEnv'
import API from '../apis'
import Web3 from 'web3'
import ERC20 from '../ERC20'

import type {
  IWallet,
  WalletDataEthereum,
  AccountEthereum
} from '../types/wallet.flow'

import type {
  TxFee,
  TxHash
} from '../types/transfer.flow'

export class WalletEthereum implements IWallet<WalletDataEthereum, AccountEthereum> {
  ledger: any
  walletData: WalletDataEthereum

  constructor (walletData?: WalletDataEthereum) {
    if (walletData) {
      this.walletData = walletData
      if (this.walletData.walletType === 'ledger') {
        this.ledger = new LedgerNanoS()
      }
    }
  }

  // interface functions
  createAccount = async (): Promise<AccountEthereum> => {
    // we use the first address as the sending/change address
    let _web3 = new Web3(new Web3.providers.HttpProvider(url.INFURA_API_URL))
    let web3Account
    if (env.REACT_APP_PREFILLED_ACCOUNT_ENDPOINT) {
      const privateKey = await API.getPrefilledAccount()
      web3Account = privateKey
        ? _web3.eth.accounts.privateKeyToAccount(privateKey)
        : _web3.eth.accounts.create()
    } else {
      web3Account = _web3.eth.accounts.create()
    }

    let account = {
      balance: '0',
      address: web3Account.address,
      privateKey: web3Account.privateKey,
      encryptedPrivateKey: null
    }

    return account
  }

  getPrivateKey = (accountIdx?: number = 0): ?string => {
    if (this.walletData.walletType === 'drive') {
      return this.getAccount(accountIdx).privateKey
    }
    // no private keys avaiable
    return null
  }

  // get account (default first account)
  getAccount = (accountIdx?: number): AccountEthereum => {
    if (!accountIdx) accountIdx = 0
    return this.walletData.accounts[accountIdx]
  }

  getTxFee = async ({ to, value }: { to: string, value: string }): Promise<TxFee> => {
    let { cryptoType } = this.walletData

    const mockFrom = '0x0f3fe948d25ddf2f7e8212145cef84ac6f20d904'
    const mockTo = '0x0f3fe948d25ddf2f7e8212145cef84ac6f20d905'
    const mockNumTokens = '1000'

    if (cryptoType === 'ethereum') {
      return utils.getGasCost({
        from: mockFrom,
        to: mockTo,
        value: mockNumTokens
      })
    } else if (cryptoType === 'dai') {
      // eth transfer cost
      let txCostEth = await utils.getGasCost({
        from: mockFrom,
        to: mockTo,
        value: mockNumTokens
      })

      // ERC20 transfer tx cost
      let txCostERC20 = await utils.getGasCost(
        ERC20.getTransferTxObj(mockFrom, mockTo, mockNumTokens, cryptoType)
      )

      // amount of eth to be transfered to the escrow wallet
      // this will be spent as tx fees for the next token transfer (from escrow wallet)
      // otherwise, the tokens in the escrow wallet cannot be transfered out
      // we use the current estimation to calculate amount of ETH to be transfered
      let ethTransfer = txCostERC20.costInBasicUnit

      let costInBasicUnit = new BN(txCostEth.costInBasicUnit)
        .add(new BN(txCostERC20.costInBasicUnit))
        .add(new BN(ethTransfer))

      return {
        // use the current estimated price
        price: txCostERC20.price,
        // eth transfer gas + erc20 transfer gas
        gas: new BN(txCostEth.gas).add(new BN(txCostERC20.gas)).toString(),
        // estimate total cost = eth to be transfered + eth transfer fee + erc20 transfer fee
        costInBasicUnit: costInBasicUnit.toString(),
        costInStandardUnit: utils.toHumanReadableUnit(costInBasicUnit).toString(),
        // subtotal tx cost
        // this is used for submitTx()
        costByType: { txCostEth, txCostERC20, ethTransfer }
      }
    } else {
      throw new Error(`Invalid cryptoType: ${cryptoType}`)
    }
  }
}
