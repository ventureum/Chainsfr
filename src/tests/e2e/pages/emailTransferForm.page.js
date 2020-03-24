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
        console.log('account', account)
        const accountSelectionElement = await page.$('[data-test-id="account_selection"]')

        // const value = await (await accountSelectionElement.getProperty('value')).jsonValue()
        // const value = JSON.stringify(await accountSelectionElement.getProperty('value'))
        // const properties = await accountSelectionElement.getProperties()
        // const value = properties.get('labelId')

        const jsHandle = await accountSelectionElement.getProperty('value')
        const value = await page.evaluate(value => {
          // console.log('in value', value)
          // await page.waitFor(10000)
          // return value.jsonValue()
          return value
        }, jsHandle)

        console.log('value', value)
        console.log('account value', Object.keys(value))
        console.log('account value', Object.values(value))
        console.log('account value', Object.entries(value))
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
