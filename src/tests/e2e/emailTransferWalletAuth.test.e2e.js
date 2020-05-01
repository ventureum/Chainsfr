import LoginPage from './pages/login.page'
import EmailTransferFormPage from './pages/emailTransferForm.page'
import EmailTransferReviewPage from './pages/sendReview.page'
import EmailTransferAuthPage from './pages/emailTransferAuth.page'
import ReceiptPage from './pages/receipt.page'
import DisconnectPage from './pages/disconnect.page'
import ReduxTracker from './utils/reduxTracker'
import { resetUserDefault } from './utils/reset'
import url from '../../url'
import { DATA, WALLET_FOLDER_NAME, WALLET_FILE_NAME } from './mocks/drive.js'
import log from 'loglevel'
import BN from 'bn.js'
import pWaitFor from 'p-wait-for'
import Web3 from 'web3'

log.setDefaultLevel('info')

// 3 min
const timeout = 180000

describe('Transfer Auth Tests', () => {
  let loginPage
  const reduxTracker = new ReduxTracker()
  const emtPage = new EmailTransferFormPage()
  const emtReviewPage = new EmailTransferReviewPage()
  const emtAuthPage = new EmailTransferAuthPage()
  const receiptPage = new ReceiptPage()
  const disconnectPage = new DisconnectPage()
  const web3 = new Web3(new Web3.providers.HttpProvider(url.INFURA_API_URL))

  const FORM_BASE = {
    formPage: emtPage,
    recipient: 'chainsfre2etest@gmail.com',
    currencyAmount: '1',
    securityAnswer: '123456',
    sendMessage: 'Send Message'
  }

  const NETWORK_ID = 4

  beforeAll(async () => {
    await resetUserDefault()
    await page.goto(`${process.env.E2E_TEST_URL}`)
    // login to app
    const loginPage = new LoginPage()
    await loginPage.login(
      process.env.E2E_TEST_GOOGLE_LOGIN_USERNAME,
      process.env.E2E_TEST_GOOGLE_LOGIN_PASSWORD,
      true
    )
  }, timeout)

  afterAll(async () => {
    await jestPuppeteer.resetBrowser()
  })

  const gotoAuthPage = async () => {
    // go to review page
    await emtPage.dispatchFormActions('continue')

    // go to auth page
    await emtReviewPage.dispatchFormActions('continue')
  }

  // more logs to debug
  beforeEach(() => console.log(`Starting test: [${jasmine['currentTest'].fullName}]`));
  afterEach(() => console.log(`Finished test: [${jasmine['currentTest'].fullName}]`));

  const waitForTxConfirmation = async () => {
    // due to us manually setting allowance using web3, as well as reseting the browser storage,
    // the pending txs are not tracked properly in txController which causes incorrecet nonce
    // errors
    //
    // we wait for all txs in each test to be mined before procedding to the next test
    const { sendOnExplorerLink } = await receiptPage.getReceiptFormInfo('sendOn')
    const txHash = sendOnExplorerLink
      .split('/')
      .slice(-1)
      .pop()

    log.info('Waiting for the pending tx to be mined...')
    await pWaitFor(
      async () => {
        const receipt = await web3.eth.getTransactionReceipt(txHash)
        return !!receipt
      },
      {
        interval: 1000
      }
    )
    log.info('Tx mined.')
  }

  test(
    'Send ETH from drive wallet',
    async () => {
      await page.goto(`${process.env.E2E_TEST_URL}/send`, { waitUntil: 'networkidle0' })

      await emtPage.fillForm({
        ...FORM_BASE,
        walletType: 'drive',
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
                type: 'SUBMIT_TX_FULFILLED'
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
        emtAuthPage.connect()
      ])

      await waitForTxConfirmation()
    },
    timeout
  )

  test(
    'Send DAI from drive wallet (insufficient allowance)',
    async () => {
      // reset metamask dai allowance
      await page.goto(`${process.env.E2E_TEST_URL}/disconnect`, { waitUntil: 'networkidle0' })

      await disconnectPage.setAllowance('0', 'drive')
      log.info(`Reset allowance to 0 successfully`)

      // go back to transfer form
      await page.goto(`${process.env.E2E_TEST_URL}/send`, { waitUntil: 'networkidle0' })

      const CRYPTO_AMOUNT = '1'
      await emtPage.fillForm({
        ...FORM_BASE,
        cryptoAmount: CRYPTO_AMOUNT,
        currencyAmount: null,
        walletType: 'drive',
        platformType: 'ethereum',
        cryptoType: 'dai'
      })

      await gotoAuthPage()

      await expect(page).toMatch('Insufficient transaction limit to complete the transaction.')
      const allowance = await emtAuthPage.getAllowance()

      // allowance should match transfer crypto amount exactly
      expect(allowance).toBe(CRYPTO_AMOUNT)

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
                type: 'SET_TOKEN_ALLOWANCE_FULFILLED'
              }
            },
            {
              action: {
                type: 'SET_TOKEN_ALLOWANCE_WAIT_FOR_CONFIRMATION_FULFILLED'
              }
            },
            {
              action: {
                type: 'SUBMIT_TX_FULFILLED'
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
        emtAuthPage.connect()
      ])

      await waitForTxConfirmation()
    },
    timeout
  )

  test(
    'Send DAI from drive wallet (sufficient allowance)',
    async () => {
      const CRYPTO_AMOUNT = '1'

      // reset metamask dai allowance
      await page.goto(`${process.env.E2E_TEST_URL}/disconnect`, { waitUntil: 'networkidle0' })

      // dai has decimals of 18
      const cryptoAmountBasicTokenUnit = new BN(10).pow(new BN(18)).toString()

      await disconnectPage.setAllowance(cryptoAmountBasicTokenUnit, 'drive')

      log.info(`Reset allowance to ${CRYPTO_AMOUNT} successfully`)

      // go back to transfer form
      await page.goto(`${process.env.E2E_TEST_URL}/send`, { waitUntil: 'networkidle0' })

      await emtPage.fillForm({
        ...FORM_BASE,
        cryptoAmount: CRYPTO_AMOUNT,
        currencyAmount: null,
        walletType: 'drive',
        platformType: 'ethereum',
        cryptoType: 'dai'
      })

      await gotoAuthPage()

      await expect(page).toMatch(`Your remaining DAI transaction limit is ${CRYPTO_AMOUNT}`, {
        timeout: 5000
      })

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
                type: 'SUBMIT_TX_FULFILLED'
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
        emtAuthPage.connect()
      ])

      await waitForTxConfirmation()
    },
    timeout
  )

  test(
    'Send BTC from drive wallet',
    async () => {
      await page.goto(`${process.env.E2E_TEST_URL}/send`, { waitUntil: 'networkidle0' })

      const CRYPTO_AMOUNT = '0.001'
      await emtPage.fillForm({
        ...FORM_BASE,
        cryptoAmount: CRYPTO_AMOUNT,
        walletType: 'drive',
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
                type: 'SUBMIT_TX_FULFILLED'
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
        emtAuthPage.connect()
      ])
    },
    timeout
  )

  test(
    'Send ETH from metamask extension',
    async () => {
      await page.goto(`${process.env.E2E_TEST_URL}/send`, { waitUntil: 'networkidle0' })

      await emtPage.fillForm({
        ...FORM_BASE,
        walletType: 'metamask',
        platformType: 'ethereum',
        cryptoType: 'ethereum'
      })

      await gotoAuthPage()

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
                type: 'SUBMIT_TX_FULFILLED'
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
        emtAuthPage.connect('metamask', 'ethereum')
      ])
      await waitForTxConfirmation()
    },
    timeout
  )

  test(
    'Send DAI from metamask wallet (insufficient allowance)',
    async () => {
      // reset metamask dai allowance
      await page.goto(`${process.env.E2E_TEST_URL}/disconnect`, { waitUntil: 'networkidle0' })

      await disconnectPage.setAllowance('0', 'metamask')
      log.info(`Reset allowance to 0 successfully`)

      // go back to transfer form
      await page.goto(`${process.env.E2E_TEST_URL}/send`, { waitUntil: 'networkidle0' })

      const CRYPTO_AMOUNT = '1'
      await emtPage.fillForm({
        ...FORM_BASE,
        cryptoAmount: CRYPTO_AMOUNT,
        currencyAmount: null,
        walletType: 'metamask',
        platformType: 'ethereum',
        cryptoType: 'dai'
      })

      await gotoAuthPage()

      await expect(page).toMatch('Insufficient transaction limit to complete the transaction.', {
        timeout: 10000
      })
      const allowance = await emtAuthPage.getAllowance()

      // allowance should match transfer crypto amount exactly
      expect(allowance).toBe(CRYPTO_AMOUNT)

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
                type: 'SET_TOKEN_ALLOWANCE_FULFILLED'
              }
            },
            {
              action: {
                type: 'SET_TOKEN_ALLOWANCE_WAIT_FOR_CONFIRMATION_FULFILLED'
              }
            },
            {
              action: {
                type: 'SUBMIT_TX_FULFILLED'
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
        emtAuthPage.connect('metamask', 'dai', true)
      ])
      await waitForTxConfirmation()
    },
    timeout
  )

  test(
    'Send DAI from metamask wallet (sufficient allowance)',
    async () => {
      const CRYPTO_AMOUNT = '1'

      // reset metamask dai allowance
      await page.goto(`${process.env.E2E_TEST_URL}/disconnect`, { waitUntil: 'networkidle0' })

      // dai has decimals of 18
      const cryptoAmountBasicTokenUnit = new BN(10).pow(new BN(18)).toString()

      await disconnectPage.setAllowance(cryptoAmountBasicTokenUnit, 'metamask')

      log.info(`Reset allowance to ${CRYPTO_AMOUNT} successfully`)

      // go back to transfer form
      await page.goto(`${process.env.E2E_TEST_URL}/send`, { waitUntil: 'networkidle0' })

      await emtPage.fillForm({
        ...FORM_BASE,
        cryptoAmount: CRYPTO_AMOUNT,
        currencyAmount: null,
        walletType: 'metamask',
        platformType: 'ethereum',
        cryptoType: 'dai'
      })

      await gotoAuthPage()

      await expect(page).toMatch(`Your remaining DAI transaction limit is ${CRYPTO_AMOUNT}.`, {
        timeout: 5000
      })

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
                type: 'SUBMIT_TX_FULFILLED'
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
        emtAuthPage.connect('metamask', 'dai', false)
      ])
      await waitForTxConfirmation()
    },
    timeout
  )
})
