// @flow
import type { IWallet } from '../types/wallet.flow.js'
import type { IAccount, AccountData, Utxos } from '../types/account.flow.js'
import type { TxFee, TxHash, Signature } from '../types/transfer.flow'
import type { BasicTokenUnit, Address } from '../types/token.flow'

import EthereumAccount from '../accounts/EthereumAccount.js'
import BitcoinAccount from '../accounts/BitcoinAccount.js'
import * as bitcoin from 'bitcoinjs-lib'
import Web3 from 'web3'
import * as bip32 from 'bip32'
import * as bip39 from 'bip39'

import API from '../apis.js'
import url from '../url'
import env from '../typedEnv'
import WalletUtils from './utils.js'
import WalletErrors from './walletErrors'

const escrowErrors = WalletErrors.escrow
const BASE_BTC_PATH = env.REACT_APP_BTC_PATH
const DEFAULTaccountData = 0
const NETWORK =
  env.REACT_APP_BTC_NETWORK === 'mainnet' ? bitcoin.networks.bitcoin : bitcoin.networks.testnet

export default class EscrowWallet implements IWallet<AccountData> {
  WALLET_TYPE = 'escrow'

  account: IAccount
  static chainsfrBtcMultiSigPublicKey: string

  constructor (accountData?: AccountData) {
    if (accountData && accountData.cryptoType) {
      switch (accountData.cryptoType) {
        case 'dai':
        case 'ethereum':
          this.account = new EthereumAccount(accountData)
          break
        case 'bitcoin':
          this.account = new BitcoinAccount(accountData)
          break
        default:
          throw new Error('Invalid crypto type')
      }
    }
  }

  getChainsfrBtcMultiSigPublicKey = async () => {
    if (!EscrowWallet.chainsfrBtcMultiSigPublicKey) {
      EscrowWallet.chainsfrBtcMultiSigPublicKey = (await API.getBtcMultisigPublicKey()).btcPublicKey
    }
    return EscrowWallet.chainsfrBtcMultiSigPublicKey
  }

  getAccount = (): IAccount => {
    if (!this.account) {
      throw new Error('Account is undefined')
    }
    return this.account
  }

  _newEthereumAccount = async (
    name: string,
    cryptoType: string,
    options?: Object
  ): Promise<EthereumAccount> => {
    let _web3 = new Web3(new Web3.providers.HttpProvider(url.INFURA_API_URL))
    let web3Account = _web3.eth.accounts.create()
    const privateKey = web3Account.privateKey

    const accountData = {
      cryptoType: cryptoType,
      walletType: this.WALLET_TYPE,

      address: web3Account.address,
      name: name, // the name of this account set by the user.

      // token balance for erc20 tokens/
      balance: '0',
      balanceInStandardUnit: '0',

      // eth balance only
      ethBalance: '0',

      connected: true,
      verified: true,
      receivable: true,
      sendable: true,

      privateKey: privateKey,
      lastSynced: 0
    }

    this.account = new EthereumAccount(accountData)
    return this.account
  }

  _newBitcoinAccount = async (name: string): Promise<BitcoinAccount> => {
    const seed = bip39.mnemonicToSeedSync(bip39.generateMnemonic())
    const root = bip32.fromSeed(seed, NETWORK)
    let xpriv = root.toBase58()
    const path = `m/${BASE_BTC_PATH}/${DEFAULTaccountData}'`
    const child = root.derivePath(path)
    const accountXPub = child.neutered().toBase58()
    const firstAddressNode = child.derive(0).derive(0)
    const firstAddressNodePrivateKey = firstAddressNode.toWIF()

    const keyPair = bitcoin.ECPair.fromWIF(firstAddressNodePrivateKey, NETWORK)

    const chainsfrBtcMultiSigPublicKey = await this.getChainsfrBtcMultiSigPublicKey()
    const chainsfrBtcMultiSigPublicKeyBuffer = Buffer.from(chainsfrBtcMultiSigPublicKey, 'hex')

    const pubkeys = [keyPair.publicKey, chainsfrBtcMultiSigPublicKeyBuffer].sort()
    const payment = bitcoin.payments.p2sh({
      // use P2WSH to reduce size
      redeem: bitcoin.payments.p2wsh({
        redeem: bitcoin.payments.p2ms({ m: 2, pubkeys, network: NETWORK }),
        network: NETWORK
      }),
      network: NETWORK
    })
    let accountData = {
      cryptoType: 'bitcoin',
      walletType: this.WALLET_TYPE,
      name: name,
      balance: '0',
      balanceInStandardUnit: '0',
      address: payment.address,
      privateKey: firstAddressNodePrivateKey,
      hdWalletVariables: {
        xpriv: xpriv,
        xpub: accountXPub,
        nextAddressIndex: 0,
        nextChangeIndex: 0,
        changeAddress: payment.address,
        addresses: [
          {
            address: payment.address,
            path: env.REACT_APP_BTC_PATH + `/${DEFAULTaccountData}'/0/0`,
            utxos: []
          }
        ],
        lastUpdate: 0,
        endAddressIndex: 0,
        endChangeIndex: 0
      },
      verified: true,
      receivable: true,
      sendable: true,

      lastSynced: 0
    }

    this.account = new BitcoinAccount(accountData)
    return this.account
  }

  async newAccount (name: string, cryptoType: string, options?: Object): Promise<IAccount> {
    if (['dai', 'bitcoin', 'ethereum'].includes(cryptoType)) {
      if (cryptoType !== 'bitcoin') {
        return this._newEthereumAccount(name, cryptoType, options)
      } else {
        return this._newBitcoinAccount(name)
      }
    } else {
      throw new Error('Invalid crypto type')
    }
  }

  checkWalletConnection = async (additionalInfo: ?Object): Promise<boolean> => {
    let account = this.getAccount()
    let accountData = account.getAccountData()
    if (accountData.privateKey === undefined || accountData.privateKey === null) {
      if (additionalInfo && additionalInfo.password && accountData.encryptedPrivateKey) {
        try {
          await account.decryptAccount(additionalInfo.password)
          return true
        } catch (e) {
          console.error(e)
          return false
        }
      }
      return false
    }
    return true
  }

  verifyAccount = async (additionalInfo: ?Object): Promise<boolean> => {
    let accountData = this.getAccount().getAccountData()

    if (accountData.privateKey) {
      if (accountData.cryptoType === 'bitcoin') {
        const root = bip32.fromBase58(accountData.hdWalletVariables.xpriv, NETWORK)

        const path = `m/${BASE_BTC_PATH}/${DEFAULTaccountData}'`
        const child = root.derivePath(path)
        const firstAddressNode = child.derive(0).derive(0)
        const firstAddressNodePrivateKey = firstAddressNode.toWIF()

        if (firstAddressNodePrivateKey !== accountData.privateKey) {
          accountData.connected = false
          throw new Error(escrowErrors.keyPairDoesNotMatch)
        }
      } else if (['dai', 'ethereum'].includes(accountData.cryptoType)) {
        let _web3 = new Web3(new Web3.providers.HttpProvider(url.INFURA_API_URL))
        const web3Account = _web3.eth.accounts.privateKeyToAccount(accountData.privateKey)
        if (web3Account.address !== accountData.address) {
          accountData.connected = false
          throw new Error(escrowErrors.keyPairDoesNotMatch)
        }
      }
      accountData.verified = true
      accountData.connected = true
      return this.account.accountData.connected
    }
    accountData.verified = false
    throw new Error(escrowErrors.privateKeyNotExist)
  }

  sendTransaction = async ({
    to,
    value,
    txFee,
    options
  }: {
    to: Address,
    value: BasicTokenUnit,
    txFee: TxFee,
    options?: Object
  }): Promise<{ txHash?: TxHash, clientSig?: Signature }> => {
    const account = this.getAccount()
    const accountData = account.getAccountData()

    if (!accountData.connected) {
      throw new Error('Must connect and verify account first')
    }

    const { cryptoType } = accountData
    if (!options) throw new Error(escrowErrors.noOptions)

    let clientSig

    if (['dai', 'ethereum'].includes(cryptoType)) {
      if (!options.multiSig) throw new Error(escrowErrors.noMultiSig)
      if (!accountData.privateKey) throw new Error(escrowErrors.noPrivateKeyInAccount)
      clientSig = await options.multiSig.sendFromEscrow(accountData.privateKey, to)
    } else if (cryptoType === 'bitcoin') {
      const addressPool = accountData.hdWalletVariables.addresses
      if (!txFee) throw new Error('Missing txFee')
      const { fee, utxosCollected } = account._collectUtxos(addressPool, value, Number(txFee.price))

      clientSig = await this._psbtSigner(
        utxosCollected,
        to,
        Number(value), // actual value to be sent
        Number(fee),
        accountData.hdWalletVariables.nextChangeIndex
      )
    } else {
      throw new Error('Invalid crypto type')
    }

    return { clientSig: clientSig }
  }

  getTxFee = async ({
    value,
    options
  }: {
    value: BasicTokenUnit,
    options: Object
  }): Promise<TxFee> => {
    const accountData = this.getAccount().getAccountData()
    if (accountData.cryptoType === 'bitcoin') {
      return WalletUtils.getBtcTxFee({
        value,
        addressesPool: accountData.hdWalletVariables.addresses
      })
    } else if (['ethereum', 'dai'].includes(accountData.cryptoType)) {
      // send from escrow incurs no tx fees for eth
      return {
        price: '0',
        gas: '0',
        costInBasicUnit: '0',
        costInStandardUnit: '0'
      }
    }
    throw new Error('Invalid cryptoType')
  }

  setTokenAllowance = async (amount: BasicTokenUnit): Promise<TxHash> => {
    // NOT IMPLEMENTED
    return '0x'
  }

  _psbtSigner = async (
    inputs: Utxos,
    to: string,
    // value to be sent
    satoshiValue: number,
    // total fee in satoshi
    fee: number,
    changeIndex: number
  ) => {
    // use the first account

    const accountData = this.getAccount().getAccountData()
    const keyPair = bitcoin.ECPair.fromWIF(accountData.privateKey, NETWORK)
    const chainsfrBtcMultiSigPublicKey = await this.getChainsfrBtcMultiSigPublicKey()
    const chainsfrBtcMultiSigPublicKeyBuffer = Buffer.from(chainsfrBtcMultiSigPublicKey, 'hex')

    const pubkeys = [keyPair.publicKey, chainsfrBtcMultiSigPublicKeyBuffer].sort()
    const payment = bitcoin.payments.p2sh({
      redeem: bitcoin.payments.p2wsh({
        redeem: bitcoin.payments.p2ms({ m: 2, pubkeys, network: NETWORK }),
        network: NETWORK
      }),
      network: NETWORK
    })

    let psbt = new bitcoin.Psbt({ network: NETWORK })
    for (let i = 0; i < inputs.length; i++) {
      const utxo = inputs[i]
      psbt.addInput({
        hash: utxo.txHash,
        index: utxo.outputIndex,
        witnessUtxo: {
          script: Buffer.from(utxo.script, 'hex'),
          value: utxo.value
        },
        redeemScript: payment.redeem.output,
        witnessScript: payment.redeem.redeem.output
      })
    }

    if (satoshiValue - fee < 0) {
      throw new Error('invalid outputs')
    }

    psbt.addOutput({
      value: satoshiValue - fee,
      address: to
    })

    psbt.signAllInputs(keyPair)
    return psbt.toBase64()
  }
}
