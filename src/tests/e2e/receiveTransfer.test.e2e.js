import LoginPage from './pages/login.page'
import DisconnectPage from './pages/disconnect.page'
import EmailTransferFormPage from './pages/emailTransferForm.page'
import EmailTransferAuthPage from './pages/emailTransferAuth.page'
import SendReviewPage from './pages/sendReview.page'
import ReceiptPage from './pages/receipt.page'
import ReceiveFormPage from './pages/receiveFormPage'
import ReduxTracker from './utils/reduxTracker'
import { resetUserDefault } from './utils/reset'
import { getTransfer, getTransferState } from './testUtils'
import log from 'loglevel'
import BN from 'bn.js'
log.setDefaultLevel('info')

// 10 min
const timeout = 1000 * 60 * 10

describe('Receive transfer tests', () => {
  const reduxTracker = new ReduxTracker()
  const emtPage = new EmailTransferFormPage()
  const emtReviewPage = new SendReviewPage()
  const emtAuthPage = new EmailTransferAuthPage()
  const receiptPage = new ReceiptPage()
  const receiveFormPage = new ReceiveFormPage()
  const disconnectPage = new DisconnectPage()

  const FORM_BASE = {
    formPage: emtPage,
    recipient: 'chainsfre2etest@gmail.com',
    currencyAmount: '1',
    securityAnswer: '123456',
    sendMessage: 'donchdachdonchdach'
  }

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

    // reset metamask dai allowance
    await page.goto(`${process.env.E2E_TEST_URL}/disconnect`)

    // dai has decimals of 18
    const cryptoAmountBasicTokenUnit = new BN(10).pow(new BN(18)).toString()

    await disconnectPage.setAllowanceWithMetamask(cryptoAmountBasicTokenUnit)

    log.info(`Set allowance Dai successfully`)
  }, timeout)

  afterAll(async () => {
    await jestPuppeteer.resetBrowser()
  })

  const sendTx = async (walletType, cryptoType) => {
    // go to review page
    await emtPage.dispatchFormActions('continue')
    // go to auth page
    await emtReviewPage.dispatchFormActions('continue')

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
  }

  it(
    'Receive Ether tx',
    async () => {
      const depositWalletType = 'metamask'
      const platformType = 'ethereum'
      await Promise.all([
        page.waitForNavigation({
          waitUntil: 'networkidle0'
        }),
        page.goto(`${process.env.E2E_TEST_URL}/send`)
      ])

      await emtPage.fillForm({
        ...FORM_BASE,
        walletType: 'metamask',
        platformType: platformType,
        cryptoType: 'ethereum'
      })

      await sendTx('metamask', 'ethereum')
      let sendTxState = ''
      while (true) {
        await page.waitFor(15000) // 15 seconds
        const { transferId } = await receiptPage.getReceiptFormInfo('transferId')
        const transferData = await getTransfer({ transferId: transferId })
        sendTxState = getTransferState(transferData)
        if (sendTxState === 'SEND_CONFIRMED_RECEIVE_NOT_INITIATED') {
          var { receivingId } = transferData
          break
        }
        log.info('Waiting for send tx to be confirmed, current state: ', sendTxState)
      }
      log.info('Send tx confirmed', sendTxState)
      log.info('Tx receiving id: ', receivingId)
      // back to home page
      await Promise.all([
        page.waitForNavigation(),
        page.goto(`${process.env.E2E_TEST_URL}/receive?id=${receivingId}`)
      ])

      await receiveFormPage.waitUntilTransferLoaded()

      //
      await receiveFormPage.enterSecurityAnswer('123456')

      await Promise.all([
        reduxTracker.waitFor(
          [
            {
              action: {
                type: 'VERIFY_ESCROW_ACCOUNT_PASSWORD_FULFILLED'
              }
            },
            {
              action: {
                type: 'GET_TX_COST_FULFILLED'
              }
            },
            {
              action: {
                type: 'SYNC_WITH_NETWORK_FULFILLED'
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
        receiveFormPage.dispatchFormActions('validate')
      ])

      await receiveFormPage.selectAccount(depositWalletType, platformType)
      await Promise.all([
        reduxTracker.waitFor(
          [
            {
              action: {
                type: 'ACCEPT_TRANSFER_FULFILLED'
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
        receiveFormPage.dispatchFormActions('deposit')
      ])

      let receivetxState
      while (true) {
        // wait until receive tx is confirmed
        await page.waitFor(15000) // 15 seconds
        const { transferId } = await receiptPage.getReceiptFormInfo('transferId')

        const transferData = await getTransfer({ receivingId: transferId })
        receivetxState = getTransferState(transferData)
        if (receivetxState === 'SEND_CONFIRMED_RECEIVE_CONFIRMED') break
        log.info('Waiting for receive tx to be confirmed, current state: ', receivetxState)
      }
      log.info('Receive tx confirmed', receivetxState)
    },
    timeout
  )

  it(
    'Receive Dai tx',
    async () => {
      const depositWalletType = 'metamask'
      const platformType = 'ethereum'
      await Promise.all([
        page.waitForNavigation({
          waitUntil: 'networkidle0'
        }),
        page.goto(`${process.env.E2E_TEST_URL}/send`)
      ])

      await emtPage.fillForm({
        ...FORM_BASE,
        walletType: 'metamask',
        platformType: platformType,
        cryptoType: 'dai'
      })

      await sendTx('metamask', 'dai')
      let sendTxState = ''
      while (true) {
        await page.waitFor(15000) // 15 seconds
        const { transferId } = await receiptPage.getReceiptFormInfo('transferId')
        const transferData = await getTransfer({ transferId: transferId })
        sendTxState = getTransferState(transferData)
        if (sendTxState === 'SEND_CONFIRMED_RECEIVE_NOT_INITIATED') {
          var { receivingId } = transferData
          break
        }
        log.info('Waiting for send tx to be confirmed, current state: ', sendTxState)
      }
      log.info('Send tx confirmed', sendTxState)
      log.info('Tx receiving id: ', receivingId)
      // back to home page
      await Promise.all([
        page.waitForNavigation(),
        page.goto(`${process.env.E2E_TEST_URL}/receive?id=${receivingId}`)
      ])

      await receiveFormPage.waitUntilTransferLoaded()
      await receiveFormPage.enterSecurityAnswer('123456')

      await Promise.all([
        reduxTracker.waitFor(
          [
            {
              action: {
                type: 'VERIFY_ESCROW_ACCOUNT_PASSWORD_FULFILLED'
              }
            },
            {
              action: {
                type: 'GET_TX_COST_FULFILLED'
              }
            },
            {
              action: {
                type: 'SYNC_WITH_NETWORK_FULFILLED'
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
        receiveFormPage.dispatchFormActions('validate')
      ])

      await receiveFormPage.selectAccount(depositWalletType, platformType)
      await Promise.all([
        reduxTracker.waitFor(
          [
            {
              action: {
                type: 'ACCEPT_TRANSFER_FULFILLED'
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
        receiveFormPage.dispatchFormActions('deposit')
      ])

      let receivetxState
      while (true) {
        // wait until receive tx is confirmed
        await page.waitFor(15000) // 15 seconds
        const { transferId } = await receiptPage.getReceiptFormInfo('transferId')

        const transferData = await getTransfer({ receivingId: transferId })
        receivetxState = getTransferState(transferData)
        if (receivetxState === 'SEND_CONFIRMED_RECEIVE_CONFIRMED') break
        log.info('Waiting for receive tx to be confirmed, current state: ', receivetxState)
      }
      log.info('Receive tx confirmed', receivetxState)
    },
    timeout
  )
})
