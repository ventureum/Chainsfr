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
import { getCrypto } from '../tokens'

const ledgerNanoS = new LedgerNanoS()
const infuraApi = `https://${process.env.REACT_APP_NETWORK_NAME}.infura.io/v3/${process.env.REACT_APP_INFURA_API_KEY}`

function web3EthSendTransactionPromise (web3Instance, txObj) {
  return new Promise((resolve, reject) => {
    web3Instance.eth.sendTransaction(txObj)
      .on('transactionHash', (hash) => resolve(hash))
      .on('error', (error) => reject(error))
  })
}

async function _getGasCost (txRequest) {
  let { cryptoType } = txRequest

  const mockFrom = '0x0f3fe948d25ddf2f7e8212145cef84ac6f20d904'
  const mockTo = '0x0f3fe948d25ddf2f7e8212145cef84ac6f20d905'
  const mockNumTokens = '1000'

  let txObj = {
    from: mockFrom,
    to: mockTo
  }

  if (cryptoType === 'ethereum') {
    txObj.value = mockNumTokens
  } else if (cryptoType === 'dai') {
    txObj = ERC20.getTransferTxObj(mockFrom, mockTo, mockNumTokens, cryptoType)
  } else {
    throw new Error('Invalid walletType/cryptoType')
  }
  return utils.getGasCost(txObj)
}

async function _submitTx (dispatch, txRequest) {
  let { fromWallet, walletType, cryptoType, transferAmount, password, sender, destination, gasCost } = txRequest

  if (['ethereum', 'dai'].includes(cryptoType)) {
    // ethereum based coins
    // step 1: create an escrow wallet
    var escrow = window._web3.eth.accounts.create()

    // step 2: encrypt the escrow wallet with password provided and the destination email address
    var encriptedEscrow = window._web3.eth.accounts.encrypt(escrow.privateKey, password + destination)

    // add escrow wallet to tx request
    txRequest.encriptedEscrow = encriptedEscrow

    // before sending out a TX, store a backup of encrypted escrow wallet in user's drive
    await saveTempSendFile({
      sender: sender,
      destination: destination,
      transferAmount: transferAmount,
      cryptoType: cryptoType,
      data: Base64.encode(JSON.stringify(encriptedEscrow)),
      password: Base64.encode(password),
      tempTimestamp: moment().unix()
    })
  }

  // step 4: transfer funds from [fromWallet] to the newly created escrow wallet
  if (walletType === 'metamask') {
    var txObj = null
    if (cryptoType === 'ethereum') {
      let wei = window._web3.utils.toWei(transferAmount.toString(), 'ether')
      txObj = {
        from: fromWallet.accounts[0].address,
        to: escrow.address,
        value: wei
      }
    } else if (cryptoType === 'dai') {
      // we need to transfer a small amount of eth to escrow to pay for
      // the next transfer's tx fees
      txRequest.sendTxFeeTxHash = await web3EthSendTransactionPromise(window._web3, {
        from: fromWallet.accounts[0].address,
        to: escrow.address,
        value: gasCost.costInWei // estimated gas cost for the next tx
      })

      // next, we send tokens to the escrow address
      let amountInBasicUnit = window._web3.utils.toWei(transferAmount.toString(), 'ether')
      txObj = await ERC20.getTransferTxObj(fromWallet.accounts[0].address, escrow.address, amountInBasicUnit, cryptoType)

      // update tx fees
      txObj.gas = gasCost.gas
      txObj.gasPrice = gasCost.gasPrice
    }

    txRequest.sendTxHash = await web3EthSendTransactionPromise(window._web3, txObj)
    dispatch(transactionHashRetrieved(txRequest))
  } else if (walletType === 'ledger') {
    if (cryptoType === 'ethereum') {
      const _web3 = new Web3(new Web3.providers.HttpProvider(infuraApi))
      const amountInWei = _web3.utils.toWei(transferAmount.toString(), 'ether')
      const signedTransactionObject = await ledgerNanoS.signSendEther(0, escrow.address, amountInWei)
      _web3.eth.sendSignedTransaction(signedTransactionObject.rawTransaction)
        .on('transactionHash', (hash) => {
          console.log('txHash: ', hash)
          // update request tx hash
          txRequest.sendTxHash = hash
          dispatch(transactionHashRetrieved(txRequest))
        })
    } else if (cryptoType === 'dai') {
      const _web3 = new Web3(new Web3.providers.HttpProvider(infuraApi))
      const amountInWei = _web3.utils.toWei(transferAmount.toString(), 'ether')
      const signedTransactionObject = await ledgerNanoS.signSendTrasaction(0, getCrypto('dai').address, ERC20_ABI, 'transfer', escrow.address, amountInWei)
      _web3.eth.sendSignedTransaction(signedTransactionObject.rawTransaction)
        .on('transactionHash', (hash) => {
          console.log('txHash: ', hash)
          // update request tx hash
          txRequest.sendTxHash = hash
          dispatch(transactionHashRetrieved(txRequest))
        })
    }
  }

  // step 5: clear wallet
  window._web3.eth.accounts.wallet.clear()
}

async function _transactionHashRetrieved (txRequest) {
  let { sender, destination, transferAmount, cryptoType, encriptedEscrow, sendTxHash, password } = txRequest

  let transferData = {
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

async function _acceptTransfer (dispatch, txRequest) {
  // transfer funds from escrowWallet to destinationAddress with cryptoType and transferAmount
  // fromWallet is a decryptedWallet with the following data
  // 1. address
  // 2. privateKey

  let { escrowWallet, destinationAddress, walletType, cryptoType, transferAmount, gasCost } = txRequest

  const _web3 = new Web3(new Web3.providers.HttpProvider(infuraApi))
  var txObj = null

  if (walletType === 'metamask') {
    // add escrow account to web3
    _web3.eth.accounts.wallet.add(escrowWallet.privateKey)

    if (cryptoType === 'ethereum') {
      // calculate amount in wei to be sent
      let wei = new BN(window._web3.utils.toWei(transferAmount.toString(), 'ether'))

      // actual amount to receive = escrow balance - tx fees
      let amountExcludeGasInWei = new BN(wei).sub(new BN(gasCost.costInWei))

      // setup tx object
      txObj = {
        from: escrowWallet.address,
        to: destinationAddress,
        value: amountExcludeGasInWei.toString(), // actual receiving amount
        gas: gasCost.gas,
        gasPrice: gasCost.gasPrice
      }
    } else if (cryptoType === 'dai') {
      // calculate amount in basic token unit to be sent
      let amountInBasicUnit = _web3.utils.toWei(transferAmount.toString(), 'ether')

      txObj = await ERC20.getTransferTxObj(escrowWallet.address, destinationAddress, amountInBasicUnit, cryptoType)

      // update tx fees
      txObj.gas = gasCost.gas
      txObj.gasPrice = await ERC20.getGasPriceGivenBalance(escrowWallet.address, gasCost.gas)
    }

    txRequest.receiveTxHash = await web3EthSendTransactionPromise(_web3, txObj)
    dispatch(acceptTransferTransactionHashRetrieved(txRequest))
  }
}

async function _acceptTransferTransactionHashRetrieved (txRequest) {
  let { receivingId, receiveTxHash } = txRequest

  let data = await API.accept({
    clientId: 'test-client',
    receivingId: receivingId,
    receiveTxHash: receiveTxHash
  })

  return data
}

async function _cancelTransfer (dispatch, txRequest) {
  // transfer funds from escrowWallet to sender address with cryptoType and transferAmount
  // fromWallet is a decryptedWallet with the following data
  // 1. address
  // 2. privateKey

  let { escrowWallet, sendTxHash, cryptoType, transferAmount, gasCost } = txRequest

  if (['ethereum', 'dai'].includes(cryptoType)) {
    // ethereum based coins

    const _web3 = new Web3(new Web3.providers.HttpProvider(infuraApi))

    var txObj = null

    // add escrow account to web3
    _web3.eth.accounts.wallet.add(escrowWallet.privateKey)

    if (cryptoType === 'ethereum') {
      // calculate amount in wei to be sent
      let wei = _web3.utils.toWei(transferAmount.toString(), 'ether')

      // actual amount to receive = escrow balance - tx fees
      let amountExcludeGasInWei = new BN(wei).sub(new BN(gasCost.costInWei))

      let txReceipt = await _web3.eth.getTransactionReceipt(sendTxHash)
      // setup tx object
      txObj = {
        from: escrowWallet.address,
        to: txReceipt.from, // sender address
        value: amountExcludeGasInWei.toString(), // actual receiving amount
        gas: gasCost.gas,
        gasPrice: gasCost.gasPrice
      }
    } else if (cryptoType === 'dai') {
      // calculate amount in basic token unit to be sent
      let amountInBasicUnit = _web3.utils.toWei(transferAmount.toString(), 'ether')

      let txReceipt = await _web3.eth.getTransactionReceipt(sendTxHash)
      txObj = await ERC20.getTransferTxObj(escrowWallet.address, txReceipt.from, amountInBasicUnit, cryptoType)

      // update tx fees
      txObj.gas = gasCost.gas
      txObj.gasPrice = await ERC20.getGasPriceGivenBalance(escrowWallet.address, gasCost.gas)
    }

    // now boardcast tx
    txRequest.cancelTxHash = await web3EthSendTransactionPromise(_web3, txObj)
    dispatch(cancelTransferTransactionHashRetrieved(txRequest))
  }
}

async function _cancelTransferTransactionHashRetrieved (txRequest) {
  let { sendingId, cancelTxHash } = txRequest

  let data = await API.cancel({
    clientId: 'test-client',
    sendingId: sendingId,
    cancelTxHash: cancelTxHash
  })

  return data
}

async function _getTransfer (sendingId, receivingId) {
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

function transactionHashRetrieved (txRequest) {
  return (dispatch, getState) => {
    return dispatch({
      type: 'TRANSACTION_HASH_RETRIEVED',
      payload: _transactionHashRetrieved(txRequest)
    }).then(() => dispatch(goToStep('send', 1)))
  }
}

function acceptTransferTransactionHashRetrieved (txRequest) {
  return (dispatch, getState) => {
    return dispatch({
      type: 'ACCEPT_TRANSFER_TRANSACTION_HASH_RETRIEVED',
      payload: _acceptTransferTransactionHashRetrieved(txRequest)
    }).then(() => dispatch(goToStep('receive', 1)))
  }
}

function cancelTransferTransactionHashRetrieved (txRequest) {
  return (dispatch, getState) => {
    return dispatch({
      type: 'CANCEL_TRANSFER_TRANSACTION_HASH_RETRIEVED',
      payload: _cancelTransferTransactionHashRetrieved(txRequest)
    }).then(() => dispatch(goToStep('cancel', 1)))
  }
}

function submitTx (txRequest) {
  return (dispatch, getState) => {
    return {
      type: 'SUBMIT_TX',
      payload: _submitTx(dispatch, txRequest)
    }
  }
}

function acceptTransfer (txRequest) {
  return (dispatch, getState) => {
    return {
      type: 'ACCEPT_TRANSFER',
      payload: _acceptTransfer(dispatch, txRequest)
    }
  }
}

function cancelTransfer (txRequest) {
  return (dispatch, getState) => {
    return {
      type: 'CANCEL_TRANSFER',
      payload: _cancelTransfer(dispatch, txRequest)
    }
  }
}

function getGasCost (txRequest) {
  return {
    type: 'GET_GAS_COST',
    payload: _getGasCost(txRequest)
  }
}

function getTransfer (sendingId, receivingId) {
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
  getGasCost,
  getTransfer,
  getTransferHistory
}
