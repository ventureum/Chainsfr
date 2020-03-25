import log from 'loglevel'
log.setDefaultLevel('info')

class AccountsManagementPage {
  async getAccountsList () {
    const accountsElementList = await page.$$('[data-test-id^="account_list_item"]')
    const accounts = await Promise.all(
      accountsElementList.map(async elementHandle => {
        const walletPlatformHandle = await elementHandle.$('[data-test-id="wallet_platform"]')
        const assetsHandle = await elementHandle.$('[data-test-id="assets_cell"]')
        const walletType = (
          await (await walletPlatformHandle.getProperty('textContent')).jsonValue()
        ).split(', ')[0]
        const platformType = (
          await (await walletPlatformHandle.getProperty('textContent')).jsonValue()
        ).split(', ')[1]
        let assets = await (await assetsHandle.getProperty('textContent')).jsonValue()
        while (!assets) {
          // ledger BTC takes time to sync
          assets = await (await assetsHandle.getProperty('textContent')).jsonValue()
          await page.waitFor(500)
        }
        return {
          walletType,
          platformType,
          assets
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
}

export default AccountsManagementPage
