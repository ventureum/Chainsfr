import pWaitFor from 'p-wait-for'
import log from 'loglevel'
log.setDefaultLevel('info')

const POPUP_REGEX = 'chrome-extension://[a-z]+/notification.html'
const METAMASK_PAGE_REGEX = 'chrome-extension://[a-z]+/home.html'
const TEST_PAGE = process.env.E2E_TEST_URL
class MetamaskPage {
  async _waitForPopup (open = true) {
    // wait until popup is open
    await pWaitFor(async () => {
      const pages = await browser.pages()
      const matched = pages.find(p => p.url().match(POPUP_REGEX))
      return open ? !!matched : !matched
    })
  }

  // sometimes, metamask stucks at loading screen
  // here is a hacky fix by refreshing the popup
  // see https://github.com/ventureum/Chainsfr/issues/1424
  // for details
  async fixHang (metamaskPage) {
    // check if metamask hangs
    let spinnerEle
    do {
      spinnerEle = await metamaskPage.$('#loading__spinner')
      if (spinnerEle) {
        log.info('Looks like metamask hangs, force refresh in popup')
        await metamaskPage.reload({ waitUntil: ['domcontentloaded'] })

        // recheck
        await page.waitFor(1000)
        log.info('rechecking if the popup still hangs...')
        spinnerEle = await metamaskPage.$('#loading__spinner')
        if (!spinnerEle) {
          log.info('Spinner is gone, problem resolved')
        } else {
          log.info('Still hangs, re-trying...')
        }
      }
    } while (spinnerEle)
  }

  // this is triggered by invoking metamask.enable()
  async connect () {
    await this._waitForPopup()
    const pages = await browser.pages()
    const metamaskPage = pages.find(p => p.url().match(POPUP_REGEX))

    if (metamaskPage) {
      await this.fixHang(metamaskPage)

      await Promise.all([
        expect(metamaskPage).toClick('button', { text: 'Connect' }),
        this._waitForPopup(false)
      ])
    }
    log.info('Metamask connected')
  }

  async approve (approveAllowance) {
    await this._waitForPopup()
    let pages = await browser.pages()
    let metamaskPage = pages.find(p => p.url().match(POPUP_REGEX))

    await this.fixHang(metamaskPage)

    // check if we need to connect
    const connectBtn = await metamaskPage.$(
      'button.button.btn-primary.btn--large.page-container__footer-button'
    )
    const btnText = await connectBtn.evaluate(e => e.innerText)
    if (btnText === 'Connect') {
      log.info('Need to approve connection first (first time connection)')
      await Promise.all([
        expect(metamaskPage).toClick('button', { text: 'Connect' }),
        this._waitForPopup(false)
      ])
    }

    if (approveAllowance) {
      log.info('Wait for allowance approval popup...')
      await this._waitForPopup()
      pages = await browser.pages()
      metamaskPage = pages.find(p => p.url().match(POPUP_REGEX))
      await this.fixHang(metamaskPage)

      log.info('Approving allowance in popup...')
      await Promise.all([
        expect(metamaskPage).toClick('button', { text: 'Confirm' }),
        this._waitForPopup(false)
      ])
    }

    log.info('Wait for tx approve popup...')
    await this._waitForPopup()
    pages = await browser.pages()
    metamaskPage = pages.find(p => p.url().match(POPUP_REGEX))
    await this.fixHang(metamaskPage)

    log.info('Approving tx in popup...')
    await Promise.all([
      expect(metamaskPage).toClick('button', { text: 'Confirm' }),
      this._waitForPopup(false)
    ])
    log.info('Tx approved')
  }
}

export default MetamaskPage
