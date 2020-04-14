import { getElementTextContent } from '../testUtils'
import log from 'loglevel'

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
      case 'description': {
        const titleElement = await this.page.$('[data-test-id="title"]')
        const title = await getElementTextContent(titleElement)
        return title
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
        return { securityAnswer }
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
}

export default ReceiptPage
