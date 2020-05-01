import { getElementTextContent } from '../testUtils'

class ReceiveFormPage {
  /**
   * @param {Object} receivePage - The designated page referrence,
   * use default current page if not provided.
   */
  constructor (receivePage) {
    if (receivePage) this.page = receivePage
    else this.page = page
  }

  async dispatchFormActions (action) {
    if (action === 'validate') {
      await this.page.click('[data-test-id="validate_btn"]')
    } else if (action === 'deposit') {
      await Promise.all([
        this.page.click('[data-test-id="deposit_btn"]'),
        this.page.waitForNavigation()
      ])
    } else {
      throw new Error(`Invalid action: ${action}`)
    }
  }

  async getFormInfo (field) {
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
      case 'transferAmount': {
        const transferAmountElement = await this.page.$('[data-test-id="transfer_amount"]')
        const currencyAmountElement = await this.page.$('[data-test-id="currency_amount"]')
        const transferAmount = (await getElementTextContent(transferAmountElement)).split(' ')[0]
        const symbol = (await getElementTextContent(transferAmountElement)).split(' ')[1]
        const currencyAmount = (await getElementTextContent(currencyAmountElement)).split(' ')[1]
        return { transferAmount, currencyAmount, symbol }
      }
      case 'sendMessage': {
        const messageElement = await this.page.$('[data-test-id="send_msg"]')
        const message = await getElementTextContent(messageElement)
        return { message }
      }
      case 'transferId': {
        const transferIdElement = await this.page.$('[data-test-id="transfer_id"]')
        const transferId = (await getElementTextContent(transferIdElement)).split(' ')[2]
        return { transferId }
      }
      case 'sendOn': {
        const sendOnElement = await this.page.$('[data-test-id="send_on"]')
        if (!sendOnElement) return null
        const sendOn = await getElementTextContent(sendOnElement)
        return { sendOn }
      }
    }
  }

  async enterSecurityAnswer (securityAnswer) {
    // click three times and backspace to clear any previous value
    await page.click('[data-test-id="security_answer"]', { clickCount: 3 })
    await page.keyboard.press('Backspace')
    await page.keyboard.type(securityAnswer)
  }

  async getSecurityAnswerTextFieldStatus () {
    const textFieldElement = await page.$('[data-test-id="security_answer"]')
    const helperTextElement = await page.$('#answer-helper-text')
    const inputTextElement = await page.$('#answer')
    const text = await (await inputTextElement.getProperty('value')).jsonValue()
    const error = (await (await textFieldElement.getProperty('className')).jsonValue()).includes(
      'Mui-error'
    )
    let helperText
    if (helperTextElement) {
      helperText = await (await helperTextElement.getProperty('textContent')).jsonValue()
    }
    return { error, helperText, text }
  }

  async waitUntilTransferLoaded () {
    await this.page.waitForSelector('[data-test-id="title"]', {
      visible: true
    })
  }

  async selectAccount (walletType, platformType) {
    await page.click('#groupedAccountSelection')
    await page.waitFor(500) // select animation
    await page.click(`[data-test-id="grouped_account_item_${walletType}_${platformType}"]`)
    await page.waitFor(500) // select animation
  }
}

export default ReceiveFormPage
