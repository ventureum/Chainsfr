import { sleep, runUntilEvaluateEquals, getNewPopupPage, getElementTextContent } from '../testUtils'

class LandingPage {
  async startEmailTransfer () {
    await Promise.all([page.waitForNavigation(), page.click('[data-test-id="emt_btn"]')])
    expect(page.url()).toEqual(`${process.env.E2E_TEST_URL}/send`)
  }

  async navigateToOverview () {
    if (page.url() === `${process.env.E2E_TEST_URL}`) {
      await page.click('#Overview-NavBtn')
      expect(page.url()).toEqual(`${process.env.E2E_TEST_URL}`)
    } else {
      await Promise.all([page.waitForNavigation(), page.click('[data-test-id="overview_nav_btn"]')])
      expect(page.url()).toEqual(`${process.env.E2E_TEST_URL}/`)
    }
  }

  async navigateToAccounts () {
    await Promise.all([page.waitForNavigation(), page.click('[data-test-id="cya_btn"]')])
    expect(page.url()).toEqual(`${process.env.E2E_TEST_URL}/accounts`)

    await Promise.all([page.waitForNavigation(), page.click('[data-test-id="accounts_nav_btn"]')])
    expect(page.url()).toEqual(`${process.env.E2E_TEST_URL}/accounts`)
  }

  async navigateToContacts () {
    await Promise.all([page.waitForNavigation(), page.click('[data-test-id="contacts_nav_btn"]')])
    expect(page.url()).toEqual(`${process.env.E2E_TEST_URL}/contacts`)
  }

  async navigateToWallet () {
    await Promise.all([page.waitForNavigation(), page.click('[data-test-id="wallet_nav_btn"]')])
    expect(page.url()).toEqual(`${process.env.E2E_TEST_URL}/wallet`)
  }

  async clickHelpCenter () {
    let pagesBeforeOpen = await browser.pages()
    await expect(page).toClick('a', { text: 'Help Center' })
    var pageCount = 0
    await runUntilEvaluateEquals(function () {
      ;(async function () {
        pageCount = (await browser.pages()).length
      })()
      return pageCount
    }, pagesBeforeOpen.length + 1)

    const browserPages = await browser.pages()
    const newPopup = browserPages.reduce(function (acc, curr) {
      if (!pagesBeforeOpen.includes(curr)) {
        return curr
      } else {
        return acc
      }
    })
    expect(newPopup.url()).toEqual(process.env.REACT_APP_FAQ_URL)
  }

  async checkCopyRight () {
    const element = await page.$('[data-test-id="copy_right"]')
    const text = await (await element.getProperty('textContent')).jsonValue()
    // note that there is no space between "2020" and "Ventureum"
    expect(text).toEqual(`© 2018-${new Date().getFullYear()}Ventureum Inc.`)
  }

  async checkBuild () {
    const element = await page.$('[data-test-id="build_version"]')
    const text = await (await element.getProperty('textContent')).jsonValue()
    expect(text).toMatch(/Build/)
  }

  async checkEmailTransferTitle () {
    const element = await page.$('[data-test-id="emt_title"]')
    const text = await (await element.getProperty('textContent')).jsonValue()
    expect(text).toEqual('Email Transfer')
  }

  async checkEmailTransferTitleSubtitle () {
    const element = await page.$('[data-test-id="emt_subtitle"]')
    const text = await (await element.getProperty('textContent')).jsonValue()
    expect(text).toEqual('Send Crypto payments to any Email address. No more cryptic address.')
  }

  async checkEmptyImg () {
    const element = await page.$('[data-test-id="empty_img"]')
    expect(element.getProperty('src')).toEqual(expect.anything())
  }

  async checkVideoEmbed () {
    const element = await page.$('[data-test-id="video_embed"]')
    const src = await (await element.getProperty('src')).jsonValue()
    expect(src).toEqual('https://www.youtube.com/embed/TeHbsQ0-wmM')
  }

  async expandTxHistoryItem (index) {
    await page.$eval(`[data-test-id="tx_history_${index}"]`, elem => elem.click())
    await page.waitFor(500) // animation
  }

  async cancelTx (txIndex) {
    await page.click(`[data-test-id="cancel_btn_${txIndex}"]`)
  }

  async waitUntilTransferHistoryLoaded () {
    while (true) {
      const loading = await page.waitForSelector('[data-test-id="tx_history_loading"]', {
        hidden: true
      })
      if (loading === null) break
      await page.waitFor(200)
    }
  }
}

export default LandingPage
