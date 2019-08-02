import axios from 'axios'
import { Base64 } from 'js-base64'
import env from './typedEnv'
import { walletCryptoSupports } from './wallet.js'

const apiTransfer = axios.create({
  baseURL: env.REACT_APP_CHAINSFER_API_ENDPOINT,
  headers: {
    'Content-Type': 'application/json'
  }
})

async function transfer ({
  clientId,
  sender,
  destination,
  transferAmount,
  message,
  cryptoType,
  data,
  sendTxHash
}) {
  let apiResponse = await apiTransfer.post('/transfer', {
    action: 'SEND',
    clientId: clientId,
    sender: sender,
    destination: destination,
    transferAmount: transferAmount,
    message: message,
    cryptoType: cryptoType,
    data: data,
    sendTxHash: sendTxHash
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
  return responseData
}

async function getBatchTransfers ({ sendingId, receivingId }) {
  let rv = await apiTransfer.post('/transfer', {
    action: 'BATCH_GET',
    sendingId: sendingId,
    receivingId: receivingId
  })

  let responseData = rv.data
  responseData = responseData.map(item => {
    if (!item.error) {
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

async function setLastUsedAddress ({ idToken, cryptoType, walletType, address }) {
  try {
    var rv = await apiTransfer.post('/transfer', {
      action: 'SET_LAST_USED_ADDRESS',
      idToken: idToken,
      walletType: walletType,
      address: address,
      cryptoType: cryptoType
    })
  } catch (e) {
    console.warn(e)
  }
  return rv.data
}

async function getLastUsedAddress (idToken, wallet) {
  try {
    let rv = await apiTransfer.post('/transfer', {
      action: 'GET_LAST_USED_ADDRESS',
      idToken: idToken
    })
    const { data } = rv
    let lastUsedAddress = ['metamask', 'ledger'].reduce((lastUsedAddressObj, walletType) => {
      let addressByCryptoType = walletCryptoSupports[walletType]
        .map(cryptoTypeData => cryptoTypeData.cryptoType)
        .reduce((obj, cryptoType) => {
          if (!!data[walletType] && !!data[walletType][cryptoType]) {
            obj[cryptoType] = { address: data[walletType][cryptoType].address }
          }
          return obj
        }, {})

      lastUsedAddressObj[walletType] = { crypto: addressByCryptoType }
      return lastUsedAddressObj
    }, {})
    return lastUsedAddress
  } catch (e) {
    console.warn(e)
  }
}

export default {
  transfer,
  accept,
  cancel,
  getTransfer,
  getPrefilledAccount,
  getBatchTransfers,
  setLastUsedAddress,
  getLastUsedAddress
}
