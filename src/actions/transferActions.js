// @flow
import API from '../apis'
import Web3 from 'web3'
import axios from 'axios'
import utils from '../utils'
import { goToStep } from './navigationActions'
import { saveTempSendFile, saveHistoryFile, getAllTransfers } from '../drive.js'
import moment from 'moment'
import { Base64 } from 'js-base64'
import { getCryptoDecimals } from '../tokens'
import url from '../url'
import WalletUtils from '../wallets/utils'
import WalletFactory from '../wallets/factory'
import type { Wallet, WalletData } from '../types/wallet.flow.js'
import type { TxFee, TxHash } from '../types/transfer.flow.js'
import type { StandardTokenUnit, BasicTokenUnit, Address } from '../types/token.flow'

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

async function getFirstFromAddress (txHash: string) {
  const rv = (await axios.get(`${url.LEDGER_API_URL}/transactions/${txHash}`)).data
  const address = rv[0].inputs[0].address
  return address
}

async function _getTxFee (txRequest: {
  fromWallet: WalletData,
  transferAmount: StandardTokenUnit,
  options: Object
}) {
  let { fromWallet, transferAmount, options } = txRequest
  let txFee: TxFee = await WalletFactory.createWallet(fromWallet).getTxFee({
    value: utils
      .toBasicTokenUnit(transferAmount, getCryptoDecimals(fromWallet.cryptoType))
      .toString(),
    options: options
  })
  return txFee
}

async function _directTransfer (txRequest: {
  fromWallet: WalletData,
  transferAmount: StandardTokenUnit,
  destinationAddress: Address,
  txFee: TxFee
}) {
  let { fromWallet, transferAmount, destinationAddress, txFee } = txRequest

  // convert transferAmount to basic token unit
  let value: BasicTokenUnit = utils
    .toBasicTokenUnit(transferAmount, getCryptoDecimals(fromWallet.cryptoType))
    .toString()

  return {
    cryptoType: fromWallet.cryptoType,
    sendTxHash: await WalletFactory.createWallet(fromWallet).sendTransaction({
      to: destinationAddress,
      value: value,
      txFee: txFee
    })
  }
}

async function _submitTx (txRequest: {
  fromWallet: WalletData,
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
    fromWallet,
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

  let { cryptoType } = fromWallet
  // add destination to password to enhance security
  let _password = password + destination

  // generate an escrow wallet
  let escrowWallet: Wallet = await WalletFactory.generateWallet({
    walletType: 'escrow',
    cryptoType: cryptoType
  })

  let escrowAccount = escrowWallet.getAccount()

  // supress flow warning
  if (!escrowAccount.privateKey) throw new Error('PrivateKey missing in escrow account')
  let encryptedPrivateKey = await utils.encryptMessage(escrowAccount.privateKey, _password)

  let sendTxHash
  let sendTxFeeTxHash

  // before sending out a TX, store a backup of encrypted escrow wallet in user's drive
  await saveTempSendFile({
    sender: sender,
    destination: destination,
    transferAmount: transferAmount,
    cryptoType: fromWallet.cryptoType,
    data: Base64.encode(encryptedPrivateKey),
    password: Base64.encode(_password),
    tempTimestamp: moment().unix()
  })

  // convert transferAmount to basic token unit
  let value: BasicTokenUnit = utils
    .toBasicTokenUnit(transferAmount, getCryptoDecimals(cryptoType))
    .toString()

  if (['ethereum', 'bitcoin', 'dai', 'libra'].includes(cryptoType)) {
    let txHashList = await WalletFactory.createWallet(fromWallet).sendTransaction({
      to: escrowAccount.address,
      value: value,
      txFee: txFee,
      options: cryptoType === 'dai' ? { prepayTxFee: true } : null
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
    password: Base64.encode(_password)
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
  password: string
|}) {
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
  escrowWallet: WalletData,
  receiveWallet: WalletData,
  transferAmount: StandardTokenUnit,
  txFee: TxFee,
  receivingId: string,
  receiveMessage: ?string
}) {
  let {
    escrowWallet,
    txFee,
    receiveWallet,
    transferAmount,
    receivingId,
    receiveMessage
  } = txRequest

  let { cryptoType } = escrowWallet
  // convert transferAmount to basic token unit
  let value: BasicTokenUnit = utils
    .toBasicTokenUnit(transferAmount, getCryptoDecimals(cryptoType))
    .toString()

  let receiveTxHash: any = await WalletFactory.createWallet(escrowWallet).sendTransaction({
    to: WalletFactory.createWallet(receiveWallet).getAccount().address,
    value: value,
    txFee: txFee
  })
  if (Array.isArray(receiveTxHash)) throw new Error('receiveTxHash should not be an array')

  return _acceptTransferTransactionHashRetrieved({
    receiveTxHash: receiveTxHash,
    receivingId: receivingId,
    receiveMessage: receiveMessage
  })
}

async function _acceptTransferTransactionHashRetrieved (txRequest: {|
  receiveTxHash: TxHash,
  receivingId: string,
  receiveMessage: ?string
|}) {
  let response = await API.accept(txRequest)

  await saveHistoryFile({
    receivingId: txRequest.receivingId,
    receiveTimestamp: response.receiveTimestamp
  })
  return response
}

async function _cancelTransfer (txRequest: {
  escrowWallet: WalletData,
  transferId: string,
  sendTxHash: TxHash,
  transferAmount: StandardTokenUnit,
  txFee: TxFee,
  cancelMessage: ?string
}) {
  let { escrowWallet, transferId, sendTxHash, transferAmount, txFee, cancelMessage } = txRequest
  let { cryptoType } = escrowWallet

  // assuming wallet has been decrypted
  let wallet = WalletFactory.createWallet(escrowWallet)

  // convert transferAmount to basic token unit
  let value: BasicTokenUnit = utils
    .toBasicTokenUnit(transferAmount, getCryptoDecimals(cryptoType))
    .toString()
  let senderAddress: Address

  if (cryptoType === 'bitcoin') {
    senderAddress = await getFirstFromAddress(sendTxHash)
  } else if (['ethereum', 'dai'].includes(cryptoType)) {
    // ethereum based coins
    const _web3 = new Web3(new Web3.providers.HttpProvider(url.INFURA_API_URL))
    let txReceipt = await _web3.eth.getTransactionReceipt(sendTxHash)
    senderAddress = txReceipt.from
  } else if (cryptoType === 'libra') {
    // txHash is the sender's address for libra
    senderAddress = sendTxHash
  } else {
    throw new Error(`Invalid cryptoType: ${cryptoType}`)
  }

  let cancelTxHash: any = await wallet.sendTransaction({
    to: senderAddress,
    value: value,
    txFee: txFee
  })

  return _cancelTransferTransactionHashRetrieved({
    transferId: transferId,
    cancelTxHash: cancelTxHash,
    cancelMessage: cancelMessage
  })
}

async function _cancelTransferTransactionHashRetrieved (txRequest: {|
  transferId: string,
  cancelTxHash: TxHash,
  cancelMessage: ?string
|}) {
  let response = await API.cancel(txRequest)
  let { cancelMessage } = txRequest
  return { ...response, cancelMessage }
}

async function _getTransfer (transferId: ?string, receivingId: ?string) {
  let transferData = await API.getTransfer({ transferId, receivingId })
  let walletData = WalletUtils.toWalletData('escrow', transferData.cryptoType, [
    {
      balance: transferData.balance,
      ethBalance: transferData.ethBalance,
      address: transferData.address,
      encryptedPrivateKey: transferData.data
    }
  ])
  return { transferData, walletData }
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

  let transferData = await API.getBatchTransfers({
    transferIds: transferIds,
    receivingIds: receivingIds
  })

  transferData = transferData
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
          password = Base64.decode(transfersDict[item.transferId].password).split(item.sender)[0]
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
          case 'Failed': {
            // SEND_FAILURE
            state = transferStates.SEND_FAILURE
            break
          }
          default:
            state = 'UNKNOW'
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
  fromWallet: WalletData,
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
  return (dispatch: Function, getState: Function) => {
    return dispatch({
      type: 'SUBMIT_TX',
      payload: _submitTx(txRequest)
    }).then(() => dispatch(goToStep('send', 1)))
  }
}

function setLastUsedAddress ({ idToken, cryptoType, walletType, address }) {
  return {
    type: 'SET_LAST_USED_ADDRESS',
    payload: API.setLastUsedAddress({ idToken, cryptoType, walletType, address })
  }
}

function directTransfer (txRequest: {
  fromWallet: Object,
  transferAmount: StandardTokenUnit,
  destinationAddress: Address,
  txFee: TxFee
}) {
  return (dispatch: Function, getState: Function) => {
    return dispatch({
      type: 'DIRECT_TRANSFER',
      payload: _directTransfer(txRequest)
    })
  }
}

function acceptTransfer (txRequest: {
  escrowWallet: WalletData,
  receiveWallet: WalletData,
  transferAmount: StandardTokenUnit,
  txFee: TxFee,
  receivingId: string,
  receiveMessage: ?string
}) {
  return (dispatch: Function, getState: Function) => {
    const { receiveWallet } = txRequest
    const { walletType, cryptoType } = receiveWallet
    return dispatch({
      type: 'ACCEPT_TRANSFER',
      payload: _acceptTransfer(txRequest)
    }).then(() => {
      const { profile } = getState().userReducer
      if (profile.isAuthenticated && profile.idToken) {
        const idToken = profile.idToken
        dispatch(
          setLastUsedAddress({
            idToken,
            cryptoType,
            walletType,
            address: WalletFactory.createWallet(receiveWallet).getAccount().address
          })
        )
      }

      dispatch(goToStep('receive', 1))
    })
  }
}

function cancelTransfer (txRequest: {
  escrowWallet: WalletData,
  transferId: string,
  sendTxHash: TxHash,
  transferAmount: StandardTokenUnit,
  txFee: TxFee,
  cancelMessage: ?string
}) {
  return (dispatch: Function, getState: Function) => {
    return dispatch({
      type: 'CANCEL_TRANSFER',
      payload: _cancelTransfer(txRequest)
    }).then(() => dispatch(goToStep('cancel', 1)))
  }
}

function getTxFee (txRequest: {
  fromWallet: WalletData,
  transferAmount: StandardTokenUnit,
  options: Object
}) {
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

function clearVerifyPasswordError () {
  return {
    type: 'CLEAR_VERIFY_PASSWORD_ERROR'
  }
}

export {
  submitTx,
  directTransfer,
  acceptTransfer,
  cancelTransfer,
  getTxFee,
  getTransfer,
  getTransferHistory,
  clearVerifyPasswordError,
  transferStates
}
