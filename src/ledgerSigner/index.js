import 'babel-polyfill'
import Transport from '@ledgerhq/hw-transport-u2f' // for browser
import Ledger from '@ledgerhq/hw-app-eth'
import EthTx from 'ethereumjs-tx'
import Web3 from 'web3'
import BN from 'bn.js'
import {
  getSignTransactionObject,
  getBufferFromHex,
  calculateChainIdFromV,
  networkIdMap
} from './utils'

const basePath = "44'/60'/0'/0"
const networkId = networkIdMap[process.env.REACT_APP_NETWORK_NAME]
const infuraApi = `https://${process.env.REACT_APP_NETWORK_NAME}.infura.io/v3/${process.env.REACT_APP_INFURA_API_KEY}`

class LedgerNanoS {
  static transport
  static ethLedger
  static web3

  getTransport = async () => {
    if (!this.transport) {
      this.transport = await Transport.create()
    }
    return this.transport
  }

  getEtherLedger = async () => {
    if (!this.ethLedger) {
      this.ethLedger = new Ledger(await this.getTransport())
    }
    return this.ethLedger
  }

  getWeb3 = () => {
    if (!this.web3) {
      this.web3 = new Web3(new Web3.providers.HttpProvider(infuraApi))
    }
    return this.web3
  }

  getEthAddress = async (accountIndex) => {
    const accountPath = basePath + `/${accountIndex}`
    const ethLedger = await this.getEtherLedger()
    const result = await ethLedger.getAddress(accountPath)
    return result.address
  }

  getBalance = async (accountIndex) => {
    const address = await this.getEthAddress(accountIndex)
    const web3 = this.getWeb3()
    const balance = await web3.eth.getBalance(address)
    return new BN(balance)
  }

  deviceConnected = async () => {
    try {
      return {
        connected: true,
        accounts: [{
          address: await this.getEthAddress(0),
          balance: {
            ethereum: await this.getBalance(0)
          }
        }],
        network: networkIdMap[process.env.REACT_APP_NETWORK_NAME]
      }
    } catch (e) {
      console.log(e)
      return null
    }
  }

  /**
   * @param {number}      accountIndex        Index of sender account.
   * @param {string}      receipientAddr      Address of receipient.
   * @param {number}      amount              Amount of ether, in 'wei'.
   * @param {object}      options             Options of the transaction (i.e. gasLimit & gasPrice)
   */
  signSendEther = async (accountIndex, receipientAddr, amount, ...options) => {
    const accountPath = basePath + `/${accountIndex}`
    const web3 = this.getWeb3()
    const ethLedger = await this.getEtherLedger()
    const address = await this.getEthAddress(accountIndex)
    const txCount = await web3.eth.getTransactionCount(address)

    let gasPrice = web3.utils.toWei('20', 'Gwei') // default
    let gasLimit

    if (options[options.length - 1] && options[options.length - 1].gasPrice) {
      gasPrice = options[options.length - 1].gasPrice
    }
    if (options[options.length - 1] && options[options.length - 1].gasLimit) {
      gasLimit = options[options.length - 1].gasLimit
    }

    let rawTx = {
      from: address,
      nonce: txCount,
      gasPrice: web3.utils.numberToHex(gasPrice),
      to: receipientAddr,
      value: web3.utils.numberToHex(amount),
      data: ''
    }
    const gasNeeded = await web3.eth.estimateGas(rawTx)

    if (gasNeeded >= gasLimit) {
      console.error('Insufficient gas.')
    } else if (gasLimit === undefined) {
      gasLimit = gasNeeded
    }

    rawTx = {
      ...rawTx,
      gas: web3.utils.numberToHex(gasLimit)
    }

    let tx = new EthTx(rawTx)
    tx.raw[6] = Buffer.from([networkId])
    tx.raw[7] = Buffer.from([])
    tx.raw[8] = Buffer.from([])

    const rv = await ethLedger.signTransaction(
      accountPath,
      tx.serialize().toString('hex')
    )
    tx.v = getBufferFromHex(rv.v)
    tx.r = getBufferFromHex(rv.r)
    tx.s = getBufferFromHex(rv.s)

    const signedChainId = calculateChainIdFromV(tx.v)
    if (signedChainId !== networkId) {
      console.error(
        'Invalid networkId signature returned. Expected: ' +
        networkId +
        ', Got: ' +
        signedChainId,
        'InvalidNetworkId'
      )
    }

    const signedTransactionObject = getSignTransactionObject(tx)

    return signedTransactionObject
    // return web3.eth.sendSignedTransaction(signedTransactionObject.rawTransaction)
  }

  /**
   * @param {number}                        accountIndex        Index of sender account.
   * @param {string}                        contractAddress     Target contract address.
   * @param {object}                        contractAbi         Contract ABI.
   * @param {string}                        methodName          Name of the method being called.
   * @param {[param1[, param2[, ...]]]}     params              Paramaters for the contract. The last param is a optional object contains gasPrice and gasLimit.
   */
  signSendTrasaction = async (accountIndex, contractAddress, contractAbi, methodName, ...params) => {
    const accountPath = basePath + `/${accountIndex}`
    const web3 = this.getWeb3()
    const ethLedger = await this.getEtherLedger()
    const address = await this.getEthAddress(accountIndex)
    const txCount = await web3.eth.getTransactionCount(address)

    let gasPrice = web3.utils.toWei('20', 'Gwei') // default
    let gasLimit

    if (params[params.length - 1] && params[params.length - 1].gasPrice) {
      gasPrice = params[params.length - 1].gasPrice
    }
    if (params[params.length - 1] && params[params.length - 1].gasLimit) {
      gasLimit = params[params.length - 1].gasLimit
    }

    let functionParams = []
    if (['undefined', 'object'].indexOf(typeof params[params.length - 1]) >= 0) {
      console.log('no param')
    } else {
      params.forEach((item) => {
        if (['undefined', 'object'].indexOf(typeof item)) {
          functionParams.push(item)
        }
      })
    }
    const targetContract = new web3.eth.Contract(contractAbi, contractAddress)
    const data = targetContract.methods[methodName](...functionParams).encodeABI()
    const gasNeeded = await targetContract.methods[methodName](...functionParams).estimateGas({ from: address })

    if (gasNeeded >= gasLimit) {
      console.error('Insufficient gas set for transaction.')
    } else if (gasLimit === undefined) {
      gasLimit = gasNeeded
    }

    let rawTx = {
      from: address,
      nonce: txCount,
      gasPrice: web3.utils.numberToHex(gasPrice),
      gas: web3.utils.numberToHex(gasLimit),
      to: contractAddress,
      value: web3.utils.numberToHex(0),
      data: data
    }

    let tx = new EthTx(rawTx)
    tx.raw[6] = Buffer.from([networkId])
    tx.raw[7] = Buffer.from([])
    tx.raw[8] = Buffer.from([])

    const rv = await ethLedger.signTransaction(
      accountPath,
      tx.serialize().toString('hex')
    )
    tx.v = getBufferFromHex(rv.v)
    tx.r = getBufferFromHex(rv.r)
    tx.s = getBufferFromHex(rv.s)

    const signedChainId = calculateChainIdFromV(tx.v)
    if (signedChainId !== networkId) {
      console.error(
        'Invalid networkId signature returned. Expected: ' +
        networkId +
        ', Got: ' +
        signedChainId,
        'InvalidNetworkId'
      )
    }

    const signedTransactionObject = getSignTransactionObject(tx)
    return signedTransactionObject
  }

  callMethod = async (contractAddress, contractAbi, methodName, ...params) => {
    let functionParams = []
    if (['undefined', 'object'].indexOf(typeof params[params.length - 1]) >= 0) {
      console.log('no param')
    } else {
      params.forEach((item) => {
        if (['undefined', 'object'].indexOf(typeof item)) {
          functionParams.push(item)
        }
      })
    }
    const web3 = this.getWeb3()
    const targetContract = new web3.eth.Contract(contractAbi, contractAddress)
    const rv = await targetContract.methods[methodName](...functionParams).call()
    return rv
  }
}

export default LedgerNanoS
