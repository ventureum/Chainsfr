import { getElementTextContent } from '../testUtils'

class CancelReviewPage {
  /**
   * @param {Object} cancelPage - The designated page referrence,
   * use default current page if not provided.
   */
  constructor (cancelPage) {
    if (cancelPage) this.page = cancelPage
    else this.page = page
  }

  async dispatchFormActions (action) {
    if (action === 'review_cancel') {
      await this.page.click('[data-test-id="review_cancel_btn"]')
      await this.page.waitFor(500) // animation
    } else if (action === 'modal_cancel') {
      await Promise.all([
        this.page.click('[data-test-id="modal_cancel_btn"]'),
        this.page.waitForNavigation()
      ])
    } else if (action === 'showSenderAddress') {
      await this.page.click('[data-test-id="show_from_address_btn"]')
    } else {
      throw new Error(`Invalid action: ${action}`)
    }
  }

  async getReviewFormInfo (field) {
    switch (field) {
      case 'title': {
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
        const senderAccountNameElement = await this.page.$('[data-test-id="from_account_name"]')
        const accountWalletPlatformTypeElement = await this.page.$(
          '[data-test-id="from_wallet_platform"]'
        )
        const WalletPlatform = (await getElementTextContent(
          accountWalletPlatformTypeElement
        )).split(', ')

        await this.dispatchFormActions('showSenderAddress')
        const addressElement = await this.page.$('[data-test-id="from_address"]')
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
      case 'sendMessage': {
        const messageElement = await this.page.$('[data-test-id="send_msg"]')
        const message = await getElementTextContent(messageElement)
        return { message }
      }
    }
  }

  async waitUntilTransferLoaded () {
    await this.page.waitForSelector('[data-test-id="review_cancel_btn"]', { visible: true })
  }
}

export default CancelReviewPage
