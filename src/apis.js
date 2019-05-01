import axios from 'axios'
import { Base64 } from 'js-base64'
import env from './typedEnv'

const apiTransfer = axios.create({
  baseURL: env.REACT_APP_CHAINSFER_API_ENDPOINT,
  headers: {
    'Content-Type': 'application/json'
  }
})

async function transfer ({ clientId, sender, destination, transferAmount, cryptoType, data, sendTxHash, password }) {
  let apiResponse = await apiTransfer.post('/transfer', {
    action: 'SEND',
    clientId: clientId,
    sender: sender,
    destination: destination,
    transferAmount: transferAmount,
    cryptoType: cryptoType,
    data: data,
    sendTxHash: sendTxHash,
    password: password || null
  })
  return apiResponse.data
}

async function accept ({ clientId, receivingId, receiveTxHash }) {
  let apiResponse = await apiTransfer.post('/transfer', {
    action: 'RECEIVE',
    clientId: clientId,
    receivingId: receivingId,
    receiveTxHash: receiveTxHash
  })
  return apiResponse.data
}

async function cancel ({ clientId, sendingId, cancelTxHash }) {
  let apiResponse = await apiTransfer.post('/transfer', {
    action: 'CANCEL',
    clientId: clientId,
    sendingId: sendingId,
    cancelTxHash: cancelTxHash
  })
  return apiResponse.data
}

async function getTransfer ({ sendingId, receivingId }) {
  let rv = await apiTransfer.post('/transfer', {
    action: 'GET',
    sendingId: sendingId,
    receivingId: receivingId
  })

  let responseData = rv.data
  responseData.data = JSON.parse(Base64.decode(responseData.data))
  if (responseData.password) {
    responseData.password = Base64.decode(responseData.password)
  }
  return responseData
}

async function batchTransfer ({ sendingId, receivingId }) {
  let rv = await apiTransfer.post('/transfer', {
    action: 'BATCH_GET',
    sendingId: sendingId,
    receivingId: receivingId
  })

  let responseData = rv.data
  responseData = responseData.map(item => {
    item.data = JSON.parse(Base64.decode(item.data))
    if (item.password) {
      item.password = Base64.decode(item.password)
    }
    return item
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

async function setLastUsedAddress ({ googleId, walletType, address }) {
  try {
    var rv = await apiTransfer.post('/transfer', {
      action: 'SET_LAST_USED_ADDRESS',
      googleId: googleId,
      walletType: walletType,
      address: address
    })
  } catch (e) {
    console.warn(e)
  }
  return rv.data
}

export default { transfer, accept, cancel, getTransfer, getPrefilledAccount, batchTransfer, setLastUsedAddress }
