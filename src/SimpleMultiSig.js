// @flow
import Web3 from 'web3'
import { getCrypto } from './tokens'
import url from './url'
import uuidv1 from 'uuid/v1'
import type { BasicTokenUnit, Address } from './types/token.flow'
import type { TxEthereum } from './types/transfer.flow'
import SimpleMultiSigContractArtifacts from './contracts/SimpleMultiSig.json'
import env from './typedEnv'

export default class SimpleMultiSig {
  id: string
  contractInstance: Object
  web3: Object

  constructor () {
    // setup contract instance
    this.web3 = new Web3(new Web3.providers.HttpProvider(url.INFURA_API_URL))

    const NETWORK_ID = env.NODE_ENV === 'production' ? 1 : 4
    let contractAddr = SimpleMultiSigContractArtifacts.networks[NETWORK_ID].address
    this.contractInstance = new this.web3.eth.Contract(
      SimpleMultiSigContractArtifacts.abi,
      contractAddr
    )
  }

  setWalletId = (id: string) => {
    this.id = id
  }

  createWalletId = () => {
    // generate a wallet id
    // 32-byte buffer
    const buffer = Buffer.alloc(32)
    // first 16 bytes
    uuidv1(null, buffer, 0)
    // last 16 bytes
    uuidv1(null, buffer, 16)
    // convert to hex
    return '0x' + buffer.toString('hex')
  }

  getTransferToEscrowTxObj = (
    from: Address,
    to: Address, // escrow wallet address, generated offline
    transferAmount: BasicTokenUnit,
    cryptoType: string
  ): TxEthereum => {
    let data
    let value = '0'
    if (cryptoType === 'ethereum') {
      data = this.contractInstance.methods.createEthWallet(this.id, to).encodeABI()
      value = transferAmount
    } else {
      // erc20 tokens
      data = this.contractInstance.methods
        .createErc20Wallet(this.id, to, getCrypto(cryptoType).address, transferAmount)
        .encodeABI()
    }

    return {
      from: from,
      to: this.contractInstance.options.address,
      data: data,
      value: value
    }
  }
}
