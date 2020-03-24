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

    const element = await page.$(`[data-test-id="send_from_btn"]`)
    console.log('element123', element)

    await page.click('[data-test-id="send_from_btn"]')
    // await expect(page).toClick('button', { text: 'Send' })
    console.log('clicked')
    // await page.waitFor(3000)
    // await Promise.all([
    //   page.click('[data-test-id="send_btn"]'),
    //   page.waitForNavigation({
    //     waitUntil: 'networkidle0'
    //   })
    // ])
  }
}

export default WalletPage
