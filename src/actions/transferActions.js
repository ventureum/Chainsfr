// @flow
import API from '../apis'
import Web3 from 'web3'
import axios from 'axios'
import utils from '../utils'
import BN from 'bn.js'
import { goToStep } from './navigationActions'
import { saveTempSendFile, saveSendFile, getAllTransfers } from '../drive.js'
import moment from 'moment'
import { Base64 } from 'js-base64'
import { getCryptoDecimals } from '../tokens'
import url from '../url'
import WalletUtils from '../wallets/utils'
import WalletFactory from '../wallets/factory'
import type {
  Wallet,
  WalletData,
  WalletDataEthereum
} from '../types/wallet.flow.js'
import type { TxFee, TxHash } from '../types/transfer.flow.js'
import type { StandardTokenUnit, BasicTokenUnit, Address } from '../types/token.flow'

const transferStates = {
  SEND_PENDING: 'SEND_PENDING',
  SEND_FAILURE: 'SEND_FAILURE',
  SEND_CONFIRMED_RECEIVE_PENDING: 'SEND_CONFIRMED_RECEIVE_PENDING',
  SEND_CONFIRMED_RECEIVE_FAILURE: 'SEND_CONFIRMED_RECEIVE_FAILURE',
  SEND_CONFIRMED_RECEIVE_CONFIRMED: 'SEND_CONFIRMED_RECEIVE_CONFIRMED',
  SEND_CONFIRMED_RECEIVE_NOT_INITIATED: 'SEND_CONFIRMED_RECEIVE_NOT_INITIATED',
  SEND_CONFIRMED_RECEIVE_EXPIRED: 'SEND_CONFIRMED_RECEIVE_EXPIRED',
  SEND_CONFIRMED_CANCEL_PENDING: 'SEND_CONFIRMED_CANCEL_PENDING',
  SEND_CONFIRMED_CANCEL_CONFIRMED: 'SEND_CONFIRMED_CANCEL_CONFIRMED',
  SEND_CONFIRMED_CANCEL_FAILURE: 'SEND_CONFIRMED_CANCEL_FAILURE'
}

async function getFirstFromAddress (txHash: string) {
  const rv = (await axios.get(`${url.LEDGER_API_URL}/transactions/${txHash}`)).data
  const address = rv[0].inputs[0].address
  return address
}

async function _getTxCost (txRequest: { fromWallet: WalletData, transferAmount: StandardTokenUnit }) {
  let { fromWallet, transferAmount } = txRequest
  let txFee: TxFee = await WalletFactory.createWallet(fromWallet).getTxFee({
    value: utils.toBasicTokenUnit(transferAmount, getCryptoDecimals(fromWallet.cryptoType))
  })

  if (['dai'].includes(fromWallet.cryptoType)) {
    // special case for erc20 tokens
    // amount of eth to be transfered to the escrow wallet
    // this will be spent as tx fees for the next token transfer (from escrow wallet)
    // otherwise, the tokens in the escrow wallet cannot be transfered out
    // we use the current estimation to calculate amount of ETH to be transfered

    // eth to be transfered for paying erc20 token tx while receiving
    let ethTransfer = txFee.costInBasicUnit

    // standard gas limit for regular eth transactions
    let mockEthWalletData: WalletDataEthereum = {
      walletType: 'metamask',
      cryptoType: 'ethereum',
      accounts: []
    }
    let txCostEth = await WalletFactory.createWallet(mockEthWalletData).getTxFee({ value: '1' })

    // estimate total cost = eth to be transfered + eth transfer fee + erc20 transfer fee
    let totalCostInBasicUnit = new BN(txCostEth.costInBasicUnit)
      .add(new BN(txFee.costInBasicUnit))
      .add(new BN(ethTransfer))

    return {
      // use the current estimated price
      price: txFee.price,
      // eth transfer gas + erc20 transfer gas
      gas: new BN(txCostEth.gas).add(new BN(txFee.gas)).toString(),
      costInBasicUnit: totalCostInBasicUnit.toString(),
      costInStandardUnit: utils.toHumanReadableUnit(totalCostInBasicUnit).toString(),
      // subtotal tx cost
      // this is used for submitTx()
      costByType: { txCostEth, txCostERC20: txFee, ethTransfer }
    }
  }

  return txFee
}

async function _directTransfer (txRequest: {
  fromWallet: WalletData,
  transferAmount: StandardTokenUnit,
  destinationAddress: Address,
  txFee: TxFee
}) {
  let { fromWallet, transferAmount, destinationAddress, txFee } = txRequest
  return WalletFactory.createWallet(fromWallet).sendTransaction({
    to: destinationAddress,
    value: transferAmount,
    txFee: txFee
  })
}

async function _submitTx (txRequest: {
  fromWallet: WalletData,
  transferAmount: StandardTokenUnit,
  destination: string,
  sender: string,
  password: string,
  txFee: TxFee
}) {
  let { fromWallet, transferAmount, password, sender, destination, txFee } = txRequest

  let { cryptoType } = fromWallet
  // add destination to password to enhance security
  let _password = password + destination

  // generate an escrow wallet
  let escrowWallet: Wallet = await WalletFactory.generateWallet({
    walletType: 'escrow',
    cryptoType: cryptoType
  })

  let escrowAccount = escrowWallet.getAccount()

  // supress flow warning
  if (!escrowAccount.privateKey) throw new Error('PrivateKey missing in escrow account')
  let encryptedPrivateKey = await utils.encryptMessage(escrowAccount.privateKey, _password)

  let sendTxHash: TxHash
  let sendTxFeeTxHash: TxHash

  // before sending out a TX, store a backup of encrypted escrow wallet in user's drive
  await saveTempSendFile({
    sender: sender,
    destination: destination,
    transferAmount: transferAmount,
    cryptoType: fromWallet.cryptoType,
    data: Base64.encode(encryptedPrivateKey),
    password: Base64.encode(_password),
    tempTimestamp: moment().unix()
  })

  // convert transferAmount to basic token unit
  let value: BasicTokenUnit = utils.toBasicTokenUnit(transferAmount, getCryptoDecimals(cryptoType))

  if (['ethereum', 'bitcoin'].includes(cryptoType)) {
    sendTxHash = await WalletFactory.createWallet(fromWallet).sendTransaction({
      to: escrowAccount.address,
      value: value
    })
  } else if (['dai'].includes(cryptoType)) {
    // we need to transfer a small amount of eth to escrow to pay for
    // the next transfer's tx fees
    //
    // create a mock eth wallet data for transfering eth
    // force type casting due to flowjs unable to handle union type spread issue
    // https://github.com/facebook/flow/pull/7298
    let ethWalletData: WalletDataEthereum = ((fromWallet: any): WalletDataEthereum)
    ethWalletData.cryptoType = 'ethereum'

    if (!txFee.costByType) throw new Error('costByType is missing from txFee')

    // transfer tx fees
    sendTxFeeTxHash = await WalletFactory.createWallet(ethWalletData).sendTransaction({
      to: escrowAccount.address,
      value: txFee.costByType && txFee.costByType.ethTransfer,
      txFee: txFee.costByType && txFee.costByType.txCostEth
    })

    // now transfer erc20 tokens
    sendTxHash = await WalletFactory.createWallet(fromWallet).sendTransaction({
      to: escrowAccount.address,
      value: value,
      txFee: txFee.costByType && txFee.costByType.txCostERC20
    })
  } else {
    throw new Error(`Invalid cryptoType: ${cryptoType}`)
  }

  // update tx data
  return _transactionHashRetrieved({
    sender: txRequest.sender,
    destination: txRequest.destination,
    transferAmount: txRequest.transferAmount,
    cryptoType: cryptoType,
    encriptedEscrow: encryptedPrivateKey,
    sendTxHash: sendTxHash,
    password: txRequest.password,
    sendTxFeeTxHash: sendTxFeeTxHash
  })
}

async function _transactionHashRetrieved (txRequest: {
  sender: string,
  destination: string,
  transferAmount: StandardTokenUnit,
  cryptoType: string,
  encriptedEscrow: any,
  sendTxHash: TxHash,
  password: string,
  sendTxFeeTxHash: ?TxHash
}) {
  let {
    sender,
    destination,
    transferAmount,
    cryptoType,
    encriptedEscrow,
    sendTxHash,
    password,
    sendTxFeeTxHash
  } = txRequest

  let transferData: Object = {
    clientId: 'test-client',
    sender: sender,
    destination: destination,
    transferAmount: transferAmount,
    cryptoType: cryptoType,
    sendTxHash: sendTxHash,
    data: Base64.encode(JSON.stringify(encriptedEscrow))
  }

  if (sendTxFeeTxHash) transferData.sendTxHash = [sendTxHash, sendTxFeeTxHash]

  let data = await API.transfer(transferData)

  // TX is now sent and server is notified, we save a copy of transfer data in drive's appDataFolder
  transferData.password = Base64.encode(password)
  transferData.sendingId = data.sendingId
  transferData.sendTimestamp = data.sendTimestamp
  await saveSendFile(transferData)

  return data
}

async function _acceptTransfer (txRequest: {
  escrowWallet: WalletData,
  destinationAddress: Address,
  transferAmount: StandardTokenUnit,
  txFee: TxFee,
  receivingId: string
}) {
  let {
    escrowWallet,
    txFee,
    destinationAddress,
    transferAmount,
    receivingId
  } = txRequest

  let { cryptoType } = escrowWallet
  // convert transferAmount to basic token unit
  let value: BasicTokenUnit = utils.toBasicTokenUnit(transferAmount, getCryptoDecimals(cryptoType))

  let receiveTxHash: TxHash = await WalletFactory.createWallet(escrowWallet).sendTransaction({
    to: destinationAddress,
    value: value,
    txFee: txFee
  })

  return _acceptTransferTransactionHashRetrieved({
    receiveTxHash: receiveTxHash,
    receivingId: receivingId
  })
}

async function _acceptTransferTransactionHashRetrieved (txRequest: {
  receiveTxHash: TxHash,
  receivingId: string
}) {
  let { receivingId, receiveTxHash } = txRequest

  let data = await API.accept({
    clientId: 'test-client',
    receivingId: receivingId,
    receiveTxHash: receiveTxHash
  })

  return data
}

async function _cancelTransfer (
  txRequest: {
    escrowWallet: WalletData,
    sendTxHash: TxHash,
    transferAmount: StandardTokenUnit,
    txFee: TxFee,
    sendingId: string
  }
) {
  let { escrowWallet, sendTxHash, transferAmount, txFee } = txRequest
  let { cryptoType } = escrowWallet

  // convert transferAmount to basic token unit
  let value: BasicTokenUnit = utils.toBasicTokenUnit(transferAmount, getCryptoDecimals(cryptoType))

  let cancelTxHash: TxHash

  if (cryptoType === 'bitcoin') {
    const senderAddress = await getFirstFromAddress(sendTxHash)
    cancelTxHash = await WalletFactory.createWallet(escrowWallet).sendTransaction({ to: senderAddress, value: value, txFee: txFee })
  } else if (['ethereum', 'dai'].includes(cryptoType)) {
    // ethereum based coins
    const _web3 = new Web3(new Web3.providers.HttpProvider(url.INFURA_API_URL))
    let txReceipt = await _web3.eth.getTransactionReceipt(sendTxHash)
    let senderAddress: Address = txReceipt.address
    cancelTxHash = await WalletFactory.createWallet(escrowWallet).sendTransaction({ to: senderAddress, value: value, txFee: txFee })
  } else {
    throw new Error(`Invalid cryptoType: ${cryptoType}`)
  }

  return _cancelTransferTransactionHashRetrieved({
    cancelTxHash: cancelTxHash,
    sendingId: txRequest.sendingId
  })
}

async function _cancelTransferTransactionHashRetrieved (txRequest: {
  sendingId: string,
  cancelTxHash: TxHash
}) {
  let { sendingId, cancelTxHash } = txRequest

  let data = await API.cancel({
    clientId: 'test-client',
    sendingId: sendingId,
    cancelTxHash: cancelTxHash
  })

  return data
}

async function _getTransfer (sendingId: ?string, receivingId: ?string) {
  let transferData = await API.getTransfer({ sendingId, receivingId })
  let walletData = WalletUtils.toWalletData('escrow', transferData.cryptoType, [{
    address: transferData.address,
    encryptedPrivateKey: transferData.data
  }])
  return { transferData, walletData }
}

async function _getTransferHistory () {
  let transfersDict = await getAllTransfers()

  // convert dict to array
  let transfers = []
  for (let key in transfersDict) {
    transfers.push(transfersDict[key])
  }

  // sort transfers by sendTimestamp in descending order
  transfers.sort((a, b) => b.sendTimestamp - a.sendTimestamp)

  // pick most recent 20 transfers
  transfers = transfers.slice(0, Math.min(transfers.length, 20))

  // identify transfer state
  const sendingIds = transfers.map(t => t.sendingId)
  let transferData = await API.getBatchTransfers({ sendingId: sendingIds })
  transferData = transferData.map(item => {
    let state = null
    const { sendTxState, receiveTxState, cancelTxState } = item
    switch (sendTxState) {
      case 'Pending': {
        // SEND_PENDING
        state = transferStates.SEND_PENDING
        break
      }
      case 'Confirmed': {
        switch (receiveTxState) {
          // SEND_CONFIRMED_RECEIVE_PENDING
          case 'Pending':
            state = transferStates.SEND_CONFIRMED_RECEIVE_PENDING
            break
          // SEND_CONFIRMED_RECEIVE_CONFIRMED
          case 'Confirmed':
            state = transferStates.SEND_CONFIRMED_RECEIVE_CONFIRMED
            break
          // SEND_CONFIRMED_RECEIVE_FAILURE
          case 'Failed':
            state = transferStates.SEND_CONFIRMED_RECEIVE_FAILURE
            break
          case null:
            state = transferStates.SEND_CONFIRMED_RECEIVE_NOT_INITIATED
            break
          case 'Expired': {
            // SEND_CONFIRMED_RECEIVE_EXPIRED
            state = transferStates.SEND_CONFIRMED_RECEIVE_EXPIRED
            break
          }
          default:
            break
        }
        switch (cancelTxState) {
          // SEND_CONFIRMED_CANCEL_PENDING
          case 'Pending':
            state = transferStates.SEND_CONFIRMED_CANCEL_PENDING
            break
          // SEND_CONFIRMED_CANCEL_CONFIRMED
          case 'Confirmed':
            state = transferStates.SEND_CONFIRMED_CANCEL_CONFIRMED
            break
          // SEND_CONFIRMED_CANCEL_FAILURE
          case 'Failed':
            state = transferStates.SEND_CONFIRMED_CANCEL_FAILURE
            break
          default:
            break
        }
        break
      }
      case 'Failed': {
        // SEND_FAILURE
        state = transferStates.SEND_FAILURE
        break
      }
      default:
        state = 'UNKNOW'
    }
    return {
      ...item,
      state
    }
  })
  return transferData
}

function submitTx (txRequest: {
  fromWallet: WalletData,
  transferAmount: StandardTokenUnit,
  password: string,
  sender: string,
  destination: string,
  txFee: TxFee
}) {
  return (dispatch: Function, getState: Function) => {
    return dispatch({
      type: 'SUBMIT_TX',
      payload: _submitTx(txRequest)
    }).then(() => dispatch(goToStep('send', 1)))
  }
}

function setLastUsedAddress ({ googleId, cryptoType, walletType, address }) {
  return {
    type: 'SET_LAST_USED_ADDRESS',
    payload: API.setLastUsedAddress({ googleId, cryptoType, walletType, address })
  }
}

function directTransfer (txRequest: {
  fromWallet: Object,
  transferAmount: StandardTokenUnit,
  destinationAddress: Address,
  txFee: TxFee
}) {
  return (dispatch: Function, getState: Function) => {
    return dispatch({
      type: 'DIRECT_TRANSFER',
      payload: _directTransfer(txRequest)
    })
  }
}

function acceptTransfer (txRequest: {
  escrowWallet: WalletData,
  destinationAddress: Address,
  transferAmount: StandardTokenUnit,
  txFee: TxFee,
  receivingId: string
}) {
  return (dispatch: Function, getState: Function) => {
    const { escrowWallet, destinationAddress } = txRequest
    const { walletType, cryptoType } = escrowWallet
    return dispatch({
      type: 'ACCEPT_TRANSFER',
      payload: _acceptTransfer(txRequest)
    }).then(() => {
      const { profile } = getState().userReducer
      if (profile.isAuthenticated && profile.googleId) {
        const googleId = profile.googleId
        dispatch(
          setLastUsedAddress({ googleId, cryptoType, walletType, address: destinationAddress })
        )
      }

      dispatch(goToStep('receive', 1))
    })
  }
}

function cancelTransfer (txRequest: {
  escrowWallet: WalletData,
  sendTxHash: TxHash,
  transferAmount: StandardTokenUnit,
  txFee: TxFee,
  sendingId: string
}) {
  return (dispatch: Function, getState: Function) => {
    return dispatch({
      type: 'CANCEL_TRANSFER',
      payload: _cancelTransfer(txRequest)
    }).then(() => dispatch(goToStep('cancel', 1)))
  }
}

function getTxCost (txRequest: {
  fromWallet: WalletData,
  transferAmount: StandardTokenUnit,
}) {
  return (dispatch: Function, getState: Function) => {
    return dispatch({
      type: 'GET_TX_COST',
      payload: _getTxCost(txRequest)
    })
  }
}

function getTransfer (sendingId: ?string, receivingId: ?string) {
  return {
    type: 'GET_TRANSFER',
    payload: _getTransfer(sendingId, receivingId)
  }
}

function getTransferHistory () {
  return {
    type: 'GET_TRANSFER_HISTORY',
    payload: _getTransferHistory()
  }
}

function clearVerifyPasswordError () {
  return {
    type: 'CLEAR_VERIFY_PASSWORD_ERROR'
  }
}

export {
  submitTx,
  directTransfer,
  acceptTransfer,
  cancelTransfer,
  getTxCost,
  getTransfer,
  getTransferHistory,
  clearVerifyPasswordError,
  transferStates
}
