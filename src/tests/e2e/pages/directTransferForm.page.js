import ReduxTracker from '../utils/reduxTracker'

export default class DirectTransferFormPage {
  async dispatchFormActions (action) {
    if (action === 'continue') {
      await Promise.all([
        page.click('[data-test-id="continue"]'),
        page.waitForNavigation()
      ])
    } else if (action === 'back') {
      await Promise.all([
        page.click('[data-test-id="back"]'),
        page.waitForNavigation()
      ])
    } else if (action === 'transferIn') {
      await page.click('[data-test-id="transfer_in"]')
      await page.waitFor(500) // animation
    } else if (action === 'transferOut') {
      await page.click('[data-test-id="transfer_out"]')
      await page.waitFor(500) // animation
    } else {
      throw new Error(`Invalid action: ${action}`)
    }
  }

  async openSelect (field) {
    switch (field) {
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
        let syncing = !!(await page.$('[data-test-id="syncing"]'))
        while (syncing) {
          syncing = !!(await page.$('[data-test-id="syncing"]'))
          await page.waitFor(500) // check later
        }
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
    let text
    switch (field) {
      case 'currencyAmount': {
        textFieldElement = await page.$('[data-test-id="currency_amount"]')
        helperTextElement = await page.$('#currencyAmount-helper-text')
        const cryptoAmountElement = await page.$('#currencyAmount')
        text = await (await cryptoAmountElement.getProperty('value')).jsonValue()
        break
      }
      case 'cryptoAmount': {
        textFieldElement = await page.$('[data-test-id="crypto_amount"]')
        helperTextElement = await page.$('#cryptoAmount-helper-text')
        const cryptoAmountElement = await page.$('#cryptoAmount')
        text = await (await cryptoAmountElement.getProperty('value')).jsonValue()
        break
      }
      case 'sendMessage': {
        textFieldElement = await page.$('#message-label')
        helperTextElement = await page.$('#message-helper-text')
        const cryptoAmountElement = await page.$('#message')
        text = await (await cryptoAmountElement.getProperty('value')).jsonValue()
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
    return { error, helperText, text }
  }

  async getSelectStatus (selectName) {
    switch (selectName) {
      case 'account': {
        let displayed = await page.$eval('#groupedAccountSelection', node => {
          if (!node || !node.querySelector('p') || !node.querySelector('span')) return null
          let displayedAccount = {}
          displayedAccount.name = node.querySelector('p').textContent
          let walletAndPlatform = node.querySelector('span').textContent.split(', ')
          displayedAccount.walletType = walletAndPlatform[0]
          displayedAccount.platformType = walletAndPlatform[1]
          return displayedAccount
        })
        return displayed
      }
      case 'coin': {
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
        if (displayed) {
          const addressElement = await page.$('[data-test-id="coin_address"]')
          const text = await (await addressElement.getProperty('textContent')).jsonValue()
          displayed.address = text.split(' ')[1]
        }
        return displayed
      }
      case 'drive': {
        let displayed = await page.$eval('#mockDriveWalletSelect', node => {
          if (!node || !node.querySelector('p')) return null

          let displayedAccount = {}
          displayedAccount.name = node.querySelector(
            '[data-test-id="drive_wallet_name"]'
          ).textContent
          displayedAccount.title = node.querySelector(
            '[data-test-id="drive_wallet_title"]'
          ).textContent
          return displayedAccount
        })
        const labelElement = await page.$('[data-test-id="drive_wallet_label"]')
        displayed.label = await (await labelElement.getProperty('textContent')).jsonValue()
        return displayed
      }
    }
  }

  async getAccountSwitchStatus () {
    let selected = ''
    const transferInBtn = await page.$('[data-test-id="transfer_in"]')
    const transferOutBtn = await page.$('[data-test-id="transfer_out"]')
    if (
      (await (await transferInBtn.getProperty('className')).jsonValue()).includes('Mui-selected')
    ) {
      selected = 'transferIn'
    }
    if (
      (await (await transferOutBtn.getProperty('className')).jsonValue()).includes('Mui-selected')
    ) {
      selected = 'transferOut'
    }
    return selected
  }

  async formProceedable () {
    const continueBtnElement = await page.$('[data-test-id="continue"]')
    return !(await (await continueBtnElement.getProperty('disabled')).jsonValue())
  }

  async fillForm (formInfo, checkError = false) {
    const {
      walletType,
      platformType,
      cryptoType,
      currencyAmount,
      cryptoAmount,
      sendMessage
    } = formInfo

    const reduxTracker = new ReduxTracker()

    await this.updateForm('account', { walletType: walletType, platformType: platformType })
    if (checkError) expect(await this.formProceedable()).toBe(false)

    await this.updateForm('coin', { cryptoType: cryptoType })
    if (checkError) expect(await this.formProceedable()).toBe(false)

    if (currencyAmount) {
      if (checkError) {
        await Promise.all([
          reduxTracker.waitFor(
            [
              {
                action: {
                  type: 'GET_TX_COST_FULFILLED'
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
          this.updateForm('currencyAmount', { currencyAmount: currencyAmount })
        ])
      } else {
        await this.updateForm('currencyAmount', { currencyAmount: currencyAmount })
      }
    }

    if (cryptoAmount) {
      if (checkError) {
        await Promise.all([
          reduxTracker.waitFor(
            [
              {
                action: {
                  type: 'GET_TX_COST_FULFILLED'
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
          this.updateForm('cryptoAmount', { cryptoAmount: cryptoAmount })
        ])
      } else {
        await this.updateForm('cryptoAmount', { cryptoAmount: cryptoAmount })
      }
    }

    if (sendMessage) {
      await this.updateForm('sendMessage', { sendMessage: sendMessage })
      if (checkError) expect(await this.formProceedable()).toBe(true)
    }
  }
}
