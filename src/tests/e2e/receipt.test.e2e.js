import LoginPage from './pages/login.page'
import ReceiptPage from './pages/receipt.page'
import { resetUserDefault } from './utils/reset.js'
import ReduxTracker from './utils/reduxTracker'
import { TRANSFER_ID_LIST, RECEIVING_ID_LIST } from './mocks/ids'
import { DEFAULT_TRANSFER_DATA } from './mocks/transfers'
import { getElementTextContent, getNewPopupPage } from './testUtils'
import { getCryptoSymbol } from '../../tokens'
import { Base64 } from 'js-base64'
import { brown } from '@material-ui/core/colors'
import moment from 'moment'
import { jssPreset } from '@material-ui/core'

const timeout = 180000
const reduxTracker = new ReduxTracker()
const { transferDataList, driveTransferHistory } = DEFAULT_TRANSFER_DATA

describe('Receipt page tests', () => {
  beforeAll(async () => {
    await resetUserDefault()
  }, timeout)

  afterEach(async () => {
    await jestPuppeteer.resetBrowser()
  })

  it(
    `Transfer ID: ${transferDataList[0].transferId} (SEND_PENDING) SENDER`,
    async () => {
      const transfer = transferDataList[0]
      const driveTransfer = driveTransferHistory[transfer.transferId]
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

      const title = await receiptPage.getReceiptFormInfo('title')
      expect(title).toEqual('Transfer Arranged')

      const sender = await receiptPage.getReceiptFormInfo('sender')
      expect(sender.name).toEqual(transfer.senderName)
      expect(sender.email).toEqual(transfer.sender)

      const recipient = await receiptPage.getReceiptFormInfo('recipient')
      expect(recipient.name).toEqual(transfer.receiverName)
      expect(recipient.email).toEqual(transfer.destination)

      const senderAccount = await receiptPage.getReceiptFormInfo('senderAccount')
      const receiptSenderAccount = JSON.parse(transfer.senderAccount)
      expect(senderAccount.walletType.toLowerCase()).toEqual(receiptSenderAccount.walletType)
      expect(senderAccount.platformType.toLowerCase()).toEqual(receiptSenderAccount.platformType)
      expect(senderAccount.address).toEqual(receiptSenderAccount.address)

      const transferAmount = await receiptPage.getReceiptFormInfo('transferAmount')
      expect(transferAmount.transferAmount).toEqual(transfer.transferAmount)
      expect(transferAmount.currencyAmount).toEqual(transfer.transferFiatAmountSpot)
      expect(transferAmount.symbol).toEqual(getCryptoSymbol(transfer.cryptoType))

      const { securityAnswer } = await receiptPage.getReceiptFormInfo('securityAnswer')
      expect(securityAnswer).toEqual(Base64.decode(driveTransfer.password))

      const { message } = await receiptPage.getReceiptFormInfo('sendMessage')
      expect(message).toEqual(transfer.sendMessage)

      const { sendOn } = await receiptPage.getReceiptFormInfo('sendOn')
      const expectTime = moment.unix(driveTransfer.sendTimestamp).format('MMM Do YYYY, HH:mm:ss')
      expect(sendOn).toEqual(`Sent on ${expectTime}`)

      const explorerPage = await getNewPopupPage(browser, async () => {
        await receiptPage.dispatchActions('openSendExplorer')
      })
      expect(explorerPage.url()).toEqual(`https://rinkeby.etherscan.io/tx/${transfer.sendTxHash}`)
      await explorerPage.close()

      const { transferId } = await receiptPage.getReceiptFormInfo('transferId')
      expect(transferId).toEqual(transfer.transferId)
    },
    timeout
  )

  it(
    `Transfer ID: ${transferDataList[1].transferId} (SEND_CONFIRMED_RECEIVE_NOT_INITIATED) SENDER`,
    async () => {
      const transfer = transferDataList[1]
      const driveTransfer = driveTransferHistory[transfer.transferId]
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

      const title = await receiptPage.getReceiptFormInfo('title')
      expect(title).toEqual('Transfer Sent')

      const sender = await receiptPage.getReceiptFormInfo('sender')
      expect(sender.name).toEqual(transfer.senderName)
      expect(sender.email).toEqual(transfer.sender)

      const recipient = await receiptPage.getReceiptFormInfo('recipient')
      expect(recipient.name).toEqual(transfer.receiverName)
      expect(recipient.email).toEqual(transfer.destination)

      const senderAccount = await receiptPage.getReceiptFormInfo('senderAccount')
      const receiptSenderAccount = JSON.parse(transfer.senderAccount)
      expect(senderAccount.walletType.toLowerCase()).toEqual(receiptSenderAccount.walletType)
      expect(senderAccount.platformType.toLowerCase()).toEqual(receiptSenderAccount.platformType)
      expect(senderAccount.address).toEqual(receiptSenderAccount.address)

      const transferAmount = await receiptPage.getReceiptFormInfo('transferAmount')
      expect(transferAmount.transferAmount).toEqual(transfer.transferAmount)
      expect(transferAmount.currencyAmount).toEqual(transfer.transferFiatAmountSpot)
      expect(transferAmount.symbol).toEqual(getCryptoSymbol(transfer.cryptoType))

      const { securityAnswer } = await receiptPage.getReceiptFormInfo('securityAnswer')
      expect(securityAnswer).toEqual(Base64.decode(driveTransfer.password))

      const { message } = await receiptPage.getReceiptFormInfo('sendMessage')
      expect(message).toEqual(transfer.sendMessage)

      const { sendOn } = await receiptPage.getReceiptFormInfo('sendOn')
      const expectTime = moment.unix(driveTransfer.sendTimestamp).format('MMM Do YYYY, HH:mm:ss')
      expect(sendOn).toEqual(`Sent on ${expectTime}`)

      const explorerPage = await getNewPopupPage(browser, async () => {
        await receiptPage.dispatchActions('openSendExplorer')
      })
      expect(explorerPage.url()).toEqual(`https://rinkeby.etherscan.io/tx/${transfer.sendTxHash}`)
      await explorerPage.close()

      const { transferId } = await receiptPage.getReceiptFormInfo('transferId')
      expect(transferId).toEqual(transfer.transferId)
    },
    timeout
  )

  it(
    `Transfer ID: ${transferDataList[2].transferId} (SEND_CONFIRMED_RECEIVE_CONFIRMED) SENDER`,
    async () => {
      const transfer = transferDataList[2]
      const driveTransfer = driveTransferHistory[transfer.transferId]
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

      const title = await receiptPage.getReceiptFormInfo('title')
      expect(title).toEqual('Transfer Completed')

      const sender = await receiptPage.getReceiptFormInfo('sender')
      expect(sender.name).toEqual(transfer.senderName)
      expect(sender.email).toEqual(transfer.sender)

      const recipient = await receiptPage.getReceiptFormInfo('recipient')
      expect(recipient.name).toEqual(transfer.receiverName)
      expect(recipient.email).toEqual(transfer.destination)

      const senderAccount = await receiptPage.getReceiptFormInfo('senderAccount')
      const receiptSenderAccount = JSON.parse(transfer.senderAccount)
      expect(senderAccount.walletType.toLowerCase()).toEqual(receiptSenderAccount.walletType)
      expect(senderAccount.platformType.toLowerCase()).toEqual(receiptSenderAccount.platformType)
      expect(senderAccount.address).toEqual(receiptSenderAccount.address)

      const transferAmount = await receiptPage.getReceiptFormInfo('transferAmount')
      expect(transferAmount.transferAmount).toEqual(transfer.transferAmount)
      expect(transferAmount.currencyAmount).toEqual(transfer.transferFiatAmountSpot)
      expect(transferAmount.symbol).toEqual(getCryptoSymbol(transfer.cryptoType))

      const { securityAnswer } = await receiptPage.getReceiptFormInfo('securityAnswer')
      expect(securityAnswer).toEqual(Base64.decode(driveTransfer.password))

      const sendMessage = await receiptPage.getReceiptFormInfo('sendMessage')
      expect(sendMessage.message).toEqual(transfer.sendMessage)

      const receiveMessage = await receiptPage.getReceiptFormInfo('receiveMessage')
      expect(receiveMessage.message).toEqual(transfer.receiveMessage)

      const { sendOn } = await receiptPage.getReceiptFormInfo('sendOn')
      const expectSendTime = moment
        .unix(driveTransfer.sendTimestamp)
        .format('MMM Do YYYY, HH:mm:ss')
      expect(sendOn).toEqual(`Sent on ${expectSendTime}`)

      const { receiveOn } = await receiptPage.getReceiptFormInfo('receiveOn')
      const expectReceiveTime = moment
        .unix(transfer.chainsferToReceiver.txTimestamp)
        .format('MMM Do YYYY, HH:mm:ss')
      expect(sendOn).toEqual(`Sent on ${expectReceiveTime}`)

      let explorerPage = await getNewPopupPage(browser, async () => {
        await receiptPage.dispatchActions('openSendExplorer')
      })
      expect(explorerPage.url()).toEqual(`https://rinkeby.etherscan.io/tx/${transfer.sendTxHash}`)
      await explorerPage.close()

      explorerPage = await getNewPopupPage(browser, async () => {
        await receiptPage.dispatchActions('openReceiveExplorer')
      })
      expect(explorerPage.url()).toEqual(
        `https://rinkeby.etherscan.io/tx/${transfer.chainsferToReceiver.txHash}`
      )
      await explorerPage.close()

      const { transferId } = await receiptPage.getReceiptFormInfo('transferId')
      expect(transferId).toEqual(transfer.transferId)
    },
    timeout
  )

  it(
    `Receiving ID: ${transferDataList[0].receivingId} (SEND_PENDING) RECEIVER`,
    async () => {
      const transfer = transferDataList[0]

      await page.goto(`${process.env.E2E_TEST_URL}/receipt?receivingId=${transfer.receivingId}`)
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

      const title = await receiptPage.getReceiptFormInfo('title')
      expect(title).toEqual('Transfer Arranged')

      const sender = await receiptPage.getReceiptFormInfo('sender')
      expect(sender.name).toEqual(transfer.senderName)
      expect(sender.email).toEqual(transfer.sender)

      const recipient = await receiptPage.getReceiptFormInfo('recipient')
      expect(recipient.name).toEqual(transfer.receiverName)
      expect(recipient.email).toEqual(transfer.destination)

      const transferAmount = await receiptPage.getReceiptFormInfo('transferAmount')
      expect(transferAmount.transferAmount).toEqual(transfer.transferAmount)
      expect(transferAmount.currencyAmount).toEqual(transfer.transferFiatAmountSpot)
      expect(transferAmount.symbol).toEqual(getCryptoSymbol(transfer.cryptoType))

      expect(await receiptPage.getReceiptFormInfo('securityAnswer')).toBeNull()

      const { message } = await receiptPage.getReceiptFormInfo('sendMessage')
      expect(message).toEqual(transfer.sendMessage)

      const { sendOn } = await receiptPage.getReceiptFormInfo('sendOn')
      const expectTime = moment
        .unix(transfer.senderToChainsfer.txTimestamp)
        .format('MMM Do YYYY, HH:mm:ss')
      expect(sendOn).toEqual(`Sent on ${expectTime}`)

      const explorerPage = await getNewPopupPage(browser, async () => {
        await receiptPage.dispatchActions('openSendExplorer')
      })
      expect(explorerPage.url()).toEqual(`https://rinkeby.etherscan.io/tx/${transfer.sendTxHash}`)
      await explorerPage.close()

      const { transferId } = await receiptPage.getReceiptFormInfo('transferId')
      expect(transferId).toEqual(transfer.receivingId)
    },
    timeout
  )

  it(
    `Receiving ID: ${transferDataList[1].receivingId} (SEND_CONFIRMED_RECEIVE_NOT_INITIATED) RECEIVER`,
    async () => {
      const transfer = transferDataList[1]

      await page.goto(`${process.env.E2E_TEST_URL}/receipt?receivingId=${transfer.receivingId}`)
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

      const title = await receiptPage.getReceiptFormInfo('title')
      expect(title).toEqual('Pending to Receive')

      const sender = await receiptPage.getReceiptFormInfo('sender')
      expect(sender.name).toEqual(transfer.senderName)
      expect(sender.email).toEqual(transfer.sender)

      const recipient = await receiptPage.getReceiptFormInfo('recipient')
      expect(recipient.name).toEqual(transfer.receiverName)
      expect(recipient.email).toEqual(transfer.destination)

      const transferAmount = await receiptPage.getReceiptFormInfo('transferAmount')
      expect(transferAmount.transferAmount).toEqual(transfer.transferAmount)
      expect(transferAmount.currencyAmount).toEqual(transfer.transferFiatAmountSpot)
      expect(transferAmount.symbol).toEqual(getCryptoSymbol(transfer.cryptoType))

      expect(await receiptPage.getReceiptFormInfo('securityAnswer')).toBeNull()

      const { message } = await receiptPage.getReceiptFormInfo('sendMessage')
      expect(message).toEqual(transfer.sendMessage)

      const { sendOn } = await receiptPage.getReceiptFormInfo('sendOn')
      const expectTime = moment
        .unix(transfer.senderToChainsfer.txTimestamp)
        .format('MMM Do YYYY, HH:mm:ss')
      expect(sendOn).toEqual(`Sent on ${expectTime}`)

      const explorerPage = await getNewPopupPage(browser, async () => {
        await receiptPage.dispatchActions('openSendExplorer')
      })
      expect(explorerPage.url()).toEqual(`https://rinkeby.etherscan.io/tx/${transfer.sendTxHash}`)
      await explorerPage.close()

      const { transferId } = await receiptPage.getReceiptFormInfo('transferId')
      expect(transferId).toEqual(transfer.receivingId)
    },
    timeout
  )

  it(
    `Receiving ID: ${transferDataList[2].receivingId} (SEND_DIRECT_TRANSFER_CONFIRMED) RECEIVER`,
    async () => {
      const transfer = transferDataList[2]

      await page.goto(`${process.env.E2E_TEST_URL}/receipt?receivingId=${transfer.receivingId}`)
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

      const title = await receiptPage.getReceiptFormInfo('title')
      expect(title).toEqual('Transfer Completed')

      const sender = await receiptPage.getReceiptFormInfo('sender')
      expect(sender.name).toEqual(transfer.senderName)
      expect(sender.email).toEqual(transfer.sender)

      const recipient = await receiptPage.getReceiptFormInfo('recipient')
      expect(recipient.name).toEqual(transfer.receiverName)
      expect(recipient.email).toEqual(transfer.destination)

      const receiverAccount = await receiptPage.getReceiptFormInfo('receiverAccount')
      const receiptReceiverAccount = JSON.parse(transfer.receiverAccount)
      expect(receiverAccount.walletType.toLowerCase()).toEqual(receiptReceiverAccount.walletType)
      expect(receiverAccount.platformType.toLowerCase()).toEqual(
        receiptReceiverAccount.platformType
      )
      expect(receiverAccount.address).toEqual(receiptReceiverAccount.address)

      const transferAmount = await receiptPage.getReceiptFormInfo('transferAmount')
      expect(transferAmount.transferAmount).toEqual(transfer.transferAmount)
      expect(transferAmount.currencyAmount).toEqual(transfer.transferFiatAmountSpot)
      expect(transferAmount.symbol).toEqual(getCryptoSymbol(transfer.cryptoType))

      expect(await receiptPage.getReceiptFormInfo('securityAnswer')).toBeNull()

      const { message } = await receiptPage.getReceiptFormInfo('sendMessage')
      expect(message).toEqual(transfer.sendMessage)

      const { sendOn } = await receiptPage.getReceiptFormInfo('sendOn')
      const expectSendTime = moment
        .unix(transfer.senderToChainsfer.txTimestamp)
        .format('MMM Do YYYY, HH:mm:ss')
      expect(sendOn).toEqual(`Sent on ${expectSendTime}`)

      const expectReceiveTime = moment
        .unix(transfer.chainsferToReceiver.txTimestamp)
        .format('MMM Do YYYY, HH:mm:ss')
      expect(sendOn).toEqual(`Sent on ${expectReceiveTime}`)

      let explorerPage = await getNewPopupPage(browser, async () => {
        await receiptPage.dispatchActions('openSendExplorer')
      })
      expect(explorerPage.url()).toEqual(`https://rinkeby.etherscan.io/tx/${transfer.sendTxHash}`)
      await explorerPage.close()

      explorerPage = await getNewPopupPage(browser, async () => {
        await receiptPage.dispatchActions('openReceiveExplorer')
      })
      expect(explorerPage.url()).toEqual(
        `https://rinkeby.etherscan.io/tx/${transfer.chainsferToReceiver.txHash}`
      )
      await explorerPage.close()
      const { transferId } = await receiptPage.getReceiptFormInfo('transferId')
      expect(transferId).toEqual(transfer.receivingId)
    },
    timeout
  )
})
