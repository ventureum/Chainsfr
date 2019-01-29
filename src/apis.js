import axios from 'axios'

const apiTransfer = axios.create({
  baseURL: 'https://cr7j581ggh.execute-api.us-east-1.amazonaws.com/Prod',
  headers: {
    'Content-Type': 'application/json'
  }
})

async function transfer ({ id, clientId, sender, destination, cryptoType, sendTxHash, data }) {
  let rv = await apiTransfer.post('/transfer', {
    id: id,
    clientId: clientId,
    sender: sender,
    destination: destination,
    cryptoType: cryptoType,
    sendTxHash: sendTxHash,
    data: JSON.stringify(data)
  })
  return rv
}

export default { transfer }
