import axios from 'axios'

const apiTransfer = axios.create({
  baseURL: 'https://cr7j581ggh.execute-api.us-east-1.amazonaws.com/Prod',
  headers: {
    'Content-Type': 'application/json'
  }
})

async function transfer (id, clientId, destination, cryptoType, data) {
  let rv = await apiTransfer.post('/transfer', {
    id: id,
    clientId: clientId,
    destination: destination,
    cryptoType: cryptoType,
    data: data,
  })
  return rv
}

export default { transfer }
