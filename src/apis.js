// @flow
import axios from 'axios'
import { Base64 } from 'js-base64'
import env from './typedEnv'
import type { TxHash, Recipient } from './types/transfer.flow.js'
import { store } from './configureStore.js'

const chainsferApi = axios.create({
  baseURL: env.REACT_APP_CHAINSFER_API_ENDPOINT,
  headers: {
    'Content-Type': 'application/json'
  }
})

async function transfer (request: {|
  senderName: string,
  senderAvatar: string,
  sender: string,
  destination: string,
  receiverName: string,
  transferAmount: string,
  transferFiatAmountSpot: string,
  fiatType: string,
  sendMessage: ?string,
  cryptoType: string,
  data: string,
  sendTxHash: Array<TxHash> | TxHash
|}) {
  let apiResponse = await chainsferApi.post('/transfer', {
    clientId: 'test-client',
    action: 'SEND',
    ...request
  })
  return apiResponse.data
}

async function accept (request: {|
  receivingId: string,
  receiveMessage: ?string,
  receiveTxHash: string
|}) {
  let apiResponse = await chainsferApi.post('/transfer', {
    clientId: 'test-client',
    action: 'RECEIVE',
    ...request
  })
  return apiResponse.data
}

async function cancel (request: {|
  transferId: string,
  cancelMessage: ?string,
  cancelTxHash: string
|}) {
  let apiResponse = await chainsferApi.post('/transfer', {
    clientId: 'test-client',
    action: 'CANCEL',
    ...request
  })
  return apiResponse.data
}

function normalizeTransferData (transferData) {
  transferData.sendTxState = null
  transferData.receiveTxState = null
  transferData.cancelTxState = null

  if (transferData['senderToChainsfer']) {
    const stage = transferData['senderToChainsfer']
    transferData.sendTimestamp = stage.txTimestamp
    transferData.sendTxState = stage.txState
    transferData.sendTxHash = stage.txHash
  }

  if (transferData['chainsferToReceiver']) {
    const stage = transferData['chainsferToReceiver']
    transferData.receiveTimestamp = stage.txTimestamp
    transferData.receiveTxState = stage.txState
    transferData.receiveTxHash = stage.txHash
  }

  if (transferData['chainsferToSender']) {
    const stage = transferData['chainsferToSender']
    transferData.cancelTimestamp = stage.txTimestamp
    transferData.cancelTxState = stage.txState
    transferData.cancelTxHash = stage.txHash
  }

  return transferData
}

async function getTransfer (request: { transferId: ?string, receivingId: ?string }) {
  let rv = await chainsferApi.post('/transfer', {
    clientId: 'test-client',
    action: 'GET',
    ...request
  })

  let responseData = normalizeTransferData(rv.data)
  responseData.data = JSON.parse(Base64.decode(responseData.data))
  return responseData
}

async function getBatchTransfers (request: {
  transferIds: Array<string>,
  receivingIds: Array<string>
}) {
  let rv = await chainsferApi.post('/transfer', {
    clientId: 'test-client',
    action: 'BATCH_GET',
    ...request
  })

  let responseData = rv.data
  responseData = responseData.map(item => {
    if (!item.error) {
      item = normalizeTransferData(item)
      item.data = JSON.parse(Base64.decode(item.data))
      return item
    } else {
      console.warn('Transfer detail not found.')
      item.data = { error: 'Transfer detail not found.' }
      return item
    }
  })
  return responseData
}

async function getPrefilledAccount () {
  try {
    var rv = await axios.get(env.REACT_APP_PREFILLED_ACCOUNT_ENDPOINT)
    return rv.data.privateKey
  } catch (e) {
    console.warn(e)
    return null
  }
}

async function setLastUsedAddress (request: {
  idToken: string,
  walletType: string,
  cryptoType: string,
  address: string
}) {
  try {
    var rv = await chainsferApi.post('/transfer', {
      clientId: 'test-client',
      action: 'SET_LAST_USED_ADDRESS',
      ...request
    })
    return rv.data
  } catch (e) {
    console.warn(e)
  }
}

async function getLastUsedAddress (request: { idToken: string }) {
  try {
    let rv = await chainsferApi.post('/transfer', {
      clientId: 'test-client',
      action: 'GET_LAST_USED_ADDRESS',
      ...request
    })
    return rv.data
  } catch (e) {
    console.warn(e)
  }
}

async function getRecipients (request: { idToken: string }) {
  try {
    let rv = await chainsferApi.post('/user', {
      clientId: 'test-client',
      action: 'GET_RECIPIENTS',
      ...request
    })
    return rv.data.recipients
  } catch (e) {
    console.warn(e)
  }
}

async function addRecipient (request: { idToken: string, recipient: Recipient }) {
  try {
    let rv = await chainsferApi.post('/user', {
      clientId: 'test-client',
      action: 'ADD_RECIPIENT',
      ...request
    })
    return rv.data.recipients
  } catch (e) {
    console.warn(e)
  }
}

async function removeRecipient (request: { idToken: string, recipient: Recipient }) {
  try {
    let rv = await chainsferApi.post('/user', {
      clientId: 'test-client',
      action: 'REMOVE_RECIPIENT',
      ...request
    })
    return rv.data.recipients
  } catch (e) {
    console.warn(e)
  }
}

async function register (request: { idToken: string }) {
  try {
    let rv = await chainsferApi.post('/user', {
      clientId: 'test-client',
      action: 'REGISTER',
      ...request
    })
    return rv.data
  } catch (e) {
    console.warn(e)
  }
}


async function mintLibra (request: {
  address: string,
  amount: string // microlibra
}) {
  try {
    let rv = await chainsferApi.post('/transfer', {
      clientId: 'test-client',
      action: 'MINT_LIBRA',
      ...request
    })
    return rv.data
  } catch (e) {
    console.warn(e)
  }
}

async function referralBalance () {
  const { idToken } = store.getState().userReducer.profile
  let rv = await chainsferApi.post('/referralWallet', {
    action: 'BALANCE',
    idToken
  })
  return rv.data
}

async function referralSend (request: { destination: string, transferAmount: string }) {
  const { idToken } = store.getState().userReducer.profile
  let rv = await chainsferApi.post('/referralWallet', {
    action: 'SEND',
    idToken,
    ...request
  })
  return rv.data
}

async function referralCreate () {
  const { idToken } = store.getState().userReducer.profile
  let rv = await chainsferApi.post('/referralWallet', {
    action: 'CREATE',
    idToken
  })
  return rv.data
}

export default {
  transfer,
  accept,
  cancel,
  getTransfer,
  getPrefilledAccount,
  getBatchTransfers,
  setLastUsedAddress,
  getLastUsedAddress,
  getRecipients,
  addRecipient,
  removeRecipient,
  register,
  mintLibra,
  referralBalance,
  referralSend,
  referralCreate
}
