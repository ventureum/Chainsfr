// @flow
import { getCrypto } from './tokens'
import url from './url'
import uuidv1 from 'uuid/v1'
import { ethers } from 'ethers'
import API from './apis'
import type { BasicTokenUnit, Address } from './types/token.flow'
import type { TxEthereum, Signature } from './types/transfer.flow'
import SimpleMultiSigContractArtifacts from './contracts/SimpleMultiSig.json'
import env from './typedEnv'
import WalletUtils from './wallets/utils'

class SimpleMultiSig {
  id: ?string
  extraData: any
  contractInstance: Object
  web3: Object

  constructor (extraData?: { walletId?: string, transferId?: string, receivingId?: string }) {
    // set walletId if available
    this.extraData = extraData
    if (extraData && extraData.walletId) {
      this.id = extraData.walletId
    } else {
      this.id = this.createWalletId()
    }

    // setup contract instance\
    const Web3 = require('web3')
    this.web3 = new Web3(new Web3.providers.HttpProvider(url.INFURA_API_URL))

    const NETWORK_ID = WalletUtils.networkIdMap[env.REACT_APP_ETHEREUM_NETWORK]
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

  sendFromEscrow = async (privateKey: string, destinationAddress: string): Promise<Signature> => {
    const { transferId, receivingId } = this.extraData
    let signingData
    if (transferId) {
      signingData = await API.getMultiSigSigningData({
        transferId: transferId,
        destinationAddress: destinationAddress
      })
    } else if (receivingId) {
      signingData = await API.getMultiSigSigningData({
        receivingId: receivingId,
        destinationAddress: destinationAddress
      })
    } else {
      throw new Error('Either transferId or receivingId must be non-null value')
    }
    // sign data with escrow's privateKey
    // return clientSig
    const wallet = new ethers.Wallet(privateKey)
    return ethers.utils.joinSignature(
      await wallet.signingKey.signDigest(ethers.utils.arrayify(signingData.data))
    )
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

export default SimpleMultiSig