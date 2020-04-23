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
import BN from 'bn.js'

// 15 min
const timeout = 1000 * 60 * 15

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

  // pending transferIds by walletType, cryptoType
  var pendingReceive = {}
  // pending receivingIds by walletType, cryptoType
  var pendingDeposit = {}

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
    pendingReceive[`${walletType}_${cryptoType}`] = transferId

    log.info(`Send ${walletType}_${cryptoType} finished`)
  }

  const deposit = async (walletType, cryptoType) => {
    log.info(`Depositing ${walletType}_${cryptoType} transfer...`)

    const platformType = 'ethereum'
    let sendTxState = ''

    const transferId = pendingReceive[`${walletType}_${cryptoType}`]
    while (true) {
      await page.waitFor(15000) // 15 seconds
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
    await page.goto(`${process.env.E2E_TEST_URL}/receive?id=${receivingId}`, {
      waitUntil: 'networkidle0'
    })

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

    await receiveFormPage.selectAccount(walletType, platformType)
    await Promise.all([
      reduxTracker.waitFor(
        [
          {
            action: {
              type: 'ACCEPT_TRANSFER_FULFILLED'
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
      receiveFormPage.dispatchFormActions('deposit')
    ])

    pendingDeposit[`${walletType}_${cryptoType}`] = receivingId
    log.info(`Deposit ${walletType}_${cryptoType} finished`)
  }

  const confirmDeposit = async (walletType, cryptoType) => {
    log.info(`Confirming deposit ${walletType}_${cryptoType}...`)
    const receivingId = pendingDeposit[`${walletType}_${cryptoType}`]

    let receivetxState
    while (true) {
      // wait until receive tx is confirmed
      await page.waitFor(15000) // 15 seconds

      const transferData = await getTransfer({ receivingId })
      receivetxState = getTransferState(transferData)
      if (receivetxState === 'SEND_CONFIRMED_RECEIVE_CONFIRMED') break
      log.info('Waiting for receive tx to be confirmed, current state: ', receivetxState)
    }
    log.info(`Deposit ${walletType}_${cryptoType} confirmed with txState ${receivetxState}`)
  }

  // make dai the first tests to reduce waiting time between different transfers
  // since the allowance approval takes one tx time unit
  it(
    'Send DAI from metamask',
    async done => {
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
      done()
    },
    timeout
  )

  it(
    'Send ETH from metamask',
    async done => {
      const platformType = 'ethereum'
      await page.goto(`${process.env.E2E_TEST_URL}/send`, { waitUntil: 'networkidle0' })
      await emtPage.fillForm({
        ...FORM_BASE,
        walletType: 'metamask',
        platformType: platformType,
        cryptoType: 'ethereum'
      })

      await sendTx('metamask', 'ethereum')
      done()
    },
    timeout
  )

  it(
    'Deposit DAI into metamask',
    async done => {
      await deposit('metamask', 'dai')
      done()
    },
    timeout
  )

  it(
    'Deposit ETH into metamask',
    async done => {
      await deposit('metamask', 'ethereum')
      done()
    },
    timeout
  )

  it('Confirm DAI metamask depost', async done => {
    await confirmDeposit('metamask', 'dai')
    done()
  })

  it('Confirm ETH metamask depost', async done => {
    await confirmDeposit('metamask', 'ethereum')
    done()
  })
})
