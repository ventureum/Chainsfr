class MetamaskPage {
  constructor () {
    new Promise((resolve, reject) => {
      browser.on('targetcreated', async target => {
        if (target.url().match('chrome-extension://')) {
          try {
            console.log('found page')
            const page = await target.page()
            resolve(page)
          } catch (e) {
            reject(e)
          }
        }
      })
    }).then(page => (this.metamaskPage = page))
  }

  async approve () {
    await this.metamaskPage.bringToFront()
    const confirmButtonSelector =
      'button.button.btn-primary.btn--large.page-container__footer-button'

    const button = await this.metamaskPage.waitFor(confirmButtonSelector)
    await button.click()
  }
}

export default MetamaskPage
