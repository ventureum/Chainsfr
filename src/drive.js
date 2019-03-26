/*
 * Google Drive APIs
 */

const ROOT_FOLDER_NAME = '__ChainsferData__'

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
const TEMP_SEND_FILE_NAME = '__chainsfer_temp_send__.json'

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
const SEND_FILE_NAME = '__chainsfer_send__.json'

/*
 * A single file storing encrypted wallet data
 *
 * Data format:
 * {
 *   ethereum: Base64 encoded encrypted privateKey
 *   bitcoin: Base58 encoded BIP38 encrypted privateKey
 * }
 */
const WALLET_FILE_NAME = '__chainsfer_wallet__.json'

// gapi.load does not support promise
// convert it into a promise
function gapiLoad () {
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
async function loadFile (fileId) {
  let rv = await window.gapi.client.drive.files.get({
    fileId: fileId,
    alt: 'media'
  })
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
async function listFiles (space, parents, isFolder, fileName) {
  await loadApi()

  // build a query string
  let query = null

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

  let rv = await window.gapi.client.drive.files.list({
    spaces: space,
    fields: 'nextPageToken, files(id, name)',
    orderBy: 'modifiedTime',
    q: query,
    pageSize: 10
  })

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
async function createFolder (space, parents, folder) {
  await loadApi()

  let files = await listFiles(space, parents, true, folder)

  if (files.length === 0) {
    // folder DNE
    // create a new one
    let resp = await window.gapi.client.drive.files.create({
      resource: {
        name: folder,
        mimeType: 'application/vnd.google-apps.folder',
        parents: (space === 'appDataFolder' && !parents) ? ['appDataFolder'] : parents
      }
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
async function addContent (fileId, content) {
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
async function saveFileByName (space, folder, file) {
  await loadApi()

  var metadata = {
    mimeType: 'application/json',
    name: file.name,
    fields: 'id'
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
async function loadFileByNameFromAppData (fileName) {
  // appDataFolder is the default location

  // get fileId first
  let files = await listFiles('appDataFolder', null, false, fileName)

  if (files.length === 1) {
    // we should have exactly one file
    let fileId = files[0].id

    // now load content of the file
    return loadFile(fileId)
  } else {
    if (files.length === 0) return null
    else throw new Error('Multiple files with same file name found')
  }
}

/*
 * Save transferData into TEMP_SEND_FILE_NAME
 *
 * @param transferData [object]
 * see the object definition at the top
 */
async function saveTempSendFile (transferData) {
  // save a new temp send file
  await saveFileByName('drive', null, {
    name: transferData.tempTimestamp + TEMP_SEND_FILE_NAME,
    content: transferData
  })
}

/*
 * Save transferData into SEND_FILE_NAME
 *
 * @param transferData [object]
 * see the object definition at the top
 */
async function saveSendFile (transferData) {
  let transfers = null
  transfers = await loadFileByNameFromAppData(SEND_FILE_NAME)

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

async function saveWallet (wallet) {
  // update the wallet
  return saveFileByName('appDataFolder', null, {
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
async function getTransferData (sendingId) {
  let transfers = await loadFileByNameFromAppData(SEND_FILE_NAME)
  return transfers[sendingId]
}

async function getAllTransfers () {
  return loadFileByNameFromAppData(SEND_FILE_NAME)
}

async function getWallet () {
  return loadFileByNameFromAppData(WALLET_FILE_NAME)
}

export {
  saveTempSendFile,
  saveSendFile,
  saveWallet,
  getTransferData,
  getAllTransfers,
  getWallet
}
