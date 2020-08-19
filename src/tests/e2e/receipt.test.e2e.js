import LoginPage from './pages/login.page'
import ReceiptPage from './pages/receipt.page'
import { resetUserDefault } from './utils/reset.js'
import ReduxTracker from './utils/reduxTracker'
import { TRANSFER_ID_LIST, RECEIVING_ID_LIST } from './mocks/ids'
import { DEFAULT_TRANSFER_DATA, DEFAULT_TRANSFER_DATA_CONFIG } from './mocks/transfers'
import { getElementTextContent, getNewPopupPage, getCryptoSymbol } from './testUtils'
import { Base64 } from 'js-base64'
import moment from 'moment'

const timeout = 180000
const reduxTracker = new ReduxTracker()
const { transferDataList, driveTransferHistory } = DEFAULT_TRANSFER_DATA

let testedTransferList = []
testedTransferList = transferDataList.map((transfer, i) => {
  return {
    ...transfer,
    state: DEFAULT_TRANSFER_DATA_CONFIG[i].state,
    password: driveTransferHistory[transfer.transferId].password
  }
})
let senderTestParam = testedTransferList.map((transfer, i) => {
  return [transfer.transferId, transfer.state, transfer]
})
let receiverTestParam = testedTransferList.map((transfer, i) => {
  return [transfer.receivingId, transfer.state, transfer]
})

describe('Receipt login test', () => {
  beforeAll(async () => {
    await resetUserDefault()

    // setup interceptor
    await requestInterceptor.setRequestInterception(true)
  }, timeout)

  afterAll(async () => {
    requestInterceptor.showStats()
  })

  afterEach(async () => {
    await jestPuppeteer.resetBrowser()
  })

  it('Receipt login test with transfer id', async () => {
    const loginPage = new LoginPage()
    const transferId = testedTransferList[0].transferId

    await page.goto(`${process.env.E2E_TEST_URL}/receipt?transferId=${transferId}`, {
      waitUntil: 'networkidle0'
    })
    await loginPage.receiptLogin(
      process.env.E2E_TEST_GOOGLE_LOGIN_USERNAME,
      process.env.E2E_TEST_GOOGLE_LOGIN_PASSWORD,
      `${process.env.E2E_TEST_URL}/receipt?transferId=${transferId}`,
      true
    )
  })

  it('Receipt login test with receiving id', async () => {
    const loginPage = new LoginPage()
    const receivingId = testedTransferList[0].receivingId

    await page.goto(`${process.env.E2E_TEST_URL}/receipt?receivingId=${receivingId}`, {
      waitUntil: 'networkidle0'
    })
    await loginPage.receiptLogin(
      process.env.E2E_TEST_GOOGLE_LOGIN_USERNAME,
      process.env.E2E_TEST_GOOGLE_LOGIN_PASSWORD,
      `${process.env.E2E_TEST_URL}/receipt?receivingId=${receivingId}`,
      true
    )
  })
})

describe('Receipt page tests', () => {
  beforeAll(async () => {
    await resetUserDefault()

    // setup interceptor
    await requestInterceptor.setRequestInterception(true)

    const loginPage = new LoginPage()
    await page.goto(`${process.env.E2E_TEST_URL}`)
    await loginPage.login(
      process.env.E2E_TEST_GOOGLE_LOGIN_USERNAME,
      process.env.E2E_TEST_GOOGLE_LOGIN_PASSWORD,
      true
    )
  }, timeout)

  afterAll(async () => {
    // show intercepted stats
    requestInterceptor.showStats()

    await jestPuppeteer.resetBrowser()
  })

  it.each(senderTestParam)(
    'Transfer ID: %s %s',
    async (transferId, state, transfer) => {
      await Promise.all([
        reduxTracker.waitFor(
          [
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
        page.goto(`${process.env.E2E_TEST_URL}/receipt?transferId=${transfer.transferId}`, {
          waitUntil: 'networkidle0'
        })
      ])
      const receiptPage = new ReceiptPage()
      await receiptPage.receiptCheck(transfer, 'SENDER')
    },
    timeout
  )

  it.each(receiverTestParam)(
    'Receiving ID: %s %s',
    async (receivingId, state, transfer) => {
      await Promise.all([
        reduxTracker.waitFor(
          [
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
        page.goto(`${process.env.E2E_TEST_URL}/receipt?receivingId=${receivingId}`, {
          waitUntil: 'networkidle0'
        })
      ])
      const receiptPage = new ReceiptPage()
      await receiptPage.receiptCheck(transfer, 'RECEIVER')
    },
    timeout
  )
})
