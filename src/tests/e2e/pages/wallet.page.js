import log from 'loglevel'
log.setDefaultLevel('info')

class WalletPage {
  async clickCrypto (cryptoType) {
    // const element = await page.$(`[data-test-id="crypto_list_item_${cryptoType}"]`)

    await Promise.all([
      // wait for drawer animation
      page.waitFor(1000),
      page.click(`[data-test-id="crypto_list_item_${cryptoType}"]`)
    ])
  }

  async sendFromCrypto (cryptoType) {
    await this.clickCrypto(cryptoType)
    await Promise.all([
      page.$eval('[data-test-id="send_from_btn"]', elem => elem.click()),
      page.waitForNavigation({
        waitUntil: 'networkidle0'
      })
    ])
  }
}

export default WalletPage
