import queryString from 'query-string'
import log from 'loglevel'
log.setDefaultLevel('info')

class EmailTransferFormPage {
  async formInputFieldToBe (field, values = {}) {
    switch (field) {
      case 'recipient': {
        const { email } = values
        const recipientSelectElement = await page.$('[data-test-id="destination"]')
        const value = await (await recipientSelectElement.getProperty('value')).jsonValue()
        if (!email) {
          return !value
        } else {
          return value === email
        }
      }
      case 'account': {
        const { account } = values
        const accountSelectionElement = await page.$('[data-test-id="account_selection"]')
        const value = await (await accountSelectionElement.getProperty('value')).jsonValue()
        console.log('account value', value)
        if (!account) {
          return !value
        } else {
          return account === value
        }
      }
      case 'coin': {
        const cryptoTypeSelectionElement = await page.$('[data-test-id="crypto_selection"]')
        const value = await (await accountSelectionElement.getProperty('value')).jsonValue()
        console.log('crypto value', value)
        return !value
      }
      case 'currencyAmount': {
        const cryptoTypeSelectionElement = await page.$('[data-test-id="currency_amount"]')
        const value = await (await accountSelectionElement.getProperty('value')).jsonValue()
        console.log('currency value', value)
        return !value
      }
      case 'cryptoAmount': {
        const cryptoTypeSelectionElement = await page.$('[data-test-id="crypto_amount"]')
        const value = await (await accountSelectionElement.getProperty('value')).jsonValue()
        console.log('crypto value', value)
        return !value
      }
      case 'securityAnswer': {
        const cryptoTypeSelectionElement = await page.$('[data-test-id="security_answer"]')
        const value = await (await accountSelectionElement.getProperty('value')).jsonValue()
        console.log('security value', value)
        return !value
      }
      case 'send_msg': {
        const cryptoTypeSelectionElement = await page.$('[data-test-id="send_msg"]')
        const value = await (await accountSelectionElement.getProperty('value')).jsonValue()
        console.log('send msg value', value)
        return !value
      }
      default:
        throw new Error(`Invalid form field received: ${field}`)
    }
  }
}

export default EmailTransferFormPage
