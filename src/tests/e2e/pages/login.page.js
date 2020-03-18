import log from 'loglevel'
import captcha from 'async-captcha'

const anticaptcha = new captcha(process.env.E2E_TEST_ANTICAPTCHA_API_KEY, 2, 10)
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
  async login (username, password, newUser) {
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

    while (true) {
      // solve captcha
      await sleep(1000)

      if (await googleLoginPopup.$('input[name=password]')) {
        log.info('Password input field found, proceed to type password')
        break
      }
      let captchaElementHandler = await googleLoginPopup.$('#captchaimg')
      if (captchaElementHandler) {
        log.info('Found captcha in login popup')
        // base64String contains the captcha image's base64 encoded version
        const base64String = await captchaElementHandler.screenshot({ encoding: 'base64' })
        log.info('Solving captcha...')
        const captchaCode = await anticaptcha.getResult(base64String)
        if (captchaCode) {
          log.info('Captcha solution: ' + captchaCode)
          await googleLoginPopup.keyboard.type(captchaCode)
          await googleLoginPopup.keyboard.press('Enter')
        } else {
          log.error('Unable to find captcha solution')
        }
      }
    }

    await googleLoginPopup.waitForFunction('document.querySelector("input")')
    log.info('Google login popup password field loaded')

    await googleLoginPopup.keyboard.type(password)
    await googleLoginPopup.keyboard.press('Enter')

    if (newUser) {
      // new user would get a authorization page
      await expect(page).toClick('button', { text: 'Allow' })
      await sleep(1000)
    }

    await expect(page).toMatchElement('p', { text: 'Loading...', timeout: 100000 })
    if (newUser) {
      // new user would get a authorization page
      await expect(page).toMatchElement('p', { text: 'Setting up your account...', timeout: 100000 })
      await expect(page).toMatchElement('p', { text: 'It won\'t take long.', timeout: 100000 })
    }

    log.info('loading page displayed')
    await page.waitForNavigation({
      waitUntil: 'networkidle0'
    })
    log.info('Login finished')
  }
}

export default LoginPage
