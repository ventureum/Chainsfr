import LoginPage from './pages/login.page'
import ReduxTracker from './utils/reduxTracker'
import DisconnectPage from './pages/disconnect.page'
import { sleep } from './testUtils'

const timeout = 180000

describe('Login and onboarding', () => {
  beforeEach(async () => {
    await jestPuppeteer.resetBrowser()
  })

  beforeAll(async () => {
    // setup interceptor
    await requestInterceptor.setRequestInterception(true)
  })

  afterAll(async () => {
    requestInterceptor.showStats()
    await jestPuppeteer.resetBrowser()
  })

  it(
    'Login normally as a returning user',
    async () => {
      await page.goto(process.env.E2E_TEST_URL, {
        waitUntil: 'networkidle0'
      })
      const loginPage = new LoginPage()
      const reduxTracker = new ReduxTracker()
      await Promise.all([
        reduxTracker.waitFor(
          [
            {
              action: {
                type: 'REGISTER_FULFILLED'
              }
            },
            {
              action: {
                type: 'POST_LOGIN_PREPARATION_FULFILLED'
              }
            },
            {
              action: {
                type: 'GET_CRYPTO_ACCOUNTS_FULFILLED'
              }
            }
          ],
          [
            // should not have any errors
            {
              action: {
                type: 'ENQUEUE_SNACKBAR',
                notification: {
                  options: {
                    variant: 'error'
                  }
                }
              }
            }
          ]
        ),
        loginPage.login(
          process.env.E2E_TEST_GOOGLE_LOGIN_USERNAME,
          process.env.E2E_TEST_GOOGLE_LOGIN_PASSWORD
        )
      ])
    },
    timeout
  )

  it(
    'Login as a new user',
    async () => {
      await page.goto(`${process.env.E2E_TEST_URL}/disconnect`)
      const loginPage = new LoginPage()
      await loginPage.login(
        process.env.E2E_TEST_GOOGLE_LOGIN_USERNAME,
        process.env.E2E_TEST_GOOGLE_LOGIN_PASSWORD
      )
      const disconnectPage = new DisconnectPage()
      await disconnectPage.disconnect()

      // reset browser
      await jestPuppeteer.resetBrowser()

      await page.goto(process.env.E2E_TEST_URL, {
        waitUntil: 'networkidle0'
      })
      // now test account is a new user
      const reduxTracker = new ReduxTracker()

      await Promise.all([
        reduxTracker.waitFor(
          [
            {
              action: {
                type: 'REGISTER_FULFILLED'
              }
            },
            {
              action: {
                type: 'POST_LOGIN_PREPARATION_FULFILLED'
              }
            },
            {
              action: {
                type: 'CLEAR_CLOUD_WALLET_CRYPTO_ACCOUNTS_FULFILLED'
              }
            },
            {
              action: {
                type: 'CREATE_CLOUD_WALLET_FULFILLED'
              }
            },
            {
              action: {
                type: 'GET_CRYPTO_ACCOUNTS_FULFILLED'
              }
            }
          ],
          [
            // should not have any errors
            {
              action: {
                type: 'ENQUEUE_SNACKBAR',
                notification: {
                  options: {
                    variant: 'error'
                  }
                }
              }
            }
          ],
          timeout
        ),
        loginPage.login(
          process.env.E2E_TEST_GOOGLE_LOGIN_USERNAME,
          process.env.E2E_TEST_GOOGLE_LOGIN_PASSWORD
        )
      ])
    },
    timeout
  )
})
