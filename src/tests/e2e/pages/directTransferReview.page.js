import { getElementTextContent } from '../testUtils'

class DirectTransferReviewPage {
  async dispatchFormActions (action) {
    if (action === 'continue') {
      await Promise.all([
        page.click('[data-test-id="continue"]'),
        page.waitForNavigation({
          waitUntil: 'networkidle0'
        })
      ])
    } else if (action === 'back') {
      await Promise.all([
        page.click('[data-test-id="back"]'),
        page.waitForNavigation({
          waitUntil: 'networkidle0'
        })
      ])
    } else if (action === 'showSenderAddress') {
      await page.click('[data-test-id="show_from_address_btn"]')
    } else if (action === 'showReceiverAddress') {
      await page.click('[data-test-id="show_to_address_btn"]')
    } else {
      throw new Error(`Invalid action: ${action}`)
    }
  }

  async getReviewFormInfo (field) {
    switch (field) {
      case 'title': {
        const titleElement = await page.$('[data-test-id="title"]')
        const title = await getElementTextContent(titleElement)
        return title
      }
      case 'senderAccount': {
        const senderAccountNameElement = await page.$('[data-test-id="from_account_name"]')
        const accountWalletPlatformTypeElement = await page.$(
          '[data-test-id="from_wallet_platform"]'
        )
        const WalletPlatform = (
          await getElementTextContent(accountWalletPlatformTypeElement)
        ).split(', ')

        await this.dispatchFormActions('showSenderAddress')
        const addressElement = await page.$('[data-test-id="from_address"]')
        const address = await getElementTextContent(addressElement)

        const name = await getElementTextContent(senderAccountNameElement)
        const walletType = WalletPlatform[0]
        const platformType = WalletPlatform[1]
        return { name, walletType, platformType, address }
      }
      case 'receiverAccount': {
        const senderAccountNameElement = await page.$('[data-test-id="to_account_name"]')
        const accountWalletPlatformTypeElement = await page.$('[data-test-id="to_wallet_platform"]')
        const WalletPlatform = (
          await getElementTextContent(accountWalletPlatformTypeElement)
        ).split(', ')

        await this.dispatchFormActions('showSenderAddress')
        const addressElement = await page.$('[data-test-id="to_address"]')
        const address = await getElementTextContent(addressElement)

        const name = await getElementTextContent(senderAccountNameElement)
        const walletType = WalletPlatform[0]
        const platformType = WalletPlatform[1]
        return { name, walletType, platformType, address }
      }
      case 'transferAmount': {
        const transferAmountElement = await page.$('[data-test-id="transfer_amount"]')
        const currencyAmountElement = await page.$('[data-test-id="currency_amount"]')
        const transferAmount = (await getElementTextContent(transferAmountElement)).split(' ')[0]
        const symbol = (await getElementTextContent(transferAmountElement)).split(' ')[1]
        const currencyAmount = (await getElementTextContent(currencyAmountElement)).split(' ')[2]
        return { transferAmount, currencyAmount, symbol }
      }
      case 'txFee': {
        const txFeeElement = await page.$('[data-test-id="tx_fee"]')
        const currencyTxFeeElement = await page.$('[data-test-id="currency_tx_fee"]')
        const txFee = (await getElementTextContent(txFeeElement)).split(' ')[0]
        const symbol = (await getElementTextContent(txFeeElement)).split(' ')[1]
        const currencyTxFee = (await getElementTextContent(currencyTxFeeElement)).split(' ')[2]
        return { txFee, currencyTxFee, symbol }
      }
      case 'securityAnswer': {
        const securityAnswerElement = await page.$('[data-test-id="security_answer"]')
        const securityAnswer = await getElementTextContent(securityAnswerElement)
        return { securityAnswer }
      }
      case 'sendMessage': {
        const messageElement = await page.$('[data-test-id="send_msg"]')
        const message = await getElementTextContent(messageElement)
        return { message }
      }
    }
  }
}

export default SendReviewPage
