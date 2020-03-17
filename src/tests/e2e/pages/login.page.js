import log from 'loglevel'
log.setDefaultLevel('info')

const runUntilEvaluateEquals = (fn, value, opts = {}) => {
  if (opts.interval === undefined) opts.interval = 500
  if (opts.comparator === undefined) opts.comparator = (a, b) => a === b
  return new Promise((resolve, reject) => {
    ;(function wait () {
      if (!opts.comparator(fn(), value)) {
        setTimeout(wait, opts.interval)
      } else {
        resolve()
      }
    })()
  })
}

const sleep = milliseconds => {
  return new Promise((resolve, reject) => {
    setTimeout(function () {
      resolve()
    }, milliseconds)
  })
}

class LoginPage {
  async login (username, password) {
    log.debug(username, password)
    // assume we are at login page
    await page.waitForFunction('document.querySelector("button")')
    await expect(page).toClick('button', { text: 'Sign in with Google' })
    var pageCount = 0
    await runUntilEvaluateEquals(function () {
      ;(async function () {
        pageCount = (await browser.pages()).length
      })()
      return pageCount
    }, 3)
    log.info('Popup opened')
    var browserPages = await browser.pages()
    var googleLoginPopup = browserPages.reduce(function (acc, curr) {
      if (curr.url().indexOf('google') !== -1) {
        return curr
      } else {
        return acc
      }
    })
    await googleLoginPopup.waitForFunction('document.querySelector("input")')
    log.info('Google login popup email field loaded')
    await sleep(1000)

    await googleLoginPopup.keyboard.type(username)
    await googleLoginPopup.keyboard.press('Enter')

    await googleLoginPopup.waitForFunction('document.querySelector("input")')
    log.info('Google login popup password field loaded')
    await sleep(1000)

    await googleLoginPopup.keyboard.type(password)
    await googleLoginPopup.keyboard.press('Enter')

    await page.waitForNavigation({
      waitUntil: 'networkidle0'
    })
    log.info('Login finished')
  }
}

export default LoginPage
