// @flow

/*
 * Google Drive APIs
 */

import env from '../../../typedEnv'

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
var data = {
  [TEMP_SEND_FOLDER_NAME]: {
    [TEMP_SEND_FILE_NAME]: null
  },
  [HISTORY_FOLDER_NAME]: {
    [HISTORY_FILE_NAME]: null
  },
  [WALLET_FOLDER_NAME]: {
    [WALLET_FILE_NAME]: {
      accounts: {
        '0xb428Ca537F86a8375fF7FB35d9c58E58Adb85aC8': {
          privateKey: '0x9ccba47adc95d13b565ce4beed9c1de5b909288cfa59ee7a8a15e4e227532d57'
        },
        tpubDCJU5Qa4bbLyQH8jteCDJGnTzQSFLpqhCS6v3C3TqXmR3cMGC2Y5BcG6XZ5Sd6ZaJnNszf2kHxAnF3miN63QMLTPhEesVQWaoecbA4qxfCc: {
          privateKey: 'cRaKNmbcr99rqPCZjVvtYhGtC1eVc44AYeHHvFtJYhxXj9cAEGQZ',
          address: '2N7WBvyKw2wegfjsW7riVhzfBaz8cJdjqRX'
        }
      }
    }
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
  // save a new temp send file
  data[TEMP_SEND_FOLDER_NAME][TEMP_SEND_FILE_NAME] = transferData
}

/*
 * Save transferData into HISTORY_FILE_NAME
 *
 * @param transferData [object]
 * see the object definition at the top
 */
async function saveHistoryFile (transferData: TransferData) {
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
}

async function saveWallet (walletDataList: any, encryptedWalletFileData: any) {
  // update the wallet
  data[WALLET_FOLDER_NAME][WALLET_FILE_NAME] = walletDataList
}

/*
 * Return the transfer data stored in HISTORY_FILE_NAME by transferId | receivingId
 *
 * @param id [string] transferId | receivingId of the transfer
 * @returns transferData
 * see the object definition at the top
 */
async function getTransferData (id: string): Promise<TransferData> {
  let transfers: ?{ [string]: TransferData } = data[HISTORY_FOLDER_NAME][HISTORY_FILE_NAME]
  if (transfers) {
    return transfers[id]
  } else {
    return {}
  }
}

async function getAllTransfers (): Promise<{ [string]: TransferData }> {
  return data[HISTORY_FOLDER_NAME][HISTORY_FILE_NAME]
}

async function getWallet (): Promise<any> {
  return data[WALLET_FOLDER_NAME][WALLET_FILE_NAME]
}

async function deleteWallet (): Promise<any> {
  delete data[WALLET_FOLDER_NAME][WALLET_FILE_NAME]
}

export {
  saveTempSendFile,
  saveHistoryFile,
  saveWallet,
  getTransferData,
  getAllTransfers,
  getWallet,
  gapiLoad,
  deleteWallet
}
