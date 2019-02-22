exports.handler = async (event, context, callback) => {
  // Setup env
  var moment = require('moment')
  var UUID = require('uuid/v4')
  var email = require('./email.js')

  // load the AWS SDK for Node.js
  var AWS = require('aws-sdk')

  // set the region
  AWS.config.update({ region: 'us-east-1' })

  // create the DynamoDB service object
  var ddb = new AWS.DynamoDB({ apiVersion: '2012-10-08' })

  // create the SES service object
  var ses = new AWS.SES({ apiVersion: '2010-12-01' })

  // parse request data
  // for local testing, use request = event.body
  let request = JSON.parse(event.body)

  // TODO reject invalid clientId
  const clientId = request.clientId

  function handleResults (rv, err) {
    let response = {
      'headers': {
        'Access-Control-Allow-Origin': '*', // Required for CORS support to work
        'Access-Control-Allow-Credentials': true // Required for cookies, authorization headers with HTTPS
      },
      'isBase64Encoded': false
    }

    if (!err) {
      response.statusCode = 200
      response.body = JSON.stringify(rv)
      callback(null, response)
    } else {
      console.log(err)
      response.statusCode = 500
      response.body = JSON.stringify(err)
      callback(null, response)
    }
  }

  async function getSendingIdByReceivingId (receivingId) {
    let data = await ddb.getItem({
      TableName: 'IdMapping',
      Key: {
        'receivingId': { S: receivingId }
      }
    }).promise()

    return data.Item.sendingId.S
  }

  async function getTransferBySendingId (sendingId) {
    let data = await ddb.getItem({
      TableName: 'TransferData',
      Key: {
        'sendingId': { S: sendingId }
      }
    }).promise()
    let item = data.Item
    return {
      'sendingId': item.sendingId.S,
      'sender': item.sender.S,
      'destination': item.destination.S,
      'transferAmount': item.transferAmount.S,
      'cryptoType': item.cryptoType.S,
      'data': item.data.S,
      'sendTxHash': item.sendTxHash.S,
      'sendTimestamp': item.sendTimestamp.N,
      'receiveTxHash': item.receiveTxHash ? item.receiveTxHash.S : null,
      'receiveTimestamp': item.receiveTimestamp ? item.receiveTimestamp.N : null,
      'cancelTxHash': item.cancelTxHash ? item.cancelTxHash.S : null,
      'cancelTimestamp': item.cancelTimestamp ? item.cancelTimestamp.N : null
    }
  }

  async function getTransferByReceivingId (receivingId) {
    let sendingId = await getSendingIdByReceivingId(receivingId)
    let data = await getTransferBySendingId(sendingId)
    data.sendingId = null
    // add receivingId
    data.receivingId = receivingId
    return data
  }

  async function getTransfer (sendingId, receivingId) {
    return sendingId ? getTransferBySendingId(sendingId) : getTransferByReceivingId(receivingId)
  }

  async function send (sender, destination, transferAmount, cryptoType, data, sendTxHash) {
    let sendingId = UUID() // for sender
    let receivingId = UUID() // for receiver
    let sendTimestamp = moment().unix().toString()

    // Call DynamoDB to add the transfer data to the table
    await ddb.putItem({
      TableName: 'TransferData',
      Item: {
        'sendingId': { S: sendingId },
        'receivingId': { S: receivingId },
        'clientId': { S: clientId },
        'sender': { S: sender },
        'destination': { S: destination },
        'transferAmount': { S: transferAmount },
        'cryptoType': { S: cryptoType },
        'data': { S: data },
        'sendTxHash': { S: sendTxHash },
        'sendTimestamp': { N: sendTimestamp }
      }
    }).promise()

    // store the id mapping in database
    await ddb.putItem({
      TableName: 'IdMapping',
      Item: {
        'receivingId': { S: receivingId },
        'sendingId': { S: sendingId }
      }
    }).promise()

    // send emails to sender and receiver
    await email.sendAction(
      ses,
      sendingId,
      receivingId,
      sender,
      destination,
      transferAmount,
      cryptoType,
      sendTxHash,
      sendTimestamp
    )

    return {
      sendingId: sendingId,
      sendTimestamp: sendTimestamp
    }
  }

  async function receive (receivingId, receiveTxHash) {
    let receiveTimestamp = moment().unix().toString()

    // retrieve sendingId first
    let data = await ddb.getItem({
      TableName: 'IdMapping',
      Key: {
        'receivingId': { S: receivingId }
      }
    }).promise()

    let sendingId = data.Item.sendingId.S

    // store receiveTimestamp and receiveTxHash
    data = await ddb.updateItem({
      TableName: 'TransferData',
      Key: {
        'sendingId': { S: sendingId }
      },
      ExpressionAttributeNames: {
        '#RT': 'receiveTimestamp',
        '#RTH': 'receiveTxHash'

      },
      ExpressionAttributeValues: {
        ':rt': { N: receiveTimestamp },
        ':rth': { S: receiveTxHash }
      },
      ReturnValues: 'ALL_NEW',
      UpdateExpression: 'SET #RT = :rt, #RTH = :rth'
    }).promise()

    let sender = data.Attributes.sender.S
    let destination = data.Attributes.destination.S
    let transferAmount = data.Attributes.transferAmount.S
    let cryptoType = data.Attributes.cryptoType.S
    let sendTxHash = data.Attributes.sendTxHash.S
    let sendTimestamp = data.Attributes.sendTimestamp.N

    // send emails to sender and receiver
    await email.receiveAction(
      ses,
      sendingId,
      receivingId,
      sender,
      destination,
      transferAmount,
      cryptoType,
      sendTxHash,
      sendTimestamp,
      receiveTxHash,
      receiveTimestamp
    )

    return {
      receivingId: receivingId,
      receiveTimestamp: receiveTimestamp
    }
  }

  async function cancel (sendingId, cancelTxHash) {
    let cancelTimestamp = moment().unix().toString()

    // store receiveTimestamp and receiveTxHash
    let data = await ddb.updateItem({
      TableName: 'TransferData',
      Key: {
        'sendingId': { S: sendingId }
      },
      ExpressionAttributeNames: {
        '#CT': 'cancelTimestamp',
        '#CTH': 'cancelTxHash'

      },
      ExpressionAttributeValues: {
        ':ct': { N: cancelTimestamp },
        ':cth': { S: cancelTxHash }
      },
      ReturnValues: 'ALL_NEW',
      UpdateExpression: 'SET #CT = :ct, #CTH = :cth'
    }).promise()

    let receivingId = data.Attributes.receivingId.N
    let sender = data.Attributes.sender.S
    let destination = data.Attributes.destination.S
    let transferAmount = data.Attributes.transferAmount.S
    let cryptoType = data.Attributes.cryptoType.S
    let sendTxHash = data.Attributes.sendTxHash.S
    let sendTimestamp = data.Attributes.sendTimestamp.N

    // send emails to sender and receiver
    await email.cancelAction(
      ses,
      sendingId,
      receivingId,
      sender,
      destination,
      transferAmount,
      cryptoType,
      sendTxHash,
      sendTimestamp,
      cancelTxHash,
      cancelTimestamp
    )

    return {
      sendingId: sendingId,
      cancelTimestamp: cancelTimestamp
    }
  }

  try {
    let rv = null
    if (request.action === 'GET') {
      rv = await getTransfer(request.sendingId, request.receivingId)
    } else if (request.action === 'SEND') {
      rv = await send(request.sender, request.destination, request.transferAmount, request.cryptoType, request.data, request.sendTxHash)
    } else if (request.action === 'RECEIVE') {
      rv = await receive(request.receivingId, request.receiveTxHash)
    } else if (request.action === 'CANCEL') {
      rv = await cancel(request.sendingId, request.cancelTxHash)
    } else {
      throw new Error('Invalid command')
    }

    handleResults(rv)
  } catch (err) {
    handleResults(null, err)
  }
}
