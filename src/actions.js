import API from './apis'
import UUIDv1 from 'uuid/v1'
import Web3 from 'web3'
import LedgerNanoS from './ledgerSigner'

const ledgerNanoS = new LedgerNanoS()
const infuraApi = `https://${process.env.REACT_APP_NETWORK_NAME}.infura.io/v3/${process.env.REACT_APP_INFURA_API_KEY}`

async function loadFile (fileId) {
  let rv = await window.gapi.client.drive.files.get({
    fileId: fileId,
    alt: 'media'
  })
  console.log(rv)
  return rv.result
}

async function listFiles () {
  console.log(window.gapi)
  console.log(window.gapi.client)
  if (!window.gapi.client.drive) {
    await window.gapi.client.load('drive', 'v3')
  }

  let rv = await window.gapi.client.drive.files.list({
    spaces: 'appDataFolder',
    fields: 'nextPageToken, files(id, name)',
    pageSize: 10
  })

  let files = rv.result.files
  for (let f of files) {
    if (f.name === 'wallet.json') {
      return {
        fileId: f.id,
        content: await loadFile(f.id)
      }
    }
  }
  return null
}

async function saveFile (file) {
  if (!window.gapi.client.drive) {
    await window.gapi.client.load('drive', 'v3')
  }

  async function addContent (fileId) {
    return window.gapi.client.request({
      path: '/upload/drive/v3/files/' + fileId,
      method: 'PATCH',
      params: {
        uploadType: 'media'
      },
      body: file.content
    })
  }
  var metadata = {
    mimeType: 'application/json',
    name: file.name,
    fields: 'id'
  }

  if (file.parents) {
    metadata.parents = file.parents
  }

  if (file.id) {
    // just update
    await addContent(file.id).then(function (resp) {
      console.log('File just updated', resp.result)
    })
    return file.id
  } else {
    // create and update
    let resp = await window.gapi.client.drive.files.create({
      resource: metadata
    })
    resp = await addContent(resp.result.id)
    console.log('created and added content', resp.result)
    return resp.result.id
  }
}

function onLogin (loginData) {
  return {
    type: 'LOGIN',
    payload: {
      profile: {
        ...loginData,
        isAuthenticated: true
      }
    }
  }
}

async function __createAddress (wallet, alias) {
  let { address, privateKey } = window._web3.eth.accounts.create()
  let addressData = {
    alias: alias,
    address: address,
    privateKey: privateKey,
    cryptoType: 'Ethereum',
    public: false
  }
  let newWalletContent = [...wallet.content, addressData]
  let fileId = await saveFile({
    content: JSON.stringify(newWalletContent),
    name: 'wallet.json',
    id: wallet.fileId,
    parents: ['appDataFolder']
  })
  return {
    fileId: fileId,
    content: newWalletContent
  }
}

async function _getWallet () {
  return await listFiles()
}

function _createAddress (wallet, alias) {
  return {
    type: 'CREATE_ADDRESS',
    payload: __createAddress(wallet, alias)
  }
}

async function _transfer (fromWallet, pin, value, destination) {
  // only support ethereum now
  if (!fromWallet || fromWallet.cryptoType !== 'Ethereum') {
    throw 'Only Ethereum is supported!'
  }

  // step 1: create an escrow wallet
  let escrow = window._web3.eth.accounts.create()

  // step 2: encrypt the escrow wallet with pin provided
  let encriptedEscrow = window._web3.eth.accounts.encrypt(escrow.privateKey, pin)

  // step 3: transfer funds from [fromWallet] to the newly created escrow wallet
  window._web3.eth.accounts.wallet.add(fromWallet.privateKey)
  let txReceipt = await window._web3.eth.sendTransaction({
    from: fromWallet.address,
    to: escrow.address,
    value: value
  })

  // step 4: invoke api to store encripted escrow wallet
  let apiResponse = await API.transfer(UUIDv1(), 'test-client', destination, fromWallet.cryptoType, encriptedEscrow)
  console.log(apiResponse)

  // step 5: clear wallet
  window._web3.eth.accounts.wallet.clear()
}

async function _checkMetamaskConnection (dispatch) {
  let rv = {
    connected: false,
    network: null,
    accounts: null
  }

  if (typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask) {
    rv.connected = true
    rv.network = window.ethereum.networkVersion

    window._web3 = new Web3(window.ethereum)

    // request the user logs in
    rv.accounts = await window.ethereum.enable()

    // listen for accounts changes
    window.ethereum.on('accountsChanged', function (accounts) {
      dispatch(onMetamaskAccountsChanged(accounts))
    })
  }
  return rv
}

async function _submitTx (dispatch, txRequest) {
  let { fromWallet, walletType, cryptoType, transferAmount, password } = txRequest

  // step 1: create an escrow wallet
  let escrow = window._web3.eth.accounts.create()

  // step 2: encrypt the escrow wallet with pin provided
  let encriptedEscrow = window._web3.eth.accounts.encrypt(escrow.privateKey, password)

  // step 3: invoke api to store encripted escrow wallet
  let id = UUIDv1()

  // update request id
  txRequest.id = id

  // add escrow wallet to tx request
  txRequest.encriptedEscrow = encriptedEscrow

  // step 4: transfer funds from [fromWallet] to the newly created escrow wallet
  if (walletType === 'metamask') {
    if (cryptoType === 'ethereum') {
      const BN = window._web3.utils.BN

      let finney = new BN(parseInt(Number(transferAmount) * 1000.0))
      let wei = finney.mul(new BN('1000000000000000'))

      window._web3.eth.sendTransaction({
        from: fromWallet.accounts[0],
        to: escrow.address,
        value: wei.toString()
      }).on('transactionHash', (hash) => {
        // update request tx hash
        txRequest.sendTxHash = hash
        dispatch(transactionHashRetrieved(txRequest))
      })
    }
  } else if (walletType === 'ledger') {
    if (cryptoType === 'ethereum') {
      const signedTransactionObject = await ledgerNanoS.sendEther(0, escrow.address, transferAmount)
      const _web3 = new Web3(new Web3.providers.HttpProvider(infuraApi))
      _web3.eth.sendSignedTransaction(signedTransactionObject.rawTransaction)
        .on('transactionHash', (hash) => {
          console.log('txHash: ', hash)
          // update request tx hash
          txRequest.sendTxHash = hash
          dispatch(transactionHashRetrieved(txRequest))
        })
    }
  }

  // step 5: clear wallet
  window._web3.eth.accounts.wallet.clear()
}

async function _transactionHashRetrieved (txRequest) {
  let { id, sender, destination, cryptoType, encriptedEscrow, sendTxHash } = txRequest

  let apiResponse = await API.transfer({
    id: id,
    clientId: 'test-client',
    sender: sender,
    destination: destination,
    cryptoType: cryptoType,
    sendTxHash: sendTxHash,
    data: encriptedEscrow
  })

  return apiResponse
}

function transactionHashRetrieved (txRequest) {
  return {
    type: 'TRANSACTION_HASH_RETRIEVED',
    payload: _transactionHashRetrieved(txRequest)
  }
}

function createAddress (alias) {
  return (dispatch, getState) => {
    let wallet = getState().userReducer.wallet
    dispatch(_createAddress(wallet, alias))
  }
}

function getWallet () {
  return {
    type: 'GET_WALLET',
    payload: _getWallet()
  }
}

function transfer (fromWallet, pin, value, destination) {
  return {
    type: 'TRANSFER',
    payload: _transfer(fromWallet, pin, value, destination)
  }
}

function submitTx (txRequest) {
  return (dispatch, getState) => {
    return {
      type: 'SUBMIT_TX',
      payload: _submitTx(dispatch, txRequest)
    }
  }
}

function checkMetamaskConnection (dispatch) {
  return {
    type: 'CHECK_METAMASK_CONNECTION',
    payload: _checkMetamaskConnection(dispatch)
  }
}

function onMetamaskAccountsChanged (accounts) {
  return {
    type: 'UPDATE_METAMASK_ACCOUNTS',
    payload: accounts
  }
}

async function _checkLedgerNanoSConnection () {
  const deviceConnected = await ledgerNanoS.deviceConnected()
  return deviceConnected
}

function checkLedgerNanoSConnection () {
  return {
    type: 'CHECK_LEDGER_NANOS_CONNECTION',
    payload: _checkLedgerNanoSConnection()
  }
}

export { onLogin, createAddress, getWallet, transfer, checkMetamaskConnection, onMetamaskAccountsChanged, submitTx, checkLedgerNanoSConnection }
