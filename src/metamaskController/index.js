/**
 * @file      The central metamask controller. Aggregates other controllers and exports an api.
 * @copyright Copyright (c) 2018 MetaMask
 * @license   MIT
 */

import Web3 from 'web3'
import BlockTracker from 'eth-block-tracker'
import TransactionController from './controllers/transactions'
import ComposableObservableStore from './lib/ComposableObservableStore'
import url from '../url'
const EventEmitter = require('events')
const { BN } = require('ethereumjs-util')
const GWEI_BN = new BN('1000000000')
const percentile = require('percentile')
const debounce = require('debounce')
const HttpProvider = require('ethjs-provider-http')

class MetamaskController extends EventEmitter {
  /**
   * @constructor
   * @param {Object} opts
   */
  constructor (opts) {
    super()

    this.defaultMaxListeners = 20
    this.sendUpdate = debounce(this.privateSendUpdate.bind(this), 200)

    // observable state store
    this.store = new ComposableObservableStore({})
    this.provider = new HttpProvider(url.INFURA_API_URL)
    this.web3 = new Web3(this.provider)
    this.blockTracker = new BlockTracker({ provider: this.provider })

    // tx mgmt
    this.txController = new TransactionController({
      initState: {},
      web3: this.web3,
      txHistoryLimit: 40,
      signTransaction: this.web3.eth.signTransaction,
      provider: this.provider,
      blockTracker: this.blockTracker,
      getGasPrice: this.getGasPrice.bind(this),
    })
    this.txController.on('newUnapprovedTx', (txMeta) => this.emit(txMeta))

    this.store.updateStructure({
      TransactionController: this.txController.store,
    })

    this.memStore = new ComposableObservableStore(null, {
      TxController: this.txController.memStore,
    })
    this.memStore.subscribe(this.sendUpdate.bind(this))
  }

  init (opts) {
    // TODO: Init controllers after redux has been rehydrated
    // pass
  }

  /**
   * The metamask-state of the various controllers, made available to the UI
   *
   * @returns {Object} status
   */
  getState () {
    return {
      ...this.memStore.getFlatState(),
    }
  }

  /**
   * A method for emitting the full MetaMask state to all registered listeners.
   * @private
   */
  privateSendUpdate () {
    this.emit('update', this.getState())
  }

  /**
   * A method for estimating a good gas price at recent prices.
   * Returns the lowest price that would have been included in
   * 50% of recent blocks.
   *
   * @returns {string} A hex representation of the suggested wei gas price.
   */
  getGasPrice () {
    const { recentBlocksController } = this
    const { recentBlocks } = recentBlocksController.store.getState()

    // Return 1 gwei if no blocks have been observed:
    if (recentBlocks.length === 0) {
      return '0x' + GWEI_BN.toString(16)
    }

    const lowestPrices = recentBlocks
      .map((block) => {
        if (!block.gasPrices || block.gasPrices.length < 1) {
          return GWEI_BN
        }
        return block.gasPrices
          .map((hexPrefix) => hexPrefix.substr(2))
          .map((hex) => new BN(hex, 16))
          .sort((a, b) => {
            return a.gt(b) ? 1 : -1
          })[0]
      })
      .map((number) => number.div(GWEI_BN).toNumber())

    const percentileNum = percentile(65, lowestPrices)
    const percentileNumBn = new BN(percentileNum)
    return '0x' + percentileNumBn.mul(GWEI_BN).toString(16)
  }

  /**
   * Returns the nonce that will be associated with a transaction once approved
   * @param address {string} - The hex string address for the transaction
   * @returns Promise<number>
   */
  async getPendingNonce (address) {
    const { nonceDetails, releaseLock } = await this.txController.nonceTracker.getNonceLock(address)
    const pendingNonce = nonceDetails.params.highestSuggested

    releaseLock()
    return pendingNonce
  }

  /**
   * Returns the next nonce according to the nonce-tracker
   * @param address {string} - The hex string address for the transaction
   * @returns Promise<number>
   */
  async getNextNonce (address) {
    let nonceLock
    try {
      nonceLock = await this.txController.nonceTracker.getNonceLock(address)
    } finally {
      nonceLock.releaseLock()
    }
    return nonceLock.nextNonce
  }
}

const metamaskController = new MetamaskController()
export default metamaskController
