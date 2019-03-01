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
import BtcLedger from '@ledgerhq/hw-app-btc'
import { address, networks } from 'bitcoinjs-lib'
import axios from 'axios'

const baseEtherPath = "44'/60'/0'/0"
const baseBtcPath = "49'/1'"
const networkId = networkIdMap[process.env.REACT_APP_NETWORK_NAME]
const infuraApi = `https://${process.env.REACT_APP_NETWORK_NAME}.infura.io/v3/${process.env.REACT_APP_INFURA_API_KEY}`
const blockcypherBaseUrl = 'https://api.blockcypher.com/v1/btc/test3'
const blockcypherToken = 'd4b651a932544a5087e1e470d4aad3bb'
const TX_FEE_PER_BYTE = 15 // satoshi

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
    const accountPath = baseEtherPath + `/${accountIndex}`
    const ethLedger = await this.getEtherLedger()
    const result = await ethLedger.getAddress(accountPath)
    return result.address
  }

  getBalance = async (accountIndex, cryptoType) => {
    let balance
    switch (cryptoType) {
      case 'ethereum':
        const address = await this.getEthAddress(accountIndex)
        const web3 = this.getWeb3()
        balance = await web3.eth.getBalance(address)
        break
      case 'bitcoin':
        balance = await this.getTotaBtclBalance(accountIndex)
        break
      default:
        balance = 0
    }

    return new BN(balance)
  }

  getBtcLedger = async () => {
    if (!this.btcLedger) {
      this.btcLedger = new BtcLedger(await this.getTransport())
    }
    return this.btcLedger
  }

  deviceConnected = async (cryptoType) => {
    try {
      return {
        connected: true,
        accounts: [{
          address: cryptoType === 'bitcoin' ? null : await this.getEthAddress(0),
          balance: {
            [cryptoType]: await this.getBalance(0, cryptoType)
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

  // BTC:
  getTotaBtclBalance = async (accountIndex) => {
    const btcLedger = await this.getBtcLedger()
    let i = 0
    let totalBalance = 0
    while (true) {
      const externalAddressPath = `${baseBtcPath}/${accountIndex}'/0/${i}`
      const externalAddress = (await btcLedger.getWalletPublicKey(externalAddressPath, false, true)).bitcoinAddress

      const rv = await axios.get(`${blockcypherBaseUrl}/addrs/${externalAddress}?token=${blockcypherToken}`)

      const { data } = rv
      if (data.n_tx === 0) {
        break
      }
      // check change address
      totalBalance += data.balance

      const internalAddressPath = `${baseBtcPath}/${accountIndex}'/1/${i}`
      const internalAddress = (await btcLedger.getWalletPublicKey(internalAddressPath, false, true)).bitcoinAddress

      const rv2 = await axios.get(`${blockcypherBaseUrl}/addrs/${internalAddress}?token=${blockcypherToken}`)
      totalBalance += rv2.data.balance

      i += 1
    }
    return totalBalance
  }

  getUtxosForAccounts = async (accounts) => {
    const utxos = await Promise.all(accounts.map(account => {
      return axios.get(`${blockcypherBaseUrl}/addrs/${account.bitcoinAddress}?unspentOnly=true&token=${blockcypherToken}`)
    }))
    return accounts.map((account, i) => ({
      account: account,
      utxos: utxos[i].data.txrefs
    }))
  }

  getUtxoDetails = async (txHash) => {
    const details = await axios.get(`${blockcypherBaseUrl}/txs/${txHash}?includeHex=true&token=${blockcypherToken}`)
    return details.data.hex
  }

  getAddressesForAmount = async (accountIndex, amount) => {
    const btcLedger = await this.getBtcLedger()
    let addresses = []
    let balance = 0
    let i = 0
    while (balance < amount) {
      const externalAddressPath = `${baseBtcPath}/${accountIndex}'/0/${i}`
      const externalAddress = (await btcLedger.getWalletPublicKey(externalAddressPath, false, true))
      const rv = await axios.get(`${blockcypherBaseUrl}/addrs/${externalAddress.bitcoinAddress}?token=${blockcypherToken}`)

      const { data } = rv
      if (data.n_tx === 0) {
        break
      }
      if (data.balance !== 0) {
        balance += data.balance
        addresses.push({
          ...externalAddress,
          path: externalAddressPath
        })
      }

      // search Change address
      const internalAddressPath = `${baseBtcPath}/${accountIndex}'/1/${i}`
      const internalAddress = (await btcLedger.getWalletPublicKey(internalAddressPath, false, true))
      const rv2 = await axios.get(`${blockcypherBaseUrl}/addrs/${internalAddress.bitcoinAddress}`)
      if (rv2.data.balance !== 0) {
        balance += rv2.data.balance
        addresses.push({
          ...internalAddress,
          path: internalAddressPath
        })
      }
      i += 1
    }
    return addresses
  }

  createNewBtcPaymentTransaction = async (accountIndex, to, amount) => {
    const btcLedger = await this.getBtcLedger()
    const changeAddressPath = "49'/1'/0'/1/0"

    const addresses = await this.getAddressesForAmount(accountIndex, amount)

    const utxosForAccounts = await this.getUtxosForAccounts(addresses)

    let inputs = []
    let associatedKeysets = []
    let inputValueTotal = 0
    for (let i = 0; i < utxosForAccounts.length; i++) {
      for (let j = 0; j < utxosForAccounts[i].utxos.length; j++) {
        const utxo = utxosForAccounts[i].utxos[j]
        const utxoDetails = await this.getUtxoDetails(utxo.tx_hash)

        const txObj = btcLedger.splitTransaction(utxoDetails, true)
        const input = [txObj, utxo.tx_output_n]
        inputs.push(input)
        associatedKeysets.push(utxosForAccounts[i].account.path)
        inputValueTotal += utxo.value
      }
    }
    let outputs = []
    let amountBuffer = Buffer.alloc(8, 0)
    amountBuffer.writeUIntLE(amount, 0, 8)
    const txOutput = {
      amount: amountBuffer,
      script: address.toOutputScript(to, networks.testnet)
    }
    outputs.push(txOutput)

    const change = inputValueTotal - amount - (TX_FEE_PER_BYTE * (138 + 64 * (inputs.length - 1))) // 138 bytes for 1 input, 64 bytes per additional input
    let changeBuffer = Buffer.alloc(8, 0)
    changeBuffer.writeUIntLE(change, 0, 8)
    const changeAddress = (await btcLedger.getWalletPublicKey(changeAddressPath, false, true)).bitcoinAddress
    const changeOutput = {
      amount: changeBuffer,
      script: address.toOutputScript(changeAddress, networks.testnet)
    }
    outputs.push(changeOutput)

    const outputScriptHex = btcLedger.serializeTransactionOutputs({ outputs: outputs }).toString('hex')
    const signedTxRaw = await btcLedger.createPaymentTransactionNew(inputs, associatedKeysets, changeAddressPath, outputScriptHex, undefined, undefined, true)

    return signedTxRaw
  }

  broadcastBtcRawTx = async (txRaw) => {
    const rv = await axios.post(
      `${blockcypherBaseUrl}/txs/push?token=${blockcypherToken}`,
      { tx: txRaw })
    return rv.data.tx.hash
  }
}

export default LedgerNanoS
