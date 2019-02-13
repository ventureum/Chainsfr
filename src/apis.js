import axios from 'axios'
import { Base64 } from 'js-base64'

const apiTransfer = axios.create({
  baseURL: 'https://cr7j581ggh.execute-api.us-east-1.amazonaws.com/Prod',
  headers: {
    'Content-Type': 'application/json'
  }
})

async function transfer ({ id, clientId, sender, destination, transferAmount, cryptoType, sendTxHash, sendTimestamp, data }) {
  let rv = await apiTransfer.post('/transfer', {
    id: id,
    clientId: clientId,
    sender: sender,
    destination: destination,
    transferAmount: transferAmount,
    cryptoType: cryptoType,
    sendTxHash: sendTxHash,
    sendTimestamp: sendTimestamp,
    data: Base64.encode(JSON.stringify(data))
  })
  return rv
}

async function getTransfer ({ id }) {
  let rv = await apiTransfer.get('/get-transfer', {
    params: {
      id: id
    }
  })

  let responseData = rv.data
  responseData.data = JSON.parse(Base64.decode(responseData.data))
  return responseData
}

export default { transfer, getTransfer }
