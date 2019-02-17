import API from '../apis'
import Web3 from 'web3'
import LedgerNanoS from '../ledgerSigner'
import ERC20_ABI from '../contracts/ERC20.json'
import moment from 'moment'
import utils from '../utils'
import BN from 'bn.js'
import { push } from 'connected-react-router'
import paths from '../Paths'

const ledgerNanoS = new LedgerNanoS()
const infuraApi = `https://${process.env.REACT_APP_NETWORK_NAME}.infura.io/v3/${process.env.REACT_APP_INFURA_API_KEY}`
const DAI_CONTRACT_ADDRESS = '0xdb29d7f3973e1a428f0578705e7ea1632f2e4ac5'

async function _getGasCost (txRequest) {
  let { cryptoType, transferAmount } = txRequest

  const mockFrom = '0x0f3fe948d25ddf2f7e8212145cef84ac6f20d904'
  const mockTo = '0x0f3fe948d25ddf2f7e8212145cef84ac6f20d905'
  const mockNumTokens = '1000'

  const _web3 = new Web3(new Web3.providers.HttpProvider(infuraApi))

  let txObj = {
    from: mockFrom,
    to: mockTo
  }

  if (cryptoType === 'ethereum') {
    let wei = _web3.utils.toWei(transferAmount.toString(), 'ether')
    txObj.value = wei
  } else if (cryptoType === 'dai') {
    const targetContract = new Web3.eth.Contract(ERC20_ABI, DAI_CONTRACT_ADDRESS)
    txObj.data = targetContract.methods['transfer'](mockTo, mockNumTokens).encodeABI()
  } else {
    throw new Error('Invalid walletType/cryptoType')
  }
  return utils.getGasCost(txObj)
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

async function _acceptTransfer (dispatch, txRequest) {
  // transfer funds from escrowWallet to destinationAddress with cryptoType and transferAmount
  // fromWallet is a decryptedWallet with the following data
  // 1. address
  // 2. privateKey

  let { escrowWallet, destinationAddress, walletType, cryptoType, transferAmount, gas, gasPrice } = txRequest

  if (walletType === 'metamask') {
    if (cryptoType === 'ethereum') {
      const _web3 = new Web3(new Web3.providers.HttpProvider(infuraApi))

      // add escrow account to web3
      _web3.eth.accounts.wallet.add(escrowWallet.privateKey)

      // calculate amount in wei to be sent
      let wei = window._web3.utils.toWei(transferAmount.toString(), 'ether')

      // calculate gas cost in wei
      let gasCostInWei = (new BN(gasPrice).mul(new BN(gas))).toString()

      // setup tx object
      let txObj = {
        from: escrowWallet.address,
        to: destinationAddress,
        value: wei - gasCostInWei, // actual receiving amount
        gas: gas,
        gasPrice: gasPrice
      }

      _web3.eth.sendTransaction(txObj).on('transactionHash', (hash) => {
        // update request tx hash
        txRequest.receiveTxHash = hash
        dispatch(acceptTransferTransactionHashRetrieved(txRequest))
      })
    }
  }
}

async function _acceptTransferTransactionHashRetrieved (txRequest) {
  txRequest.receiveTimestamp = moment().unix()

  // TODO add api call
  let apiResponse = null

  return { apiResponse, txRequest }
}

async function _getTransfer (id) {
  let apiResponse = await API.getTransfer({ id: id })
  return apiResponse
}

function transactionHashRetrieved (txRequest) {
  return (dispatch, getState) => {
    return dispatch({
      type: 'TRANSACTION_HASH_RETRIEVED',
      payload: _transactionHashRetrieved(txRequest)
    }).then(() => dispatch(push(paths.transfer + paths.receiptStep)))
  }
}

function acceptTransferTransactionHashRetrieved (txRequest) {
  return (dispatch, getState) => {
    return dispatch({
      type: 'ACCEPT_TRANSFER_TRANSACTION_HASH_RETRIEVED',
      payload: _acceptTransferTransactionHashRetrieved(txRequest)
    }).then(() => dispatch(push(paths.receive + paths.receiveReceiptStep)))
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

function acceptTransfer (txRequest) {
  return (dispatch, getState) => {
    return {
      type: 'ACCEPT_TRANSFER',
      payload: _acceptTransfer(dispatch, txRequest)
    }
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
  submitTx,
  acceptTransfer,
  getGasCost,
  getTransfer
}
