// @flow
import 'babel-polyfill'
import WebUsbTransport from '@ledgerhq/hw-transport-webusb' // for browser
import Ledger from '@ledgerhq/hw-app-eth'
import { Transaction as EthTx } from 'ethereumjs-tx'
import Web3 from 'web3'
import {
  getSignTransactionObject,
  getBufferFromHex,
  calculateChainIdFromV,
  networkIdMap
} from './utils'
import BtcLedger from '@ledgerhq/hw-app-btc'
import { address, networks } from 'bitcoinjs-lib'
import axios from 'axios'
import BN from 'bn.js'
import url from '../url'
import env from '../typedEnv'
import { getAccountXPub } from './addressFinderUtils'

const baseEtherPath = "44'/60'/0'/0"
const baseBtcPath = env.REACT_APP_BTC_PATH

let networkId: number = networkIdMap[env.REACT_APP_ETHEREUM_NETWORK]

class LedgerNanoS {
  static webUsbTransport: any
  ethLedger: any
  web3: any
  btcLedger: any

  getWebUsbTransport = async (): Promise<any> => {
    if (!LedgerNanoS.webUsbTransport || !LedgerNanoS.webUsbTransport.device || !LedgerNanoS.webUsbTransport.device.opened) {
      LedgerNanoS.webUsbTransport = await WebUsbTransport.create()
      LedgerNanoS.webUsbTransport.setExchangeTimeout(300000) // 5 mins
      setTimeout(async () => {
        await LedgerNanoS.webUsbTransport.close()
        LedgerNanoS.webUsbTransport = null
      }, 300000)
    }
    return LedgerNanoS.webUsbTransport
  }

  getEtherLedger = async (): Promise<any> => {
    this.ethLedger = new Ledger(await this.getWebUsbTransport())
    return this.ethLedger
  }

  getWeb3 = (): any => {
    if (!this.web3) {
      this.web3 = new Web3(new Web3.providers.HttpProvider(url.INFURA_API_URL))
    }
    return this.web3
  }

  getEthAddress = async (accountIndex: number): Promise<string> => {
    const accountPath = baseEtherPath + `/${accountIndex}`
    const ethLedger = await this.getEtherLedger()
    const result = await ethLedger.getAddress(accountPath)
    return result.address
  }

  getBtcAddresss = async (accountIndex: number): Promise<Object> => {
    const btcLedger = await this.getBtcLedger()
    const accountPath = `${baseBtcPath}/${accountIndex}'/0/0`
    const addr = await btcLedger.getWalletPublicKey(accountPath, false, true)
    const xpub = await getAccountXPub(btcLedger, baseBtcPath, `${accountIndex}'`, true)
    return { address: addr.bitcoinAddress, xpub: xpub }
  }

  getBtcLedger = async (): Promise<any> => {
    this.btcLedger = new BtcLedger(await this.getWebUsbTransport())
    return this.btcLedger
  }

  deviceConnected = async (cryptoType: string) => {
    try {
      if (cryptoType !== 'bitcoin') {
        await this.getEthAddress(0)
      } else {
        await this.getBtcAddresss(0)
      }
      return {
        connected: true,
        network: cryptoType === 'bitcoin' ? process.env.REACT_APP_BTC_NETWORK : networkId
      }
    } catch (e) {
      console.log(e)
      return {
        connected: false
      }
    }
  }

  /**
   * @param {number}      accountIndex        Index of sender account.
   * @param {string}      receipientAddr      Address of receipient.
   * @param {number}      amount              Amount of ether, in 'wei'.
   * @param {object}      options             Options of the transaction (i.e. gasLimit & gasPrice)
   */
  signSendEther = async (accountIndex: number, receipientAddr: string, amount: string, ...options: Array<any>) => {
    const accountPath = baseEtherPath + `/${accountIndex}`
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

    if (gasLimit === undefined) {
      gasLimit = gasNeeded
    } else if (new BN(gasNeeded).gt(new BN(gasLimit))) {
      console.error('Insufficient gas.')
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

  signSendTransaction = async (txObj: any) => {
    const web3 = this.getWeb3()
    const ethLedger = await this.getEtherLedger()
    const accountIndex = 0 // default first account
    const accountPath = baseEtherPath + `/${accountIndex}`

    txObj.nonce = txObj.nonce || await web3.eth.getTransactionCount(txObj.from)
    txObj.gas = web3.utils.numberToHex(txObj.gas)
    txObj.gasPrice = web3.utils.numberToHex(txObj.gasPrice)
    txObj.value = web3.utils.numberToHex(txObj.value)
    txObj.v = web3.utils.numberToHex(4)
    txObj.r = web3.utils.numberToHex(0)
    txObj.s = web3.utils.numberToHex(0)

    let tx = new EthTx(txObj, { chain: env.REACT_APP_ETHEREUM_NETWORK })

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

  /**
   * @param {number}                        accountIndex        Index of sender account.
   * @param {string}                        contractAddress     Target contract address.
   * @param {object}                        contractAbi         Contract ABI.
   * @param {string}                        methodName          Name of the method being called.
   * @param {[param1[, param2[, ...]]]}     params              Paramaters for the contract. The last param is a optional object contains gasPrice and gasLimit.
   */
  signSendTrasactionContract = async (accountIndex: number, contractAddress: string, contractAbi: Object, methodName: string, ...params: Array<any>) => {
    const accountPath = baseEtherPath + `/${accountIndex}`
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
    if (['undefined', 'object'].indexOf(typeof params[params.length - 1]) >= 0 && params.length === 1) {
      console.log('no param')
    } else {
      params.forEach((item) => {
        if (['undefined', 'object'].indexOf(typeof item) < 0) {
          functionParams.push(item)
        }
      })
    }

    const targetContract = new web3.eth.Contract(contractAbi, contractAddress)
    const data = targetContract.methods[methodName](...functionParams).encodeABI()
    const gasNeeded = await targetContract.methods[methodName](...functionParams).estimateGas({ from: address })

    if (gasLimit === undefined) {
      gasLimit = gasNeeded
    } else if (new BN(gasNeeded).gt(new BN(gasLimit))) {
      console.error('Insufficient gas.')
    }

    let rawTx = {
      from: address,
      nonce: txCount + 1,
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

  callMethod = async (contractAddress: string, contractAbi: Object, methodName: string, ...params: Array<any>) => {
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

  getUtxoDetails = async (txHash: string) => {
    const details = await axios.get(`${url.LEDGER_API_URL}/transactions/${txHash}/hex`)
    return details.data[0].hex
  }

  createNewBtcPaymentTransaction = async (inputs: Array<Object>, to: string, amount: number, fee: number, changeIndex: number) => {
    const btcLedger = await this.getBtcLedger()
    const changeAddressPath = `${baseBtcPath}/0'/1/${changeIndex}`

    let associatedKeysets = []
    let finalInputs = []
    let inputValueTotal = 0
    for (let i = 0; i < inputs.length; i++) {
      const utxo = inputs[i]
      const utxoDetails = await this.getUtxoDetails(utxo.txHash)

      const txObj = btcLedger.splitTransaction(utxoDetails, true)
      const input = [txObj, utxo.outputIndex]
      finalInputs.push(input)
      associatedKeysets.push(utxo.keyPath)
      inputValueTotal += utxo.value
    }
    let outputs = []
    let amountBuffer = Buffer.alloc(8, 0)
    amountBuffer.writeUIntLE(amount, 0, 8)
    const txOutput = {
      amount: amountBuffer,
      script: address.toOutputScript(to, networks[env.REACT_APP_BITCOIN_JS_LIB_NETWORK])
    }
    outputs.push(txOutput)
    const change = inputValueTotal - amount - fee // 138 bytes for 1 input, 64 bytes per additional input

    let changeBuffer = Buffer.alloc(8, 0)
    changeBuffer.writeUIntLE(change, 0, 8)
    const changeAddress = (await btcLedger.getWalletPublicKey(changeAddressPath, false, true)).bitcoinAddress
    const changeOutput = {
      amount: changeBuffer,
      script: address.toOutputScript(changeAddress, networks[env.REACT_APP_BITCOIN_JS_LIB_NETWORK])
    }
    outputs.push(changeOutput)

    const outputScriptHex = btcLedger.serializeTransactionOutputs({ outputs: outputs }).toString('hex')
    const signedTxRaw = await btcLedger.createPaymentTransactionNew(
      finalInputs,
      associatedKeysets,
      changeAddressPath,
      outputScriptHex,
      undefined,
      undefined,
      true
    )

    return signedTxRaw
  }

  broadcastBtcRawTx = async (txRaw: string) => {
    const rv = await axios.post(
      `${url.LEDGER_API_URL}/transactions/send`,
      { tx: txRaw })
    return rv.data.result
  }
}

export default LedgerNanoS
