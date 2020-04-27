import { getElementTextContent, getNewPopupPage } from '../testUtils'
import transferStates from '../../../transferStates'
import log from 'loglevel'
import { Base64 } from 'js-base64'
import moment from 'moment'
import { getCryptoPlatformType, getCryptoSymbol } from '../../../tokens'
log.setDefaultLevel('info')

class ReceiptPage {
  /**
   * @param {Object} receiptPage - The designated page referrence,
   * use default current page if not provided.
   */
  constructor (receiptPage) {
    if (receiptPage) {
      this.page = receiptPage
    } else {
      this.page = page
    }
  }

  async dispatchActions (action) {
    if (action === 'back') {
      await Promise.all([
        this.page.click('[data-test-id="back"]'),
        this.page.waitForNavigation({
          waitUntil: 'networkidle0'
        })
      ])
    } else if (action === 'showSenderAddress') {
      await this.page.click('[data-test-id="show_from_address_btn"]')
    } else if (action === 'showReceiverAddress') {
      await this.page.click('[data-test-id="show_to_address_btn"]')
    } else if (action === 'copySecurityAnswer') {
      await this.page.click('[data-test-id="copy_security_answer_btn"]')
    } else if (action === 'openSendExplorer') {
      await this.page.click('[data-test-id="send_explorer_btn"]')
    } else if (action === 'openReceiveExplorer') {
      await this.page.click('[data-test-id="receive_explorer_btn"]')
    } else if (action === 'openCancelExplorer') {
      await this.page.click('[data-test-id="cancel_explorer_btn"]')
    } else {
      throw new Error(`Invalid action: ${action}`)
    }
  }

  async getReceiptFormInfo (field) {
    switch (field) {
      case 'title': {
        const titleElement = await this.page.$('[data-test-id="title"]')
        const title = await getElementTextContent(titleElement)
        return title
      }
      case 'messageBox': {
        const messageBoxElement = await this.page.$('.MuiAlert-message')
        const messageBox = await getElementTextContent(messageBoxElement)
        return messageBox
      }
      case 'sender': {
        const senderNameElement = await this.page.$('[data-test-id="from_name"]')
        const senderEmailElement = await this.page.$('[data-test-id="from_email"]')
        const name = await getElementTextContent(senderNameElement)
        const email = await getElementTextContent(senderEmailElement)
        return { name, email }
      }
      case 'recipient': {
        const recipientNameElement = await this.page.$('[data-test-id="to_name"]')
        const recipientEmailElement = await this.page.$('[data-test-id="to_email"]')
        const name = await getElementTextContent(recipientNameElement)
        const email = await getElementTextContent(recipientEmailElement)
        return { name, email }
      }
      case 'senderAccount': {
        const accountWalletPlatformTypeElement = await this.page.$(
          '[data-test-id="from_wallet_platform"]'
        )
        const WalletPlatform = (await getElementTextContent(
          accountWalletPlatformTypeElement
        )).split(', ')

        await this.dispatchActions('showSenderAddress')
        const addressElement = await this.page.$('[data-test-id="from_address"]')
        const address = await getElementTextContent(addressElement)

        const walletType = WalletPlatform[0]
        const platformType = WalletPlatform[1]
        return { walletType, platformType, address }
      }
      case 'receiverAccount': {
        const senderAccountNameElement = await this.page.$('[data-test-id="to_account_name"]')
        const accountWalletPlatformTypeElement = await this.page.$(
          '[data-test-id="to_wallet_platform"]'
        )
        const WalletPlatform = (await getElementTextContent(
          accountWalletPlatformTypeElement
        )).split(', ')

        await this.dispatchActions('showReceiverAddress')
        const addressElement = await this.page.$('[data-test-id="to_address"]')
        const address = await getElementTextContent(addressElement)

        const name = await getElementTextContent(senderAccountNameElement)
        const walletType = WalletPlatform[0]
        const platformType = WalletPlatform[1]
        return { name, walletType, platformType, address }
      }
      case 'transferAmount': {
        const transferAmountElement = await this.page.$('[data-test-id="transfer_amount"]')
        const currencyAmountElement = await this.page.$('[data-test-id="currency_amount"]')
        const transferAmount = (await getElementTextContent(transferAmountElement)).split(' ')[0]
        const symbol = (await getElementTextContent(transferAmountElement)).split(' ')[1]
        const currencyAmount = (await getElementTextContent(currencyAmountElement)).split(' ')[2]
        return { transferAmount, currencyAmount, symbol }
      }
      case 'txFee': {
        const txFeeElement = await this.page.$('[data-test-id="tx_fee"]')
        const currencyTxFeeElement = await this.page.$('[data-test-id="currency_tx_fee"]')
        const txFee = (await getElementTextContent(txFeeElement)).split(' ')[0]
        const symbol = (await getElementTextContent(txFeeElement)).split(' ')[1]
        const currencyTxFee = (await getElementTextContent(currencyTxFeeElement)).split(' ')[2]
        return { txFee, currencyTxFee, symbol }
      }
      case 'securityAnswer': {
        const securityAnswerElement = await this.page.$('[data-test-id="security_answer"]')
        if (!securityAnswerElement) return null
        const securityAnswer = await getElementTextContent(securityAnswerElement)
        return securityAnswer
      }
      case 'sendOn': {
        const sendOnElement = await this.page.$('[data-test-id="send_on"]')
        if (!sendOnElement) return null
        const sendOn = await getElementTextContent(sendOnElement)

        const sendOnExplorerBtnElement = await page.$('[data-test-id="send_explorer_btn"]')
        let sendOnExplorerLink
        if (sendOnExplorerBtnElement) {
          sendOnExplorerLink = await (await sendOnExplorerBtnElement.getProperty(
            'href'
          )).jsonValue()
        }
        return { sendOn, sendOnExplorerLink }
      }
      case 'receiveOn': {
        const receiveOnElement = await this.page.$('[data-test-id="receive_on"]')
        if (!receiveOnElement) return null
        const receiveOn = await getElementTextContent(receiveOnElement)

        const receiveOnExplorerBtnElement = await page.$('[data-test-id="receive_explorer_btn"]')
        let receiveOnExplorerLink
        if (receiveOnExplorerBtnElement) {
          receiveOnExplorerLink = await (await receiveOnExplorerBtnElement.getProperty(
            'href'
          )).jsonValue()
        }
        return { receiveOn, receiveOnExplorerLink }
      }
      case 'cancelOn': {
        const cancelOnElement = await this.page.$('[data-test-id="cancel_on"]')
        const cancelOn = await getElementTextContent(cancelOnElement)

        const cancelOnExplorerBtnElement = await page.$('[data-test-id="cancel_explorer_btn"]')
        let cancelOnExplorerLink
        if (cancelOnExplorerBtnElement) {
          cancelOnExplorerLink = await (await cancelOnExplorerBtnElement.getProperty(
            'href'
          )).jsonValue()
        }
        return { cancelOn, cancelOnExplorerLink }
      }
      case 'sendMessage': {
        const messageElement = await this.page.$('[data-test-id="send_msg"]')
        const message = await getElementTextContent(messageElement)
        return { message }
      }
      case 'cancelMessage': {
        const messageElement = await this.page.$('[data-test-id="cancel_msg"]')
        const message = await getElementTextContent(messageElement)
        return { message }
      }
      case 'receiveMessage': {
        const messageElement = await this.page.$('[data-test-id="receive_msg"]')
        const message = await getElementTextContent(messageElement)
        return { message }
      }
      case 'transferId': {
        const transferIdElement = await this.page.$('[data-test-id="transfer_id"]')
        const transferId = (await getElementTextContent(transferIdElement)).split(' ')[2]
        return { transferId }
      }
    }
  }

  async waitUntilReceiptLoaded () {
    await this.page.waitForSelector('[data-test-id="transfer_id"]', { visible: true })
  }

  async receiptCheck (transfer, userType) {
    const { state, receiverName, cryptoType } = transfer
    let platFormType = ''
    platFormType = getCryptoPlatformType(cryptoType)
    platFormType = platFormType.charAt(0).toUpperCase() + platFormType.substring(1)

    let expectedTitle
    let expectedMessageBoxContent
    let received
    let cancelled
    switch (state) {
      case transferStates.SEND_PENDING:
        expectedTitle = 'Payment Arranged'
        expectedMessageBoxContent =
          `${platFormType} network is processing your transaction. ` +
          `${receiverName} will receive an email notification to ` +
          `accept your payment shortly`
        break
      case transferStates.SEND_DIRECT_TRANSFER_PENDING:
        expectedTitle = 'Payment Arranged'
        expectedMessageBoxContent = `${platFormType} network is processing your transaction. `
        break
      case transferStates.SEND_FAILURE:
      case transferStates.SEND_DIRECT_TRANSFER_FAILURE:
        expectedTitle = 'Payment Delayed'
        expectedMessageBoxContent =
          'Your payment is experiencing longer than usual time to ' +
          'be processed by the network. To learn more, visit our Help Center.'
        break
      case transferStates.SEND_DIRECT_TRANSFER_CONFIRMED:
        expectedTitle = 'Payment Completed'
        break
      case transferStates.SEND_CONFIRMED_RECEIVE_PENDING:
      case transferStates.SEND_CONFIRMED_EXPIRED_RECEIVE_PENDING:
        if (userType === 'SENDER') {
          expectedTitle = 'Payment Sent'
          expectedMessageBoxContent = `An email notification was sent to ${receiverName} successfully.`
        } else {
          expectedTitle = 'Payment Accepted'
          expectedMessageBoxContent =
            'It may take some time to update your account balance. You can track the transaction here.'
        }
        received = true
        break
      case transferStates.SEND_CONFIRMED_RECEIVE_FAILURE:
        if (userType === 'SENDER') {
          expectedTitle = 'Payment Sent'
          expectedMessageBoxContent = `An email notification was sent to ${receiverName} successfully.`
        } else {
          expectedTitle = 'Accept Failed'
          expectedMessageBoxContent =
            'Something went wrong while sending your payment. ' +
            'You can track the transaction here. Please contact us for help.'
        }
        received = true
        break
      case transferStates.SEND_CONFIRMED_EXPIRED_RECEIVE_FAILURE:
        if (userType === 'SENDER') {
          expectedTitle = 'Payment Expired'
          expectedMessageBoxContent = `Payment has expired. Please reclaim the payment.`
          break
        } else {
          expectedTitle = 'Accept Failed'
          expectedMessageBoxContent =
            'Something went wrong while sending your payment. ' +
            'You can track the transaction here. Please contact us for help.'
        }
        received = true
        break
      case transferStates.SEND_CONFIRMED_RECEIVE_CONFIRMED:
      case transferStates.SEND_CONFIRMED_EXPIRED_RECEIVE_CONFIRMED:
        expectedTitle = 'Payment Completed'
        break
      case transferStates.SEND_CONFIRMED_RECEIVE_NOT_INITIATED:
        if (userType === 'SENDER') {
          expectedTitle = 'Payment Sent'
          expectedMessageBoxContent = `An email notification was sent to ${receiverName} successfully.`
        } else {
          expectedTitle = 'Pending to Receive'
        }
        break
      case transferStates.SEND_CONFIRMED_EXPIRED_RECEIVE_NOT_INITIATED:
        expectedTitle = 'Payment Expired'
        if (userType === 'SENDER') {
          expectedMessageBoxContent = `Payment has expired. Please reclaim the payment.`
        }
        break
      case transferStates.SEND_CONFIRMED_CANCEL_PENDING:
        expectedTitle = 'Payment Cancelled'
        if (userType === 'SENDER') {
          expectedMessageBoxContent =
            'It may take some time to update your account balance. You can track the transaction here.'
        }
        cancelled = true
        break
      case transferStates.SEND_CONFIRMED_EXPIRED_CANCEL_PENDING:
        if (userType === 'SENDER') {
          expectedTitle = 'Payment Reclaimed'
          expectedMessageBoxContent =
            'It may take some time to update your account balance. You can track the transaction here.'
        } else {
          expectedTitle = 'Payment Expired'
        }
        cancelled = true
        break
      case transferStates.SEND_CONFIRMED_CANCEL_CONFIRMED:
        expectedTitle = 'Payment Cancelled'
        cancelled = true
        break
      case transferStates.SEND_CONFIRMED_EXPIRED_CANCEL_CONFIRMED:
        if (userType === 'SENDER') {
          expectedTitle = 'Payment Reclaimed'
        } else {
          expectedTitle = 'Payment Expired'
        }
        cancelled = true
        break
      case transferStates.SEND_CONFIRMED_CANCEL_FAILURE:
        if (userType === 'SENDER') {
          expectedTitle = 'Cancel Failed'
          expectedMessageBoxContent =
            'Something went wrong while cancelling your payment. ' +
            'You can track the transaction here. Please contact us for help.'
        } else {
          expectedTitle = 'Payment Cancelled'
        }
        cancelled = true
        break
      case transferStates.SEND_CONFIRMED_EXPIRED_CANCEL_FAILURE:
        if (userType === 'SENDER') {
          expectedTitle = 'Reclaim Failed'
          expectedMessageBoxContent =
            'Something went wrong while reclaiming your payment. ' +
            'You can track the transaction here. Please contact us for help.'
        } else {
          expectedTitle = 'Payment Expired'
        }
        cancelled = true
        break
      default:
        throw new Error(`Unknown transfer state: ${state}`)
    }

    // title
    if (expectedTitle) {
      const title = await this.getReceiptFormInfo('title')
      expect(title).toEqual(expectedTitle)
    }
    if (expectedMessageBoxContent) {
      const messageBox = await this.getReceiptFormInfo('messageBox')
      expect(messageBox).toEqual(expectedMessageBoxContent)
    }

    const sender = await this.getReceiptFormInfo('sender')
    expect(sender.name).toEqual(transfer.senderName)
    expect(sender.email).toEqual(transfer.sender)

    const recipient = await this.getReceiptFormInfo('recipient')
    expect(recipient.name).toEqual(transfer.receiverName)
    expect(recipient.email).toEqual(transfer.destination)

    if (userType === 'SENDER') {
      const senderAccount = await this.getReceiptFormInfo('senderAccount')
      const receiptSenderAccount = JSON.parse(transfer.senderAccount)
      expect(senderAccount.walletType.toLowerCase()).toEqual(receiptSenderAccount.walletType)
      expect(senderAccount.platformType.toLowerCase()).toEqual(receiptSenderAccount.platformType)
      expect(senderAccount.address).toEqual(receiptSenderAccount.address)
    }
    if (userType === 'RECEIVER' && received) {
      const receiverAccount = await this.getReceiptFormInfo('receiverAccount')
      const receiptReceiverAccount = JSON.parse(transfer.receiverAccount)
      expect(receiverAccount.walletType.toLowerCase()).toEqual(receiptReceiverAccount.walletType)
      expect(receiverAccount.platformType.toLowerCase()).toEqual(
        receiptReceiverAccount.platformType
      )
      expect(receiverAccount.address).toEqual(receiptReceiverAccount.address)
    }

    const transferAmount = await this.getReceiptFormInfo('transferAmount')
    expect(transferAmount.transferAmount).toEqual(transfer.transferAmount)
    expect(transferAmount.currencyAmount).toEqual(transfer.transferFiatAmountSpot)
    expect(transferAmount.symbol).toEqual(getCryptoSymbol(transfer.cryptoType))

    const securityAnswer = await this.getReceiptFormInfo('securityAnswer')
    if (userType === 'SENDER') {
      expect(securityAnswer).toEqual(Base64.decode(transfer.password))
    } else {
      expect(securityAnswer).toBeNull()
    }

    const sendMessage = (await this.getReceiptFormInfo('sendMessage')).message
    expect(sendMessage).toEqual(transfer.sendMessage)
    const sendTime = (await this.getReceiptFormInfo('sendOn')).sendOn
    const expectSendTime = moment
      .unix(transfer.senderToChainsfer.txTimestamp)
      .format('MMM Do YYYY, HH:mm:ss')
    expect(sendTime).toEqual(`Sent on ${expectSendTime}`)

    const sendLink = (await this.getReceiptFormInfo('sendOn')).sendOnExplorerLink
    expect(sendLink).toEqual(`https://rinkeby.etherscan.io/tx/${transfer.senderToChainsfer.txHash}`)

    if (received) {
      const receiveMessage = (await this.getReceiptFormInfo('receiveMessage')).message
      expect(receiveMessage).toEqual(transfer.receiveMessage)
      const receiveTime = (await this.getReceiptFormInfo('receiveOn')).receiveOn
      const expectReceiveTime = moment
        .unix(transfer.chainsferToReceiver.txTimestamp)
        .format('MMM Do YYYY, HH:mm:ss')
      expect(receiveTime).toEqual(`Received on ${expectReceiveTime}`)

      const receiveLink = (await this.getReceiptFormInfo('receiveOn')).receiveOnExplorerLink
      expect(receiveLink).toEqual(
        `https://rinkeby.etherscan.io/tx/${transfer.chainsferToReceiver.txHash}`
      )
    }

    if (cancelled) {
      const cancelMessage = (await this.getReceiptFormInfo('cancelMessage')).message
      expect(cancelMessage).toEqual(transfer.cancelMessage)
      const cancelTime = (await this.getReceiptFormInfo('cancelOn')).cancelOn
      const expectCancelTime = moment
        .unix(transfer.chainsferToSender.txTimestamp)
        .format('MMM Do YYYY, HH:mm:ss')
      expect(cancelTime).toEqual(`Cancelled on ${expectCancelTime}`)

      const cancelLink = (await this.getReceiptFormInfo('cancelOn')).cancelOnExplorerLink
      expect(cancelLink).toEqual(
        `https://rinkeby.etherscan.io/tx/${transfer.chainsferToSender.txHash}`
      )
    }

    const { transferId } = await this.getReceiptFormInfo('transferId')
    if (userType === 'SENDER') {
      expect(transferId).toEqual(transfer.transferId)
    } else {
      expect(transferId).toEqual(transfer.receivingId)
    }
  }
}

export default ReceiptPage
