import LoginPage from './pages/login.page'
import DisconnectPage from './pages/disconnect.page'
import EmailTransferFormPage from './pages/emailTransferForm.page'
import EmailTransferAuthPage from './pages/emailTransferAuth.page'
import SendReviewPage from './pages/sendReview.page'
import ReceiptPage from './pages/receipt.page'
import ReceiveFormPage from './pages/receiveFormPage'
import ReduxTracker from './utils/reduxTracker'
import { resetUserDefault, resetUser } from './utils/reset'
import { CRYPTO_ACCOUNTS } from './mocks/cryptoAccounts.js'
import { EMAIL, PROFILE } from './mocks/user.js'
import { getTransfer, getTransferState, getCryptoSymbol } from './testUtils'
import BN from 'bn.js'
import moment from 'moment'
import { DEFAULT_TRANSFER_DATA, DEFAULT_TRANSFER_DATA_CONFIG } from './mocks/transfers'
import { RECEIVER } from './mocks/recipients'
import TestMailsClient from './email/testMailClient'
import { SELECTORS, EmailParser, getEmailSubject } from './email/emailParser'
const { transferDataList, driveTransferHistory } = DEFAULT_TRANSFER_DATA

// 20 min
const timeout = 1000 * 60 * 20
const reduxTracker = new ReduxTracker()

const receivingTransfer = { ...transferDataList[1], state: DEFAULT_TRANSFER_DATA_CONFIG[1].state }
if (!process.env.REACT_APP_E2E_TEST_TEST_MAIL_NAMESPACE)
  throw new Error('REACT_APP_E2E_TEST_TEST_MAIL_NAMESPACE missing')
const suffix = process.env.REACT_APP_E2E_TEST_MAIL_TAG_SUFFIX || ''
let expiryDays = 0
if (process.env.REACT_APP_CHAINSFER_API_ENDPOINT.match(new RegExp('prod'))) expiryDays = 28
if (process.env.REACT_APP_CHAINSFER_API_ENDPOINT.match(new RegExp('test'))) expiryDays = 10

describe('Receive transfer tests', () => {
  let emtPage
  let emtReviewPage
  let emtAuthPage
  let receiptPage
  let receiveFormPage
  let disconnectPage

  const FORM_BASE = {
    recipient: RECEIVER.email,
    currencyAmount: '1',
    securityAnswer: '123456',
    sendMessage: 'donchdachdonchdach'
  }

  // pending transferIds by walletType, cryptoType
  var pendingReceive = {}
  var pendingSendEmail = {}
  // pending receivingIds by walletType, cryptoType
  var pendingDeposit = {}
  var pendingReceiveEmail = {}

  beforeAll(async () => {
    await resetUserDefault()
    await jestPuppeteer.resetBrowser()

    emtPage = new EmailTransferFormPage()
    emtReviewPage = new SendReviewPage()
    emtAuthPage = new EmailTransferAuthPage()
    receiptPage = new ReceiptPage()
    receiveFormPage = new ReceiveFormPage()
    disconnectPage = new DisconnectPage()

    // setup interceptor
    await requestInterceptor.setRequestInterception(true)
    requestInterceptor.byPass({
      platform: 'chainsfrApi',
      method: 'GET_TRANSFER'
    })

    await page.goto(process.env.E2E_TEST_URL, {
      waitUntil: 'networkidle0'
    })
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
    pendingReceive[`${walletType}_${cryptoType}`] = transferId
    log.info(`Send ${walletType}_${cryptoType} finished`)

    pendingSendEmail[`${walletType}_${cryptoType}`] = checkSendEmails(walletType, cryptoType)
  }

  const deposit = async (walletType, cryptoType) => {
    log.info(`Depositing ${walletType}_${cryptoType} transfer...`)

    const platformType = 'ethereum'
    let sendTxState = ''

    const transferId = pendingReceive[`${walletType}_${cryptoType}`]
    while (true) {
      const transferData = await getTransfer({ transferId: transferId })
      sendTxState = getTransferState(transferData)
      if (sendTxState === 'SEND_CONFIRMED_RECEIVE_NOT_INITIATED') {
        var { receivingId } = transferData
        break
      }
      log.info('Waiting for send tx to be confirmed, current state: ', sendTxState)
      await page.waitFor(15000) // 15 seconds
    }
    log.info('Send tx confirmed', sendTxState)
    log.info('Tx receiving id: ', receivingId)
    // back to home page
    await page.goto(`${process.env.E2E_TEST_URL}/receive?id=${receivingId}`, {
      waitUntil: 'networkidle0'
    })

    await receiveFormPage.waitUntilTransferLoaded()

    // Test wrong security answer deposit
    await receiveFormPage.enterSecurityAnswer('wrongla')
    await Promise.all([
      reduxTracker.waitFor(
        [
          {
            action: {
              type: 'VERIFY_ESCROW_ACCOUNT_PASSWORD_REJECTED'
            }
          },
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
        ],
        []
      ),
      receiveFormPage.dispatchFormActions('validate')
    ])

    const status = await receiveFormPage.getSecurityAnswerTextFieldStatus()
    expect(status.error).toBeTruthy()
    expect(status.helperText).toEqual('Incorrect security answer')

    if (walletType === 'drive' && cryptoType === 'ethereum') {
      // edge case, receiver has exactly one matched account
      // this corresponds to the issue #1656
      // testing drive_ethereum is sufficient
      await resetUser({
        email: EMAIL,
        profile: PROFILE,
        cryptoAccounts: [
          CRYPTO_ACCOUNTS.find(e => e.walletType === walletType && e.cryptoType === e.cryptoType)
        ]
      })
      await page.waitFor(500)
      await page.goto(`${process.env.E2E_TEST_URL}/receive?id=${receivingId}`, {
        waitUntil: 'networkidle0'
      })
      await receiveFormPage.waitUntilTransferLoaded()
      await receiveFormPage.enterSecurityAnswer(FORM_BASE.securityAnswer)
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

      // reset back to default accounts
      await resetUser({
        email: EMAIL,
        profile: PROFILE,
        cryptoAccounts: CRYPTO_ACCOUNTS
      })
      await page.waitFor(500)
      await page.goto(`${process.env.E2E_TEST_URL}/receive?id=${receivingId}`, {
        waitUntil: 'networkidle0'
      })
      await receiveFormPage.waitUntilTransferLoaded()
    }

    await receiveFormPage.enterSecurityAnswer(FORM_BASE.securityAnswer)
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

    pendingReceiveEmail[`${walletType}_${cryptoType}`] = checkReceiveEmails(walletType, cryptoType)
  }

  const confirmDeposit = async (walletType, cryptoType) => {
    log.info(`Confirming deposit ${walletType}_${cryptoType}...`)
    const receivingId = pendingDeposit[`${walletType}_${cryptoType}`]

    let receivetxState
    while (true) {
      const transferData = await getTransfer({ receivingId })
      receivetxState = getTransferState(transferData)
      if (receivetxState === 'SEND_CONFIRMED_RECEIVE_CONFIRMED') break
      log.info('Waiting for receive tx to be confirmed, current state: ', receivetxState)
      await page.waitFor(15000) // 15 seconds
    }
    log.info(`Deposit ${walletType}_${cryptoType} confirmed with txState ${receivetxState}`)
  }

  const checkSendSenderEmail = async transferData => {
    const testMailClient = new TestMailsClient('sender')

    const subjectFilterValue = getEmailSubject('sender', 'send', transferData)
    const email = await testMailClient.liveEmailQuery(subjectFilterValue)

    const emailParser = new EmailParser(email.html)
    const selectors = SELECTORS.SENDER.SEND
    const emailMessage = emailParser.getEmailElementText(selectors.MESSAGE)
    const btnLink = emailParser.getEmailElementAttribute(selectors.CANCEL_BTN, 'href')

    expect(emailMessage).toMatch(new RegExp(transferData.transferAmount))
    expect(emailMessage).toMatch(new RegExp(getCryptoSymbol(transferData.cryptoType)))
    expect(emailMessage).toMatch(new RegExp(transferData.transferFiatAmountSpot))
    expect(emailMessage).toMatch(new RegExp(transferData.fiatType))
    expect(emailMessage).toMatch(new RegExp(transferData.receiverName))
    expect(emailMessage).toMatch(new RegExp(transferData.destination))
    expect(emailMessage).toMatch(new RegExp(transferData.sendMessage))
    expect(btnLink).toMatch(`testnet.chainsfr.com%2Fcancel%3Fid=${transferData.transferId}`)
  }

  const checkSendReceiverEmail = async transferData => {
    const testMailClient = new TestMailsClient('receiver')

    const subjectFilterValue = getEmailSubject('receiver', 'send', transferData)
    const email = await testMailClient.liveEmailQuery(subjectFilterValue)

    const emailParser = new EmailParser(email.html)
    const selectors = SELECTORS.RECEIVER.SEND
    const emailMessage = emailParser.getEmailElementText(selectors.MESSAGE)
    const btnLink = emailParser.getEmailElementAttribute(selectors.DEPOSIT_BTN, 'href')
    const reminderMessage = emailParser.getEmailElementText(selectors.DEPOSIT_REMINDER)

    expect(emailMessage).toMatch(new RegExp(transferData.senderName))
    expect(emailMessage).toMatch(new RegExp(transferData.transferAmount))
    expect(emailMessage).toMatch(new RegExp(getCryptoSymbol(transferData.cryptoType)))
    expect(emailMessage).toMatch(new RegExp(transferData.transferFiatAmountSpot))
    expect(emailMessage).toMatch(new RegExp(transferData.fiatType))
    expect(emailMessage).toMatch(new RegExp(transferData.sendMessage))
    expect(btnLink).toMatch(`testnet.chainsfr.com%2Freceive%3Fid=${transferData.receivingId}`)
    expect(reminderMessage).toMatch(new RegExp(`You have ${expiryDays} days to accept it`))
  }

  const checkSendEmails = async (walletType, cryptoType) => {
    log.info(`Listening send email ${walletType}_${cryptoType}...`)

    const transferId = pendingReceive[`${walletType}_${cryptoType}`]
    const transferData = await getTransfer({ transferId: transferId })

    return Promise.all([checkSendSenderEmail(transferData), checkSendReceiverEmail(transferData)])
  }

  const checkReceiveSenderEmail = async transferData => {
    const testMailClient = new TestMailsClient('sender')

    const subjectFilterValue = getEmailSubject('sender', 'receive', transferData)
    const email = await testMailClient.liveEmailQuery(subjectFilterValue)
    const emailParser = new EmailParser(email.html)
    const selectors = SELECTORS.SENDER.RECEIVE
    const emailMessage = emailParser.getEmailElementText(selectors.MESSAGE)
    const btnLink = emailParser.getEmailElementAttribute(selectors.RECEIPT_BTN, 'href')

    expect(emailMessage).toMatch(new RegExp(transferData.transferAmount))
    expect(emailMessage).toMatch(new RegExp(getCryptoSymbol(transferData.cryptoType)))
    expect(emailMessage).toMatch(new RegExp(transferData.transferFiatAmountSpot))
    expect(emailMessage).toMatch(new RegExp(transferData.fiatType))
    expect(emailMessage).toMatch(new RegExp(transferData.receiverName))
    expect(btnLink).toMatch(
      `testnet.chainsfr.com%2Freceipt%3FtransferId=${transferData.transferId}`
    )
  }

  const checkReceiveReceiverEmail = async transferData => {
    const testMailClient = new TestMailsClient('receiver')

    const subjectFilterValue = getEmailSubject('receiver', 'receive', transferData)
    const email = await testMailClient.liveEmailQuery(subjectFilterValue)
    const emailParser = new EmailParser(email.html)
    const selectors = SELECTORS.RECEIVER.RECEIVE
    const emailMessage = emailParser.getEmailElementText(selectors.MESSAGE)
    const btnLink = emailParser.getEmailElementAttribute(selectors.RECEIPT_BTN, 'href')

    expect(emailMessage).toMatch(new RegExp(transferData.senderName))
    expect(emailMessage).toMatch(new RegExp(transferData.transferAmount))
    expect(emailMessage).toMatch(new RegExp(getCryptoSymbol(transferData.cryptoType)))
    expect(emailMessage).toMatch(new RegExp(transferData.transferFiatAmountSpot))
    expect(emailMessage).toMatch(new RegExp(transferData.fiatType))
    expect(btnLink).toMatch(
      `testnet.chainsfr.com%2Freceipt%3FreceivingId=${transferData.receivingId}`
    )
  }

  const checkReceiveEmails = async (walletType, cryptoType) => {
    log.info(`Listening receive email ${walletType}_${cryptoType}...`)

    const transferId = pendingReceive[`${walletType}_${cryptoType}`]
    const transferData = await getTransfer({ transferId: transferId })

    return Promise.all([
      checkReceiveSenderEmail(transferData),
      checkReceiveReceiverEmail(transferData)
    ])
  }

  // make dai the first tests to reduce waiting time between different transfers
  // since the allowance approval takes one tx time unit
  it(
    'Send DAI from metamask',
    async done => {
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
      const cryptoAmountBasicTokenUnit = new BN(10).pow(new BN(19)).toString()
      await disconnectPage.setAllowance(cryptoAmountBasicTokenUnit, 'metamask')
      log.info(`Set allowance Dai successfully`)

      await page.goto(`${process.env.E2E_TEST_URL}/send`, { waitUntil: 'networkidle0' })
      await emtPage.fillForm({
        ...FORM_BASE,
        formPage: emtPage,
        walletType: 'metamask',
        platformType: platformType,
        cryptoType: 'dai',
        currencyAmount: '1.1' // set different amount to diferentiate emails
      })

      await sendTx('metamask', 'dai')
      requestInterceptor.byPass(null)
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
        formPage: emtPage,
        walletType: 'metamask',
        platformType: platformType,
        cryptoType: 'ethereum',
        currencyAmount: '1.1' // set different amount to diferentiate emails
      })

      await sendTx('metamask', 'ethereum')
      done()
    },
    timeout
  )

  it(
    'Send DAI from drive',
    async done => {
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
      const cryptoAmountBasicTokenUnit = new BN(10).pow(new BN(19)).toString()
      await disconnectPage.setAllowance(cryptoAmountBasicTokenUnit, 'drive')
      log.info(`Set allowance Dai successfully`)

      await page.goto(`${process.env.E2E_TEST_URL}/send`, { waitUntil: 'networkidle0' })
      await emtPage.fillForm({
        ...FORM_BASE,
        formPage: emtPage,
        walletType: 'drive',
        platformType: platformType,
        cryptoType: 'dai'
      })

      await sendTx('drive', 'dai')
      requestInterceptor.byPass(null)
      done()
    },
    timeout
  )

  it(
    'Send ETH from drive',
    async done => {
      const platformType = 'ethereum'
      const cryptoAmount = '1'
      await page.goto(`${process.env.E2E_TEST_URL}/send`, { waitUntil: 'networkidle0' })
      await emtPage.fillForm({
        ...FORM_BASE,
        formPage: emtPage,
        walletType: 'drive',
        platformType: platformType,
        cryptoType: 'ethereum'
      })

      await sendTx('drive', 'ethereum')
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

  it(
    'Deposit DAI into drive',
    async done => {
      await deposit('drive', 'dai')
      done()
    },
    timeout
  )

  it(
    'Deposit ETH into drive',
    async done => {
      await deposit('drive', 'ethereum')
      done()
    },
    timeout
  )

  it(
    'Check DAI MetaMask send email',
    async done => {
      log.info('Waiting for metamask_dai send emails to be resolved')
      await pendingSendEmail['metamask_dai']
      log.info('metamask_dai send emails resolved')
      done()
    },
    timeout
  )

  it(
    'Check ETH MetaMask send email',
    async done => {
      log.info('Waiting for metamask_ethereum send emails to be resolved')
      await pendingSendEmail['metamask_ethereum']
      log.info('metamask_ethereum send emails resolved')
      done()
    },
    timeout
  )

  it(
    'Check DAI drive send email',
    async done => {
      log.info('Waiting for drive_dai send emails to be resolved')
      await pendingSendEmail['drive_dai']
      log.info('drive_dai send emails resolved')
      done()
    },
    timeout
  )

  it(
    'Check ETH drive send email',
    async done => {
      log.info('Waiting for drive_ethereum send emails to be resolved')
      await pendingSendEmail['drive_ethereum']
      log.info('drive_ethereum send emails resolved')
      done()
    },
    timeout
  )

  it('Confirm DAI metamask deposit', async done => {
    await confirmDeposit('metamask', 'dai')
    done()
  })

  it('Confirm ETH metamask deposit', async done => {
    await confirmDeposit('metamask', 'ethereum')
    done()
  })

  it('Confirm DAI drive deposit', async done => {
    await confirmDeposit('drive', 'dai')
    done()
  })

  it('Confirm ETH drive deposit', async done => {
    await confirmDeposit('drive', 'ethereum')
    done()
  })

  it(
    'Check DAI MetaMask receive email',
    async done => {
      log.info('Waiting for metamask_dai receive emails to be resolved')
      await pendingReceiveEmail['metamask_dai']
      log.info('metamask_dai receive emails resolved')
      done()
    },
    timeout
  )

  it(
    'Check ETH MetaMask receive email',
    async done => {
      log.info('Waiting for metamask_ethereum receive emails to be resolved')
      await pendingReceiveEmail['metamask_ethereum']
      log.info('metamask_ethereum receive emails resolved')
      done()
    },
    timeout
  )

  it(
    'Check DAI drive receive email',
    async done => {
      log.info('Waiting for drive_dai receive emails to be resolved')
      await pendingReceiveEmail['drive_dai']
      log.info('drive_dai receive emails resolved')
      done()
    },
    timeout
  )

  it(
    'Check ETH drive receive email',
    async done => {
      log.info('Waiting for drive_ethereum receive emails to be resolved')
      await pendingReceiveEmail['drive_ethereum']
      log.info('drive_ethereum receive emails resolved')
      done()
    },
    timeout
  )
})

describe('Receive Login test', () => {
  beforeAll(async () => {
    // setup interceptor
    await requestInterceptor.setRequestInterception(true)
    await resetUserDefault()
  })

  afterAll(async () => {
    requestInterceptor.showStats()
    await jestPuppeteer.resetBrowser()
  })

  it('Receive Login test', async () => {
    const loginPage = new LoginPage()
    const receiveFormPage = new ReceiveFormPage()
    await page.goto(`${process.env.E2E_TEST_URL}/receive?id=${receivingTransfer.receivingId}`, {
      waitUntil: 'networkidle0'
    })

    await receiveFormPage.waitUntilTransferLoaded()

    // verify transfer form info
    const sender = await receiveFormPage.getFormInfo('sender')
    expect(sender.name).toEqual(receivingTransfer.senderName)
    expect(sender.email).toEqual(receivingTransfer.sender)

    const recipient = await receiveFormPage.getFormInfo('recipient')
    expect(recipient.name).toEqual(receivingTransfer.receiverName)
    expect(recipient.email).toEqual(receivingTransfer.destination)

    const transferAmount = await receiveFormPage.getFormInfo('transferAmount')
    expect(transferAmount.transferAmount).toEqual(receivingTransfer.transferAmount)
    expect(transferAmount.symbol).toEqual(getCryptoSymbol(receivingTransfer.cryptoType))

    const sendMessage = (await receiveFormPage.getFormInfo('sendMessage')).message
    expect(sendMessage).toEqual(receivingTransfer.sendMessage)
    const sendTime = (await receiveFormPage.getFormInfo('sendOn')).sendOn
    const expectSendTime = moment
      .unix(receivingTransfer.senderToChainsfer.txTimestamp)
      .format('MMM Do YYYY, HH:mm:ss')
    expect(sendTime).toEqual(`Sent on ${expectSendTime}`)

    // login
    await loginPage.login(
      process.env.E2E_TEST_GOOGLE_LOGIN_USERNAME,
      process.env.E2E_TEST_GOOGLE_LOGIN_PASSWORD,
      true
    )
    expect(page.url()).toEqual(
      `${process.env.E2E_TEST_URL}/receive?id=${receivingTransfer.receivingId}`
    )
  })
})
