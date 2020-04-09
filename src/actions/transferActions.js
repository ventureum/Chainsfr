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
import { getCryptoDecimals, isERC20, getCryptoPlatformType, getCrypto } from '../tokens'
import url from '../url'
import SimpleMultiSig from '../SimpleMultiSig'
import type { TxFee, TxHash, AccountTxHistoryType } from '../types/transfer.flow.js'
import type { StandardTokenUnit, BasicTokenUnit, Address } from '../types/token.flow'
import type { AccountData } from '../types/account.flow.js'
import { createWallet } from '../wallets/WalletFactory'
import { createAccount } from '../accounts/AccountFactory'
import { postTxAccountCleanUp } from './accountActions'
import transferStates from '../transferStates'
import WalletUtils from '../wallets/utils'
import pWaitFor from 'p-wait-for'
import env from '../typedEnv'
import { erc20TokensList } from '../erc20Tokens'

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

function submitDirectTransferTx (txRequest: {
  fromAccount: AccountData,
  destinationAccount: AccountData,
  transferAmount: StandardTokenUnit,
  transferFiatAmountSpot: string,
  fiatType: string,
  sendMessage: ?string,
  txFee: TxFee
}) {
  return (dispatch: Function, getState: Function) => {
    return dispatch({
      type: 'DIRECT_TRANSFER',
      payload: _submitDirectTransferTx(txRequest)
    }).then(() => {
      dispatch(postTxAccountCleanUp(txRequest.fromAccount))
    })
  }
}

async function _submitDirectTransferTx (txRequest: {
  fromAccount: AccountData,
  destinationAccount: AccountData,
  transferAmount: StandardTokenUnit,
  transferFiatAmountSpot: string,
  fiatType: string,
  sendMessage: ?string,
  txFee: TxFee
}) {
  let {
    fromAccount,
    destinationAccount,
    transferAmount,
    transferFiatAmountSpot,
    fiatType,
    sendMessage,
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
    sendMessage,
    sendTxHash: txHash
  })

  await saveHistoryFile({
    transferId: response.transferId,
    senderAccountId: fromAccount.id,
    sendTimestamp: response.sendTimestamp,
    sendTxHash: txHash
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
  receiverAvatar: ?string,
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
    receiverAvatar,
    txFee
  } = txRequest

  let { cryptoType } = fromAccount

  // generate an escrow wallet
  let walletId
  let escrowWallet = createWallet({ walletType: 'escrow' })

  let escrowAccount = await escrowWallet.newAccount('escrow', cryptoType)
  await escrowAccount.encryptAccount(password)
  let encryptedPrivateKey = escrowAccount.getAccountData().encryptedPrivateKey

  if (!sendMessage || sendMessage === '') {
    // Set a default message if not provided
    sendMessage = MESSAGE_NOT_PROVIDED
  }
  // convert transferAmount to basic token unit
  let value: BasicTokenUnit = utils
    .toBasicTokenUnit(transferAmount, getCryptoDecimals(cryptoType))
    .toString()

  if (['ethereum', 'bitcoin', 'libra', ...erc20TokensList].includes(cryptoType)) {
    let multisig
    if (['ethereum', ...erc20TokensList].includes(cryptoType)) {
      walletId = new SimpleMultiSig().createWalletId()
      multisig = new SimpleMultiSig({ walletId })
    }
    if (cryptoType === 'bitcoin') {
      walletId = escrowAccount.getAccountData().address
    }
    const _wallet = createWallet(fromAccount)

    var transferObj = {
      transferId: null,
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
      receiverAvatar,
      data: Base64.encode(JSON.stringify(encryptedPrivateKey)),
      cryptoType: cryptoType,
      // we do not have txHash yet
      sendTxHash: null,
      walletId: walletId
    }

    // back transfer data in db before broadcasting
    const dryRunResponse = await API.transfer(transferObj)
    const { transferId, timestamp } = dryRunResponse

    // before sending out a TX, store a backup of encrypted escrow wallet in user's drive
    await saveTempSendFile({
      transferId,
      sender: sender,
      destination: destination,
      transferAmount: transferAmount,
      cryptoType: cryptoType,
      data: Base64.encode(encryptedPrivateKey),
      password: Base64.encode(password),
      tempTimestamp: timestamp
    })

    const rv = await _wallet.sendTransaction({
      to: escrowAccount.getAccountData().address,
      value: value,
      txFee: txFee,
      options: { multisig }
    })
    var { txHash } = rv
    if (!txHash) throw new Error('Failed to fetch txHash from sendTransaction()')

    // update sendTxHash
    return _transactionHashRetrieved({
      ...transferObj,
      transferId,
      senderAccountId: fromAccount.id,
      sendTxHash: txHash,
      password: Base64.encode(password)
    })
  } else {
    throw new Error(`Invalid cryptoType: ${cryptoType}`)
  }
}

async function _transactionHashRetrieved (txRequest: {|
  transferId: string,
  transferAmount: StandardTokenUnit,
  transferFiatAmountSpot: string,
  fiatType: string,
  senderName: string,
  senderAvatar: string,
  sender: string,
  senderAccount: string,
  senderAccountId: string,
  destination: string,
  receiverName: string,
  receiverAvatar: ?string,
  cryptoType: string,
  sendMessage: ?string,
  data: string,
  sendTxHash: TxHash,
  password: string,
  walletId?: string
|}) {
  // mask out password
  const { password, senderAccountId, ...request } = txRequest
  let response = await API.transfer(request)

  await saveHistoryFile({
    transferId: response.transferId,
    // used to filter transfer history by account
    senderAccountId: senderAccountId,
    sendTimestamp: response.sendTimestamp,
    data: txRequest.data,
    password: txRequest.password,
    sendTxHash: txRequest.sendTxHash
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

  if (['ethereum', ...erc20TokensList].includes(cryptoType)) {
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
    // used to filter transfer history by account
    destinationAccountId: destinationAccount.id,
    receiveTimestamp: response.receiveTimestamp,
    receiveTxHash: response.receiveTxHash
  })

  return { ...response, ...txRequest }
}

async function _cancelTransfer (txRequest: {
  senderAccount: AccountData,
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
  } else if (['ethereum', ...erc20TokensList].includes(cryptoType)) {
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
    // used to filter transfer history by account
    senderAccountId: escrowAccount.id,
    cancelTimestamp: response.cancelTimestamp,
    cancelTxHash: response.cancelTxHash
  })

  return { ...response, ...txRequest }
}

// helper function
// transferState format: [SEND_STATE, EXPIRED_STATE(optional), RECEIVE_STATE | CANCEL_STATE]
// which follows the timeline of transfer events
function getTransferState (transferData: Object): string {
  let state
  const { sendTxState, receiveTxState, cancelTxState, transferMethod, expired } = transferData
  switch (sendTxState) {
    case 'Pending': {
      // SEND_PENDING
      if (transferMethod === 'DIRECT_TRANSFER') {
        // special case, direct transfer
        state = transferStates.SEND_DIRECT_TRANSFER_PENDING
        break
      } else if (transferMethod === 'EMAIL_TRANSFER') {
        state = transferStates.SEND_PENDING
        break
      } else {
        throw new Error(`Invalid transferMethod ${transferMethod}`)
      }
    }
    case 'Confirmed': {
      if (transferMethod === 'DIRECT_TRANSFER') {
        // special case, direct transfer
        state = transferStates.SEND_DIRECT_TRANSFER_CONFIRMED
        break
      }
      // expired state
      const EXPIRED_STATE = expired ? '_EXPIRED' : ''
      switch (receiveTxState) {
        // SEND_CONFIRMED_RECEIVE_PENDING
        case 'Pending':
          state = transferStates[`SEND_CONFIRMED${EXPIRED_STATE}_RECEIVE_PENDING`]
          break
        // SEND_CONFIRMED_RECEIVE_CONFIRMED
        case 'Confirmed':
          // receive confirmed after expiration is possible:
          //  receiver started receiving right before expiration,
          //  transfer expired and receiver's tx is confirmed
          state = transferStates[`SEND_CONFIRMED${EXPIRED_STATE}_RECEIVE_CONFIRMED`]
          break
        // SEND_CONFIRMED_RECEIVE_FAILURE
        case 'Failed':
          state = transferStates[`SEND_CONFIRMED${EXPIRED_STATE}_RECEIVE_FAILURE`]
          break
        case 'NotInitiated':
          state = transferStates[`SEND_CONFIRMED${EXPIRED_STATE}_RECEIVE_NOT_INITIATED`]
          break
        default:
          break
      }
      switch (cancelTxState) {
        // SEND_CONFIRMED_CANCEL_PENDING
        case 'Pending':
          state = transferStates[`SEND_CONFIRMED${EXPIRED_STATE}_CANCEL_PENDING`]
          break
        // SEND_CONFIRMED_CANCEL_CONFIRMED
        case 'Confirmed':
          // SEND_CONFIRMED_EXPIRED_CANCEL_CONFIRMED is equivalent to reclaimed
          state = transferStates[`SEND_CONFIRMED${EXPIRED_STATE}_CANCEL_CONFIRMED`]
          break
        // SEND_CONFIRMED_CANCEL_FAILURE
        case 'Failed':
          state = transferStates[`SEND_CONFIRMED${EXPIRED_STATE}_CANCEL_FAILURE`]
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
  if (!state) {
    console.warn('Unable to calculate transfer state', transferData)
    state = ''
  }
  return state
}

// fetch transferData and convert it into an escrow account
async function _getTransfer (transferId: ?string, receivingId: ?string) {
  let transferData = await API.getTransfer({ transferId, receivingId })

  // default transfer method
  transferData.transferMethod = 'EMAIL_TRANSFER'

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
  // direct transfer destination account
  if (transferData.destinationAccount) {
    transferData.destinationAccount = createAccount(
      JSON.parse(transferData.destinationAccount)
    ).getAccountData()
    transferData.transferMethod = 'DIRECT_TRANSFER'
  }
  transferData.state = getTransferState(transferData)
  transferData.transferType =
    transferData.transferMethod === 'EMAIL_TRANSFER'
      ? transferId
        ? 'SENDER'
        : 'RECEIVER'
      : 'SENDER'
  transferData.txFee = await _getTxFeeForTransfer(transferData)

  if (transferData.txFee) {
    transferData.txFeeCurrencyAmount = utils.toCurrencyAmount(
      transferData.txFee.costInStandardUnit,
      parseFloat(transferData.transferFiatAmountSpot) / parseFloat(transferData.transferAmount),
      transferData.fiatType
    )
  }

  if (!transferData.senderAvatar) {
    const senderProfile = await API.getUserProfileByEmail(transferData.sender)
    transferData.senderAvatar = senderProfile.imageUrl
  }
  if (!transferData.receiverAvatar) {
    const receiverProfile = await API.getUserProfileByEmail(transferData.destination)
    transferData.receiverAvatar = receiverProfile.imageUrl
  }

  let escrowAccount = createAccount({
    walletType: 'escrow',
    cryptoType: transferData.cryptoType,
    encryptedPrivateKey: transferData.data,
    address: transferData.walletId
  }).getAccountData()
  return { transferData, escrowAccount }
}

function unmarshalAccount (transferData) {
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
  // direct transfer destination account
  if (transferData.destinationAccount) {
    transferData.destinationAccount = createAccount(
      JSON.parse(transferData.destinationAccount)
    ).getAccountData()
  }

  const transferMethod = transferData.senderToReceiver ? 'DIRECT_TRANSFER' : 'EMAIL_TRANSFER'
  transferData = { ...transferData, transferMethod }
  const state = getTransferState(transferData)

  return { ...transferData, state }
}

// gather recent txs using third-party APIs for an account
async function getRecentTxs (account: AccountData): Promise<Array<Object>> {
  const MAX_TXS = 50 // maximum number of txs
  let txs = []
  if (getCryptoPlatformType(account.cryptoType) === 'bitcoin') {
    // get a list of txs
    let response = await axios.get(
      `${url.LEDGER_API_URL}/addresses/${account.address}/transactions?noToken=true`
    )

    // filter out unconfirmed
    txs = response.data.txs.filter(tx => tx.confirmations > 0)

    // sort tx by received timestamp in non-increasing order
    txs = txs.sort(
      (txA, txB) => moment(txB['received_at']).unix() - moment(txA['received_at']).unix()
    )
  } else if (getCryptoPlatformType(account.cryptoType) === 'ethereum') {
    if (isERC20(account.cryptoType)) {
      // token tx
      // gather erc20 txs
      let response = await axios.get(
        `${url.ETHERSCAN_API_URL}/api?module=account&action=tokentx&address=${
          account.address
        }&contractaddress=${
          getCrypto(account.cryptoType).address
        }&page=1&offset=${MAX_TXS}&sort=desc&apikey=${env.REACT_APP_ETHERSCAN_API_KEY}`
      )
      txs = response.data.result
    } else {
      // eth tx
      // 1. gather normal tx
      let response = await axios.get(
        `${url.ETHERSCAN_API_URL}/api?module=account&action=txlist&address=${
          account.address
        }&page=1&offset=${MAX_TXS}&sort=desc&apikey=${env.REACT_APP_ETHERSCAN_API_KEY}`
      )
      const txsNormal = response.data.result

      // 2. gather internal tx (sent from a contract)
      response = await axios.get(
        `${url.ETHERSCAN_API_URL}/api?module=account&action=txlistinternal&address=${
          account.address
        }&page=1&offset=${MAX_TXS}&sort=desc&apikey=${env.REACT_APP_ETHERSCAN_API_KEY}`
      )
      const txsInternal = response.data.result

      // combine normal txs and internal txs, order in non-increasing timestamp
      txs = [...txsNormal, ...txsInternal].sort((txA, txB) => txB - txA)
    }
  }
  return txs
}

/* 
  Given a list a txHash, convert the corresponding list of transferData
  into list of txHistory objects

  @param transferDataList Array of transferData to be converted
  @param txHashDict original list of txHash to be looked up
 */
async function TransferData2TxHistory (transferDataList, txHashDict) {
  // handle matched txHash list
  // fill in txs with transferData
  let rv = {}
  for (let transferData of transferDataList) {
    let hash
    let { sendTxHash, receiveTxHash, cancelTxHash } = transferData
    let transferType: string
    let timestamp
    // exactly one of [sendTxHash | receiveTxHash | cancelTxHash] matches txHash
    if (sendTxHash && sendTxHash in txHashDict) {
      transferType = 'SENDER'
      if (transferData.senderToChainsfer) {
        // email transfer
        timestamp = transferData.senderToChainsfer.txTimestamp
      } else if (transferData.senderToReceiver) {
        // direct transfrer
        timestamp = transferData.senderToReceiver.txTimestamp
      }
      hash = sendTxHash
    } else if (receiveTxHash && receiveTxHash in txHashDict) {
      transferType = 'RECEIVER'
      timestamp = transferData.chainsferToReceiver.txTimestamp
      hash = receiveTxHash
    } else if (cancelTxHash && cancelTxHash in txHashDict) {
      transferType = 'SENDER'
      timestamp = transferData.chainsferToSender.txTimestamp
      hash = cancelTxHash
    } else {
      console.log(sendTxHash, txHashDict[sendTxHash])
      // this should not happen
      throw new Error('transferData does not have matched txHash')
    }

    // fill in data
    transferData = unmarshalAccount(transferData)
    rv[hash] = { timestamp }
    rv[hash].transferData = { ...transferData, transferType }
  }
  return rv
}

async function getPendingTxHistoryByAccount (account, confirmedTxs) {
  // number of most most recent txs to check
  const NUM_MOST_RECENT_TXS = 20

  // https://github.com/facebook/flow/issues/6064
  // $FlowFixMe
  let transfersDict = await getAllTransfers()

  // convert dict to array
  let transfers = []
  for (let key in transfersDict) {
    const { senderAccountId, destinationAccountId, sendTxHash, cancelTxHash } = transfersDict[key]
    if (
      utils.accountsEqual(account, { id: senderAccountId }) ||
      utils.accountsEqual(account, { id: destinationAccountId })
    ) {
      // filter by account
      if (sendTxHash && cancelTxHash) {
        // special case
        // need to split it into two separate transfers, each representing
        // a distinct tx
        transfers.push({
          ...transfersDict[key],
          cancelTxHash: undefined,
          cancelTimestamp: undefined
        })
        transfers.push({
          ...transfersDict[key],
          sendTxHash: undefined,
          sendTimestamp: undefined
        })
      } else {
        transfers.push(transfersDict[key])
      }
    }
  }

  // sort by timestamp
  transfers = transfers.sort((a, b) => {
    let getTimestamp = item => {
      let rv = item.sendTimestamp
        ? item.sendTimestamp
        : item.receiveTimestamp
        ? item.receiveTimestamp
        : item.cancelTimestamp
      if (!rv) {
        console.warn('Missing timestamp in transfer history data')
        return 0
      }
      return rv
    }
    return getTimestamp(b) - getTimestamp(a)
  })

  // only check most recent txs
  transfers = transfers.slice(0, NUM_MOST_RECENT_TXS)

  // create a dict for confirmedTxs for look-ups
  const confirmedTxsDict = {}
  confirmedTxs.map(tx => (confirmedTxsDict[tx.hash] = {}))

  // filter transfer whose txHash is in confirmedTxs
  transfers = transfers.filter(transferItem => {
    const { sendTxHash, receiveTxHash, cancelTxHash } = transferItem
    if (sendTxHash && sendTxHash in confirmedTxsDict) return false
    if (receiveTxHash && receiveTxHash in confirmedTxsDict) return false
    if (cancelTxHash && cancelTxHash in confirmedTxsDict) return false

    // filter out invalid trqnsfers
    if (!sendTxHash && !receiveTxHash && !cancelTxHash) return false

    return true
  })

  const txHash2Idx = transfers.reduce((accumulator, currentValue, idx) => {
    if (currentValue) {
      const { sendTxHash, receiveTxHash, cancelTxHash } = currentValue
      if (sendTxHash || receiveTxHash || cancelTxHash) {
        accumulator[sendTxHash || receiveTxHash || cancelTxHash] = idx
      }
    }
    return accumulator
  }, {})

  // gather data for pending txs
  // make it match AccountTxHistoryType
  const transferDataList = await API.getBatchTransfers({
    transferIds: transfers.filter(item => item.transferId).map(item => item.transferId),
    receivingIds: transfers.filter(item => item.receivingId).map(item => item.receivingId)
  })

  // handle matched txHash list
  // fill in txs with transferData
  let rv = await TransferData2TxHistory(transferDataList, txHash2Idx)

  // convert to array
  rv = Object.entries(rv).map(([txHash, value]) => {
    //$FlowFixMe
    return {
      txHash,
      ...value
    }
  })

  // re-sort by timestamp in non-increasing order
  rv = rv.sort((txA, txB) => txB.timestamp - txA.timestamp)

  return rv
}

async function _getTxHistoryByAccount ({
  account,
  accountTxHistory
}: {
  account: AccountData,
  accountTxHistory: ?AccountTxHistoryType
}) {
  const MAX_TXS = 50 // maximum number of txs
  const MIN_UPDATE_INTERVAL = 10 // 10 seconds

  // init accountTxHistory if necessary
  accountTxHistory = accountTxHistory
    ? accountTxHistory
    : {
        updated: null,
        confirmedTxs: [],
        pendingTxs: []
      }

  // do not update if MIN_UPDATE_INTERVAL has not passed
  if (accountTxHistory.updated + MIN_UPDATE_INTERVAL >= moment().unix())
    return { account, accountTxHistory }

  let txs: Array<Object> = []

  // gather recent txs using third-party APIs
  // tx always have property hash regardless of cryptoType
  txs = await getRecentTxs(account)
  const confirmedTxs = txs

  // limit the numnber of txs to MAX_TXS
  txs = txs.slice(0, MAX_TXS)

  // create a dict with key of txHash for existing tx history
  let historyDict = {}
  if (accountTxHistory.confirmedTxs) {
    accountTxHistory.confirmedTxs.map(tx => (historyDict[tx.txHash] = tx))
  }

  // filter out tx whose corresponding transferData or standaloneTx already
  // exists in accountTxHistory
  txs = txs.filter(tx => !historyDict[tx.txHash])

  const txHash2Idx = txs.reduce((accumulator, currentValue, idx) => {
    if (currentValue && currentValue.hash) {
      accumulator[currentValue.hash] = idx
    }
    return accumulator
  }, {})

  // lookup hashes in our transfer database to see if any
  // transfer.[sendTxHash | receiveTxHash | cancelTxHash] matches txHash
  const txHashLookupResults: Array<{
    txHash: string,
    transferId: string,
    receivingId: string
  }> = await API.lookupTxHash(txs.map(tx => tx.hash))

  // split results into matched and unmatched
  const matched = {
    transferIdList: txHashLookupResults
      .filter(result => result.transferId)
      .map(result => result.transferId),
    receivingIdList: txHashLookupResults
      .filter(result => result.receivingId)
      .map(result => result.receivingId)
  }
  const unmatched = txHashLookupResults.filter(result => !result.transferId && !result.receivingId)

  // gather transferData using transferIds and receivingIds
  const transferDataList = await API.getBatchTransfers({
    transferIds: matched.transferIdList,
    receivingIds: matched.receivingIdList
  })

  // handle matched txHash list
  // fill in txs with transferData
  let rv = await TransferData2TxHistory(transferDataList, txHash2Idx)

  // deal with unmatched txs
  if (getCryptoPlatformType(account.cryptoType) === 'bitcoin') {
    for (let result of unmatched) {
      let txHash = result.txHash
      let txData = txs[txHash2Idx[txHash]]

      let from: Address
      let to: Address
      // actual amount received by the destination address
      let amount: BasicTokenUnit

      let matchedInput = txData.inputs.find(input => input.address === account.address)
      let matchedOutput = txData.outputs.find(output => output.address === account.address)
      if (matchedInput) {
        // if address is in inputs, then it is transfering out
        //
        // the destination address is assumed to be the first one in the outputs which
        // is not account.address
        // note that having multiple output addresses is possible

        let _out = txData.outputs.find(
          output => output.address && output.address !== account.address
        )
        from = account.address
        to = _out.address
        amount = _out.value
      } else if (matchedOutput) {
        // if address only exists in outputs, then it is transfering in
        from = matchedOutput.address
        to = account.address
        amount = matchedOutput.value
      } else {
        // this should not happen
        throw new Error(`Cannot find matched input or output for ${txHash}`)
      }

      // fill in data
      rv[txHash] = {
        timestamp: moment(txData.received_at).unix(),
        blockNumber: txData.block.height,
        txFees: txData.fees
      }
      rv[txHash].standaloneTx = { from, to, value: amount, cryptoType: account.cryptoType }
    }
  } else if (getCryptoPlatformType(account.cryptoType) === 'ethereum') {
    // address is in lowercase in returned txData
    // must convert account address to lowercase first
    const accountAddr = account.address.toLowerCase()

    for (let result of unmatched) {
      let txHash = result.txHash
      let txData = txs[txHash2Idx[txHash]]
      if (isERC20(account.cryptoType)) {
        // token tx
        const tokenContractAddr = getCrypto(account.cryptoType).address.toLowerCase()
        let {
          contractAddress,
          from,
          to,
          value,
          timeStamp,
          blockNumber,
          nonce,
          gasPrice,
          cumulativeGasUsed
        } = txData

        if (contractAddress === tokenContractAddr && (from === accountAddr || to === accountAddr)) {
          // token matches
          // fill in data
          rv[txHash] = { timestamp: timeStamp, blockNumber, nonce, gasPrice, cumulativeGasUsed }
          rv[txHash].standaloneTx = {
            from,
            to,
            value,
            cryptoType: account.cryptoType
          }
        }
      } else {
        // eth tx
        let { from, to, value, timeStamp, blockNumber, nonce, gasPrice, cumulativeGasUsed } = txData
        if (from === accountAddr || to === accountAddr) {
          // from or to matches
          // fill in data
          rv[txHash] = { timestamp: timeStamp, blockNumber, nonce, gasPrice, cumulativeGasUsed }
          rv[txHash].standaloneTx = {
            from,
            to,
            value,
            cryptoType: account.cryptoType
          }
        }
      }
    }
  }

  // now we have gathered all txs data in one of the two structs
  // 1. transferData
  // 2. standaloneTx
  //
  // convert results from dict to list
  rv = Object.entries(rv).map(([txHash, value]) => {
    // $FlowFixMe
    return {
      txHash,
      ...value
    }
  })

  // add results to the existing accountTxHistory.history
  accountTxHistory.updated = moment().unix()
  accountTxHistory.confirmedTxs = accountTxHistory.confirmedTxs.concat(rv)

  // re-sort accountTxHistory by timestamp in non-increasing order
  accountTxHistory.confirmedTxs = accountTxHistory.confirmedTxs.sort(
    (txA, txB) => txB.timestamp - txA.timestamp
  )

  // gather pending txs
  accountTxHistory.pendingTxs = await getPendingTxHistoryByAccount(account, confirmedTxs)

  // TODO: update existing tx  confirmations
  return { account, accountTxHistory }
}

async function _getTransferHistory (offset: number = 0, transferMethod: string = 'ALL') {
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

  let transferData = (await API.getBatchTransfers({
    transferIds: transferIds,
    receivingIds: receivingIds
  }))
    .map(item => {
      // classify transferMethod
      return {
        ...item,
        transferMethod: item.senderToReceiver ? 'DIRECT_TRANSFER' : 'EMAIL_TRANSFER'
      }
    })
    .filter(item => transferMethod === item.transferMethod || transferMethod === 'ALL')
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
          if (item.transferMethod === 'DIRECT_TRANSFER') {
            // direct transfer only applies to sender
            transferType = 'SENDER'
          } else {
            if (transfersDict[item.transferId].password) {
              password = Base64.decode(transfersDict[item.transferId].password)
            }
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
    return Base64.decode(transfersDict[transferId].password)
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
  receiverAvatar: ?string,
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
  senderAccount: AccountData,
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

function getTxHistoryByAccount ({ account }: { account: AccountData }) {
  return (dispatch: Function, getState: Function) => {
    return dispatch({
      type: 'GET_TX_HISTORY_BY_ACCOUNT',
      payload: _getTxHistoryByAccount({
        account,
        accountTxHistory: getState().transferReducer.txHistoryByAccount[account.accountId]
      })
    })
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
  const {
    cryptoType,
    senderToChainsfer,
    chainsferToSender,
    senderToReceiver,
    transferType,
    transferMethod
  } = transferData

  if (chainsferToSender || transferType === 'RECEIVER') {
    return {
      price: '0',
      gas: '0',
      costInBasicUnit: '0',
      costInStandardUnit: '0'
    }
  } else {
    let txHash
    if (transferMethod === 'EMAIL_TRANSFER') {
      txHash = senderToChainsfer.txHash
    } else if (transferMethod === 'DIRECT_TRANSFER') {
      txHash = senderToReceiver.txHash
    } else {
      throw new Error(`Invalid transferMethod ${transferMethod}`)
    }

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
    } else if (['ethereum', ...erc20TokensList].includes(cryptoType)) {
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
  getTxHistoryByAccount,
  getTransferPassword,
  clearVerifyEscrowAccountPasswordError,
  transferStates,
  submitDirectTransferTx,
  setTokenAllowance
}
