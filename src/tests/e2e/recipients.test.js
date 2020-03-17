const log = require('loglevel')
log.setDefaultLevel('debug')

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


const timeout = 180000

describe('Login and onboarding', () => {
  test('test', async () => {
    var pageLoading = page.goto('https://tim.serveo.ventureum.io')
    log.info('Opening login page')
    await pageLoading
    log.info('login page loaded')
    await sleep(5000)

    pageLoading.click('#googleLoginBtn')
    log.info('Ethereum enable button clicked')
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
    await sleep(3000)

    await googleLoginPopup.keyboard.type('timothy@ventureum.io')
    await googleLoginPopup.keyboard.press('Enter')

    await googleLoginPopup.waitForFunction('document.querySelector("input")')
    log.info('Google login popup password field loaded')
    await sleep(3000)

    await googleLoginPopup.keyboard.type('wjwsz001')
    await googleLoginPopup.keyboard.press('Enter')

  }, timeout)
})