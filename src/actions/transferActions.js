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
import { postTxAccountCleanUp } from './accountActions'
import transferStates from '../transferStates'
import WalletUtils from '../wallets/utils'
import pWaitFor from 'p-wait-for'

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

function directTransfer (txRequest: {
  fromAccount: AccountData,
  destinationAccount: AccountData,
  transferAmount: StandardTokenUnit,
  transferFiatAmountSpot: string,
  fiatType: string,
  txFee: TxFee
}) {
  return (dispatch: Function, getState: Function) => {
    return dispatch({
      type: 'DIRECT_TRANSFER',
      payload: _directTransfer(txRequest)
    }).then(() => {
      dispatch(postTxAccountCleanUp(txRequest.fromAccount))
    })
  }
}

async function _directTransfer (txRequest: {
  fromAccount: AccountData,
  destinationAccount: AccountData,
  transferAmount: StandardTokenUnit,
  transferFiatAmountSpot: string,
  fiatType: string,
  txFee: TxFee
}) {
  let {
    fromAccount,
    destinationAccount,
    transferAmount,
    transferFiatAmountSpot,
    fiatType,
    txFee
  } = txRequest

  // convert transferAmount to basic token unit
  let value: BasicTokenUnit = utils
    .toBasicTokenUnit(transferAmount, getCryptoDecimals(fromAccount.cryptoType))
    .toString()
  const _wallet = createWallet(fromAccount)

  const rv = await _wallet.sendTransaction({
    to: destinationAccount.address,
    value: value,
    txFee: txFee,
    options: { directTransfer: true }
  })

  var { txHash } = rv
  if (!txHash) throw new Error('Failed to fetch txHash from sendTransaction()')

  const response = await API.directTransfer({
    senderAccount: JSON.stringify({
      cryptoType: fromAccount.cryptoType,
      walletType: fromAccount.walletType,
      address: fromAccount.address,
      name: fromAccount.name
    }),
    destinationAccount: JSON.stringify({
      cryptoType: destinationAccount.cryptoType,
      walletType: destinationAccount.walletType,
      address: destinationAccount.address,
      name: destinationAccount.name
    }),
    cryptoType: fromAccount.cryptoType,
    transferAmount,
    transferFiatAmountSpot,
    fiatType,
    sendTxHash: txHash
  })

  await saveHistoryFile({
    transferId: response.transferId,
    sendTimestamp: response.sendTimestamp,
  })

  return response
}

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

    const rv = await _wallet.sendTransaction({
      to: escrowAccount.getAccountData().address,
      value: value,
      txFee: txFee,
      options: { multisig }
    })
    var { txHash } = rv
    if (!txHash) throw new Error('Failed to fetch txHash from sendTransaction()')
  } else {
    throw new Error(`Invalid cryptoType: ${cryptoType}`)
  }

  // update tx data
  return _transactionHashRetrieved({
    transferAmount,
    transferFiatAmountSpot,
    fiatType,
    senderName,
    senderAvatar,
    sender,
    senderAccount: JSON.stringify({
      cryptoType: fromAccount.cryptoType,
      walletType: fromAccount.walletType,
      address: fromAccount.address,
      name: fromAccount.name
    }),
    sendMessage,
    destination,
    receiverName,
    data: Base64.encode(JSON.stringify(encryptedPrivateKey)),
    cryptoType: cryptoType,
    sendTxHash: txHash,
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
  senderAccount: string,
  destination: string,
  receiverName: string,
  cryptoType: string,
  sendMessage: ?string,
  data: string,
  sendTxHash: TxHash,
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
  destinationAccount: AccountData,
  transferAmount: StandardTokenUnit,
  txFee: TxFee,
  receivingId: string,
  receiveMessage: ?string,
  walletId: string
}) {
  let {
    escrowAccount,
    txFee,
    destinationAccount,
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
    multiSig = new SimpleMultiSig({
      walletId,
      receivingId
    })
  }

  const rv = await wallet.sendTransaction({
    to: destinationAccount.address,
    // actual value to be received = transferAmount - txFee
    value: new BN(value).sub(new BN(txFee.costInBasicUnit)),
    txFee: txFee,
    options: {
      multiSig
    }
  })

  if (rv.clientSig) {
    var { clientSig } = rv
  } else {
    throw new Error('clientSig not found')
  }

  const receiverAccount = JSON.stringify({
    cryptoType: destinationAccount.cryptoType,
    walletType: destinationAccount.walletType,
    address: destinationAccount.address,
    name: destinationAccount.name
  })

  const response = await API.accept({
    receivingId,
    receiverAccount,
    clientSig,
    receiveMessage
  })

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
    multiSig = new SimpleMultiSig({ walletId, transferId })
  } else if (cryptoType === 'libra') {
    // txHash is the sender's address for libra
    senderAddress = sendTxHash
  } else {
    throw new Error(`Invalid cryptoType: ${cryptoType}`)
  }

  await wallet.verifyAccount()

  const rv = await wallet.sendTransaction({
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

  if (rv.clientSig) {
    var { clientSig } = rv
  } else {
    throw new Error('clientSig not found')
  }

  const response = await API.cancel({
    transferId,
    clientSig,
    cancelMessage
  })

  await saveHistoryFile({
    transferId: transferId,
    cancelTimestamp: response.cancelTimestamp
  })

  return { ...response, ...txRequest }
}

// helper function
function getTransferState (transferData: Object): string {
  let state
  const { sendTxState, receiveTxState, cancelTxState } = transferData
  switch (sendTxState) {
    case 'Pending': {
      // SEND_PENDING
      state = transferStates.SEND_PENDING
      break
    }
    case 'Confirmed': {
      if (transferData.senderToReceiver) {
        // special case, direct transfer
        state = transferStates.SEND_CONFIRMED
        break
      }
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
    case 'Failed':
      state = transferStates.SEND_FAILURE
      break
    default:
      break
  }
  if (!state) throw new Error('Unable to calculate transfer state')
  return state
}

// fetch transferData and convert it into an escrow account
async function _getTransfer (transferId: ?string, receivingId: ?string) {
  let transferData = await API.getTransfer({ transferId, receivingId })
  if (transferData.senderAccount) {
    transferData.senderAccount = createAccount(
      JSON.parse(transferData.senderAccount)
    ).getAccountData()
  }
  if (transferData.receiverAccount) {
    transferData.receiverAccount = createAccount(
      JSON.parse(transferData.receiverAccount)
    ).getAccountData()
  }
  transferData.state = getTransferState(transferData)
  transferData.transferType = transferId ? 'SENDER' : 'RECEIVER'
  transferData.txFee = await _getTxFeeForTransfer(transferData)
  if (transferData.txFee) {
    transferData.txFeeCurrencyAmount = utils.toCurrencyAmount(
      transferData.txFee.costInStandardUnit,
      parseFloat(transferData.transferFiatAmountSpot) / parseFloat(transferData.transferAmount),
      transferData.fiatType
    )
  }
  let escrowAccount = createAccount({
    walletType: 'escrow',
    cryptoType: transferData.cryptoType,
    encryptedPrivateKey: transferData.data,
    address: transferData.walletId
  }).getAccountData()
  return { transferData, escrowAccount }
}

async function _getTransferHistory (offset: number = 0, transferMethod: string ='ALL') {
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
    .filter(
      item =>
        (transferMethod === 'DIRECT_TRANSFER' && item.senderToReceiver) ||
        (transferMethod === 'EMAIL_TRANSFER' && !item.senderToReceiver) ||
        transferMethod === 'ALL'
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
      let state: ?string = null
      let transferType: ?string = null
      let password: ?string = null
      if (!item.error) {
        if (
          item.transferId &&
          transferIdsSet.has(item.transferId) &&
          transfersDict[item.transferId]
        ) {
          if (item.senderToReceiver) {
            transferType = 'DIRECT_TRANSFER'
          } else {
            password = Base64.decode(transfersDict[item.transferId].password)
            transferType = 'SENDER'
          }
        } else if (item.receivingId && receivingIdsSet.has(item.receivingId)) {
          transferType = 'RECEIVER'
        } else {
          item.error = `Cannot identify transferType for item ${JSON.stringify(item)}`
        }
        state = getTransferState(item)
      }
      return {
        ...item,
        transferType,
        password,
        state
      }
    })

  transferData = await Promise.all(
    transferData.map(async transfer => {
      if (!transfer.error) {
        if (!transfer.senderAvatar) {
          const senderProfile = await API.getUserProfileByEmail(transfer.sender)
          transfer.senderAvatar = senderProfile.imageUrl
        }
        if (!transfer.receiverAvatar) {
          const receiverProfile = await API.getUserProfileByEmail(transfer.destination)
          transfer.receiverAvatar = receiverProfile.imageUrl
        }
      }
      return transfer
    })
  )

  return { hasMore, transferData, offset }
}

async function _getTransferPassword (transferId: string): Promise<string> {
  let transfersDict = await getAllTransfers()
  if (transfersDict && transfersDict[transferId] && transfersDict[transferId].password) {
    return transfersDict[transferId].password
  } else {
    throw new Error(`Transfer ${transferId} does not exist`)
  }
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
  return (dispatch: Function, getState: Function) => {
    return dispatch({
      type: 'SUBMIT_TX',
      payload: _submitTx(txRequest)
    }).then(() => {
      dispatch(postTxAccountCleanUp(txRequest.fromAccount))
    })
  }
}

function acceptTransfer (txRequest: {
  escrowAccount: AccountData,
  destinationAccount: AccountData,
  transferAmount: StandardTokenUnit,
  txFee: TxFee,
  receivingId: string,
  receiveMessage: ?string,
  walletId: string
}) {
  return {
    type: 'ACCEPT_TRANSFER',
    payload: _acceptTransfer(txRequest)
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

function getTransferHistory (offset: number, transferMethod: string) {
  return {
    type: 'GET_TRANSFER_HISTORY',
    payload: _getTransferHistory(offset, transferMethod)
  }
}

function getTransferPassword (transferId: string) {
  return {
    type: 'GET_TRANSFER_PASSWORD',
    payload: _getTransferPassword(transferId)
  }
}

function clearVerifyEscrowAccountPasswordError () {
  return {
    type: 'CLEAR_VERIFY_ESCROW_ACCOUNT_PASSWORD_ERROR'
  }
}

async function _getTxFeeForTransfer (transferData) {
  const { cryptoType, senderToChainsfer, chainsferToSender, transferType } = transferData

  if (chainsferToSender || transferType === 'RECEIVER') {
    return {
      price: '0',
      gas: '0',
      costInBasicUnit: '0',
      costInStandardUnit: '0'
    }
  } else {
    const { txHash } = senderToChainsfer
    if (cryptoType === 'bitcoin') {
      const rv = await WalletUtils.getUtxoDetails(txHash)
      if (!rv) return null
      return {
        price: 0,
        gas: 0,
        costInBasicUnit: rv.fees.toString(),
        costInStandardUnit: utils
          .toHumanReadableUnit(rv.fees.toString(), getCryptoDecimals('bitcoin'), 8)
          .toString()
      }
    } else if (['ethereum', 'dai'].includes(cryptoType)) {
      const _web3 = new Web3(new Web3.providers.HttpProvider(url.INFURA_API_URL))
      const rv = await axios.post(url.INFURA_API_URL, {
        method: 'eth_getTransactionByHash',
        params: [txHash],
        jsonrpc: '2.0',
        id: 1
      })
      if (rv.data.result) {
        let { gasPrice } = rv.data.result
        gasPrice = _web3.utils.hexToNumber(gasPrice)
        const receipt = await _web3.eth.getTransactionReceipt(txHash)
        let gas = 0
        if (!receipt) return null
        gas = receipt.gasUsed
        const costInBasicUnit = new BN(gasPrice).mul(new BN(gas)).toString()
        return {
          price: gasPrice.toString(),
          gas: gas.toString(),
          costInBasicUnit: costInBasicUnit,
          costInStandardUnit: utils
            .toHumanReadableUnit(costInBasicUnit, getCryptoDecimals('ethereum'), 8)
            .toString()
        }
      } else return null
    }
  }
}

async function _setTokenAllowance (
  fromAccount: AccountData,
  tokenAllowanceAmount: StandardTokenUnit
) {
  let _wallet = createWallet(fromAccount)
  const amountBasicTokenUnit = utils
    .toBasicTokenUnit(tokenAllowanceAmount, getCryptoDecimals(fromAccount.cryptoType))
    .toString()
  const txHash: TxHash = await _wallet.setTokenAllowance(amountBasicTokenUnit)
  return txHash
}

async function _setTokenAllowanceWaitForConfirmation (txHash: TxHash) {
  if (!txHash) return
  const checkConfirmation = async () => {
    const Web3 = require('web3')
    const web3 = new Web3(new Web3.providers.HttpProvider(url.INFURA_API_URL))
    const receipt = await web3.eth.getTransactionReceipt(txHash)
    if (receipt && receipt.status === false) {
      throw new Error('Transaction was unsuccessful')
    }
    return !!receipt
  }

  // intierval: 5s, timeout: inf
  await pWaitFor(checkConfirmation, { interval: 5000 })
}

function setTokenAllowance (fromAccount: AccountData, tokenAllowanceAmount: StandardTokenUnit) {
  return (dispatch: Function, getState: Function) => {
    return dispatch({
      type: 'SET_TOKEN_ALLOWANCE',
      payload: _setTokenAllowance(fromAccount, tokenAllowanceAmount),
      meta: {
        localErrorHandling: true
      }
    })
      .then(({ value }) =>
        dispatch({
          type: 'SET_TOKEN_ALLOWANCE_WAIT_FOR_CONFIRMATION',
          payload: _setTokenAllowanceWaitForConfirmation(value)
        })
      )
      .then(() =>
        // we need to update tx fee since we likely had an
        // 'gas required exceeds allowance (10000000)' revert error while getting
        // tx fee previously
        dispatch({
          type: 'GET_TX_COST',
          payload: _getTxFee({
            fromAccount,
            transferAmount: getState().formReducer.transferForm.transferAmount
          })
        })
      )
      .catch(e => console.warn(e))
  }
}

export {
  submitTx,
  acceptTransfer,
  cancelTransfer,
  getTxFee,
  getTransfer,
  getTransferHistory,
  getTransferPassword,
  clearVerifyEscrowAccountPasswordError,
  transferStates,
  directTransfer,
  setTokenAllowance
}
