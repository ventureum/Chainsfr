// @flow
import Web3 from 'web3'
import { getCrypto } from './tokens'
import url from './url'
import uuidv1 from 'uuid/v1'
import { ethers } from 'ethers'
import API from './apis'
import type { BasicTokenUnit, Address } from './types/token.flow'
import type { TxEthereum } from './types/transfer.flow'
import SimpleMultiSigContractArtifacts from './contracts/SimpleMultiSig.json'
import env from './typedEnv'

export default class SimpleMultiSig {
  id: ?string
  extraData: any
  contractInstance: Object
  web3: Object

  constructor (extraData?: {
    walletId?: string,
    transferId?: string,
    receivingId?: string,
    cancelMessage?: string,
    receiveMessage?: string
  }) {
    // set walletId if available
    this.extraData = extraData
    if (extraData && extraData.walletId) {
      this.id = extraData.walletId
    } else {
      this.id = this.createWalletId()
    }

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

  receive = async (privateKey: string, destinationAddress: string) => {
    const { receivingId, receiveMessage } = this.extraData
    if (!receivingId) throw new Error('Missing receivingId for receiving')
    if (!receiveMessage) throw new Error('Missing receiveMessage for receiving')

    // fetch signing data
    let signingData = await API.getMultiSigSigningData({
      receivingId: receivingId,
      destinationAddress: destinationAddress
    })

    // sign data with escrow's privateKey
    const wallet = new ethers.Wallet(privateKey)
    let clientSig = ethers.utils.joinSignature(
      await wallet.signingKey.signDigest(ethers.utils.arrayify(signingData.data))
    )

    // transfer sig back to server
    return API.accept({
      receivingId: receivingId,
      receiveMessage: receiveMessage,
      clientSig: clientSig
    })
  }

  cancel = async (privateKey: string, destinationAddress: string) => {
    const { transferId, cancelMessage } = this.extraData
    if (!transferId) throw new Error('Missing transferId for cancellation')
    if (!cancelMessage) throw new Error('Missing cancelMessage for cancellation')

    // fetch signing data
    let signingData = await API.getMultiSigSigningData({
      transferId: transferId,
      destinationAddress: destinationAddress
    })

    // sign data with escrow's privateKey
    const wallet = new ethers.Wallet(privateKey)
    let clientSig = ethers.utils.joinSignature(
      await wallet.signingKey.signDigest(ethers.utils.arrayify(signingData.data))
    )

    // transfer sig back to server
    return API.cancel({
      transferId: transferId,
      cancelMessage: cancelMessage,
      clientSig: clientSig
    })
  }

  sendFromEscrow = async (privateKey: string, destinationAddress: string) => {
    const { transferId, receivingId } = this.extraData
    if (transferId) {
      return this.cancel(privateKey, destinationAddress)
    } else if (receivingId) {
      return this.receive(privateKey, destinationAddress)
    } else {
      throw new Error('Either transferId or receivingId must be non-null value')
    }
  }

  getSendToEscrowTxObj = (
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
