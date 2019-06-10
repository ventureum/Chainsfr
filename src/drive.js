// @flow

/*
 * Google Drive APIs
 */

import env from './typedEnv'

const ROOT_FOLDER_NAME: string = '__ChainsferData__'

/*
 * Stores encrypted escrow wallet and password before sending out the TX
 * This ensures the funds is at least recoverable if
 *
 * 1. Frontend fails to store wallet and password in SEND_FILE_NAME after TX is sent,
 * possibly due to space limit, file corruption, drive API changes or permission issues
 *
 * 2. Server fails to save escrow wallet, in which case, we still have a backup copy
 * of the wallet
 *
 * The frontend does not update temp files, the funds recovery procedure is done
 * manually with the help of Chainsfer team
 *
 * Data format:
 *
 * [{
 *   sender: [string],
 *   destination: [string],
 *   transferAmount: [string],
 *   cryptoType: [string],
 *   data: [string], // base64 encoded encrypted escrow wallet
 *   password: [string], // password for the escrow wallet
 *   tempTimestamp: [int], // unix timestamp of the saving action
 *  } ...]
 */
const TEMP_SEND_FILE_NAME: string = `__chainsfer_temp_send_${env.REACT_APP_ENV}__.json`

/*
 * A single file storing past transfer data
 * The password in the file will be used for cancellation
 *
 * Data format:
 *
 * {
 *   [sendingId]: { // [sendingId] is the key, retrieved from api response
 *     sender: [string],
 *     destination: [string],
 *     transferAmount: [string],
 *     cryptoType: [string],
 *     data: [string], // base64 encoded encrypted escrow wallet
 *     sendTxHash: [string]
 *     password: [string], // password for the escrow wallet
 *   }
 *  }
 */
const SEND_FILE_NAME: string = `__chainsfer_send_${env.REACT_APP_ENV}__.json`

/*
 * A single file storing encrypted wallet data
 *
 * Data format:
 * {
 *   ethereum: Base64 encoded encrypted privateKey
 *   bitcoin: Base58 encoded BIP38 encrypted privateKey
 * }
 */
const WALLET_FILE_NAME: string = `__chainsfer_wallet_${env.NODE_ENV}__.json`

// flow type definitions

type DriveSpace = string
type FileName = string
type FileId = string

type File = {
  name: FileName,
  content: Object
}

type FileResource = {
  id?: FileId,
  name?: FileName,
  mimeType?: string,
  parents?: ?Array<FileId>,
  alt?: string
  // see https://developers.google.com/drive/api/v2/reference/files#resource
  // for complete  definition
}
type FileResourceResponse = {
  id: FileId, // response must include fileId
  name?: FileName,
  mimeType?: string,
  parents?: ?Array<FileId>
}

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
  sendingId: string,
  sender: string,
  destination: string,
  transferAmount: string,
  cryptoType: string,
  data: string,
  password: string,
  sendTimestamp: number
}

type Wallet = {
  ethereum: string,
  bitcoin: string
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

// load google drive APIs
async function loadApi () {
  if (!window.gapi.client) {
    console.log('loading client ... ')
    let config = {
      scope: process.env.REACT_APP_GOOGLE_API_SCOPE,
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID
    }
    await gapiLoad()
    console.log('loading client done. ')
    await window.gapi.client.init(config)
    if (!window.gapi.client.drive) {
      await window.gapi.client.load('drive', 'v3')
    }
  }
  if (!window.gapi.client.drive) {
    await window.gapi.client.load('drive', 'v3')
  }
}

// load a single file with fileId
async function loadFile (fileId: FileId): Promise<Object> {
  let fileRequest: FileResource = {
    fileId: fileId,
    alt: 'media'
  }

  let rv: {
    result: any
  } = await window.gapi.client.drive.files.get(fileRequest)

  return rv.result
}

/*
 * Search for a list of files
 *
 * @param space [string] one of 'drive', 'appDataFolder'
 * @param parents [array of string] parent folders, only support one parent currently
 * @param isFolder [boolean] is the file a folder
 * @param fileName [string] name of the file
 * @returns [array of file resource]
 * see https://developers.google.com/drive/api/v3/reference/files#resource for details
 */
async function listFiles (
  space: DriveSpace,
  parents: ?Array<FileId>,
  isFolder: boolean,
  fileName: FileName
): Promise< Array<FileResourceResponse> > {
  await loadApi()

  // build a query string
  let query = ''

  if (fileName) {
    query = `name = '${fileName}'`
  }

  if (isFolder) {
    if (query) query += 'and '
    query += `mimeType = 'application/vnd.google-apps.folder'`
  }

  if (parents) {
    // if we have a parent, insert parent into the search query
    if (query) query += 'and '
    query += `'${parents[0]}' in parents`
  }

  var filesListRequest: {
    spaces: DriveSpace,
    fields: string,
    orderBy: string,
    q: string,
    pageSize: number
  } = {
    spaces: space,
    fields: 'nextPageToken, files(id, name)',
    orderBy: 'modifiedTime',
    q: query,
    pageSize: 10
  }

  let rv: {
    result: {
      files: Array<FileResourceResponse>
    }
  } = await window.gapi.client.drive.files.list(filesListRequest)

  return rv.result.files
}

/*
 * Create a folder (if not exist) in appDataFolder
 *
 * @param space [string] one of 'drive', 'appDataFolder'
 * @param parents [array of string] list of parent folders (only support one parent right now)
 * @param folder [string] name of the folder
 * @returns file id of the folder
 */
async function createFolder (
  space: DriveSpace,
  parents: ?Array<FileId>,
  folder: FileName
): Promise<string> {
  await loadApi()

  let files = await listFiles(space, parents, true, folder)

  if (files.length === 0) {
    // folder DNE
    // create a new one
    let resource: FileResource = {
      name: folder,
      mimeType: 'application/vnd.google-apps.folder',
      parents: (space === 'appDataFolder' && !parents) ? ['appDataFolder'] : parents
    }

    let resp: {
      result: FileResourceResponse
    } = await window.gapi.client.drive.files.create({
      resource: resource
    })
    return resp.result.id
  } else {
    // return the first folder found (we only have one)
    return files[0].id
  }
}

/*
 * Overwrite content of a file
 *
 * @param fileId [string] id of the file
 * @param content [object] content of the file
 */
async function addContent (
  fileId: FileId,
  content: any
): Promise<FileResource> {
  return window.gapi.client.request({
    path: '/upload/drive/v3/files/' + fileId,
    method: 'PATCH',
    params: {
      uploadType: 'media'
    },
    body: content
  })
}

/*
 *  Create a file or update a file if it exists
 *  Overwrite the file with same file name
 *
 *  @param space [string] one of 'drive', 'appDataFolder'
 *  @param folder [string] name of the parent folder
 *  @param file [object]
 *  {
 *    name: [string] name of the file
 *    content: [object] content of the file
 *  }
 *  @returns id [string] id of the file created/updated
 */
async function saveFileByName (
  space: DriveSpace,
  folder: ?FileName,
  file: File
): Promise<FileId> {
  await loadApi()

  var metadata: FileResource = {
    mimeType: 'application/json',
    name: file.name,
    fields: 'id',
    parents: null
  }

  // create a root folder
  let rootFolderId = await createFolder(space, null, ROOT_FOLDER_NAME)

  // create a sub-folder
  let folderId = null
  if (folder) {
    folderId = await createFolder(space, [rootFolderId], folder)
  } else {
    folderId = rootFolderId
  }

  // set parent folder in metadata
  metadata.parents = [folderId]

  let files = await listFiles(space, [folderId], false, file.name)

  let fileId = files[0] ? files[0].id : null
  if (!fileId) {
    // creating a new file
    let resp = await window.gapi.client.drive.files.create({
      resource: metadata
    })

    // update file id
    fileId = resp.result.id
  }

  // now add/update content to the file
  await addContent(fileId, file.content)

  // return the file id
  return fileId
}

/*
 * Load file content from appDataFolder
 *
 * @param fileName [string] name of the file
 * @returns content of the file
 */
async function loadFileByNameFromAppData (fileName: FileName): Promise<any> {
  // appDataFolder is the default location

  // get fileId first
  let files = await listFiles('appDataFolder', null, false, fileName)

  if (files.length >= 1) {
    // always use the first file
    let fileId = files[0].id

    if (files.length > 1) {
      console.warn('Multiple files with same file name found')
    }
    // now load content of the file
    if (fileId) {
      return loadFile(fileId)
    }
  } else {
    return null
  }
}

/*
 * Save transferData into TEMP_SEND_FILE_NAME
 *
 * @param transferData [object]
 * see the object definition at the top
 */
async function saveTempSendFile (transferData: TempTransferData) {
  // save a new temp send file
  let file: File = {
    name: transferData.tempTimestamp + TEMP_SEND_FILE_NAME,
    content: transferData
  }

  await saveFileByName('drive', null, file)
}

/*
 * Save transferData into SEND_FILE_NAME
 *
 * @param transferData [object]
 * see the object definition at the top
 */
async function saveSendFile (transferData: TransferData) {
  let transfers = await loadFileByNameFromAppData(SEND_FILE_NAME)

  if (transfers) {
    transfers[transferData.sendingId] = transferData
  } else {
    transfers = {
      [transferData.sendingId]: transferData
    }
  }

  // update the send file with new content
  await saveFileByName('appDataFolder', null, {
    name: SEND_FILE_NAME,
    content: transfers
  })
}

async function saveWallet (wallet: Wallet) {
  // update the wallet
  await saveFileByName('appDataFolder', null, {
    name: WALLET_FILE_NAME,
    content: wallet
  })

  await saveFileByName('drive', null, {
    name: WALLET_FILE_NAME,
    content: wallet
  })
}

/*
 * Return the transfer data stored in SEND_FILE_NAME by sendingId
 *
 * @param sendingId [string] sendingId of the transfer
 * @returns transferData
 * see the object definition at the top
 */
async function getTransferData (sendingId: string): Promise<TransferData> {
  let transfers: ?{[string]: TransferData} = await loadFileByNameFromAppData(SEND_FILE_NAME)
  if (transfers) {
    return transfers[sendingId]
  } else {
    return {}
  }
}

async function getAllTransfers (): Promise< {[string]: TransferData} > {
  return loadFileByNameFromAppData(SEND_FILE_NAME)
}

async function getWallet (): Promise<Wallet> {
  return loadFileByNameFromAppData(WALLET_FILE_NAME)
}

export {
  saveTempSendFile,
  saveSendFile,
  saveWallet,
  getTransferData,
  getAllTransfers,
  getWallet,
  gapiLoad
}
