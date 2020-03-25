import log from 'loglevel'
import { getWalletTitle } from '../../../wallet.js'
import { getPlatformTitle } from '../../../platforms'
import { getCryptoSymbol } from '../../../tokens.js'

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
          displayedAccount.balance = node.querySelector(
            '[data-test-id="crypto_balance_in_select"]'
          ).textContent
          displayedAccount.currencyBalance = node.querySelector(
            '[data-test-id="currency_balance_in_select"]'
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
        const { currencyAmount } = values

        const cryptoTypeSelectionElement = await page.$('[data-test-id="currency_amount"]')
        const value = await (await accountSelectionElement.getProperty('value')).jsonValue()
        if (currencyAmount) {
          return currencyAmount === value
        }
        return !value
      }
      case 'cryptoAmount': {
        const { cryptoAmount } = values

        const cryptoTypeSelectionElement = await page.$('[data-test-id="crypto_amount"]')
        const value = await (await accountSelectionElement.getProperty('value')).jsonValue()
        if (cryptoAmount) {
          return cryptoAmount === value
        }
        return !value
      }
      case 'securityAnswer': {
        const { securityAnswer } = values
        
        const cryptoTypeSelectionElement = await page.$('[data-test-id="security_answer"]')
        const value = await (await accountSelectionElement.getProperty('value')).jsonValue()
        if (securityAnswer) {
          return securityAnswer === value
        }
        return !value
      }
      case 'send_msg': {
        const { sendMsg } = values

        const cryptoTypeSelectionElement = await page.$('[data-test-id="send_msg"]')
        const value = await (await accountSelectionElement.getProperty('value')).jsonValue()
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
