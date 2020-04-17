import log from 'loglevel'
import captcha from 'async-captcha'
import { sleep, runUntilEvaluateEquals, getNewPopupPage } from '../testUtils'

const anticaptcha = new captcha(process.env.E2E_TEST_ANTICAPTCHA_API_KEY, 2, 10)
log.setDefaultLevel('info')

class LoginPage {
  async login (username, password, mockLogin = false) {
    log.debug(username, password)
    // assume we are at login page
    // close cookie consent
    await expect(page).toClick('button', { text: 'Accept' })
    if (!mockLogin) {
      // default to treat every login as a new user
      let newUser = true

      const googleLoginPromise = async () => {
        const googleLoginPopup = await getNewPopupPage(browser, async () => {
          await expect(page).toClick('button', { text: 'Sign in with Google' })
        })

        await googleLoginPopup.waitForFunction('document.querySelector("input")')
        log.info('Google login popup email field loaded')
        await sleep(1000)

        await googleLoginPopup.keyboard.type(username)
        await googleLoginPopup.keyboard.press('Enter')
        while (true) {
          // solve captcha
          await sleep(2000)
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
        log.info('password entered')

        try {
          await sleep(3000)
          // new user would get a authorization page
          await expect(googleLoginPopup).toClick('span', { text: 'Allow', timeout: 3000 })
        } catch (e) {
          // this is not a new user if authorization screen is not displayed
          newUser = false
        }
      }

      await Promise.all([googleLoginPromise(), page.waitForSelector('[data-test-id="loading"]')])

      if (newUser) {
        // new user would get a authorization page
        await expect(page).toMatchElement('p', {
          text: 'Setting up your account...',
          timeout: 10000
        })
        await expect(page).toMatchElement('p', { text: "It won't take long.", timeout: 10000 })
        log.info('setting up chainsfr wallet accounts displayed')
      }

      log.info('loading page displayed')
    } else {
      await expect(page).toClick('button', { text: 'Sign in with Google' })
    }
    await page.waitForNavigation({
      waitUntil: 'networkidle0'
    })
    log.info('Login finished')
  }
}

export default LoginPage
