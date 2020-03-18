import LoginPage from './pages/login.page'
import DisconnectPage from './pages/disconnect.page'
const timeout = 180000

describe('Login and onboarding', () => {
  beforeAll(async () => {
    await page.goto(process.env.E2E_TEST_URL)
  })

  // it(
  //   'Login normally as a returning user',
    
  //   async () => {
  //     const loginPage = new LoginPage()
  //     await loginPage.login(
  //       process.env.E2E_TEST_GOOGLE_LOGIN_USERNAME,
  //       process.env.E2E_TEST_GOOGLE_LOGIN_PASSWORD
  //     )
  //   },
  //   timeout
  // )

  it(
    'Login normally as a new user',
    async () => {
      // first login to disconnect page to delete cloud wallet
      await page.goto(`${process.env.E2E_TEST_URL}/disconnect`)
      const loginPage = new LoginPage()
      await loginPage.login(
        process.env.E2E_TEST_GOOGLE_LOGIN_USERNAME,
        process.env.E2E_TEST_GOOGLE_LOGIN_PASSWORD
      )
      const disconnectPage = new DisconnectPage()
      await disconnectPage.disconnect()

      // await jestPuppeteer.resetPage()
      // await context.close()
      await jestPuppeteer.resetBrowser(true)

      await page.goto(`${process.env.E2E_TEST_URL}`)
      // now test account is a new user
      await loginPage.login(
        process.env.E2E_TEST_GOOGLE_LOGIN_USERNAME,
        process.env.E2E_TEST_GOOGLE_LOGIN_PASSWORD,
        true // new user flag
      )
    },
    timeout
  )
})
