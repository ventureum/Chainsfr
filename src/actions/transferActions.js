// @flow
import API from '../apis'
import Web3 from 'web3'
import LedgerNanoS from '../ledgerSigner'
import ERC20_ABI from '../contracts/ERC20.js'
import utils from '../utils'
import BN from 'bn.js'
import { goToStep } from './navigationActions'
import { saveTempSendFile, saveSendFile, getAllTransfers } from '../drive.js'
import moment from 'moment'
import { Base64 } from 'js-base64'
import ERC20 from '../ERC20'
import { getCrypto, getCryptoDecimals } from '../tokens'
import bitcore from 'bitcore-lib'
import axios from 'axios'
import env from '../typedEnv'
import url from '../url'

type Utxos = Array<{
  value: number,
  script: string,
  outputIndex: number,
  txHash: string
}>

type AddressPool = Array<{
  path: string,
  utxos: Utxos
}>

const ledgerNanoS = new LedgerNanoS()

function web3EthSendTransactionPromise (web3Function: Function, txObj: Object) {
  return new Promise((resolve, reject) => {
    web3Function(txObj)
      .on('transactionHash', (hash) => resolve(hash))
      .on('error', (error) => reject(error))
  })
}

async function getFirstFromAddress (txHash: string) {
  const rv = (await axios.get(`${url.LEDGER_API_URL}/transactions/${txHash}`)).data
  const address = rv[0].inputs[0].address
  return address
}

async function _getTxCost (
  txRequest: {
    cryptoType: string,
    transferAmount: string,
    txFeePerByte: ?number
  },
  addressPool: Array<Object>
) {
  let { cryptoType, transferAmount, txFeePerByte } = txRequest

  const mockFrom = '0x0f3fe948d25ddf2f7e8212145cef84ac6f20d904'
  const mockTo = '0x0f3fe948d25ddf2f7e8212145cef84ac6f20d905'
  const mockNumTokens = '1000'

  const precision = (new BN(10).pow(new BN(12)))

  if (cryptoType === 'ethereum') {
    return utils.getGasCost({
      from: mockFrom,
      to: mockTo,
      value: mockNumTokens
    })
  } else if (cryptoType === 'dai') {
    // eth transfer cost
    let txCostEth = await utils.getGasCost({
      from: mockFrom,
      to: mockTo,
      value: mockNumTokens
    })

    // ERC20 transfer tx cost
    let txCostERC20 = await utils.getGasCost(ERC20.getTransferTxObj(mockFrom, mockTo, mockNumTokens, cryptoType))

    // amount of eth to be transfered to the escrow wallet
    // this will be spent as tx fees for the next token transfer (from escrow wallet)
    // otherwise, the tokens in the escrow wallet cannot be transfered out
    // we use the current estimation to calculate amount of ETH to be transfered
    let ethTransfer = txCostERC20.costInBasicUnit

    let costInBasicUnit = new BN(txCostEth.costInBasicUnit)
      .add(new BN(txCostERC20.costInBasicUnit))
      .add(new BN(ethTransfer))

    let base = new BN(10).pow(new BN(getCryptoDecimals(cryptoType)))

    return {
      // use the current estimated price
      price: txCostERC20.price,
      // eth transfer gas + erc20 transfer gas
      gas: (new BN(txCostEth.gas).add(new BN(txCostERC20.gas))).toString(),
      // estimate total cost = eth to be transfered + eth transfer fee + erc20 transfer fee
      costInBasicUnit: costInBasicUnit.toString(),
      costInStandardUnit: ((new BN(costInBasicUnit).mul(precision).div(new BN(base))).toNumber() / parseFloat(precision.toNumber())).toString(),
      // subtotal tx cost
      // this is used for submitTx()
      costByType: { txCostEth, txCostERC20, ethTransfer }
    }
  } else if (cryptoType === 'bitcoin') {
    if (!txFeePerByte) txFeePerByte = await utils.getBtcTxFeePerByte()
    const { size, fee } = collectUtxos(addressPool, transferAmount, txFeePerByte)
    let price = txFeePerByte.toString()
    let gas = size.toString()
    let costInBasicUnit = fee
    const base = new BN(100000000)
    let costInStandardUnit = (parseFloat((new BN(costInBasicUnit).mul(precision).div(new BN(base))).toString()) / precision).toString()
    return { price, gas, costInBasicUnit, costInStandardUnit }
  } else {
    throw new Error('Invalid walletType/cryptoType')
  }
}

function collectUtxos (
  addressPool: AddressPool = [],
  transferAmount: string = '0',
  txFeePerByte: number
) {
  let utxosCollected = []
  let valueCollected = new BN(0)
  let i = 0
  let size = 0
  let fee = new BN(0)
  const satoshiValue = parseFloat(transferAmount) * 100000000 // 1 btc = 100,000,000 satoshi
  while (i < addressPool.length) {
    let utxos = addressPool[i].utxos
    for (let j = 0; j < utxos.length; j++) {
      const utxo = utxos[j]
      utxosCollected.push({
        ...utxo,
        keyPath: addressPool[i].path
      })
      size = ledgerNanoS.estimateTransactionSize(utxosCollected.length, 2, true).max
      fee = (new BN(size)).mul(new BN(txFeePerByte))
      valueCollected = valueCollected.add(new BN(utxo.value))
      if (valueCollected.gte(new BN(satoshiValue).add(fee))) {
        return {
          fee: fee.toString(),
          size,
          utxosCollected
        }
      }
    }
    i += 1
  }
  console.warn('Transfer amount greater and fee than utxo values.')
  return {
    fee: fee.toString(),
    size,
    utxosCollected
  }
}

async function _directTransfer (
  txRequest: {
    fromWallet: Object,
    cryptoType: string,
    transferAmount: string,
    destinationAddress: string,
    txCost: Object
  },
  utxos: Utxos
) {
  let { fromWallet, cryptoType, transferAmount, destinationAddress, txCost } = txRequest
  if (['ethereum', 'dai'].includes(cryptoType)) {
    var _web3 = new Web3(new Web3.providers.HttpProvider(url.INFURA_API_URL))
    var txObj = null

    // eth and dai have the same decimals
    let amountInBasicUnit = _web3.utils.toWei(transferAmount, 'ether')

    // add account to web3
    _web3.eth.accounts.wallet.add(fromWallet.crypto[cryptoType][0].privateKey)

    let fromAddress = fromWallet.crypto[cryptoType][0].address
    if (cryptoType === 'ethereum') {
      txObj = {
        from: fromAddress,
        to: destinationAddress,
        value: amountInBasicUnit,
        gas: txCost.gas,
        gasPrice: txCost.price
      }
    } else if (cryptoType === 'dai') {
      txObj = await ERC20.getTransferTxObj(fromAddress, destinationAddress, amountInBasicUnit, cryptoType)
      // update tx fees
      txObj.gas = txCost.gas
      txObj.gasPrice = txCost.price
    }
    let sendTxHash = await web3EthSendTransactionPromise(_web3.eth.sendTransaction, txObj)
    return {
      sendTxHash: sendTxHash,
      transferAmount: transferAmount,
      destinationAddress: destinationAddress,
      txCost: txCost,
      cryptoType: cryptoType
    }
  } else if (cryptoType === 'bitcoin') {
    let bitcoreUtxoFormat = utxos.map(utxo => {
      return {
        txid: utxo.txHash,
        vout: utxo.outputIndex,
        address: fromWallet.crypto[cryptoType][0].address,
        script: utxo.script,
        satoshis: utxo.value
      }
    })
    const satoshiValue = parseFloat(transferAmount) * 100000000 // 1 btc = 100,000,000 satoshi
    const fee = parseInt(txCost.costInBasicUnit)
    // get privateKey
    const decryptedWallet = await utils.decryptWallet(fromWallet.crypto[cryptoType][0].ciphertext, fromWallet.password, cryptoType)
    let transaction = new bitcore.Transaction()
      .from(bitcoreUtxoFormat)
      .to(destinationAddress, satoshiValue)
      .change(fromWallet.crypto[cryptoType][0].address)
      .fee(fee)
      .sign(decryptedWallet.privateKey)
    const txHex = transaction.serialize()
    const sendTxHash = await ledgerNanoS.broadcastBtcRawTx(txHex)
    return {
      sendTxHash: sendTxHash,
      transferAmount: transferAmount,
      destinationAddress: destinationAddress,
      txCost: txCost,
      cryptoType: cryptoType
    }
  }
}

async function _submitTx (
  txRequest: {
    fromWallet: Object,
    walletType: string,
    cryptoType: string,
    transferAmount: string,
    password: string,
    sender: string,
    destination: string,
    txCost: Object,
    txFeePerByte: ?number,
  },
  accountInfo: Object
) {
  let { fromWallet, walletType, cryptoType, transferAmount, password, sender, destination, txCost } = txRequest
  let escrow: Object = {}
  let encryptedEscrow: string
  let sendTxHash: string = ''
  let sendTxFeeTxHash: string
  if (!window._web3) {
    window._web3 = new Web3(new Web3.providers.HttpProvider(url.INFURA_API_URL))
  }
  if (['ethereum', 'dai'].includes(cryptoType)) {
    // ethereum based coins
    // step 1: create an escrow wallet
    escrow = window._web3.eth.accounts.create()

    // step 2: encrypt the escrow wallet with password provided and the destination email address
    encryptedEscrow = JSON.stringify(window._web3.eth.accounts.encrypt(escrow.privateKey, password + destination))
  } else if (cryptoType === 'bitcoin') {
    escrow = new bitcore.PrivateKey(undefined, env.REACT_APP_BTC_NETWORK)
    let privateKeyWif = escrow.toWIF()

    encryptedEscrow = await utils.encryptWallet({ wif: privateKeyWif }, password + destination, 'bitcoin')
  }

  // before sending out a TX, store a backup of encrypted escrow wallet in user's drive
  await saveTempSendFile({
    sender: sender,
    destination: destination,
    transferAmount: transferAmount,
    cryptoType: cryptoType,
    data: Base64.encode(encryptedEscrow),
    password: Base64.encode(password),
    tempTimestamp: moment().unix()
  })

  // step 4: transfer funds from [fromWallet] to the newly created escrow wallet
  if (walletType === 'metamask') {
    var txObj = null
    if (cryptoType === 'ethereum') {
      let wei = window._web3.utils.toWei(transferAmount, 'ether')
      txObj = {
        from: fromWallet.crypto[cryptoType][0].address,
        to: escrow.address,
        value: wei
      }
    } else if (cryptoType === 'dai') {
      // we need to transfer a small amount of eth to escrow to pay for
      // the next transfer's tx fees
      sendTxFeeTxHash = await web3EthSendTransactionPromise(window._web3.eth.sendTransaction, {
        from: fromWallet.crypto[cryptoType][0].address,
        to: escrow.address,
        value: txCost.costByType.ethTransfer, // estimated gas cost for the next tx
        gas: txCost.costByType.txCostEth.gas,
        gasPrice: txCost.costByType.txCostEth.price
      })

      // next, we send tokens to the escrow address
      let amountInBasicUnit = window._web3.utils.toWei(transferAmount, 'ether')
      txObj = await ERC20.getTransferTxObj(fromWallet.crypto[cryptoType][0].address, escrow.address, amountInBasicUnit, cryptoType)

      // update tx fees
      txObj.gas = txCost.costByType.txCostERC20.gas
      txObj.gasPrice = txCost.costByType.txCostERC20.price
    }

    sendTxHash = await web3EthSendTransactionPromise(window._web3.eth.sendTransaction, txObj)
  } else if (walletType === 'ledger') {
    if (cryptoType === 'ethereum') {
      const _web3 = new Web3(new Web3.providers.HttpProvider(url.INFURA_API_URL))
      const amountInWei = _web3.utils.toWei(transferAmount, 'ether')
      const signedTransactionObject = await ledgerNanoS.signSendEther(
        0,
        escrow.address,
        amountInWei,
        {
          gasLimit: txCost.gas,
          gasPrice: txCost.price
        }
      )
      sendTxHash = await web3EthSendTransactionPromise(_web3.eth.sendSignedTransaction, signedTransactionObject.rawTransaction)
    } else if (cryptoType === 'dai') {
      const _web3 = new Web3(new Web3.providers.HttpProvider(url.INFURA_API_URL))
      // send out tx fee for next tx
      const signedTxFee = await ledgerNanoS.signSendEther(
        0,
        escrow.address,
        txCost.costByType.ethTransfer,
        {
          gasLimit: txCost.costByType.txCostEth.gas,
          gasPrice: txCost.costByType.txCostEth.price
        })
      sendTxFeeTxHash = await web3EthSendTransactionPromise(_web3.eth.sendSignedTransaction, signedTxFee.rawTransaction)

      const amountInBasicUnit = _web3.utils.toWei(transferAmount, 'ether')
      const signedTransactionObject = await ledgerNanoS.signSendTrasaction(
        0,
        getCrypto('dai').address, ERC20_ABI,
        'transfer',
        escrow.address,
        amountInBasicUnit,
        {
          gasLimit: txCost.costByType.txCostERC20.gas,
          gasPrice: txCost.costByType.txCostERC20.price
        })
      sendTxHash = await web3EthSendTransactionPromise(_web3.eth.sendSignedTransaction, signedTransactionObject.rawTransaction)
    } else if (cryptoType === 'bitcoin') {
      const satoshiValue = parseFloat(transferAmount) * 100000000 // 1 btc = 100,000,000 satoshi
      const addressPool = accountInfo.addresses
      const { fee, utxosCollected } = collectUtxos(addressPool, transferAmount, txCost.price)
      const signedTxRaw = await ledgerNanoS.createNewBtcPaymentTransaction(utxosCollected, escrow.toAddress().toString(), satoshiValue, fee, accountInfo.nextChangeIndex)
      sendTxHash = await ledgerNanoS.broadcastBtcRawTx(signedTxRaw)
    }
  } else if (walletType === 'drive') {
    const _web3 = new Web3(new Web3.providers.HttpProvider(url.INFURA_API_URL))
    if (cryptoType === 'ethereum') {
      let ethWalletDecrypted = await utils.decryptWallet(fromWallet.crypto[cryptoType][0], fromWallet.password, 'ethereum')
      // add privateKey to web3
      _web3.eth.accounts.wallet.add(ethWalletDecrypted.privateKey)

      let wei = _web3.utils.toWei(transferAmount, 'ether')
      txObj = {
        from: fromWallet.crypto[cryptoType][0].address,
        to: escrow.address,
        value: wei,
        gas: txCost.gas,
        gasPrice: txCost.price
      }
      sendTxHash = await web3EthSendTransactionPromise(_web3.eth.sendTransaction, txObj)
    } else if (cryptoType === 'dai') {
      let ethWalletDecrypted = await utils.decryptWallet(fromWallet.crypto[cryptoType][0], fromWallet.password, 'ethereum')
      _web3.eth.accounts.wallet.add(ethWalletDecrypted.privateKey)

      // we need to transfer a small amount of eth to escrow to pay for
      // the next transfer's tx fees
      sendTxFeeTxHash = await web3EthSendTransactionPromise(_web3.eth.sendTransaction, {
        from: fromWallet.crypto[cryptoType][0].address,
        to: escrow.address,
        value: txCost.costByType.ethTransfer, // estimated gas cost for the next tx
        gas: txCost.costByType.txCostEth.gas,
        gasPrice: txCost.costByType.txCostEth.price
      })

      // next, we send tokens to the escrow address
      let amountInBasicUnit = _web3.utils.toWei(transferAmount, 'ether')
      txObj = await ERC20.getTransferTxObj(fromWallet.crypto[cryptoType][0].address, escrow.address, amountInBasicUnit, cryptoType)

      // update tx fees
      txObj.gas = txCost.costByType.txCostERC20.gas
      txObj.gasPrice = txCost.costByType.txCostERC20.price
      sendTxHash = await web3EthSendTransactionPromise(_web3.eth.sendTransaction, txObj)
    } else if (cryptoType === 'bitcoin') {
      let bitcoreUtxoFormat = accountInfo.addresses[0].utxos.map(utxo => {
        return {
          txid: utxo.txHash,
          vout: utxo.outputIndex,
          address: fromWallet.crypto[cryptoType][0].address,
          script: utxo.script,
          satoshis: utxo.value
        }
      })
      const satoshiValue = parseFloat(transferAmount) * 100000000 // 1 btc = 100,000,000 satoshi
      const fee = parseInt(txCost.costInBasicUnit)
      // get privateKey
      const decryptedWallet = await utils.decryptWallet(fromWallet.crypto[cryptoType][0].ciphertext, fromWallet.password, cryptoType)
      let transaction = new bitcore.Transaction()
        .from(bitcoreUtxoFormat)
        .to(escrow.toAddress().toString(), satoshiValue)
        .change(fromWallet.crypto[cryptoType][0].address)
        .fee(fee)
        .sign(decryptedWallet.privateKey)
      const txHex = transaction.serialize()
      sendTxHash = await ledgerNanoS.broadcastBtcRawTx(txHex)
    }
  }

  // step 5: clear wallet
  window._web3.eth.accounts.wallet.clear()

  // step 6: update tx data
  return _transactionHashRetrieved({
    sender: txRequest.sender,
    destination: txRequest.destination,
    transferAmount: txRequest.transferAmount,
    cryptoType: txRequest.cryptoType,
    encriptedEscrow: encryptedEscrow,
    sendTxHash: sendTxHash,
    password: txRequest.password,
    sendTxFeeTxHash: sendTxFeeTxHash
  })
}

async function _transactionHashRetrieved (
  txRequest: {
    sender: string,
    destination: string,
    transferAmount: string,
    cryptoType: string,
    encriptedEscrow: any,
    sendTxHash: string,
    password: string,
    sendTxFeeTxHash: ?string
  }
) {
  let { sender, destination, transferAmount, cryptoType, encriptedEscrow, sendTxHash, password, sendTxFeeTxHash } = txRequest

  let transferData: Object = {
    clientId: 'test-client',
    sender: sender,
    destination: destination,
    transferAmount: transferAmount,
    cryptoType: cryptoType,
    sendTxHash: sendTxHash,
    data: Base64.encode(JSON.stringify(encriptedEscrow)),
    password: Base64.encode(password)
  }

  if (sendTxFeeTxHash) transferData.sendTxHash = [sendTxHash, sendTxFeeTxHash]

  let data = await API.transfer(transferData)

  // TX is now sent and server is notified, we save a copy of transfer data in drive's appDataFolder
  transferData.sendingId = data.sendingId
  transferData.sendTimestamp = data.sendTimestamp
  await saveSendFile(transferData)

  return data
}

async function _acceptTransfer (
  txRequest: {
    escrowWallet: Object,
    destinationAddress: string,
    cryptoType: string,
    transferAmount: string,
    txCost: Object,
    receivingId: string
  },
  utxos: Utxos
) {
  // transfer funds from escrowWallet to destinationAddress with cryptoType and transferAmount
  // fromWallet is a decryptedWallet with the following data
  // 1. address
  // 2. privateKey

  let { escrowWallet, destinationAddress, cryptoType, transferAmount, txCost } = txRequest
  let receiveTxHash: string
  if (cryptoType === 'bitcoin') {
    let bitcoreUtxoFormat = utxos.map(utxo => {
      return {
        txid: utxo.txHash,
        vout: utxo.outputIndex,
        address: escrowWallet && escrowWallet.address,
        script: utxo.script,
        satoshis: utxo.value
      }
    })
    const satoshiValue = parseFloat(transferAmount) * 100000000 // 1 btc = 100,000,000 satoshi
    const fee = parseInt(txCost.costInBasicUnit)
    let transaction = new bitcore.Transaction()
      .from(bitcoreUtxoFormat)
      .to(destinationAddress, satoshiValue - fee)
      .fee(parseInt(txCost.costInBasicUnit))
      .sign(escrowWallet.privateKey)
    const txHex = transaction.serialize()
    receiveTxHash = await ledgerNanoS.broadcastBtcRawTx(txHex)
  } else {
    // add escrow account to web3
    const _web3 = new Web3(new Web3.providers.HttpProvider(url.INFURA_API_URL))
    let txObj = null
    _web3.eth.accounts.wallet.add(escrowWallet.privateKey)

    if (cryptoType === 'ethereum') {
      // calculate amount in wei to be sent
      let wei = (new BN(_web3.utils.toWei(transferAmount, 'ether'))).toString()

      // actual amount to receive = escrow balance - tx fees
      let amountExcludeGasInWei = (new BN(wei).sub(new BN(txCost.costInBasicUnit))).toString()

      // setup tx object
      txObj = {
        from: escrowWallet.address,
        to: destinationAddress,
        value: amountExcludeGasInWei.toString(), // actual receiving amount
        gas: txCost.gas,
        gasPrice: txCost.price
      }
    } else if (cryptoType === 'dai') {
      // calculate amount in basic token unit to be sent
      let amountInBasicUnit = _web3.utils.toWei(transferAmount, 'ether')

      txObj = await ERC20.getTransferTxObj(escrowWallet.address, destinationAddress, amountInBasicUnit, cryptoType)

      // update tx fees
      txObj.gas = txCost.gas
      txObj.gasPrice = await ERC20.getGasPriceGivenBalance(escrowWallet.address, txCost.gas)
    }

    receiveTxHash = await web3EthSendTransactionPromise(_web3.eth.sendTransaction, txObj)
  }
  return _acceptTransferTransactionHashRetrieved({
    receiveTxHash: receiveTxHash,
    receivingId: txRequest.receivingId
  })
}

async function _acceptTransferTransactionHashRetrieved (
  txRequest: {
    receiveTxHash: string,
    receivingId: string
  }
) {
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
    escrowWallet: Object,
    sendTxHash: string,
    cryptoType: string,
    transferAmount: string,
    txCost: Object,
    sendingId: string
  },
  utxos: Utxos
) {
  // transfer funds from escrowWallet to sender address with cryptoType and transferAmount
  // fromWallet is a decryptedWallet with the following data
  // 1. address
  // 2. privateKey

  let { escrowWallet, sendTxHash, cryptoType, transferAmount, txCost } = txRequest
  let cancelTxHash: string = ''
  if (cryptoType === 'bitcoin') {
    const firstFromAddress = await getFirstFromAddress(sendTxHash)
    let bitcoreUtxoFormat = utxos.map(utxo => {
      return {
        txid: utxo.txHash,
        vout: utxo.outputIndex,
        address: escrowWallet.address,
        script: utxo.script,
        satoshis: utxo.value
      }
    })
    const satoshiValue = parseFloat(transferAmount) * 100000000 // 1 btc = 100,000,000 satoshi
    const fee = parseInt(txCost.costInBasicUnit)
    let transaction = new bitcore.Transaction()
      .from(bitcoreUtxoFormat)
      .to(firstFromAddress, satoshiValue - fee)
      .fee(parseInt(txCost.costInBasicUnit))
      .sign(escrowWallet.privateKey)
    const txHex = transaction.serialize()
    cancelTxHash = await ledgerNanoS.broadcastBtcRawTx(txHex)
  } else if (['ethereum', 'dai'].includes(cryptoType)) {
    // ethereum based coins

    const _web3 = new Web3(new Web3.providers.HttpProvider(url.INFURA_API_URL))

    var txObj = null

    // add escrow account to web3
    _web3.eth.accounts.wallet.add(escrowWallet.privateKey)

    if (cryptoType === 'ethereum') {
      // calculate amount in wei to be sent
      let wei = _web3.utils.toWei(transferAmount, 'ether')

      // actual amount to receive = escrow balance - tx fees
      let amountExcludeGasInWei = (new BN(wei).sub(new BN(txCost.costInBasicUnit))).toString()

      let txReceipt = await _web3.eth.getTransactionReceipt(sendTxHash)
      // setup tx object
      txObj = {
        from: escrowWallet.address,
        to: txReceipt.from, // sender address
        value: amountExcludeGasInWei, // actual receiving amount
        gas: txCost.gas,
        gasPrice: txCost.price
      }
    } else if (cryptoType === 'dai') {
      // calculate amount in basic token unit to be sent
      let amountInBasicUnit = _web3.utils.toWei(transferAmount, 'ether')

      let txReceipt = await _web3.eth.getTransactionReceipt(sendTxHash)
      txObj = await ERC20.getTransferTxObj(escrowWallet.address, txReceipt.from, amountInBasicUnit, cryptoType)

      // update tx fees
      txObj.gas = txCost.gas
      txObj.gasPrice = await ERC20.getGasPriceGivenBalance(escrowWallet.address, txCost.gas)
    }

    // now boardcast tx
    cancelTxHash = await web3EthSendTransactionPromise(_web3.eth.sendTransaction, txObj)
  }
  return _cancelTransferTransactionHashRetrieved({
    cancelTxHash: cancelTxHash,
    sendingId: txRequest.sendingId
  })
}

async function _cancelTransferTransactionHashRetrieved (
  txRequest: {
    sendingId: string,
    cancelTxHash: string
  }
) {
  let { sendingId, cancelTxHash } = txRequest

  let data = await API.cancel({
    clientId: 'test-client',
    sendingId: sendingId,
    cancelTxHash: cancelTxHash
  })

  return data
}

async function _getTransfer (sendingId: ?string, receivingId: ?string) {
  let apiResponse = await API.getTransfer({ sendingId, receivingId })
  return apiResponse
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
    if (!item.receiveTxHash) {
      if (!item.cancelTxHash) {
        // pending receive
        state = 'pending'
      } else {
        // cancelled
        state = 'cancelled'
      }
    } else {
      // received
      state = 'received'
    }
    return {
      ...item,
      state
    }
  })
  return transferData
}

function submitTx (txRequest: {
  fromWallet: Object,
  walletType: string,
  cryptoType: string,
  transferAmount: string,
  password: string,
  sender: string,
  destination: string,
  txCost: Object,
  txFeePerByte: ?number,
}) {
  return (dispatch: Function, getState: Function) => {
    let accountInfo = {}
    if (txRequest.cryptoType === 'bitcoin') {
      accountInfo = getState().walletReducer.wallet[txRequest.walletType].crypto[txRequest.cryptoType][0]
    }
    return dispatch({
      type: 'SUBMIT_TX',
      payload: _submitTx(txRequest, accountInfo)
    }).then(() => dispatch(goToStep('send', 1)))
  }
}

function setLastUsedAddress ({ googleId, walletType, address }) {
  return {
    type: 'SET_LAST_USED_ADDRESS',
    payload: API.setLastUsedAddress({ googleId, walletType, address })
  }
}

function directTransfer (txRequest: {
  fromWallet: Object,
  cryptoType: string,
  transferAmount: string,
  destinationAddress: string,
  txCost: Object
}) {
  return (dispatch: Function, getState: Function) => {
    let utxos = []
    if (txRequest.cryptoType === 'bitcoin') {
      utxos = getState().walletReducer.wallet.drive.crypto[txRequest.cryptoType][0].addresses[0].utxos
    }
    return dispatch({
      type: 'DIRECT_TRANSFER',
      payload: _directTransfer(txRequest, utxos)
    })
  }
}

function acceptTransfer (
  txRequest: {
    escrowWallet: Object,
    destinationAddress: string,
    cryptoType: string,
    transferAmount: string,
    txCost: Object,
    receivingId: string,
    walletType: string
  }
) {
  return (dispatch: Function, getState: Function) => {
    let utxos = []
    const { walletType, destinationAddress, cryptoType } = txRequest
    if (txRequest.cryptoType === 'bitcoin') {
      utxos = getState().walletReducer.escrowWallet.decryptedWallet.utxos
    }
    return dispatch({
      type: 'ACCEPT_TRANSFER',
      payload: _acceptTransfer(txRequest, utxos)
    }).then(() => {
      const { profile } = getState().userReducer
      if (profile.isAuthenticated && profile.googleId) {
        const googleId = profile.googleId
        const address = cryptoType === 'bitcoin' && walletType === 'ledger'
          ? getState().walletReducer.wallet[walletType].crypto[cryptoType][0].xpub
          : destinationAddress
        dispatch(setLastUsedAddress({ googleId, walletType, address }))
      }

      dispatch(goToStep('receive', 1))
    })
  }
}

function cancelTransfer (
  txRequest: {
    escrowWallet: Object,
    sendTxHash: string,
    cryptoType: string,
    transferAmount: string,
    txCost: Object,
    sendingId: string
  }
) {
  return (dispatch: Function, getState: Function) => {
    let utxos = []
    if (txRequest.cryptoType === 'bitcoin') {
      utxos = getState().walletReducer.escrowWallet.decryptedWallet.utxos
    }
    return dispatch({
      type: 'CANCEL_TRANSFER',
      payload: _cancelTransfer(txRequest, utxos)
    }).then(() => dispatch(goToStep('cancel', 1)))
  }
}

function getTxCost (
  txRequest: {
    cryptoType: string,
    transferAmount: string,
    txFeePerByte: ?number,
    escrowWallet: ?Object,
    walletType: string
  }
) {
  return (dispatch: Function, getState: Function) => {
    let addressPool = []
    if (txRequest.cryptoType === 'bitcoin') {
      if (txRequest.escrowWallet) {
        addressPool.push({ utxos: txRequest.escrowWallet.decryptedWallet.utxos })
      } else {
        addressPool = getState().walletReducer.wallet[txRequest.walletType].crypto[txRequest.cryptoType][0].addresses
      }
    }
    return dispatch({
      type: 'GET_TX_COST',
      payload: _getTxCost(txRequest, addressPool)
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
  clearVerifyPasswordError
}
