import LoginPage from './pages/login.page'
import EmailTransferFormPage from './pages/emailTransferForm.page'
import EmailTransferAuthPage from './pages/emailTransferAuth.page'
import LandingPage from './pages/landing.page'
import SendReviewPage from './pages/sendReview.page'
import ReceiptPage from './pages/receipt.page'
import CancelReviewPage from './pages/cancelReview.page'
import log from 'loglevel'
import ReduxTracker from './utils/reduxTracker'
import { resetUserDefault } from './utils/reset'
import { getNewPopupPage, getTransfer, getTransferState } from './testUtils'

log.setDefaultLevel('info')

// 10 min
const timeout = 1000 * 60 * 10

describe('Cancel transfer tests', () => {
  const reduxTracker = new ReduxTracker()
  const emtPage = new EmailTransferFormPage()
  const emtReviewPage = new SendReviewPage()
  const emtAuthPage = new EmailTransferAuthPage()
  const receiptPage = new ReceiptPage()
  const landingPage = new LandingPage()

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
  }, timeout)

  afterAll(async () => {
    await jestPuppeteer.resetBrowser()
  })

  const sendTx = async () => {
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
    'Cancel Ether tx',
    async () => {
      await Promise.all([
        page.waitForNavigation({
          waitUntil: 'networkidle0'
        }),
        page.goto(`${process.env.E2E_TEST_URL}/send`)
      ])

      await emtPage.fillForm({
        ...FORM_BASE,
        walletType: 'metamask',
        platformType: 'ethereum',
        cryptoType: 'ethereum'
      })

      await sendTx()
      let sendTxState = ''
      while (true) {
        await page.waitFor(15000) // 15 seconds
        const { transferId } = await receiptPage.getReceiptFormInfo('transferId')
        const transferData = await getTransfer({ transferId: transferId })
        sendTxState = getTransferState(transferData)
        if (sendTxState === 'SEND_CONFIRMED_RECEIVE_NOT_INITIATED') break
        log.info('Waiting for send tx to be confirmed, current state: ', sendTxState)
      }
      log.info('Send tx confirmed', sendTxState)

      // back to home page
      await Promise.all([
        page.waitForNavigation({
          waitUntil: 'networkidle0'
        }),
        page.goto(process.env.E2E_TEST_URL)
      ])
      await landingPage.waitUntilTransferHistoryLoaded()
      await landingPage.expandTxHistoryItem(0)

      const cancelPageTab = await getNewPopupPage(browser, async () => {
        await landingPage.cancelTx(0)
      })

      const cancelReviewPage = new CancelReviewPage(cancelPageTab)
      await cancelReviewPage.waitUntilTransferLoaded()
      await cancelReviewPage.dispatchFormActions('review_cancel')
      await cancelReviewPage.dispatchFormActions('modal_cancel')

      const cancelReceiptPage = new ReceiptPage(cancelPageTab)
      await cancelReceiptPage.waitUntilReceiptLoaded()

      let canceltxState = ''
      while (true) {
        // wait until cancel tx is confirmed
        await page.waitFor(15000) // 15 seconds
        const { transferId } = await cancelReceiptPage.getReceiptFormInfo('transferId')
        const transferData = await getTransfer({ transferId: transferId })
        canceltxState = getTransferState(transferData)
        if (canceltxState === 'SEND_CONFIRMED_CANCEL_CONFIRMED') break
        log.info('Waiting for cancel tx to be confirmed, current state: ', canceltxState)
      }
      log.info('Cancel tx confirmed', canceltxState)
    },
    timeout
  )
})
