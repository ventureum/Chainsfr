// @flow
import 'babel-polyfill'
import U2FTransport from '@ledgerhq/hw-transport-u2f' // for browser
import WebUsbTransport from '@ledgerhq/hw-transport-webusb' // for browser
import Ledger from '@ledgerhq/hw-app-eth'
import EthTx from 'ethereumjs-tx'
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
import moment from 'moment'
import ERC20 from '../ERC20'
import BN from 'bn.js'

const baseEtherPath = "44'/60'/0'/0"
const baseBtcPath = "49'/1'"

let networkId: number = 1
if (process.env.REACT_APP_NETWORK_NAME) {
  networkId = networkIdMap[process.env.REACT_APP_NETWORK_NAME]
}

let infuraApi: string = ''
if (process.env.REACT_APP_NETWORK_NAME && process.env.REACT_APP_INFURA_API_KEY) {
  infuraApi = `https://${process.env.REACT_APP_NETWORK_NAME}.infura.io/v3/${process.env.REACT_APP_INFURA_API_KEY}`
}
const blockcypherBaseUrl = process.env.REACT_APP_BLOCKCYPHER_API_URL

let ledgerApiUrl :string = ''
if (process.env.REACT_APP_LEDGER_API_URL) {
  ledgerApiUrl = process.env.REACT_APP_LEDGER_API_URL
}

class LedgerNanoS {
  u2fTransport: any
  webUsbTransport: any
  ethLedger: any
  web3:any
  btcLedger: any

  getU2FTransport = async (): Promise<any> => {
    if (!this.u2fTransport) {
      this.u2fTransport = await U2FTransport.create()
    }
    return this.u2fTransport
  }

  getWebUsbTransport = async (): Promise<any> => {
    if (!this.u2fTransport) {
      this.webUsbTransport = await WebUsbTransport.create()
    }
    return this.webUsbTransport
  }

  getEtherLedger = async (): Promise<any> => {
    if (!this.ethLedger) {
      this.ethLedger = new Ledger(await this.getWebUsbTransport())
    }
    return this.ethLedger
  }

  getWeb3 = (): any => {
    if (!this.web3) {
      this.web3 = new Web3(new Web3.providers.HttpProvider(infuraApi))
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
    return addr
  }

  getBtcLedger = async (): Promise<any> => {
    if (!this.btcLedger) {
      this.btcLedger = new BtcLedger(await this.getU2FTransport())
    }
    return this.btcLedger
  }

  syncAccountBaseOnCryptoType = async (cryptoType: string, accountIndex: number = 0, progress: Function): Promise<Object> => {
    let address: string
    let web3: any
    let balance: string
    switch (cryptoType) {
      case 'ethereum':
        address = await this.getEthAddress(accountIndex)
        web3 = this.getWeb3()
        balance = await web3.eth.getBalance(address)
        return {
          [cryptoType]: {
            [accountIndex]: {
              address: address,
              balance: balance
            }
          }
        }
      case 'dai':
        address = await this.getEthAddress(accountIndex)
        return {
          [cryptoType]: {
            [accountIndex]: {
              address: address,
              balance: await ERC20.getBalance(address, cryptoType)
            }
          }
        }
      case 'bitcoin':
        return {
          [cryptoType]: {
            [accountIndex]: await this.syncBtcAccountInfo(accountIndex, progress)
          }
        }
      default:
        throw new Error('Ledger Wallet received invalid cryptoType')
    }
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
      return null
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

  /**
   * @param {number}                        accountIndex        Index of sender account.
   * @param {string}                        contractAddress     Target contract address.
   * @param {object}                        contractAbi         Contract ABI.
   * @param {string}                        methodName          Name of the method being called.
   * @param {[param1[, param2[, ...]]]}     params              Paramaters for the contract. The last param is a optional object contains gasPrice and gasLimit.
   */
  signSendTrasaction = async (accountIndex: number, contractAddress: string, contractAbi: Object, methodName: string, ...params: Array<any>) => {
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
    const details = await axios.get(`${ledgerApiUrl}/transactions/${txHash}/hex`)
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
      script: address.toOutputScript(to, networks.testnet)
    }
    outputs.push(txOutput)
    const change = inputValueTotal - amount - fee // 138 bytes for 1 input, 64 bytes per additional input

    let changeBuffer = Buffer.alloc(8, 0)
    changeBuffer.writeUIntLE(change, 0, 8)
    const changeAddress = (await btcLedger.getWalletPublicKey(changeAddressPath, false, true)).bitcoinAddress
    const changeOutput = {
      amount: changeBuffer,
      script: address.toOutputScript(changeAddress, networks.testnet)
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
      `${ledgerApiUrl}/transactions/send`,
      { tx: txRaw })
    return rv.data.result
  }

  getUtxosFromTxs = (txs: Array<Object>, address: string) => {
    let utxos = []
    let spent = {}
    txs.forEach(tx => {
      tx.inputs.forEach(input => {
        if (input.address === address) {
          if (!spent[input.output_hash]) {
            spent[input.output_hash] = {}
          }
          spent[input.output_hash][input.output_index] = true
        }
      })
    })
    txs.forEach(tx => {
      tx.outputs.forEach(output => {
        if (output.address === address) {
          if (!spent[tx.hash]) {
            spent[tx.hash] = {}
          }
          if (!spent[tx.hash][output.output_index]) {
            utxos.push({
              txHash: tx.hash,
              outputIndex: output.output_index,
              value: output.value
            })
          }
        }
      })
    })

    return utxos
  }

  syncBtcAccountInfo = async (accountIndex: number, progress: Function) => {
    const btcLedger = await this.getBtcLedger()
    let i = 0
    let totalBalance = 0
    let addresses = []
    let gap = 0
    let utxos = []
    let changeIndex = 0
    let addressIndex = 0
    while (gap < 5) {
      let address
      const externalAddressPath = `${baseBtcPath}/${accountIndex}'/0/${i}`
      const external = await btcLedger.getWalletPublicKey(externalAddressPath, false, true)
      const externalAddress = external.bitcoinAddress

      const externalAddressData = (await axios.get(`${ledgerApiUrl}/addresses/${externalAddress}/transactions?noToken=true&truncated=true`)).data
      if (externalAddressData.txs.length === 0) {
        gap += 1
      } else {
        addressIndex = i
        gap = 0
        utxos = this.getUtxosFromTxs(externalAddressData.txs, externalAddress)
        if (utxos.length !== 0) {
          let value = utxos.reduce((accu, utxo) => {
            return accu + utxo.value
          }, 0)
          totalBalance += value
          address = {
            path: externalAddressPath,
            publicKeyInfo: external,
            utxos: utxos
          }
          addresses.push(address)
        }
      }
      // check change address
      const internalAddressPath = `${baseBtcPath}/${accountIndex}'/1/${i}`
      const internal = await btcLedger.getWalletPublicKey(internalAddressPath, false, true)
      const internalAddress = internal.bitcoinAddress
      const internalAddressData = (await axios.get(`${ledgerApiUrl}/addresses/${internalAddress}/transactions?noToken=true&truncated=true`)).data
      if (internalAddressData.txs.length !== 0) {
        changeIndex = i
        gap = 0
        utxos = this.getUtxosFromTxs(internalAddressData.txs, internalAddress)
        if (utxos.length !== 0) {
          let value = utxos.reduce((accu, utxo) => {
            return accu + utxo.value
          }, 0)
          totalBalance += value
          address = {
            path: internalAddressPath,
            publicKeyInfo: internal,
            utxos: utxos
          }
          addresses.push(address)
        }
      }

      i += 1
      if (progress) {
        progress(i)
      }
    }
    let accountData = {
      balance: totalBalance.toString(),
      nextAddressIndex: addressIndex + 1,
      nextChangeIndex: changeIndex + 1,
      addresses,
      lastBlockHeight: await this.getLastBlockHeight(),
      lastUpdate: moment().unix()
    }
    return accountData
  }

  getLastBlockHeight = async () => {
    const rv = (await axios.get(blockcypherBaseUrl)).data
    return rv.height
  }

  // Function to estimate Tx size
  // Referrenced from https://github.com/LedgerHQ/ledger-wallet-webtool/blob/094d3741527e181a626d929d56ab4a515403e4a0/src/TransactionUtils.js#L10
  estimateTransactionSize = (
    inputsCount: number,
    outputsCount: number,
    handleSegwit: boolean
  ) => {
    var maxNoWitness,
      maxSize,
      maxWitness,
      minNoWitness,
      minSize,
      minWitness,
      varintLength
    if (inputsCount < 0xfd) {
      varintLength = 1
    } else if (inputsCount < 0xffff) {
      varintLength = 3
    } else {
      varintLength = 5
    }
    if (handleSegwit) {
      minNoWitness =
        varintLength + 4 + 2 + 59 * inputsCount + 1 + 31 * outputsCount + 4
      maxNoWitness =
        varintLength + 4 + 2 + 59 * inputsCount + 1 + 33 * outputsCount + 4
      minWitness =
        varintLength +
        4 +
        2 +
        59 * inputsCount +
        1 +
        31 * outputsCount +
        4 +
        106 * inputsCount
      maxWitness =
        varintLength +
        4 +
        2 +
        59 * inputsCount +
        1 +
        33 * outputsCount +
        4 +
        108 * inputsCount
      minSize = (minNoWitness * 3 + minWitness) / 4
      maxSize = (maxNoWitness * 3 + maxWitness) / 4
    } else {
      minSize = varintLength + 4 + 146 * inputsCount + 1 + 31 * outputsCount + 4
      maxSize = varintLength + 4 + 148 * inputsCount + 1 + 33 * outputsCount + 4
    }
    return {
      min: minSize,
      max: maxSize
    }
  }
}

export default LedgerNanoS
