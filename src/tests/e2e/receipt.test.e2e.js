import LoginPage from './pages/login.page'
import ReceiptPage from './pages/receipt.page'
import { resetUserDefault } from './utils/reset.js'
import ReduxTracker from './utils/reduxTracker'
import { TRANSFER_ID_LIST, RECEIVING_ID_LIST } from './mocks/ids'
import { DEFAULT_TRANSFER_DATA, DEFAULT_TRANSFER_DATA_CONFIG } from './mocks/transfers'
import { getElementTextContent, getNewPopupPage } from './testUtils'
import { getCryptoSymbol } from '../../tokens'
import { Base64 } from 'js-base64'
import moment from 'moment'
import log from 'loglevel'
log.setDefaultLevel('info')

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

describe('Receipt page tests', () => {
  beforeAll(async () => {
    await resetUserDefault()
  }, timeout)

  afterEach(async () => {
    await jestPuppeteer.resetBrowser()
  })

  it.each(senderTestParam)(
    'Transfer ID: %s %s',
    async (transferId, state, transfer) => {
      await page.goto(`${process.env.E2E_TEST_URL}/receipt?transferId=${transfer.transferId}`)
      const loginPage = new LoginPage()

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
        page.waitForNavigation({
          waitUntil: 'networkidle0'
        }),
        loginPage.login(
          process.env.E2E_TEST_GOOGLE_LOGIN_USERNAME,
          process.env.E2E_TEST_GOOGLE_LOGIN_PASSWORD,
          true
        )
      ])
      const receiptPage = new ReceiptPage()
      await receiptPage.receiptCheck(transfer, 'SENDER')
    },
    timeout
  )

  it.each(receiverTestParam)(
    'Receiving ID: %s %s',
    async (receivingId, state, transfer) => {
      await page.goto(`${process.env.E2E_TEST_URL}/receipt?receivingId=${receivingId}`)
      const loginPage = new LoginPage()

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
        page.waitForNavigation({
          waitUntil: 'networkidle0'
        }),
        loginPage.login(
          process.env.E2E_TEST_GOOGLE_LOGIN_USERNAME,
          process.env.E2E_TEST_GOOGLE_LOGIN_PASSWORD,
          true
        )
      ])
      const receiptPage = new ReceiptPage()
      await receiptPage.receiptCheck(transfer, 'RECEIVER')
    },
    timeout
  )
})
