import API from './apis'
import Web3 from 'web3'
import LedgerNanoS from './ledgerSigner'
import ERC20_ABI from './contracts/ERC20.json'
import moment from 'moment'
import utils from './utils'

const ledgerNanoS = new LedgerNanoS()
const infuraApi = `https://${process.env.REACT_APP_NETWORK_NAME}.infura.io/v3/${process.env.REACT_APP_INFURA_API_KEY}`
const DAI_CONTRACT_ADDRESS = '0xdb29d7f3973e1a428f0578705e7ea1632f2e4ac5'

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

    // retrieve eth balance
    rv.balance = new window._web3.utils.BN(await window._web3.eth.getBalance(rv.accounts[0]))

    // listen for accounts changes
    window.ethereum.on('accountsChanged', function (accounts) {
      dispatch(onMetamaskAccountsChanged(accounts))
    })
  }
  return rv
}

async function _getGasCost (txRequest) {
  let { fromWallet, walletType, cryptoType, transferAmount } = txRequest

  let escrow = {
    address: '0x0f3fe948d25ddf2f7e8212145cef84ac6f20d904' // mock address
  }

  if (walletType === 'metamask') {
    if (cryptoType === 'ethereum') {
      let wei = window._web3.utils.toWei(transferAmount.toString(), 'ether')
      let txObj = {
        from: fromWallet.accounts[0],
        to: escrow.address,
        value: wei
      }

      return utils.getGasCost(txObj)
    }
  } else if (walletType === 'ledger') {
    if (cryptoType === 'ethereum') {
      const _web3 = new Web3(new Web3.providers.HttpProvider(infuraApi))
      const amountInWei = _web3.utils.toWei(transferAmount.toString(), 'ether')
      const signedTransactionObject = await ledgerNanoS.signSendEther(0, escrow.address, amountInWei)
      return utils.getGasCost(signedTransactionObject.rawTransaction)
    } else if (cryptoType === 'dai') {
      const _web3 = new Web3(new Web3.providers.HttpProvider(infuraApi))
      const amountInWei = _web3.utils.toWei(transferAmount.toString(), 'ether')
      const signedTransactionObject = await ledgerNanoS.signSendTrasaction(0, DAI_CONTRACT_ADDRESS, ERC20_ABI, 'transfer', escrow.address, amountInWei)
      return utils.getGasCost(signedTransactionObject.rawTransaction)
    }
  } else if (cryptoType === 'dai') {
    const _web3 = new Web3(new Web3.providers.HttpProvider(infuraApi))
    const amountInWei = _web3.utils.toWei(transferAmount.toString(), 'ether')
    const signedTransactionObject = await ledgerNanoS.signSendTrasaction(0, DAI_CONTRACT_ADDRESS, ERC20_ABI, 'transfer', escrow.address, amountInWei)
    return utils.getGasCost(signedTransactionObject.rawTransaction)
  }

  throw new Error('Invalid walletType/cryptoType')
}

async function _submitTx (dispatch, txRequest) {
  let { fromWallet, walletType, cryptoType, transferAmount, password } = txRequest

  // step 1: create an escrow wallet
  let escrow = window._web3.eth.accounts.create()

  // step 2: encrypt the escrow wallet with pin provided
  let encriptedEscrow = window._web3.eth.accounts.encrypt(escrow.privateKey, password)

  // add escrow wallet to tx request
  txRequest.encriptedEscrow = encriptedEscrow

  // step 4: transfer funds from [fromWallet] to the newly created escrow wallet
  if (walletType === 'metamask') {
    if (cryptoType === 'ethereum') {
      let wei = window._web3.utils.toWei(transferAmount.toString(), 'ether')
      let txObj = {
        from: fromWallet.accounts[0],
        to: escrow.address,
        value: wei
      }

      window._web3.eth.sendTransaction(txObj).on('transactionHash', (hash) => {
        // update request tx hash
        txRequest.sendTxHash = hash
        dispatch(transactionHashRetrieved(txRequest))
      })
    }
  } else if (walletType === 'ledger') {
    if (cryptoType === 'ethereum') {
      const _web3 = new Web3(new Web3.providers.HttpProvider(infuraApi))
      const amountInWei = _web3.utils.toWei(transferAmount.toString(), 'ether')
      const signedTransactionObject = await ledgerNanoS.signSendEther(0, escrow.address, amountInWei)
      _web3.eth.sendSignedTransaction(signedTransactionObject.rawTransaction)
        .on('transactionHash', (hash) => {
          console.log('txHash: ', hash)
          // update request tx hash
          txRequest.sendTxHash = hash
          dispatch(transactionHashRetrieved(txRequest))
        })
    } else if (cryptoType === 'dai') {
      const _web3 = new Web3(new Web3.providers.HttpProvider(infuraApi))
      const amountInWei = _web3.utils.toWei(transferAmount.toString(), 'ether')
      const signedTransactionObject = await ledgerNanoS.signSendTrasaction(0, DAI_CONTRACT_ADDRESS, ERC20_ABI, 'transfer', escrow.address, amountInWei)
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
  txRequest.sendTimestamp = moment().unix()

  let { id, sender, destination, transferAmount, cryptoType, encriptedEscrow, sendTxHash, sendTimestamp } = txRequest

  let apiResponse = await API.transfer({
    id: id,
    clientId: 'test-client',
    sender: sender,
    destination: destination,
    transferAmount: transferAmount,
    cryptoType: cryptoType,
    sendTxHash: sendTxHash,
    sendTimestamp: sendTimestamp,
    data: encriptedEscrow
  })

  return { apiResponse, txRequest }
}

async function _getTransfer (id) {
  let apiResponse = await API.getTransfer({ id: id })
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

function selectWallet (walletSelected) {
  return {
    type: 'SELECT_WALLET',
    payload: walletSelected
  }
}

function selectCrypto (cryptoSelected) {
  return {
    type: 'SELECT_CRYPTO',
    payload: cryptoSelected
  }
}

function updateTransferForm (form) {
  return {
    type: 'UPDATE_TRANSFER_FORM',
    payload: form
  }
}

function generateSecurityAnswer () {
  return {
    type: 'GENERATE_SECURITY_ANSWER',
    // 6 bytes, 48 bit, 4 words (12 bit per word)
    payload: utils.generatePassphrase(6).join(' ')
  }
}

function clearSecurityAnswer () {
  return {
    type: 'GENERATE_SECURITY_ANSWER',
    payload: undefined
  }
}

function getGasCost (txRequest) {
  return {
    type: 'GET_GAS_COST',
    payload: _getGasCost(txRequest)
  }
}

function getTransfer (id) {
  return {
    type: 'GET_TRANSFER',
    payload: _getTransfer(id)
  }
}

export {
  onLogin,
  createAddress,
  getWallet,
  checkMetamaskConnection,
  onMetamaskAccountsChanged,
  submitTx,
  checkLedgerNanoSConnection,
  selectWallet,
  selectCrypto,
  updateTransferForm,
  generateSecurityAnswer,
  clearSecurityAnswer,
  getGasCost,
  getTransfer
}
