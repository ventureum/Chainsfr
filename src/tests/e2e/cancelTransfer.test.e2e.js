import LoginPage from './pages/login.page'
import DisconnectPage from './pages/disconnect.page'
import EmailTransferFormPage from './pages/emailTransferForm.page'
import EmailTransferAuthPage from './pages/emailTransferAuth.page'
import LandingPage from './pages/landing.page'
import SendReviewPage from './pages/sendReview.page'
import ReceiptPage from './pages/receipt.page'
import CancelReviewPage from './pages/cancelReview.page'
import ReduxTracker from './utils/reduxTracker'
import { resetUserDefault } from './utils/reset'
import { getNewPopupPage, getTransfer, getTransferState } from './testUtils'
import BN from 'bn.js'

// 15 min
const timeout = 1000 * 60 * 15

describe('Cancel transfer tests', () => {
  const reduxTracker = new ReduxTracker()
  const emtPage = new EmailTransferFormPage()
  const emtReviewPage = new SendReviewPage()
  const emtAuthPage = new EmailTransferAuthPage()
  const receiptPage = new ReceiptPage()
  const landingPage = new LandingPage()
  const disconnectPage = new DisconnectPage()

  const FORM_BASE = {
    formPage: emtPage,
    recipient: 'chainsfre2etest@gmail.com',
    currencyAmount: '1',
    securityAnswer: '123456',
    sendMessage: 'donchdachdonchdach'
  }

  // pending transferIds by walletType, cryptoType
  var pendingReceive = {}
  // used for expanding row in transfer history
  var numPendingReceive = 0

  // pending transferIds by walletType, cryptoType
  var pendingCancel = {}

  beforeAll(async () => {
    await resetUserDefault()

    // setup interceptor
    await requestInterceptor.setRequestInterception(true)

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
    requestInterceptor.showStats()
    await jestPuppeteer.resetBrowser()
  })

  const sendTx = async (walletType, cryptoType) => {
    log.info(`Sending ${walletType}_${cryptoType}...`)

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
      emtAuthPage.connect(walletType, cryptoType)
    ])

    const { transferId } = await receiptPage.getReceiptFormInfo('transferId')

    pendingReceive[`${walletType}_${cryptoType}`] = { transferId, idx: numPendingReceive }
    numPendingReceive += 1

    // wait 2 seconds to avoid consecutive transfers having the
    // same sendTimestamp, which can cause some ordering issues
    // in transferHistory list
    await page.waitFor(2000)

    log.info(`Send ${walletType}_${cryptoType} finished`)
  }

  const cancel = async (walletType, cryptoType) => {
    log.info(`Cancelling ${walletType}_${cryptoType} transfer...`)

    const platformType = 'ethereum'
    let sendTxState = ''

    const { transferId, idx } = pendingReceive[`${walletType}_${cryptoType}`]
    log.info(`Transfer Id: ${transferId}`)
    requestInterceptor.byPass({
      platform: 'chainsfrApi',
      method: 'GET_TRANSFER'
    })
    
    while (true) {
      await page.waitFor(15000) // 15 seconds
      var transferData = await getTransfer({ transferId: transferId })
      sendTxState = getTransferState(transferData)
      if (sendTxState === 'SEND_CONFIRMED_RECEIVE_NOT_INITIATED') {
        var { receivingId } = transferData
        break
      }
      log.info('Waiting for send tx to be confirmed, current state: ', sendTxState)
    }
    log.info('Send tx confirmed', sendTxState)

    // back to home page
    requestInterceptor.byPass({
      platform: 'chainsfrApi',
      method: 'BATCH_GET'
    })
    await page.goto(process.env.E2E_TEST_URL, {
      waitUntil: 'networkidle0'
    })
    await landingPage.waitUntilTransferHistoryLoaded()

    const itemIdx = numPendingReceive - idx - 1
    await landingPage.expandTxHistoryItem(itemIdx)

    requestInterceptor.byPass({
      platform: 'chainsfrApi',
      method: 'GET_TRANSFER'
    })
    
    const cancelPageTab = await getNewPopupPage(browser, async () => {
      await landingPage.cancelTx(itemIdx)
    })

    const cancelReviewPage = new CancelReviewPage(cancelPageTab)
    await cancelReviewPage.waitUntilTransferLoaded()
    await cancelReviewPage.dispatchFormActions('review_cancel')
    await cancelReviewPage.dispatchFormActions('modal_cancel')

    // close the receipt page
    await cancelPageTab.close()

    pendingCancel[`${walletType}_${cryptoType}`] = { transferId }
    log.info(`Cancel ${walletType}_${cryptoType} finished`)
  }

  const confirmCancel = async (walletType, cryptoType) => {
    log.info(`Confirming cancellation ${walletType}_${cryptoType}...`)
    const { transferId } = pendingCancel[`${walletType}_${cryptoType}`]

    let canceltxState = ''
    while (true) {
      // wait until cancel tx is confirmed
      await page.waitFor(15000) // 15 seconds

      var transferData = await getTransfer({ transferId: transferId })

      canceltxState = getTransferState(transferData)
      if (canceltxState === 'SEND_CONFIRMED_CANCEL_CONFIRMED') break
      log.info('Waiting for cancel tx to be confirmed, current state: ', canceltxState)
    }

    log.info(`Cancel ${walletType}_${cryptoType} confirmed with txState ${canceltxState}`)
  }

  // make dai the first tests to reduce waiting time between different transfers
  // since the allowance approval takes one tx time unit
  it(
    'Send DAI from metamask',
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
      const platformType = 'ethereum'

      // reset metamask dai allowance
      await page.goto(`${process.env.E2E_TEST_URL}/disconnect`, { waitUntil: 'networkidle0' })

      // dai has decimals of 18
      const cryptoAmountBasicTokenUnit = new BN(10).pow(new BN(18)).toString()
      await disconnectPage.setAllowance(cryptoAmountBasicTokenUnit, 'metamask')
      log.info(`Set allowance Dai successfully`)

      await page.goto(`${process.env.E2E_TEST_URL}/send`, { waitUntil: 'networkidle0' })
      await emtPage.fillForm({
        ...FORM_BASE,
        walletType: 'metamask',
        platformType: platformType,
        cryptoType: 'dai'
      })

      await sendTx('metamask', 'dai')
      requestInterceptor.byPass(null)
    },
    timeout
  )

  it(
    'Send ETH from metamask',
    async () => {
      const platformType = 'ethereum'
      await page.goto(`${process.env.E2E_TEST_URL}/send`, { waitUntil: 'networkidle0' })
      await emtPage.fillForm({
        ...FORM_BASE,
        walletType: 'metamask',
        platformType: platformType,
        cryptoType: 'ethereum'
      })

      await sendTx('metamask', 'ethereum')
    },
    timeout
  )

  it(
    'Send ETH from drive wallet',
    async () => {
      const platformType = 'ethereum'
      await page.goto(`${process.env.E2E_TEST_URL}/send`, { waitUntil: 'networkidle0' })
      await emtPage.fillForm({
        ...FORM_BASE,
        walletType: 'drive',
        platformType: platformType,
        cryptoType: 'ethereum'
      })

      await sendTx('drive', 'ethereum')
    },
    timeout
  )

  it(
    'Send DAI from drive wallet',
    async () => {
      requestInterceptor.byPass({
        platform: 'ethereum',
        method: 'eth_call',
        funcSig: 'allowance',
        addresses: [
          '0x259ec51efaa03c33787752e5a99becbf7f8526c4',
          '0xdccf3b5910e936b7bfda447f10530713c2420c5d'
        ]
      })
      const platformType = 'ethereum'

      // reset drive dai allowance
      await page.goto(`${process.env.E2E_TEST_URL}/disconnect`, { waitUntil: 'networkidle0' })

      // dai has decimals of 18
      const cryptoAmountBasicTokenUnit = new BN(10).pow(new BN(18)).toString()
      await disconnectPage.setAllowance(cryptoAmountBasicTokenUnit, 'drive')
      log.info(`Set allowance Dai successfully`)

      await page.goto(`${process.env.E2E_TEST_URL}/send`, { waitUntil: 'networkidle0' })
      await emtPage.fillForm({
        ...FORM_BASE,
        walletType: 'drive',
        platformType: platformType,
        cryptoType: 'dai'
      })

      await sendTx('drive', 'dai')
      requestInterceptor.byPass(null)
    },
    timeout
  )

  it(
    'Cancel ETH drive transfer',
    async () => {
      await cancel('drive', 'ethereum')
    },
    timeout
  )

  it(
    'Cancel DAI drive transfer',
    async () => {
      await cancel('drive', 'dai')
    },
    timeout
  )

  it(
    'Cancel DAI metamask transfer',
    async () => {
      await cancel('metamask', 'dai')
    },
    timeout
  )

  it(
    'Cancel ETH metamask transfer',
    async () => {
      await cancel('metamask', 'ethereum')
    },
    timeout
  )

  it('Confirm DAI metamask cancellation', async () => {
    await confirmCancel('metamask', 'dai')
  })

  it('Confirm ETH metamask cancellation', async () => {
    await confirmCancel('metamask', 'ethereum')
  })

  it('Confirm DAI drive cancellation', async () => {
    await confirmCancel('drive', 'dai')
  })
  it('Confirm ETH drive cancellation', async () => {
    await confirmCancel('drive', 'ethereum')
  })
})
