import LoginPage from './pages/login.page'
import DisconnectPage from './pages/disconnect.page'
import { sleep } from './testUtils'

const timeout = 180000

describe('Login and onboarding', () => {
  beforeEach(async () => {
    await jestPuppeteer.resetBrowser()
  })

  afterAll(async () => {
    await jestPuppeteer.resetBrowser()
  })

  it(
    'Login normally as a returning user',
    async () => {
      await page.goto(process.env.E2E_TEST_URL)
      const loginPage = new LoginPage()
      await loginPage.login(
        process.env.E2E_TEST_GOOGLE_LOGIN_USERNAME,
        process.env.E2E_TEST_GOOGLE_LOGIN_PASSWORD
      )
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

      await page.goto(`${process.env.E2E_TEST_URL}`)
      // now test account is a new user
      await loginPage.login(
        process.env.E2E_TEST_GOOGLE_LOGIN_USERNAME,
        process.env.E2E_TEST_GOOGLE_LOGIN_PASSWORD
      )

    },
    timeout
  )
})
