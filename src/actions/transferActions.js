// @flow
import API from '../apis'
import Web3 from 'web3'
import LedgerNanoS from '../ledgerSigner'
import ERC20_ABI from '../contracts/ERC20.json'
import utils from '../utils'
import BN from 'bn.js'
import { goToStep } from './navigationActions'
import { saveTempSendFile, saveSendFile, getAllTransfers } from '../drive.js'
import moment from 'moment'
import { Base64 } from 'js-base64'
import ERC20 from '../ERC20'
import { getCrypto, getCryptoDecimals } from '../tokens'
import bitcore from 'bitcore-lib'
import wif from 'wif'
import bip38 from 'bip38'
import axios from 'axios'
import env from '../typedEnv'

type Utxos = Array<{
  value: number,
  script: string,
  txid: string,
  outputIndex: number,
  txHash: string
}>

type AddressPool = Array<{
  path: string,
  utxos: Utxos
}>

const WIF_VERSION = {
  'testnet': 0xEF,
  'mainnet': 0x80
}
const ledgerNanoS = new LedgerNanoS()
const infuraApi = `https://${env.REACT_APP_NETWORK_NAME}.infura.io/v3/${env.REACT_APP_INFURA_API_KEY}`
const ledgerApiUrl = env.REACT_APP_LEDGER_API_URL

function web3EthSendTransactionPromise (web3Function: Function, txObj: Object) {
  return new Promise((resolve, reject) => {
    web3Function(txObj)
      .on('transactionHash', (hash) => resolve(hash))
      .on('error', (error) => reject(error))
  })
}

async function getFirstFromAddress (txHash: string) {
  const rv = (await axios.get(`${ledgerApiUrl}/transactions/${txHash}`)).data
  const address = rv[0].inputs[0].address
  return address
}

async function _getTxCost (
  txRequest: {
    cryptoType: string,
    transferAmount: string,
    txFeePerByte: number
  },
  addressPool: Array<Object>
) {
  let { cryptoType, transferAmount, txFeePerByte = 15 } = txRequest

  const mockFrom = '0x0f3fe948d25ddf2f7e8212145cef84ac6f20d904'
  const mockTo = '0x0f3fe948d25ddf2f7e8212145cef84ac6f20d905'
  const mockNumTokens = '1000'

  const precision = (new BN(10).pow(new BN(12)))

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
    let txCostERC20 = await utils.getGasCost(ERC20.getTransferTxObj(mockFrom, mockTo, mockNumTokens, cryptoType))

    // amount of eth to be transfered to the escrow wallet
    // this will be spent as tx fees for the next token transfer (from escrow wallet)
    // otherwise, the tokens in the escrow wallet cannot be transfered out
    // we use the current estimation to calculate amount of ETH to be transfered
    let ethTransfer = txCostERC20.costInBasicUnit

    let costInBasicUnit = new BN(txCostEth.costInBasicUnit)
      .add(new BN(txCostERC20.costInBasicUnit))
      .add(new BN(ethTransfer))

    let base = new BN(10).pow(new BN(getCryptoDecimals(cryptoType)))

    return {
      // use the current estimated price
      price: txCostERC20.price,
      // eth transfer gas + erc20 transfer gas
      gas: (new BN(txCostEth.gas).add(new BN(txCostERC20.gas))).toString(),
      // estimate total cost = eth to be transfered + eth transfer fee + erc20 transfer fee
      costInBasicUnit: costInBasicUnit.toString(),
      costInStandardUnit: ((new BN(costInBasicUnit).mul(precision).div(new BN(base))).toNumber() / parseFloat(precision.toNumber())).toString(),
      // subtotal tx cost
      // this is used for submitTx()
      costByType: { txCostEth, txCostERC20, ethTransfer }
    }
  } else if (cryptoType === 'bitcoin') {
    const { size, fee } = collectUtxos(addressPool, transferAmount, txFeePerByte)
    let price = txFeePerByte.toString()
    let gas = size.toString()
    let costInBasicUnit = fee
    const base = new BN(100000000)
    let costInStandardUnit = (parseFloat((new BN(costInBasicUnit).mul(precision).div(new BN(base))).toString()) / precision).toString()
    return { price, gas, costInBasicUnit, costInStandardUnit }
  } else {
    throw new Error('Invalid walletType/cryptoType')
  }
}

function collectUtxos (
  addressPool: AddressPool = [],
  transferAmount: string = '0',
  txFeePerByte: number
) {
  let utxosCollected = []
  let valueCollected = new BN(0)
  let i = 0
  let size = 0
  while (i < addressPool.length) {
    let utxos = addressPool[i].utxos
    for (let j = 0; j < utxos.length; j++) {
      const utxo = utxos[j]
      utxosCollected.push({
        ...utxo,
        keyPath: addressPool[i].path
      })
      size = ledgerNanoS.estimateTransactionSize(utxosCollected.length, 2, true).max
      let fee = (new BN(size)).mul(new BN(txFeePerByte))
      valueCollected = valueCollected.add(new BN(utxo.value))
      if (valueCollected.gte(new BN(transferAmount).add(fee))) {
        return {
          fee: fee.toString(),
          size,
          utxosCollected
        }
      }
    }
    i += 1
  }
  throw new Error('Transfer amount greater and fee than utxo values.')
}

async function _submitTx (
  txRequest: {
    fromWallet: Object,
    walletType: string,
    cryptoType: string,
    transferAmount: string,
    password: string,
    sender: string,
    destination: string,
    txCost: Object,
    txFeePerByte: ?number,
  },
  accountInfo: Object
) {
  let { fromWallet, walletType, cryptoType, transferAmount, password, sender, destination, txCost, txFeePerByte } = txRequest
  let escrow: Object = {}
  let encryptedEscrow: string
  let sendTxHash: string = ''
  let sendTxFeeTxHash: string
  if (!window._web3) {
    window._web3 = new Web3(new Web3.providers.HttpProvider(infuraApi))
  }
  if (['ethereum', 'dai'].includes(cryptoType)) {
    // ethereum based coins
    // step 1: create an escrow wallet
    escrow = window._web3.eth.accounts.create()

    // step 2: encrypt the escrow wallet with password provided and the destination email address
    encryptedEscrow = JSON.stringify(window._web3.eth.accounts.encrypt(escrow.privateKey, password + destination))
  } else if (cryptoType === 'bitcoin') {
    escrow = new bitcore.PrivateKey(undefined, env.REACT_APP_BTC_NETWORK)
    let privateKeyWif = escrow.toWIF()
    let decoded = wif.decode(privateKeyWif, WIF_VERSION[env.REACT_APP_BTC_NETWORK])

    encryptedEscrow = bip38.encrypt(decoded.privateKey, decoded.compressed, password + destination)
  }

  // before sending out a TX, store a backup of encrypted escrow wallet in user's drive
  await saveTempSendFile({
    sender: sender,
    destination: destination,
    transferAmount: transferAmount,
    cryptoType: cryptoType,
    data: Base64.encode(encryptedEscrow),
    password: Base64.encode(password),
    tempTimestamp: moment().unix()
  })

  // step 4: transfer funds from [fromWallet] to the newly created escrow wallet
  if (walletType === 'metamask') {
    var txObj = null
    if (cryptoType === 'ethereum') {
      let wei = window._web3.utils.toWei(transferAmount.toString(), 'ether')
      txObj = {
        from: fromWallet.crypto[cryptoType][0].address,
        to: escrow.address,
        value: wei
      }
    } else if (cryptoType === 'dai') {
      // we need to transfer a small amount of eth to escrow to pay for
      // the next transfer's tx fees
      sendTxFeeTxHash = await web3EthSendTransactionPromise(window._web3.eth.sendTransaction, {
        from: fromWallet.crypto[cryptoType][0].address,
        to: escrow.address,
        value: txCost.costByType.ethTransfer, // estimated gas cost for the next tx
        gas: txCost.costByType.txCostEth.gas,
        gasPrice: txCost.costByType.txCostEth.price
      })

      // next, we send tokens to the escrow address
      let amountInBasicUnit = window._web3.utils.toWei(transferAmount.toString(), 'ether')
      txObj = await ERC20.getTransferTxObj(fromWallet.crypto[cryptoType][0].address, escrow.address, amountInBasicUnit, cryptoType)

      // update tx fees
      txObj.gas = txCost.costByType.txCostERC20.gas
      txObj.gasPrice = txCost.costByType.txCostERC20.price
    }

    sendTxHash = await web3EthSendTransactionPromise(window._web3.eth.sendTransaction, txObj)
  } else if (walletType === 'ledger') {
    if (cryptoType === 'ethereum') {
      const _web3 = new Web3(new Web3.providers.HttpProvider(infuraApi))
      const amountInWei = _web3.utils.toWei(transferAmount.toString(), 'ether')
      const signedTransactionObject = await ledgerNanoS.signSendEther(0, escrow.address, amountInWei)
      sendTxHash = await web3EthSendTransactionPromise(_web3.eth.sendSignedTransaction, signedTransactionObject.rawTransaction)
    } else if (cryptoType === 'dai') {
      const _web3 = new Web3(new Web3.providers.HttpProvider(infuraApi))
      // send out tx fee for next tx
      const signedTxFee = await ledgerNanoS.signSendEther(
        0,
        escrow.address,
        txCost.costByType.ethTransfer,
        {
          gasLimit: txCost.costByType.txCostEth.gas,
          gasPrice: txCost.costByType.txCostEth.price
        })
      sendTxFeeTxHash = await web3EthSendTransactionPromise(_web3.eth.sendSignedTransaction, signedTxFee.rawTransaction)

      const amountInBasicUnit = _web3.utils.toWei(transferAmount.toString(), 'ether')
      const signedTransactionObject = await ledgerNanoS.signSendTrasaction(
        0,
        getCrypto('dai').address, ERC20_ABI,
        'transfer',
        escrow.address,
        amountInBasicUnit,
        {
          gasLimit: txCost.costByType.txCostERC20.gas,
          gasPrice: txCost.costByType.txCostERC20.price
        })
      sendTxHash = await web3EthSendTransactionPromise(_web3.eth.sendSignedTransaction, signedTransactionObject.rawTransaction)
    } else if (cryptoType === 'bitcoin') {
      const satoshiValue = parseFloat(transferAmount) * 100000000 // 1 btc = 100,000,000 satoshi
      const addressPool = accountInfo.addresses
      if (!txFeePerByte) txFeePerByte = 15
      const { fee, utxosCollected } = collectUtxos(addressPool, satoshiValue.toString(), txFeePerByte)
      const signedTxRaw = await ledgerNanoS.createNewBtcPaymentTransaction(utxosCollected, escrow.toAddress().toString(), satoshiValue, fee, accountInfo.nextChangeIndex)
      sendTxHash = await ledgerNanoS.broadcastBtcRawTx(signedTxRaw)
    }
  }
  // step 5: clear wallet
  window._web3.eth.accounts.wallet.clear()

  // step 6: update tx data
  return _transactionHashRetrieved({
    sender: txRequest.sender,
    destination: txRequest.destination,
    transferAmount: txRequest.transferAmount,
    cryptoType: txRequest.cryptoType,
    encriptedEscrow: encryptedEscrow,
    sendTxHash: sendTxHash,
    password: txRequest.password,
    sendTxFeeTxHash: sendTxFeeTxHash
  })
}

async function _transactionHashRetrieved (
  txRequest: {
    sender: string,
    destination: string,
    transferAmount: string,
    cryptoType: string,
    encriptedEscrow: any,
    sendTxHash: string,
    password: string
  }
) {
  let { sender, destination, transferAmount, cryptoType, encriptedEscrow, sendTxHash, password } = txRequest

  let transferData: Object = {
    clientId: 'test-client',
    sender: sender,
    destination: destination,
    transferAmount: transferAmount,
    cryptoType: cryptoType,
    sendTxHash: sendTxHash,
    data: Base64.encode(JSON.stringify(encriptedEscrow)),
    password: Base64.encode(password)
  }

  let data = await API.transfer(transferData)

  // TX is now sent and server is notified, we save a copy of transfer data in drive's appDataFolder
  transferData.sendingId = data.sendingId
  transferData.sendTimestamp = data.sendTimestamp
  await saveSendFile(transferData)

  return data
}

async function _acceptTransfer (
  txRequest: {
    escrowWallet: Object,
    destinationAddress: string,
    cryptoType: string,
    transferAmount: string,
    txCost: Object,
    receivingId: string
  },
  utxos: Utxos
) {
  // transfer funds from escrowWallet to destinationAddress with cryptoType and transferAmount
  // fromWallet is a decryptedWallet with the following data
  // 1. address
  // 2. privateKey

  let { escrowWallet, destinationAddress, cryptoType, transferAmount, txCost } = txRequest
  let receiveTxHash: string
  if (cryptoType === 'bitcoin') {
    let bitcoreUtxoFormat = utxos.map(utxo => {
      return {
        txid: utxo.txHash,
        vout: utxo.outputIndex,
        address: escrowWallet && escrowWallet.address,
        script: utxo.script,
        satoshis: utxo.value
      }
    })
    const satoshiValue = parseFloat(transferAmount) * 100000000 // 1 btc = 100,000,000 satoshi
    const fee = parseInt(txCost.costInBasicUnit)
    let transaction = new bitcore.Transaction()
      .from(bitcoreUtxoFormat)
      .to(destinationAddress, satoshiValue - fee)
      .fee(parseInt(txCost.costInBasicUnit))
      .sign(escrowWallet.privateKey)
    const txHex = transaction.serialize()
    receiveTxHash = await ledgerNanoS.broadcastBtcRawTx(txHex)
  } else {
    // add escrow account to web3
    const _web3 = new Web3(new Web3.providers.HttpProvider(infuraApi))
    let txObj = null
    _web3.eth.accounts.wallet.add(escrowWallet.privateKey)

    if (cryptoType === 'ethereum') {
      // calculate amount in wei to be sent
      let wei = (new BN(_web3.utils.toWei(transferAmount.toString(), 'ether'))).toString()

      // actual amount to receive = escrow balance - tx fees
      let amountExcludeGasInWei = (new BN(wei).sub(new BN(txCost.costInBasicUnit))).toString()

      // setup tx object
      txObj = {
        from: escrowWallet.address,
        to: destinationAddress,
        value: amountExcludeGasInWei.toString(), // actual receiving amount
        gas: txCost.gas,
        gasPrice: txCost.price
      }
    } else if (cryptoType === 'dai') {
      // calculate amount in basic token unit to be sent
      let amountInBasicUnit = _web3.utils.toWei(transferAmount.toString(), 'ether')

      txObj = await ERC20.getTransferTxObj(escrowWallet.address, destinationAddress, amountInBasicUnit, cryptoType)

      // update tx fees
      txObj.gas = txCost.gas
      txObj.gasPrice = await ERC20.getGasPriceGivenBalance(escrowWallet.address, txCost.gas)
    }

    receiveTxHash = await web3EthSendTransactionPromise(_web3.eth.sendTransaction, txObj)
  }
  return _acceptTransferTransactionHashRetrieved({
    receiveTxHash: receiveTxHash,
    receivingId: txRequest.receivingId
  })
}

async function _acceptTransferTransactionHashRetrieved (
  txRequest: {
    receiveTxHash: string,
    receivingId: string
  }
) {
  let { receivingId, receiveTxHash } = txRequest

  let data = await API.accept({
    clientId: 'test-client',
    receivingId: receivingId,
    receiveTxHash: receiveTxHash
  })

  return data
}

async function _cancelTransfer (
  txRequest: {
    escrowWallet: Object,
    sendTxHash: string,
    cryptoType: string,
    transferAmount: string,
    txCost: Object,
    sendingId: string
  },
  utxos: Utxos
) {
  // transfer funds from escrowWallet to sender address with cryptoType and transferAmount
  // fromWallet is a decryptedWallet with the following data
  // 1. address
  // 2. privateKey

  let { escrowWallet, sendTxHash, cryptoType, transferAmount, txCost } = txRequest
  let cancelTxHash: string = ''
  if (cryptoType === 'bitcoin') {
    const firstFromAddress = await getFirstFromAddress(sendTxHash)
    let bitcoreUtxoFormat = utxos.map(utxo => {
      return {
        txid: utxo.txHash,
        vout: utxo.outputIndex,
        address: escrowWallet.address,
        script: utxo.script,
        satoshis: utxo.value
      }
    })
    const satoshiValue = parseFloat(transferAmount) * 100000000 // 1 btc = 100,000,000 satoshi
    const fee = parseInt(txCost.costInBasicUnit)
    let transaction = new bitcore.Transaction()
      .from(bitcoreUtxoFormat)
      .to(firstFromAddress, satoshiValue - fee)
      .fee(parseInt(txCost.costInBasicUnit))
      .sign(escrowWallet.privateKey)
    const txHex = transaction.serialize()
    cancelTxHash = await ledgerNanoS.broadcastBtcRawTx(txHex)
  } else if (['ethereum', 'dai'].includes(cryptoType)) {
    // ethereum based coins

    const _web3 = new Web3(new Web3.providers.HttpProvider(infuraApi))

    var txObj = null

    // add escrow account to web3
    _web3.eth.accounts.wallet.add(escrowWallet.privateKey)

    if (cryptoType === 'ethereum') {
      // calculate amount in wei to be sent
      let wei = _web3.utils.toWei(transferAmount.toString(), 'ether')

      // actual amount to receive = escrow balance - tx fees
      let amountExcludeGasInWei = (new BN(wei).sub(new BN(txCost.costInBasicUnit))).toString()

      let txReceipt = await _web3.eth.getTransactionReceipt(sendTxHash)
      // setup tx object
      txObj = {
        from: escrowWallet.address,
        to: txReceipt.from, // sender address
        value: amountExcludeGasInWei.toString(), // actual receiving amount
        gas: txCost.gas,
        gasPrice: txCost.price
      }
    } else if (cryptoType === 'dai') {
      // calculate amount in basic token unit to be sent
      let amountInBasicUnit = _web3.utils.toWei(transferAmount.toString(), 'ether')

      let txReceipt = await _web3.eth.getTransactionReceipt(sendTxHash)
      txObj = await ERC20.getTransferTxObj(escrowWallet.address, txReceipt.from, amountInBasicUnit, cryptoType)

      // update tx fees
      txObj.gas = txCost.gas
      txObj.gasPrice = await ERC20.getGasPriceGivenBalance(escrowWallet.address, txCost.gas)
    }

    // now boardcast tx
    cancelTxHash = await web3EthSendTransactionPromise(_web3.eth.sendTransaction, txObj)
  }
  return _cancelTransferTransactionHashRetrieved({
    cancelTxHash: cancelTxHash,
    sendingId: txRequest.sendingId
  })
}

async function _cancelTransferTransactionHashRetrieved (
  txRequest: {
    sendingId: string,
    cancelTxHash: string
  }
) {
  let { sendingId, cancelTxHash } = txRequest

  let data = await API.cancel({
    clientId: 'test-client',
    sendingId: sendingId,
    cancelTxHash: cancelTxHash
  })

  return data
}

async function _getTransfer (sendingId: ?string, receivingId: ?string) {
  let apiResponse = await API.getTransfer({ sendingId, receivingId })
  return apiResponse
}

async function _getTransferHistory () {
  let transfersDict = await getAllTransfers()

  // convert dict to array
  let transfers = []
  for (let key in transfersDict) {
    transfers.push(transfersDict[key])
  }

  // sort transfers by sendTimestamp in descending order
  transfers.sort((a, b) => b.sendTimestamp - a.sendTimestamp)

  // pick most recent 20 transfers
  transfers = transfers.slice(0, Math.min(transfers.length, 20))

  // identify transfer state
  return Promise.all(transfers.map(async (t) => {
    let transferData = await API.getTransfer({ sendingId: t.sendingId })
    let state = null
    if (!transferData.receiveTxHash) {
      if (!transferData.cancelTxHash) {
        // pending receive
        state = 'pending'
      } else {
        // cancelled
        state = 'cancelled'
      }
    } else {
      // received
      state = 'received'
    }
    return {
      ...transferData,
      state
    }
  }))
}

function submitTx (txRequest: {
  fromWallet: Object,
  walletType: string,
  cryptoType: string,
  transferAmount: string,
  password: string,
  sender: string,
  destination: string,
  txCost: Object,
  txFeePerByte: ?number,
}) {
  return (dispatch: Function, getState: Function) => {
    const accountInfo = txRequest.cryptoType === 'bitcoin' ? getState().walletReducer.wallet.ledger.crypto[txRequest.cryptoType][0] : {}
    return dispatch({
      type: 'SUBMIT_TX',
      payload: _submitTx(txRequest, accountInfo)
    }).then(() => dispatch(goToStep('send', 1)))
  }
}

function acceptTransfer (
  txRequest: {
    escrowWallet: Object,
    destinationAddress: string,
    cryptoType: string,
    transferAmount: string,
    txCost: Object,
    receivingId: string
  }
) {
  return (dispatch: Function, getState: Function) => {
    let utxos = []
    if (txRequest.cryptoType === 'bitcoin') {
      utxos = getState().walletReducer.escrowWallet.decryptedWallet.utxos
    }
    return dispatch({
      type: 'ACCEPT_TRANSFER',
      payload: _acceptTransfer(txRequest, utxos)
    }).then(() => dispatch(goToStep('receive', 1)))
  }
}

function cancelTransfer (
  txRequest: {
    escrowWallet: Object,
    sendTxHash: string,
    cryptoType: string,
    transferAmount: string,
    txCost: Object,
    sendingId: string
  }
) {
  return (dispatch: Function, getState: Function) => {
    let utxos = []
    if (txRequest.cryptoType === 'bitcoin') {
      utxos = getState().walletReducer.escrowWallet.decryptedWallet.utxos
    }
    return dispatch({
      type: 'CANCEL_TRANSFER',
      payload: _cancelTransfer(txRequest, utxos)
    }).then(() => dispatch(goToStep('cancel', 1)))
  }
}

function getTxCost (
  txRequest: {
    cryptoType: string,
    transferAmount: string,
    txFeePerByte: number,
    escrowWallet: ?Object
  }
) {
  return (dispatch: Function, getState: Function) => {
    let addressPool = []
    if (txRequest.cryptoType === 'bitcoin') {
      if (txRequest.escrowWallet) {
        addressPool.push({ utxos: getState().walletReducer.escrowWallet.decryptedWallet.utxos })
      } else {
        addressPool = getState().walletReducer.wallet.ledger.crypto[txRequest.cryptoType][0].addresses
      }
    }
    return dispatch({
      type: 'GET_TX_COST',
      payload: _getTxCost(txRequest, addressPool)
    })
  }
}

function getTransfer (sendingId: ?string, receivingId: ?string) {
  return {
    type: 'GET_TRANSFER',
    payload: _getTransfer(sendingId, receivingId)
  }
}

function getTransferHistory () {
  return {
    type: 'GET_TRANSFER_HISTORY',
    payload: _getTransferHistory()
  }
}

export {
  submitTx,
  acceptTransfer,
  cancelTransfer,
  getTxCost,
  getTransfer,
  getTransferHistory
}
