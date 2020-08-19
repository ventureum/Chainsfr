import axios from 'axios'
import env from '../../typedEnv'
import { Base64 } from 'js-base64'
import { cryptoSelections } from './config'
import transferStates from '../../transferStates'

const chainsferApi = axios.create({
  baseURL: env.REACT_APP_CHAINSFER_API_ENDPOINT,
  headers: {
    'Content-Type': 'application/json'
  }
})

const sleep = milliseconds => {
  return new Promise((resolve, reject) => {
    setTimeout(function () {
      resolve()
    }, milliseconds)
  })
}

const runUntilEvaluateEquals = (fn, value, opts = {}) => {
  if (opts.interval === undefined) opts.interval = 500
  if (opts.comparator === undefined) opts.comparator = (a, b) => a === b
  return new Promise((resolve, reject) => {
    ;(function wait () {
      if (!opts.comparator(fn(), value)) {
        setTimeout(wait, opts.interval)
      } else {
        resolve()
      }
    })()
  })
}

const getNewPopupPage = async (browser, triggerFunction) => {
  let pagesBeforeOpen = await browser.pages()
  await triggerFunction()
  var pageCount = 0
  await runUntilEvaluateEquals(function () {
    ;(async function () {
      pageCount = (await browser.pages()).length
    })()
    return pageCount
  }, pagesBeforeOpen.length + 1)

  const browserPages = await browser.pages()
  const newPopup = browserPages.reduce(function (acc, curr) {
    if (!pagesBeforeOpen.includes(curr)) {
      return curr
    } else {
      return acc
    }
  })
  return newPopup
}

async function getElementTextContent (elementHandle) {
  const text = await (await elementHandle.getProperty('textContent')).jsonValue()
  return text
}

async function getTransfer (request: { transferId: ?string, receivingId: ?string }) {
  let rv = await chainsferApi.post('/transfer', {
    clientId: 'test-client',
    action: 'GET',
    transferId: request.transferId,
    receivingId: request.receivingId
  })

  let responseData = normalizeTransferData(rv.data)

  // data is not availble to direct transfers
  // need check if data exists first
  responseData.data = responseData.data ? JSON.parse(Base64.decode(responseData.data)) : undefined

  // default transfer method
  responseData.transferMethod = 'EMAIL_TRANSFER'

  if (responseData.destinationAccount) {
    responseData.transferMethod = 'DIRECT_TRANSFER'
  }
  return responseData
}

function normalizeTransferData (transferData) {
  transferData.sendTxState = null
  transferData.receiveTxState = null
  transferData.cancelTxState = null

  if (transferData['senderToChainsfer']) {
    const stage = transferData['senderToChainsfer']
    transferData.sendTimestamp = stage.txTimestamp
    transferData.sendTxState = stage.txState
    transferData.sendTxHash = stage.txHash
  }

  if (transferData['chainsferToReceiver']) {
    const stage = transferData['chainsferToReceiver']
    transferData.receiveTimestamp = stage.txTimestamp
    transferData.receiveTxState = stage.txState
    transferData.receiveTxHash = stage.txHash
  }

  if (transferData['chainsferToSender']) {
    const stage = transferData['chainsferToSender']
    transferData.cancelTimestamp = stage.txTimestamp
    transferData.cancelTxState = stage.txState
    transferData.cancelTxHash = stage.txHash
  }

  // direct transfer
  if (transferData['senderToReceiver']) {
    const stage = transferData['senderToReceiver']
    transferData.sendTimestamp = stage.txTimestamp
    transferData.sendTxState = stage.txState
    transferData.sendTxHash = stage.txHash
  }

  return transferData
}

// helper function
// transferState format: [SEND_STATE, EXPIRED_STATE(optional), RECEIVE_STATE | CANCEL_STATE]
// which follows the timeline of transfer events
function getTransferState (transferData: Object): string {
  let state
  const { sendTxState, receiveTxState, cancelTxState, transferMethod, expired } = transferData
  switch (sendTxState) {
    case 'Pending': {
      // SEND_PENDING
      if (transferMethod === 'DIRECT_TRANSFER') {
        // special case, direct transfer
        state = transferStates.SEND_DIRECT_TRANSFER_PENDING
        break
      } else if (transferMethod === 'EMAIL_TRANSFER') {
        state = transferStates.SEND_PENDING
        break
      } else {
        throw new Error(`Invalid transferMethod ${transferMethod}`)
      }
    }
    case 'Confirmed': {
      if (transferMethod === 'DIRECT_TRANSFER') {
        // special case, direct transfer
        state = transferStates.SEND_DIRECT_TRANSFER_CONFIRMED
        break
      }
      // expired state
      const EXPIRED_STATE = expired ? '_EXPIRED' : ''
      switch (receiveTxState) {
        // SEND_CONFIRMED_RECEIVE_PENDING
        case 'Pending':
          state = transferStates[`SEND_CONFIRMED${EXPIRED_STATE}_RECEIVE_PENDING`]
          break
        // SEND_CONFIRMED_RECEIVE_CONFIRMED
        case 'Confirmed':
          // receive confirmed after expiration is possible:
          //  receiver started receiving right before expiration,
          //  transfer expired and receiver's tx is confirmed
          state = transferStates[`SEND_CONFIRMED${EXPIRED_STATE}_RECEIVE_CONFIRMED`]
          break
        // SEND_CONFIRMED_RECEIVE_FAILURE
        case 'Failed':
          state = transferStates[`SEND_CONFIRMED${EXPIRED_STATE}_RECEIVE_FAILURE`]
          break
        case 'NotInitiated':
          state = transferStates[`SEND_CONFIRMED${EXPIRED_STATE}_RECEIVE_NOT_INITIATED`]
          break
        default:
          break
      }
      switch (cancelTxState) {
        // SEND_CONFIRMED_CANCEL_PENDING
        case 'Pending':
          state = transferStates[`SEND_CONFIRMED${EXPIRED_STATE}_CANCEL_PENDING`]
          break
        // SEND_CONFIRMED_CANCEL_CONFIRMED
        case 'Confirmed':
          // SEND_CONFIRMED_EXPIRED_CANCEL_CONFIRMED is equivalent to reclaimed
          state = transferStates[`SEND_CONFIRMED${EXPIRED_STATE}_CANCEL_CONFIRMED`]
          break
        // SEND_CONFIRMED_CANCEL_FAILURE
        case 'Failed':
          state = transferStates[`SEND_CONFIRMED${EXPIRED_STATE}_CANCEL_FAILURE`]
          break
        default:
          break
      }
      break
    }
    case 'Failed':
      state = transferStates.SEND_FAILURE
      break
    default:
      break
  }
  if (!state) {
    console.warn('Unable to calculate transfer state', transferData)
    state = ''
  }
  return state
}

function getCryptoTitle (cryptoType) {
  const c = cryptoSelections.find(crypto => {
    return cryptoType === crypto.cryptoType
  })
  return c.title
}

function getCryptoSymbol (cryptoType) {
  const c = cryptoSelections.find(crypto => {
    return cryptoType === crypto.cryptoType
  })
  if (c) return c.symbol
  return ''
}

function getCrypto (cryptoType) {
  return cryptoSelections.find(crypto => {
    return cryptoType === crypto.cryptoType
  })
}

function getCryptoDecimals (cryptoType) {
  const c = cryptoSelections.find(crypto => {
    return cryptoType === crypto.cryptoType
  })
  return c.decimals
}

function getTxFeesCryptoType (cryptoType) {
  const c = cryptoSelections.find(crypto => {
    return cryptoType === crypto.cryptoType
  })
  return c.txFeesCryptoType
}

function getCryptoLogo (cryptoType) {
  const c = cryptoSelections.find(crypto => {
    return cryptoType === crypto.cryptoType
  })
  return c.logo
}

function isERC20 (cryptoType) {
  const c = cryptoSelections.find(crypto => {
    return cryptoType === crypto.cryptoType
  })
  return !!c.address
}

function getCryptoPlatformType (cryptoType) {
  const c = cryptoSelections.find(crypto => {
    return cryptoType === crypto.cryptoType
  })
  return c.platformType
}

function getPlatformCryptos (platformType) {
  const listOfCryptos = cryptoSelections.filter(c => {
    return c.platformType === platformType
  })
  return listOfCryptos
}

export {
  sleep,
  runUntilEvaluateEquals,
  getNewPopupPage,
  getElementTextContent,
  normalizeTransferData,
  getTransfer,
  getTransferState,
  getCryptoTitle,
  getCryptoSymbol,
  getCrypto,
  getCryptoDecimals,
  getTxFeesCryptoType,
  getCryptoLogo,
  isERC20,
  getCryptoPlatformType,
  getPlatformCryptos
}
