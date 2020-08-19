import LoginPage from './pages/login.page'
import DirectTransferFormPage from './pages/directTransferForm.page'
import DirectTransferReviewPage from './pages/directTransferReview.page'
import DirectTransferAuthPage from './pages/directTransferAuth.page'
import ReceiptPage from './pages/receipt.page'
import ReduxTracker from './utils/reduxTracker'
import { resetUserDefault } from './utils/reset'
import { INFURA_API_URL } from './config'
import Web3 from 'web3'
import pWaitFor from 'p-wait-for'
import log from 'loglevel'
import { getTransfer, getTransferState } from './testUtils'

log.setDefaultLevel('info')

// 3 min
const timeout = 180000
const reduxTracker = new ReduxTracker()

describe('Direct Transfer Auth Tests', () => {
  let loginPage

  let dtPage
  let dtReviewPage
  let dtAuthPage
  const web3 = new Web3(new Web3.providers.HttpProvider(INFURA_API_URL))
  let pendingTxTransferId = []
  var pendingTxHashList = []

  const FORM_BASE = {
    currencyAmount: '1',
    sendMessage: 'Send Message'
  }

  const NETWORK_ID = 4

  const appendTxHash = async () => {
    const receiptPage = new ReceiptPage()
    const { sendOnExplorerLink } = await receiptPage.getReceiptFormInfo('sendOn')
    const { transferId } = await receiptPage.getReceiptFormInfo('transferId')
    const txHash = sendOnExplorerLink
      .split('/')
      .slice(-1)
      .pop()
    pendingTxHashList.push(txHash)
    pendingTxTransferId.push(transferId)
  }

  beforeAll(async () => {
    await resetUserDefault()

    await requestInterceptor.setRequestInterception(true)

    dtPage = new DirectTransferFormPage()
    dtReviewPage = new DirectTransferReviewPage()
    dtAuthPage = new DirectTransferAuthPage()

    await page.goto(`${process.env.E2E_TEST_URL}`)
    // login to app
    const loginPage = new LoginPage()
    await loginPage.login(
      process.env.E2E_TEST_GOOGLE_LOGIN_USERNAME,
      process.env.E2E_TEST_GOOGLE_LOGIN_PASSWORD,
      true
    )
  }, timeout)

  beforeEach(async () => {
    if (
      ['Send BTC from drive wallet to ledger wallet'].includes(jasmine['currentTest'].description)
    ) {
      requestInterceptor.byPass({
        platform: 'bitcoin',
        method: 'txs'
      })
    } else {
      requestInterceptor.byPass(null)
    }

    await jestPuppeteer.resetPage()
    await page.goto(`${process.env.E2E_TEST_URL}/directTransfer`, {
      waitUntil: 'networkidle0'
    })
  })

  afterAll(async () => {
    // wait till all txs are either confirmed or failed
    log.info('Wait till all pending txs are mined...')
    await pWaitFor(
      async () => {
        let _remainingPendingTxs = []
        for (let txHash of pendingTxHashList) {
          const receipt = await web3.eth.getTransactionReceipt(txHash)
          if (!txHash) {
            // receipt not available implies pending status
            _remainingPendingTxs.push(txHash)
          }
        }
        pendingTxHashList = _remainingPendingTxs
        if (pendingTxHashList.length > 0) {
          log.info(`${pendingTxHashList.length} pending txs waiting to be mined...`)
        } else {
          log.info('All pending txs mined.')
        }
        return pendingTxHashList.length === 0
      },
      {
        interval: 1000
      }
    )

    requestInterceptor.showStats()
    await jestPuppeteer.resetBrowser()
  })

  const gotoAuthPage = async () => {
    // go to review page
    await dtPage.dispatchFormActions('continue')

    // go to auth page
    await dtReviewPage.dispatchFormActions('continue')
  }

  const waitForBackendConfirmation = async transferId => {
    await pWaitFor(
      async () => {
        const transferData = await getTransfer({ transferId: transferId })
        let sendTxState = getTransferState(transferData)
        log.info(
          `Waiting for send tx ${transferId} to be confirmed, current state: ${sendTxState}`
        )
        return sendTxState === 'SEND_DIRECT_TRANSFER_CONFIRMED'
      },
      {
        interval: 30000
      }
    )
  }

  test(
    'Send DAI from metamask wallet to drive wallet',
    async () => {
      requestInterceptor.byPass({
        platform: 'ethereum',
        method: 'eth_call',
        funcSig: 'allowance',
        addresses: [
          '0xd3ced3b16c8977ed0e345d162d982b899e978588',
          '0xdccf3b5910e936b7bfda447f10530713c2420c5d'
        ]
      })

      const CRYPTO_AMOUNT = '1'

      await dtPage.dispatchFormActions('transferIn')

      await dtPage.fillForm({
        ...FORM_BASE,
        cryptoAmount: CRYPTO_AMOUNT,
        currencyAmount: null,
        walletType: 'metamask',
        platformType: 'ethereum',
        cryptoType: 'dai'
      })

      await gotoAuthPage()

      // click connect
      await Promise.all([
        reduxTracker.waitFor(
          [
            {
              action: {
                type: 'CHECK_WALLET_CONNECTION_FULFILLED'
              }
            },
            {
              action: {
                type: 'VERIFY_ACCOUNT_FULFILLED'
              }
            },
            {
              action: {
                type: 'DIRECT_TRANSFER_FULFILLED'
              }
            },
            {
              action: {
                type: 'GET_TRANSFER_FULFILLED'
              }
            }
          ],
          [
            // should not have any errors
            {
              action: {
                type: 'ENQUEUE_SNACKBAR',
                notification: {
                  options: {
                    variant: 'error'
                  }
                }
              }
            }
          ]
        ),
        dtAuthPage.connect('metamask', 'dai')
      ])

      await appendTxHash()
    },
    timeout
  )

  test(
    'Send ETH from drive wallet to metamask wallet',
    async () => {
      await dtPage.fillForm({
        ...FORM_BASE,
        walletType: 'metamask',
        platformType: 'ethereum',
        cryptoType: 'ethereum'
      })

      await gotoAuthPage()

      // click connect
      await Promise.all([
        reduxTracker.waitFor(
          [
            {
              action: {
                type: 'CHECK_WALLET_CONNECTION_FULFILLED'
              }
            },
            {
              action: {
                type: 'VERIFY_ACCOUNT_FULFILLED'
              }
            },
            {
              action: {
                type: 'DIRECT_TRANSFER_FULFILLED'
              }
            },
            {
              action: {
                type: 'GET_TRANSFER_FULFILLED'
              }
            }
          ],
          [
            // should not have any errors
            {
              action: {
                type: 'ENQUEUE_SNACKBAR',
                notification: {
                  options: {
                    variant: 'error'
                  }
                }
              }
            }
          ]
        ),
        dtAuthPage.connect()
      ])

      await appendTxHash()
    },
    timeout
  )

  test(
    'Send DAI from drive wallet to metamask wallet',
    async () => {
      requestInterceptor.byPass({
        platform: 'ethereum',
        method: 'eth_call',
        funcSig: 'allowance',
        addresses: [
          '0x259EC51eFaA03c33787752E5a99BeCBF7F8526c4',
          '0xdccf3b5910e936b7bfda447f10530713c2420c5d'
        ]
      })

      const CRYPTO_AMOUNT = '1'
      await dtPage.fillForm({
        ...FORM_BASE,
        cryptoAmount: CRYPTO_AMOUNT,
        currencyAmount: null,
        walletType: 'metamask',
        platformType: 'ethereum',
        cryptoType: 'dai'
      })

      await gotoAuthPage()

      // click connect
      await Promise.all([
        reduxTracker.waitFor(
          [
            {
              action: {
                type: 'CHECK_WALLET_CONNECTION_FULFILLED'
              }
            },
            {
              action: {
                type: 'VERIFY_ACCOUNT_FULFILLED'
              }
            },
            {
              action: {
                type: 'DIRECT_TRANSFER_FULFILLED'
              }
            },
            {
              action: {
                type: 'GET_TRANSFER_FULFILLED'
              }
            }
          ],
          [
            // should not have any errors
            {
              action: {
                type: 'ENQUEUE_SNACKBAR',
                notification: {
                  options: {
                    variant: 'error'
                  }
                }
              }
            }
          ]
        ),
        dtAuthPage.connect()
      ])

      await appendTxHash()
    },
    timeout
  )

  test(
    'Send BTC from drive wallet to ledger wallet',
    async () => {
      const CRYPTO_AMOUNT = '0.001'
      await dtPage.fillForm({
        ...FORM_BASE,
        cryptoAmount: CRYPTO_AMOUNT,
        walletType: 'ledger',
        platformType: 'bitcoin',
        cryptoType: 'bitcoin'
      })

      await gotoAuthPage()

      // click connect
      await Promise.all([
        reduxTracker.waitFor(
          [
            {
              action: {
                type: 'CHECK_WALLET_CONNECTION_FULFILLED'
              }
            },
            {
              action: {
                type: 'VERIFY_ACCOUNT_FULFILLED'
              }
            },
            {
              action: {
                type: 'DIRECT_TRANSFER_FULFILLED'
              }
            },
            {
              action: {
                type: 'GET_TRANSFER_FULFILLED'
              }
            }
          ],
          [
            // should not have any errors
            {
              action: {
                type: 'ENQUEUE_SNACKBAR',
                notification: {
                  options: {
                    variant: 'error'
                  }
                }
              }
            }
          ]
        ),
        dtAuthPage.connect()
      ])
    },
    timeout
  )

  test(
    'Send ETH from drive wallet to metamask wallet',
    async () => {
      await dtPage.dispatchFormActions('transferIn')

      await dtPage.fillForm({
        ...FORM_BASE,
        walletType: 'metamask',
        platformType: 'ethereum',
        cryptoType: 'ethereum'
      })

      await gotoAuthPage()

      // click connect
      await Promise.all([
        reduxTracker.waitFor(
          [
            {
              action: {
                type: 'CHECK_WALLET_CONNECTION_FULFILLED'
              }
            },
            {
              action: {
                type: 'VERIFY_ACCOUNT_FULFILLED'
              }
            },
            {
              action: {
                type: 'DIRECT_TRANSFER_FULFILLED'
              }
            },
            {
              action: {
                type: 'GET_TRANSFER_FULFILLED'
              }
            }
          ],
          [
            // should not have any errors
            {
              action: {
                type: 'ENQUEUE_SNACKBAR',
                notification: {
                  options: {
                    variant: 'error'
                  }
                }
              }
            }
          ]
        ),
        dtAuthPage.connect('metamask', 'ethereum')
      ])

      await appendTxHash()
    },
    timeout
  )

  test(
    'Check backend tx confirmation',
    async () => {
      await Promise.all(
        pendingTxTransferId.map(transferId => {
          return waitForBackendConfirmation(transferId)
        })
      )
    },
    1000 * 60 * 10
  )
})
