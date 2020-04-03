import { getElementTextContent, getNewPopupPage } from '../testUtils'

class AccountsManagementPage {
  async getAccountsList () {
    const accountsElementList = await page.$$('[data-test-id^="account_list_item"]')
    const accounts = await Promise.all(
      accountsElementList.map(async elementHandle => {
        const walletPlatformHandle = await elementHandle.$('[data-test-id="wallet_platform"]')
        const assetsHandle = await elementHandle.$('[data-test-id="assets_cell"]')
        const walletType = (await getElementTextContent(walletPlatformHandle)).split(', ')[0]
        const platformType = (await getElementTextContent(walletPlatformHandle)).split(', ')[1]
        const name = await getElementTextContent(
          await elementHandle.$('[data-test-id="account_name"]')
        )
        let assets = await getElementTextContent(assetsHandle)
        while (!assets) {
          // ledger BTC takes time to sync
          assets = await getElementTextContent(assetsHandle)
          await page.waitFor(500)
        }
        return {
          walletType,
          platformType,
          assets,
          name
        }
      })
    )
    return accounts
  }

  async expandAccountListItem (accountIndex) {
    await page.click(`[data-test-id="account_list_item_${accountIndex}"]`)
  }

  async sendFromAccount (accountIndex) {
    await this.expandAccountListItem(accountIndex)
    await Promise.all([
      page.$eval('[data-test-id="send_from_account_btn"]', elem => elem.click()),
      page.waitForNavigation({
        waitUntil: 'networkidle0'
      })
    ])
  }

  async deleteAccounts (accountIndex) {
    await this.expandAccountListItem(accountIndex)
    await page.$eval('[data-test-id="delete_account_btn"]', elem => elem.click())
    await page.waitFor(500) // animation
    await page.$eval('[data-test-id="delete_confirm_btn"]', elem => elem.click())
  }

  async changeAccountsName (accountIndex, newName) {
    await this.expandAccountListItem(accountIndex)
    await page.$eval('[data-test-id="edit_account_btn"]', elem => elem.click())
    await page.waitFor(500) // animation

    await page.click('[data-test-id="new_name_text_field"]')
    await page.keyboard.type(newName)
    await page.$eval('[data-test-id="rename_confirm_btn"]', elem => elem.click())
  }

  async addMetaMaskAccount (name) {
    await page.click('[data-test-id="connect_account_btn"]')
    await page.waitFor(500) // animation
    await page.click('[data-test-id="wallet_item_metamask"]')
    const metamaskPopUp = await getNewPopupPage(browser, async () => {
      await page.click('[data-test-id="authorize_btn"]')
    })
    await expect(metamaskPopUp).toClick('button', { text: 'Connect', timeout: 10000 })
    await expect(page).toMatch('Metamask connected', { timeout: 10000 })
    // click three times and backspace to clear any default value
    await page.click('[data-test-id="new_accounts_name_text_field"]', { clickCount: 3 })
    await page.keyboard.press('Backspace')
    await page.keyboard.type(name)
    await page.click('[data-test-id="save_btn"]')
  }

  async showAccountQRCode (accountIndex) {
    await this.expandAccountListItem(accountIndex)
    await page.$eval('[data-test-id="address_qr_code"]', elem => elem.click())
    await page.waitFor(500) // animation
    const qrCodeElement = await page.$('[data-test-id="qr_code_img"]')
    const address = await getElementTextContent(await page.$('[data-test-id="qr_code_img"]'))
    return { qrCodeElement, address }
  }

  async closeQRCodeModal () {
    await page.click('[data-test-id="close_qr_code"]')
    await page.waitFor(500) // animation
  }
}

export default AccountsManagementPage
