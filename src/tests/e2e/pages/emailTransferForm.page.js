import log from 'loglevel'
import { getWalletTitle } from '../../../wallet.js'
import { getPlatformTitle } from '../../../platforms'
import { getCryptoSymbol } from '../../../tokens.js'

log.setDefaultLevel('info')

class EmailTransferFormPage {
  async getGroupedAccountList () {}

  async getCoinList () {
    // This works only when the grouped account has been selected
    await this.openSelect('coin')

    let coinList = await page.$$eval(`[data-test-id^="crypto_list_item"]`, nodes => {
      return nodes.map(node => {
        return {
          cryptoSymbol: node.querySelector('[data-test-id="coin_symbol"]').textContent,
          balance: node.querySelector('[data-test-id="coin_balance"]').textContent,
          currencyBalance: node.querySelector('[data-test-id="coin_currency_balance"]').textContent
        }
      })
    })
    return coinList
  }

  async openSelect (field) {
    switch (field) {
      case 'recipient': {
        await page.click('#destination')
        break
      }
      case 'account': {
        await page.click('#groupedAccountSelection')
        break
      }
      case 'coin': {
        await page.click('#accountCryptoTypeSelection')
        break
      }
      default: {
        throw new Error('Invalid field')
      }
    }
    await page.waitFor(500) // select animation
  }

  async updateForm (field, values) {
    switch (field) {
      case 'recipient': {
        const { email } = values
        await this.openSelect('recipient')
        await page.click(`[data-test-id="recipient_list_item_${email}"]`)
        await page.waitFor(500) // select animation
        break
      }
      case 'account': {
        const { walletType, platformType } = values
        await this.openSelect('account')
        await page.click(`[data-test-id="grouped_account_item_${walletType}_${platformType}"]`)
        await page.waitFor(500) // select animation
        break
      }
      case 'coin': {
        const { cryptoType } = values
        await this.openSelect('coin')
        await page.click(`[data-test-id="crypto_list_item_${cryptoType}"]`)
        await page.waitFor(500) // select animation
        break
      }
      case 'currencyAmount': {
        const { currencyAmount } = values
        // click three times and backspace to clear any previous value
        await page.click('[data-test-id="currency_amount"]', { clickCount: 3 })
        await page.keyboard.press('Backspace')
        await page.keyboard.type(currencyAmount)
        break
      }
      case 'cryptoAmount': {
        const { cryptoAmount } = values
        // click three times and backspace to clear any previous value
        await page.click('[data-test-id="crypto_amount"]', { clickCount: 3 })
        await page.keyboard.press('Backspace')
        await page.keyboard.type(cryptoAmount)
        break
      }
      case 'securityAnswer': {
        const { securityAnswer } = values
        // click three times and backspace to clear any previous value
        await page.click('[data-test-id="security_answer"]', { clickCount: 3 })
        await page.keyboard.press('Backspace')
        await page.keyboard.type(securityAnswer)
        break
      }
      case 'sendMessage': {
        const { sendMessage } = values
        // click three times and backspace to clear any previous value
        await page.click('[data-test-id="send_msg"]', { clickCount: 3 })
        await page.keyboard.press('Backspace')
        await page.keyboard.type(sendMessage)
        break
      }
      default: {
        throw new Error('Invalid field')
      }
    }
  }

  async getTextFieldStatus (field) {
    let textFieldElement
    let helperTextElement
    let error
    let helperText
    switch (field) {
      case 'currencyAmount': {
        textFieldElement = await page.$('[data-test-id="currency_amount"]')
        helperTextElement = await page.$('#currencyAmount-helper-text')
        break
      }
      case 'cryptoAmount': {
        textFieldElement = await page.$('[data-test-id="crypto_amount"]')
        helperTextElement = await page.$('#cryptoAmount-helper-text')
        break
      }
      case 'securityAnswer': {
        textFieldElement = await page.$('[data-test-id="security_answer"]')
        helperTextElement = await page.$('#password-helper-text')
        break
      }
      case 'sendMessage': {
        textFieldElement = await page.$('#message-label')
        helperTextElement = await page.$('#message-helper-text')
        break
      }
      default: {
        throw new Error('Invalid field')
      }
    }

    error = (await (await textFieldElement.getProperty('className')).jsonValue()).includes(
      'Mui-error'
    )
    if (helperTextElement) {
      helperText = await (await helperTextElement.getProperty('textContent')).jsonValue()
    }
    return { error, helperText }
  }

  async formProceedable () {
    const continueBtnElement = await page.$('[data-test-id="continue"]')
    return !(await (await continueBtnElement.getProperty('disabled')).jsonValue())
  }

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
        const { walletType, platformType } = values
        let displayed = await page.$eval('#groupedAccountSelection', node => {
          if (!node || !node.querySelector('p') || !node.querySelector('span')) return null
          let displayedAccount = {}
          displayedAccount.name = node.querySelector('p').textContent
          let walletAndPlatform = node.querySelector('span').textContent.split(', ')
          displayedAccount.walletType = walletAndPlatform[0]
          displayedAccount.platformType = walletAndPlatform[1]
          return displayedAccount
        })
        if (!walletType || !platformType) {
          return !displayed
        } else {
          return (
            getWalletTitle(walletType) === displayed.walletType &&
            getPlatformTitle(platformType) === displayed.platformType
          )
        }
      }
      case 'coin': {
        const { address, cryptoType } = values
        let displayed = await page.$eval('#accountCryptoTypeSelection', node => {
          if (!node || !node.querySelector('p')) return null

          let displayedAccount = {}
          displayedAccount.cryptoSymbol = node.querySelector(
            '[data-test-id="coin_symbol"]'
          ).textContent
          displayedAccount.balance = node.querySelector('[data-test-id="coin_balance"]').textContent
          displayedAccount.currencyBalance = node.querySelector(
            '[data-test-id="coin_currency_balance"]'
          ).textContent
          return displayedAccount
        })
        let addressMatches = false
        if (displayed) {
          const addressElement = await page.$('[data-test-id="coin_address"]')
          const text = await (await addressElement.getProperty('textContent')).jsonValue()
          if (address) {
            addressMatches = address === text.split(' ')[1]
          } else {
            addressMatches = !!text.split(' ')[1]
          }
        }
        if (!cryptoType) {
          return !displayed
        } else {
          return (
            getCryptoSymbol(cryptoType) === displayed.cryptoSymbol &&
            displayed.balance &&
            displayed.currencyBalance &&
            addressMatches
          )
        }
      }
      case 'currencyAmount': {
        // use existOnly flag to check if the currencyAmount exist (without matching)
        const { currencyAmount, existOnly } = values

        const currencyAmountElement = await page.$('#curencyAmount')
        const value = await (await currencyAmountElement.getProperty('value')).jsonValue()
        if (existOnly) return !!value
        if (currencyAmount) {
          return currencyAmount === value
        }
        return !value
      }
      case 'cryptoAmount': {
        // use existOnly flag to check if the cryptoAmount exist (without matching)
        const { cryptoAmount, existOnly } = values

        const cryptoAmountElement = await page.$('#cryptoAmount')
        const value = await (await cryptoAmountElement.getProperty('value')).jsonValue()
        if (existOnly) return !!value
        if (cryptoAmount) {
          return cryptoAmount === value
        }
        return !value
      }
      case 'securityAnswer': {
        const { securityAnswer } = values

        const securityAnswerElement = await page.$('#password')
        const value = await (await securityAnswerElement.getProperty('value')).jsonValue()
        if (securityAnswer) {
          return securityAnswer === value
        }
        return !value
      }
      case 'sendMessage': {
        const { sendMsg } = values

        const sendMessageElement = await page.$('#message')
        const value = await (await sendMessageElement.getProperty('value')).jsonValue()
        if (sendMsg) {
          return sendMsg === value
        }
        return !value
      }
      default:
        throw new Error(`Invalid form field received: ${field}`)
    }
  }
}

export default EmailTransferFormPage
