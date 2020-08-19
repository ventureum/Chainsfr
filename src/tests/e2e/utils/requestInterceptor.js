// @flow
import { DAI_ADDRESS } from '../config'
declare var Base64: any
declare var log: any

const _ = require('lodash')
const chalk = require('chalk')

const CONTRACT_ADDR = DAI_ADDRESS

const BALANCE_OF_SIG = '0x70a08231'
const ALLOWANCE_OF_SIG = '0xdd62ed3e'
const FUNC_SIG_MAP = {
  '0x70a08231': 'balanceOf',
  '0xdd62ed3e': 'allowance'
}

const MOCK_BTC_TX = {
  truncated: false,
  txs: [
    {
      hash: 'ae2b5d87ec1fdf7938c48642fd2268fed27b15aa7aca777ddfcb00550273ee5b',
      received_at: '2020-03-27T20:45:11Z',
      lock_time: 0,
      block: {
        hash: '000000009d6cba4c02d2800be819985cff08224b48518c8595260d5ccb507918',
        height: 1671262,
        time: '2020-03-27T20:59:41Z'
      },
      inputs: [
        {
          input_index: 0,
          output_hash: '353ecf3e0d32dc14a3c9335e7d57f4425294f5797068d89a1b91432ca96fd788',
          output_index: 1,
          value: 27314613,
          address: '2MyWuzqUfBhWy9JH7GhFtF6hbYnUekMzuDD',
          script_signature: '160014676826ae7c9b8fac907af5675723ce2649cbf5a9',
          txinwitness: [
            '3044022016fe4a8d211a93621b45d85576ec6395b14dad013122256d7012ab579add272302204bfbc6aac0c092dccee31e1d7202670bb27c5d6bea934831dc89bea30ac31ccd01',
            '038b040a5421618a7968ce0403a8c13f3a4e250d17a38de74aa8402d45ff33b2b1'
          ]
        }
      ],
      outputs: [
        {
          output_index: 0,
          value: 750019,
          address: '2Mvn2Niwwqmr1XsNYepxeZ7gri6e7X92EUr',
          script_hex: 'a91426bb93fa4588b13d58013481a0114ac54533343b87'
        },
        {
          output_index: 1,
          value: 26562914,
          address: '2MwAmFcFaFwGfHqs79tJZf18QYFLxHwumZC',
          script_hex: 'a9142b0885793ae234e25890f6d36ef158cbaab667c887'
        }
      ],
      fees: 1680,
      amount: 27312933,
      confirmations: 52391
    }
  ]
}

const LEDGER_API_TXS = 'https://api.ledgerwallet.com/blockchain/v2/btc_testnet/addresses'
const INFURA_API = 'https://rinkeby.infura.io/v3/'
const CHAINSFR_API = process.env.REACT_APP_CHAINSFER_API_ENDPOINT
const TEST_URL = process.env.E2E_TEST_URL

class RequestInterceptor {
  intercept: boolean = false

  // see byPass function for examples
  byPassMatchObj: any = null

  stats: { [string]: { total: number, intercepted: number, sent?: number } } = {}

  // map request fingerprint to response obj
  cache: { [string]: any } = {}

  async setRequestInterception (val: boolean) {
    this.intercept = val
    this.startIntercept()
  }

  /*
   * @param key finger print of a request
   * @param val stat increments of type { total: number, intercepted: number}
   */
  incrementStat (key: string, val: { total: number, intercepted: number }) {
    if (!this.stats[key]) {
      this.stats[key] = { total: 0, intercepted: 0 }
    }
    this.stats[key]['total'] += val.total
    this.stats[key]['intercepted'] += val.intercepted
  }

  async startIntercept () {
    const client = await page.target().createCDPSession()
    client.removeAllListeners('Fetch.requestPaused')
    //see: https://chromedevtools.github.io/devtools-protocol/tot/Fetch#method-enable
    await client.send('Fetch.enable', {
      //see: https://chromedevtools.github.io/devtools-protocol/tot/Fetch#type-RequestPattern
      patterns: [
        {
          urlPattern: 'https://*',
          requestStage: 'Request'
        },
        {
          urlPattern: 'https://*',
          requestStage: 'Response'
        }
      ]
    })
    //see: https://chromedevtools.github.io/devtools-protocol/tot/Fetch#event-requestPaused
    client.on(
      'Fetch.requestPaused',
      async ({ requestId, request, responseHeaders, responseStatusCode }) => {
        const { url } = request
        try {
          if ([200, 304].includes(responseStatusCode)) {
            // handling response
            let responseBody
            if (
              !url.startsWith(LEDGER_API_TXS) &&
              !url.startsWith(INFURA_API) &&
              !url.startsWith(CHAINSFR_API) &&
              !url.startsWith(TEST_URL)
            ) {
              //see: https://chromedevtools.github.io/devtools-protocol/tot/Fetch#method-getResponseBody
              responseBody = await client.send('Fetch.getResponseBody', {
                requestId
              })

              // store in cache
              this.cache[url] = {
                responseCode: responseStatusCode,
                responseHeaders,
                body: responseBody.body
              }
            } else if (url.startsWith(INFURA_API)) {
              // special case, cache gasPrice
              let postData = JSON.parse(request.postData)
              let params = postData.params[0]

              let id = postData.method
              if (params) {
                id = id + '_' + JSON.stringify(params)
              }

              switch (postData.method) {
                case 'eth_gasPrice':
                  responseBody = await client.send('Fetch.getResponseBody', {
                    requestId
                  })
                  this.cache[id] = {
                    responseCode: responseStatusCode,
                    responseHeaders,
                    body: responseBody.body
                  }
                  break
              }
            } else if (url.startsWith(CHAINSFR_API)) {
              // special case, cache user requests
              let postData = JSON.parse(request.postData)
              switch (postData.action) {
                case 'GET_CRYPTO_ACCOUNTS':
                case 'GET_RECIPIENTS':
                case 'REGISTER':
                case 'GET_TRANSFER':
                case 'BATCH_GET':
                case 'GET_USER':
                  responseBody = await client.send('Fetch.getResponseBody', {
                    requestId
                  })
                  // request.postData is a string
                  this.cache[request.postData] = {
                    responseCode: responseStatusCode,
                    responseHeaders,
                    body: responseBody.body
                  }
                  break
              }
            }
          } else {
            // handling requests

            if (url.startsWith('https://widget.intercom.io/widget/gjd0qon8')) {
              // abort all intercom requests since this part does not need to be tested
              await client.send('Fetch.failRequest', { requestId, errorReason: 'Aborted' })
              return
            }

            if (url.startsWith(LEDGER_API_TXS)) {
              this.incrementStat(LEDGER_API_TXS, { total: 1, intercepted: 0 })
              const _addr = url.split('/')[7]
              let toBeMatched = {
                platform: 'bitcoin',
                method: 'txs',
                addresses: [_addr]
              }

              if (!this.byPassMatchObj || !_.isMatch(toBeMatched, this.byPassMatchObj)) {
                this.incrementStat(LEDGER_API_TXS, { total: 0, intercepted: 1 })
                await client.send('Fetch.fulfillRequest', {
                  requestId,
                  responseCode: 200,
                  responseHeaders: [
                    { name: 'status', value: '200' },
                    { name: 'date', value: 'Mon, 11 May 2020 01:05:53 GMT' },
                    { name: 'content-type', value: 'text/plain; charset=utf-8' },
                    { name: 'vary', value: 'Accept-Encoding' },
                    { name: 'content-encoding', value: 'br' }
                  ],
                  // set a non-zero output value for the first derived address so the btc account balance > 0
                  // set empty txs for all other derived addresses
                  body: Base64.encode(
                    JSON.stringify(
                      _addr === '2Mvn2Niwwqmr1XsNYepxeZ7gri6e7X92EUr'
                        ? MOCK_BTC_TX
                        : { truncated: false, txs: [] }
                    )
                  )
                })
                return
              }
            } else if (url.startsWith(INFURA_API)) {
              let postData = JSON.parse(request.postData)
              let params = postData.params[0]

              // update interception stats
              let id = postData.method
              if (params) {
                id = id + '_' + JSON.stringify(params)
              }
              this.incrementStat(id, {
                total: 1,
                intercepted: 0
              })

              let responseObj: {
                jsonrpc: string,
                id: string,
                result?: string
              } = { jsonrpc: '2.0', id: postData.id }

              let toBeMatched: {
                platform: string,
                method: string,
                funcSig?: string,
                addresses?: Array<string>
              } = {
                platform: 'ethereum',
                method: postData.method
              }

              switch (postData.method) {
                // eth balance
                case 'eth_getBalance':
                  // return a fixed eth balance
                  responseObj['result'] = '0x167222698c4a0100'
                  toBeMatched.addresses = [postData.params[0]]
                  break
                case 'eth_call':
                  if (params.to === CONTRACT_ADDR) {
                    if (params.data.startsWith(ALLOWANCE_OF_SIG)) {
                      // zero allowance by default
                      responseObj['result'] =
                        '0x0000000000000000000000000000000000000000000000000000000000000000'
                      toBeMatched.funcSig = FUNC_SIG_MAP[params.data.slice(0, 10)]
                      toBeMatched.addresses = [
                        '0x' + params.data.slice(34, 34 + 40),
                        '0x' + params.data.slice(-40)
                      ]
                    } else if (params.data.startsWith(BALANCE_OF_SIG)) {
                      // return a fixed erc20 token balance (decimal 18)
                      responseObj['result'] =
                        '0x000000000000000000000000000000000000000000000043de19078ef7b04000'
                      toBeMatched.funcSig = FUNC_SIG_MAP[params.data.slice(0, 10)]
                      toBeMatched.addresses = ['0x' + params.data.slice(34, 34 + 40)]
                    }
                  }
                  break
              }

              // intercept request
              if (responseObj.result) {
                if (!this.byPassMatchObj || !_.isMatch(toBeMatched, this.byPassMatchObj)) {
                  this.incrementStat(id, {
                    total: 0,
                    intercepted: 1
                  })
                  await client.send('Fetch.fulfillRequest', {
                    requestId,
                    responseCode: 200,
                    responseHeaders: [
                      { name: 'status', value: '200' },
                      { name: 'date', value: 'Mon, 11 May 2020 02:32:18 GMT' },
                      { name: 'content-type', value: 'application/json' },
                      { name: 'content-length', value: '103' },
                      { name: 'vary', value: 'Origin' }
                    ],
                    body: Base64.encode(JSON.stringify(responseObj))
                  })
                  return
                }
              }
            } else if (url.startsWith(CHAINSFR_API)) {
              let postData = JSON.parse(request.postData)
              let toBeMatched = {
                platform: 'chainsfrApi',
                method: postData.action
              }

              this.incrementStat(postData.action, { total: 1, intercepted: 0 })
              if (!this.byPassMatchObj || !_.isMatch(toBeMatched, this.byPassMatchObj)) {
                if (this.cache[request.postData]) {
                  this.incrementStat(postData.action, { total: 0, intercepted: 1 })
                  await client.send('Fetch.fulfillRequest', {
                    ...this.cache[request.postData],
                    requestId
                  })
                  return
                }
              }
            } else {
              if (!url.startsWith(TEST_URL)) {
                if (this.cache[url]) {
                  this.incrementStat(url, { total: 1, intercepted: 1 })
                  await client.send('Fetch.fulfillRequest', { ...this.cache[url], requestId })
                  return
                } else {
                  this.incrementStat(url, { total: 1, intercepted: 0 })
                }
              }
            }
          }
          //see: https://chromedevtools.github.io/devtools-protocol/tot/Fetch#method-continueRequest
          await client.send('Fetch.continueRequest', {
            requestId
          })
        } catch (e) {
          // ignore target closed errors
          if (e.message.includes('Target closed')) return
          log.warn(`RequestInterceptor encounters error for request ${url}`, e)
        }
      }
    )
  }

  /*
    Bypass requests

    Examples:

    // chainsfrApi by pass by action type
    requestInterceptor.byPass({
      platform: 'chainsfrApi',
      method: 'GET_CRYPTO_ACCOUNTS'
    })

    requestInterceptor.byPass({
      platform: 'chainsfrApi',
      method: 'GET_TRANSFER'
    })

    requestInterceptor.byPass({
      platform: 'chainsfrApi',
      method: 'BATCH_GET'
    })

    // infura bypass
    requestInterceptor.byPass({
        platform: 'ethereum',
        method: 'eth_call',
        funcSig: 'allowance',
        // first address is owner
        // second address is spender
        addresses: [
          '0xd3ced3b16c8977ed0e345d162d982b899e978588',
          '0xdccf3b5910e936b7bfda447f10530713c2420c5d'
        ]
      })
    
    // btc bypass
    requestInterceptor.byPass({
        platform: 'bitcoin',
        method: 'txs',
        // optionally can add btc addresses here
        addresses: [...]
      })
  */
  byPass (matchObj: any) {
    this.byPassMatchObj = matchObj
  }

  showStats () {
    let overall = { total: 0, intercepted: 0, sent: 0 }
    let _stats = Object.entries(this.stats).map(
      ([key: string, value: { total: number, intercepted: number }]) => {
        // type casting to supress flow error
        let _value = (value: any)
        overall.total += _value.total
        overall.intercepted += _value.intercepted
        return {
          url: key,
          stat: {
            ...value,
            sent: _value.total - _value.intercepted
          }
        }
      }
    )
    _stats = _stats.sort((a, b) => b.stat.sent - a.stat.sent)
    log.info('Interception Stats (cumulative): ')
    for (let item of _stats) {
      log.info(chalk.yellow.bold(JSON.stringify(item.stat)) + ' ' + item.url)
    }
    overall.sent = overall.total - overall.intercepted
    log.info('Interception Overall: ', chalk.cyan.bold(JSON.stringify(overall)))
  }
}

export default RequestInterceptor
