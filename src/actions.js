import API from './apis'
import UUIDv1 from 'uuid/v1'

async function loadFile (fileId) {
  let rv = await window.gapi.client.drive.files.get({
    fileId: fileId,
    alt: 'media'
  })
  console.log(rv)
  return rv.result
}

async function listFiles ()  {
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

async function _getWallet() {
  return await listFiles()
}

function _createAddress (wallet, alias) {
  return {
    type: 'CREATE_ADDRESS',
    payload: __createAddress(wallet, alias)
  }
}

async function _transfer(fromWallet, pin, value, destination) {
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

    // request the user logs in
    rv.accounts = await window.ethereum.enable()

    // listen for accounts changes
    window.ethereum.on('accountsChanged', function (accounts) {
      dispatch(onMetamaskAccountsChanged(accounts))
    })
  }
  return rv
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

export { onLogin, createAddress, getWallet, transfer, checkMetamaskConnection, onMetamaskAccountsChanged }
