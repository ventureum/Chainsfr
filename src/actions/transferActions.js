// @flow
import API from '../apis'
import Web3 from 'web3'
import axios from 'axios'
import utils from '../utils'
import BN from 'bn.js'
import { goToStep } from './navigationActions'
import { saveTempSendFile, saveHistoryFile, getAllTransfers } from '../drive.js'
import moment from 'moment'
import { Base64 } from 'js-base64'
import { getCryptoDecimals } from '../tokens'
import url from '../url'
import SimpleMultiSig from '../SimpleMultiSig'
import type { TxFee, TxHash } from '../types/transfer.flow.js'
import type { StandardTokenUnit, BasicTokenUnit, Address } from '../types/token.flow'
import type { AccountData } from '../types/account.flow.js'
import { createWallet } from '../wallets/WalletFactory'
import { createAccount } from '../accounts/AccountFactory'

const transferStates = {
  SEND_PENDING: 'SEND_PENDING',
  SEND_FAILURE: 'SEND_FAILURE',
  SEND_CONFIRMED_RECEIVE_PENDING: 'SEND_CONFIRMED_RECEIVE_PENDING',
  SEND_CONFIRMED_RECEIVE_FAILURE: 'SEND_CONFIRMED_RECEIVE_FAILURE',
  SEND_CONFIRMED_RECEIVE_CONFIRMED: 'SEND_CONFIRMED_RECEIVE_CONFIRMED',
  SEND_CONFIRMED_RECEIVE_NOT_INITIATED: 'SEND_CONFIRMED_RECEIVE_NOT_INITIATED',
  SEND_CONFIRMED_RECEIVE_EXPIRED: 'SEND_CONFIRMED_RECEIVE_EXPIRED',
  SEND_CONFIRMED_CANCEL_PENDING: 'SEND_CONFIRMED_CANCEL_PENDING',
  SEND_CONFIRMED_CANCEL_CONFIRMED: 'SEND_CONFIRMED_CANCEL_CONFIRMED',
  SEND_CONFIRMED_CANCEL_FAILURE: 'SEND_CONFIRMED_CANCEL_FAILURE'
}

const MESSAGE_NOT_PROVIDED = '(Not provided)'

async function getFirstFromAddress (txHash: string) {
  const rv = (await axios.get(`${url.LEDGER_API_URL}/transactions/${txHash}`)).data
  const address = rv[0].inputs[0].address
  return address
}

async function _getTxFee (txRequest: {
  fromAccount: AccountData,
  transferAmount: StandardTokenUnit
}) {
  let { fromAccount, transferAmount } = txRequest
  let txFee: TxFee = await createWallet(fromAccount).getTxFee({
    value: utils
      .toBasicTokenUnit(transferAmount, getCryptoDecimals(fromAccount.cryptoType))
      .toString()
  })
  return txFee
}

// async function _directTransfer (txRequest: {
//   fromWallet: WalletData,
//   transferAmount: StandardTokenUnit,
//   destinationAddress: Address,
//   txFee: TxFee
// }) {
//   let { fromWallet, transferAmount, destinationAddress, txFee } = txRequest

//   // convert transferAmount to basic token unit
//   let value: BasicTokenUnit = utils
//     .toBasicTokenUnit(transferAmount, getCryptoDecimals(fromWallet.cryptoType))
//     .toString()

//   return {
//     cryptoType: fromWallet.cryptoType,
//     sendTxHash: await WalletFactory.createWallet(fromWallet).sendTransaction({
//       to: destinationAddress,
//       value: value,
//       txFee: txFee
//     })
//   }
// }

async function _submitTx (txRequest: {
  fromAccount: AccountData,
  transferAmount: StandardTokenUnit,
  transferFiatAmountSpot: string,
  fiatType: string,
  destination: string,
  receiverName: string,
  senderName: string,
  senderAvatar: string,
  sender: string,
  password: string,
  sendMessage: ?string,
  txFee: TxFee
}) {
  let {
    fromAccount,
    transferAmount,
    transferFiatAmountSpot,
    fiatType,
    password,
    sender,
    senderName,
    senderAvatar,
    sendMessage,
    destination,
    receiverName,
    txFee
  } = txRequest

  let { cryptoType } = fromAccount

  // generate an escrow wallet
  let walletId
  let escrowWallet = createWallet({ walletType: 'escrow' })

  let escrowAccount = await escrowWallet.newAccount('escrow', cryptoType)
  await escrowAccount.encryptAccount(password)
  let encryptedPrivateKey = escrowAccount.getAccountData().encryptedPrivateKey

  let sendTxHash
  let sendTxFeeTxHash

  // before sending out a TX, store a backup of encrypted escrow wallet in user's drive
  await saveTempSendFile({
    sender: sender,
    destination: destination,
    transferAmount: transferAmount,
    cryptoType: cryptoType,
    data: Base64.encode(encryptedPrivateKey),
    password: Base64.encode(password),
    tempTimestamp: moment().unix()
  })

  // convert transferAmount to basic token unit
  let value: BasicTokenUnit = utils
    .toBasicTokenUnit(transferAmount, getCryptoDecimals(cryptoType))
    .toString()

  if (['ethereum', 'bitcoin', 'dai', 'libra'].includes(cryptoType)) {
    let multisig
    if (['ethereum', 'dai'].includes(cryptoType)) {
      walletId = new SimpleMultiSig().createWalletId()
      multisig = new SimpleMultiSig({ walletId })
    }
    if (cryptoType === 'bitcoin') {
      walletId = escrowAccount.getAccountData().address
    }
    const _wallet = createWallet(fromAccount)

    let txHashList = await _wallet.sendTransaction({
      to: escrowAccount.getAccountData().address,
      value: value,
      txFee: txFee,
      options: { multisig }
    })
    if (Array.isArray(txHashList)) {
      sendTxHash = txHashList[0]
      sendTxFeeTxHash = txHashList[1]
    } else {
      sendTxHash = txHashList
    }
  } else {
    throw new Error(`Invalid cryptoType: ${cryptoType}`)
  }

  if (sendTxFeeTxHash) sendTxHash = [sendTxHash, sendTxFeeTxHash]
  // update tx data
  return _transactionHashRetrieved({
    transferAmount,
    transferFiatAmountSpot,
    fiatType,
    senderName,
    senderAvatar,
    sender,
    sendMessage,
    destination,
    receiverName,
    data: Base64.encode(JSON.stringify(encryptedPrivateKey)),
    cryptoType: cryptoType,
    sendTxHash: sendTxHash,
    password: Base64.encode(password),
    walletId: walletId
  })
}

async function _transactionHashRetrieved (txRequest: {|
  transferAmount: StandardTokenUnit,
  transferFiatAmountSpot: string,
  fiatType: string,
  senderName: string,
  senderAvatar: string,
  sender: string,
  destination: string,
  receiverName: string,
  cryptoType: string,
  sendMessage: ?string,
  data: string,
  sendTxHash: Array<TxHash> | TxHash,
  password: string,
  walletId?: string
|}) {
  if (!txRequest.sendMessage || txRequest.sendMessage === '') {
    // Set a default message if not provided
    txRequest.sendMessage = MESSAGE_NOT_PROVIDED
  }

  // mask out password
  const { password, ...request } = txRequest

  let response = await API.transfer(request)

  await saveHistoryFile({
    transferId: response.transferId,
    sendTimestamp: response.sendTimestamp,
    data: txRequest.data,
    password: txRequest.password
  })

  return response
}

async function _acceptTransfer (txRequest: {
  escrowAccount: AccountData,
  destinationAddress: Address,
  transferAmount: StandardTokenUnit,
  txFee: TxFee,
  receivingId: string,
  receiveMessage: ?string,
  walletId: string
}) {
  let {
    escrowAccount,
    txFee,
    destinationAddress,
    transferAmount,
    receivingId,
    receiveMessage,
    walletId
  } = txRequest

  if (!receiveMessage || receiveMessage === '') {
    // Set a default message if not provided
    receiveMessage = MESSAGE_NOT_PROVIDED
  }

  let { cryptoType } = escrowAccount

  // assuming wallet has been decrypted
  let wallet = createWallet(escrowAccount)

  // verify wallet
  await wallet.verifyAccount()

  // convert transferAmount to basic token unit
  let value: BasicTokenUnit = utils
    .toBasicTokenUnit(transferAmount, getCryptoDecimals(cryptoType))
    .toString()

  let multiSig

  if (['ethereum', 'dai'].includes(cryptoType)) {
    // ethereum based coins
    multiSig = new SimpleMultiSig({ walletId, receivingId, receiveMessage })
  }

  // $FlowFixMe
  let txhash = await wallet.sendTransaction({
    to: destinationAddress,
    // actual value to be received = transferAmount - txFee
    value: new BN(value).sub(new BN(txFee.costInBasicUnit)),
    txFee: txFee,
    options: {
      multiSig,
      receiveMessage,
      receivingId
    }
  })

  return _acceptTransferTransactionHashRetrieved({
    receiveTxHash: txhash,
    receivingId: receivingId,
    receiveMessage: receiveMessage,
    receiveTimestamp: Math.floor(Date.now() / 1000)
  })
}

async function _acceptTransferTransactionHashRetrieved (txRequest: {|
  receiveTxHash: TxHash,
  receivingId: string,
  receiveMessage: ?string,
  receiveTimestamp: number
|}) {
  // temp disabled, accept is invoked inside ethereum.sendTransaction()
  // let response = await API.accept(txRequest)
  // mock response
  const { receiveTimestamp } = txRequest
  const response = {
    receiveTimestamp: receiveTimestamp
  }

  await saveHistoryFile({
    receivingId: txRequest.receivingId,
    receiveTimestamp: response.receiveTimestamp
  })
  return { ...response, ...txRequest }
}

async function _cancelTransfer (txRequest: {
  escrowAccount: AccountData,
  transferId: string,
  sendTxHash: TxHash,
  transferAmount: StandardTokenUnit,
  txFee: TxFee,
  cancelMessage: ?string,
  walletId: string
}) {
  let {
    escrowAccount,
    transferId,
    sendTxHash,
    transferAmount,
    txFee,
    cancelMessage,
    walletId
  } = txRequest

  if (!cancelMessage || cancelMessage === '') {
    // Set a default message if not provided
    cancelMessage = MESSAGE_NOT_PROVIDED
  }

  let { cryptoType } = escrowAccount

  // assuming wallet has been decrypted
  let wallet = createWallet(escrowAccount)

  // verify wallet
  await wallet.verifyAccount()

  // convert transferAmount to basic token unit
  let value: BasicTokenUnit = utils
    .toBasicTokenUnit(transferAmount, getCryptoDecimals(cryptoType))
    .toString()
  let senderAddress: Address

  let multiSig

  if (cryptoType === 'bitcoin') {
    senderAddress = await getFirstFromAddress(sendTxHash)
  } else if (['ethereum', 'dai'].includes(cryptoType)) {
    // ethereum based coins
    const _web3 = new Web3(new Web3.providers.HttpProvider(url.INFURA_API_URL))
    let txReceipt = await _web3.eth.getTransactionReceipt(sendTxHash)
    senderAddress = txReceipt.from
    multiSig = new SimpleMultiSig({ walletId, transferId, cancelMessage })
  } else if (cryptoType === 'libra') {
    // txHash is the sender's address for libra
    senderAddress = sendTxHash
  } else {
    throw new Error(`Invalid cryptoType: ${cryptoType}`)
  }

  await wallet.verifyAccount()

  let txhash = await wallet.sendTransaction({
    to: senderAddress,
    // actual value to be received = transferAmount - txFee
    value: new BN(value).sub(new BN(txFee.costInBasicUnit)).toString(),
    txFee: txFee,
    options: {
      multiSig,
      cancelMessage,
      transferId
    }
  })

  return {
    transferId: transferId,
    cancelTxHash: txhash,
    cancelMessage: cancelMessage,
    cancelTimestamp: Math.floor(Date.now() / 1000)
  }
}

// fetch transferData and convert it into an escrow account
async function _getTransfer (transferId: ?string, receivingId: ?string) {
  let transferData = await API.getTransfer({ transferId, receivingId })
  let escrowAccount = createAccount({
    walletType: 'escrow',
    cryptoType: transferData.cryptoType,
    encryptedPrivateKey: transferData.data,
    address: transferData.walletId
  }).getAccountData()
  return { transferData, escrowAccount }
}

async function _getTransferHistory (offset: number = 0) {
  const ITEM_PER_FETCH = 10
  // https://github.com/facebook/flow/issues/6064
  // $FlowFixMe
  let transfersDict = await getAllTransfers()

  // convert dict to array
  let transfers = []
  for (let key in transfersDict) {
    transfers.push(transfersDict[key])
  }

  transfers = transfers.sort((a, b) => {
    let getTimestamp = item => {
      let rv = item.sendTimestamp ? item.sendTimestamp : item.receiveTimestamp
      if (!rv) {
        console.warn('Missing timestamp in transfer history data')
        return 0
      }
      return rv
    }
    return getTimestamp(b) - getTimestamp(a)
  })

  // pick most recent X transfers
  let hasMore = true
  if (offset + ITEM_PER_FETCH < transfers.length) {
    transfers = transfers.slice(offset, Math.min(transfers.length, offset + ITEM_PER_FETCH))
  } else {
    hasMore = false
    transfers = transfers.slice(offset)
  }

  // identify transfer state
  const transferIds = transfers.filter(t => !!t.transferId).map(t => t.transferId)
  const receivingIds = transfers.filter(t => !!t.receivingId).map(t => t.receivingId)

  // for quick transferType (sender, receiver) lookup
  const transferIdsSet = new Set(transferIds)
  const receivingIdsSet = new Set(receivingIds)

  let transferData = (
    await API.getBatchTransfers({
      transferIds: transferIds,
      receivingIds: receivingIds
    })
  )
    .sort((a, b) => {
      // we have to re-sort since API.getBatchTransfers does not persist order
      // sort transfers by timestamp in descending order
      let getTimestamp = item => {
        let rv = item.sendTimestamp ? item.sendTimestamp : item.receiveTimestamp
        if (!rv) {
          console.warn(
            `Missing timestamp in transfer history data. Transfer ID: ${item.transferId}`
          )
          return 0
        }
        return rv
      }
      return getTimestamp(b) - getTimestamp(a)
    })
    .map(item => {
      let state = null
      let transferType: ?string = null
      let password: ?string = null
      if (!item.error) {
        if (
          item.transferId &&
          transferIdsSet.has(item.transferId) &&
          transfersDict[item.transferId]
        ) {
          password = Base64.decode(transfersDict[item.transferId].password)
          transferType = 'SENDER'
        } else if (item.receivingId && receivingIdsSet.has(item.receivingId)) {
          transferType = 'RECEIVER'
        } else {
          item.error = `Cannot identify transferType for item ${JSON.stringify(item)}`
        }
        const { sendTxState, receiveTxState, cancelTxState } = item
        switch (sendTxState) {
          case 'Pending': {
            // SEND_PENDING
            state = transferStates.SEND_PENDING
            break
          }
          case 'Confirmed': {
            switch (receiveTxState) {
              // SEND_CONFIRMED_RECEIVE_PENDING
              case 'Pending':
                state = transferStates.SEND_CONFIRMED_RECEIVE_PENDING
                break
              // SEND_CONFIRMED_RECEIVE_CONFIRMED
              case 'Confirmed':
                state = transferStates.SEND_CONFIRMED_RECEIVE_CONFIRMED
                break
              // SEND_CONFIRMED_RECEIVE_FAILURE
              case 'Failed':
                state = transferStates.SEND_CONFIRMED_RECEIVE_FAILURE
                break
              case null:
                state = transferStates.SEND_CONFIRMED_RECEIVE_NOT_INITIATED
                break
              case 'Expired': {
                // SEND_CONFIRMED_RECEIVE_EXPIRED
                state = transferStates.SEND_CONFIRMED_RECEIVE_EXPIRED
                break
              }
              default:
                break
            }
            switch (cancelTxState) {
              // SEND_CONFIRMED_CANCEL_PENDING
              case 'Pending':
                state = transferStates.SEND_CONFIRMED_CANCEL_PENDING
                break
              // SEND_CONFIRMED_CANCEL_CONFIRMED
              case 'Confirmed':
                state = transferStates.SEND_CONFIRMED_CANCEL_CONFIRMED
                break
              // SEND_CONFIRMED_CANCEL_FAILURE
              case 'Failed':
                state = transferStates.SEND_CONFIRMED_CANCEL_FAILURE
                break
              default:
                break
            }
            break
          }
          default:
            break
        }
      }
      return {
        ...item,
        transferType,
        password,
        state
      }
    })

  return { hasMore, transferData, offset }
}

function submitTx (txRequest: {
  fromAccount: AccountData,
  transferAmount: StandardTokenUnit,
  transferFiatAmountSpot: string,
  fiatType: string,
  destination: string,
  receiverName: string,
  senderName: string,
  senderAvatar: string,
  sender: string,
  password: string,
  sendMessage: ?string,
  txFee: TxFee
}) {
  return {
    type: 'SUBMIT_TX',
    payload: _submitTx(txRequest)
  }
}

// function directTransfer (txRequest: {
//   fromWallet: Object,
//   transferAmount: StandardTokenUnit,
//   destinationAddress: Address,
//   txFee: TxFee
// }) {
//   return (dispatch: Function, getState: Function) => {
//     return dispatch({
//       type: 'DIRECT_TRANSFER',
//       payload: _directTransfer(txRequest)
//     })
//   }
// }

function acceptTransfer (txRequest: {
  escrowAccount: AccountData,
  destinationAddress: Address,
  transferAmount: StandardTokenUnit,
  txFee: TxFee,
  receivingId: string,
  receiveMessage: ?string,
  walletId: string
}) {
  return (dispatch: Function, getState: Function) => {
    return dispatch({
      type: 'ACCEPT_TRANSFER',
      payload: _acceptTransfer(txRequest)
    }).then(() => {
      dispatch(goToStep('receive', 1))
    })
  }
}

function cancelTransfer (txRequest: {
  escrowAccount: AccountData,
  transferId: string,
  sendTxHash: TxHash,
  transferAmount: StandardTokenUnit,
  txFee: TxFee,
  cancelMessage: ?string,
  walletId: string
}) {
  return (dispatch: Function, getState: Function) => {
    return dispatch({
      type: 'CANCEL_TRANSFER',
      payload: _cancelTransfer(txRequest)
    }).then(() => dispatch(goToStep('cancel', 1)))
  }
}

function getTxFee (txRequest: { fromAccount: AccountData, transferAmount: StandardTokenUnit }) {
  return (dispatch: Function, getState: Function) => {
    return dispatch({
      type: 'GET_TX_COST',
      payload: _getTxFee(txRequest)
    })
  }
}

function getTransfer (transferId: ?string, receivingId: ?string) {
  return {
    type: 'GET_TRANSFER',
    payload: _getTransfer(transferId, receivingId)
  }
}

function getTransferHistory (offset: number) {
  return {
    type: 'GET_TRANSFER_HISTORY',
    payload: _getTransferHistory(offset)
  }
}

function clearVerifyEscrowAccountPasswordError () {
  return {
    type: 'CLEAR_VERIFY_ESCROW_ACCOUNT_PASSWORD_ERROR'
  }
}

export {
  submitTx,
  acceptTransfer,
  cancelTransfer,
  getTxFee,
  getTransfer,
  getTransferHistory,
  clearVerifyEscrowAccountPasswordError,
  transferStates
}
