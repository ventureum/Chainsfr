exports.handler = (event, context, callback) => {
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
  // let body = JSON.parse(event.body)
  let request = event.body

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
      response.statusCode = 500
      response.body = JSON.stringify(err)
      callback(response)
    }
  }

  function getSendingIdByReceivingId (receivingId) {
    return ddb.getItem({
      TableName: 'IdMapping',
      Key: {
        'receivingId': { S: receivingId }
      }
    })
      .promise()
      .then(function (data) {
        return data.Item.sendingId.S
      })
  }

  function getTransferBySendingId (sendingId) {
    return ddb.getItem({
      TableName: 'TransferData',
      Key: {
        'sendingId': { S: sendingId }
      }
    })
      .promise()
      .then(function (data) {
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
      })
  }

  function getTransferByReceivingId (receivingId) {
    return getSendingIdByReceivingId(receivingId)
      .then(function (sendingId) {
        return getTransferBySendingId(sendingId)
      }).then(function (data) {
        // remove sendingId (should be be exposed to receiver)
        data.sendingId = null
        // add receivingId
        data.receivingId = receivingId
        return data
      })
  }

  function getTransfer (sendingId, receivingId) {
    let _promise = sendingId ? getTransferBySendingId(sendingId) : getTransferByReceivingId(receivingId)

    _promise.then(function (rv) {
      handleResults(rv, null)
    }).catch(function (err) {
      handleResults(null, err)
    })
  }

  function send (sender, destination, transferAmount, cryptoType, data, sendTxHash) {
    let sendingId = UUID() // for sender
    let receivingId = UUID() // for receiver
    let sendTimestamp = moment().unix().toString()

    // Call DynamoDB to add the transfer data to the table
    ddb.putItem({
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
    })
      .promise()
      .then(function (rv) {
        // store the id mapping in database
        return ddb.putItem({
          TableName: 'IdMapping',
          Item: {
            'receivingId': { S: receivingId },
            'sendingId': { S: sendingId }
          }
        })
          .promise()
      })
      .then(function (rv) {
        // send emails to sender and receiver
        return email.sendAction(
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
      })
      .then(function (rv) {
        handleResults(rv, null)
      }).catch(function (err) {
        handleResults(null, err)
      })
  }

  function receive (receivingId, receiveTxHash) {
    let receiveTimestamp = moment().unix().toString()

    // retrieve sendingId first
    ddb.getItem({
      TableName: 'IdMapping',
      Key: {
        'receivingId': { S: receivingId }
      }
    })
      .promise()
      .then(function (data) {
        let sendingId = data.Item.sendingId.S

        // store receiveTimestamp and receiveTxHash
        return ddb.updateItem({
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
      })
      .then(function (data) {
        let sendingId = data.Attributes.sendingId.N
        let sender = data.Attributes.sender.S
        let destination = data.Attributes.destination.S
        let transferAmount = data.Attributes.transferAmount.S
        let cryptoType = data.Attributes.cryptoType.S
        let sendTxHash = data.Attributes.sendTxHash.S
        let sendTimestamp = data.Attributes.sendTimestamp.N

        // send emails to sender and receiver
        return email.receiveAction(
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
      })
      .then(function (rv) {
        handleResults(rv, null)
      }).catch(function (err) {
        handleResults(null, err)
      })
  }

  function cancel (sendingId, cancelTxHash) {
    let cancelTimestamp = moment().unix().toString()

    // store receiveTimestamp and receiveTxHash
    return ddb.updateItem({
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
      .then(function (data) {
        let receivingId = data.Attributes.receivingId.N
        let sender = data.Attributes.sender.S
        let destination = data.Attributes.destination.S
        let transferAmount = data.Attributes.transferAmount.S
        let cryptoType = data.Attributes.cryptoType.S
        let sendTxHash = data.Attributes.sendTxHash.S
        let sendTimestamp = data.Attributes.sendTimestamp.N

        // send emails to sender and receiver
        return email.cancelAction(
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
      })
      .then(function (rv) {
        handleResults(rv, null)
      }).catch(function (err) {
        handleResults(null, err)
      })
  }

  switch (request.action) {
    case 'GET':
      getTransfer(request.sendingId, request.receivingId)
      break
    case 'SEND':
      send(request.sender, request.destination, request.transferAmount, request.cryptoType, request.data, request.sendTxHash)
      break
    case 'RECEIVE':
      receive(request.receivingId, request.receiveTxHash)
      break
    case 'CANCEL':
      cancel(request.sendingId, request.cancelTxHash)
      break
    default:
      handleResults(null, 'Invalid command')
  }
}
