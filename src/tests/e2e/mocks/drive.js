// @flow

/*
 * Google Drive APIs
 */
import { DEFAULT_TRANSFER_DATA } from './transfers'
import env from '../../../typedEnv'
import { Base64 } from 'js-base64'

const TEMP_SEND_FILE_NAME: string = `__temp_send_${env.REACT_APP_ENV}__.json`
const TEMP_SEND_FOLDER_NAME: string = `TempSend_${env.REACT_APP_ENV}`
/*
 * A single file storing past transfer data
 * The password in the file will be used for cancellation
 *
 * Data format: see type TransferData
 */
const HISTORY_FILE_NAME: string = `__transaction_history_${env.REACT_APP_ENV}__.json`
const HISTORY_FOLDER_NAME: string = `TransactionHistory_${env.REACT_APP_ENV}`
/*
 * A single file storing encrypted wallet data
 *
 * Data format:
 * {
 *   ethereum: Base64 encoded encrypted privateKey
 *   bitcoin: Base58 encoded BIP38 encrypted privateKey
 * }
 */
const WALLET_FILE_NAME: string = `__wallet_${env.REACT_APP_ENV}__.json`
const WALLET_FOLDER_NAME: string = `Wallet_${env.REACT_APP_ENV}`

// flow type definitions
type TempTransferData = {
  sender: string,
  destination: string,
  transferAmount: string,
  cryptoType: string,
  data: string,
  password: string,
  tempTimestamp: number
}

type TransferData = {
  transferId?: string,
  sendTimestamp?: number,
  receivingId?: string,
  receiveTimestamp?: number,
  data?: string, // base64 encoded encrypted escrow wallet
  password?: string // password for the escrow wallet, undefined for receiver
}

// mock data
var DATA = {
  [TEMP_SEND_FOLDER_NAME]: {
    [TEMP_SEND_FILE_NAME]: null
  },
  [HISTORY_FOLDER_NAME]: {
    [HISTORY_FILE_NAME]: DEFAULT_TRANSFER_DATA.driveTransferHistory
  },
  [WALLET_FOLDER_NAME]: {
    [WALLET_FILE_NAME]: {
      accounts: Base64.encode(
        JSON.stringify({
          '0x259EC51eFaA03c33787752E5a99BeCBF7F8526c4': {
            privateKey: '0xAFC2580FA77A12AD3972EC3353EEE003EDA1215E8091DB8C39255D19F396D3D4'
          },
          tpubDCGHKimikfN7inXVgFiRJiAkN3Lb2Rca1UQyfnioyAJDQX7SkqD8dnYJH6SdjUcMkpNFNTHxwNYoCbna2CL9ZrYCZgKgv84hvHVrNEMLHME: {
            hdWalletVariables: {
              xpriv:
                'tprv8ZgxMBicQKsPdXnbZJtwjK2a2C7P6BWT9xG2mWW26272dgJn8doNAx75omMTgukJnq6Mv9Fkq1XmuBFXKxFAUSyERgZYpEGf8jkzHuxtJTk'
            },
            privateKey: 'cVsMfbdy2rBeRh1Djyc8sqWC1e6zMNyZHUxdHvzjNFWSnjNB5WWu',
            address: '2Mvn2Niwwqmr1XsNYepxeZ7gri6e7X92EUr'
          }
        })
      )
    }
  }
}

var storage

function initStorage () {
  storage = window.localStorage

  if (!storage.getItem('data')) {
    // prevent refresh from clearing data
    storage.setItem('data', JSON.stringify(DATA))
  }
}
// gapi.load does not support promise
// convert it into a promise
function gapiLoad (): Promise<any> {
  return new Promise((resolve, reject) => {
    window.gapi.load('client', {
      callback: function () {
        // Handle gapi.client initialization.
        resolve()
      },
      onerror: function () {
        reject(new Error('Load gapi client failed'))
      },
      timeout: 5000, // 5 seconds.
      ontimeout: function () {
        // Handle timeout.
        reject(new Error('Load gapi client timeout'))
      }
    })
  })
}

/*
 * Save transferData into TEMP_SEND_FILE_NAME
 *
 * @param transferData [object]
 * see the object definition at the top
 */
async function saveTempSendFile (transferData: TempTransferData) {
  let data = JSON.parse(storage.getItem('data'))
  // save a new temp send file
  data[TEMP_SEND_FOLDER_NAME][TEMP_SEND_FILE_NAME] = transferData
  storage.setItem('data', JSON.stringify(data))
}

/*
 * Save transferData into HISTORY_FILE_NAME
 *
 * @param transferData [object]
 * see the object definition at the top
 */
async function saveHistoryFile (transferData: TransferData) {
  let data = JSON.parse(storage.getItem('data'))
  let transfers = data[HISTORY_FOLDER_NAME][HISTORY_FILE_NAME]
  let id = transferData.transferId ? transferData.transferId : transferData.receivingId
  if (!id) throw new Error('Missing id in transferData')
  if (transfers) {
    transfers[id] = {
      ...transfers[id],
      ...transferData
    }
  } else {
    transfers = {
      [id]: transferData
    }
  }

  // update the send file with new content
  data[HISTORY_FOLDER_NAME][HISTORY_FILE_NAME] = transfers
  storage.setItem('data', JSON.stringify(data))
}

async function saveWallet (walletDataList: any, encryptedWalletFileData: any) {
  let data = JSON.parse(storage.getItem('data'))
  // update the wallet
  data[WALLET_FOLDER_NAME][WALLET_FILE_NAME] = walletDataList
  storage.setItem('data', JSON.stringify(data))
}

/*
 * Return the transfer data stored in HISTORY_FILE_NAME by transferId | receivingId
 *
 * @param id [string] transferId | receivingId of the transfer
 * @returns transferData
 * see the object definition at the top
 */
async function getTransferData (id: string): Promise<TransferData> {
  if (!storage) initStorage()
  let data = JSON.parse(storage.getItem('data'))
  let transfers: ?{ [string]: TransferData } = data[HISTORY_FOLDER_NAME][HISTORY_FILE_NAME]
  if (transfers) {
    return transfers[id]
  } else {
    return {}
  }
}

async function getAllTransfers (): Promise<{ [string]: TransferData }> {
  if (!storage) initStorage()
  let data = JSON.parse(storage.getItem('data'))
  return data[HISTORY_FOLDER_NAME][HISTORY_FILE_NAME]
}

async function getWallet (): Promise<any> {
  if (!storage) initStorage()
  let data = JSON.parse(storage.getItem('data'))
  return data[WALLET_FOLDER_NAME][WALLET_FILE_NAME]
}

async function deleteWallet (): Promise<any> {
  if (!storage) initStorage()
  let data = JSON.parse(storage.getItem('data'))
  delete data[WALLET_FOLDER_NAME][WALLET_FILE_NAME]
  storage.removeItem('data')
}

export {
  saveTempSendFile,
  saveHistoryFile,
  saveWallet,
  getTransferData,
  getAllTransfers,
  getWallet,
  gapiLoad,
  deleteWallet,
  DATA,
  WALLET_FILE_NAME,
  WALLET_FOLDER_NAME,
  HISTORY_FILE_NAME,
  HISTORY_FOLDER_NAME,
  TEMP_SEND_FILE_NAME,
  TEMP_SEND_FOLDER_NAME
}
