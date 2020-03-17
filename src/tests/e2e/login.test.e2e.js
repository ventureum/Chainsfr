import LoginPage from './pages/login.page'

const timeout = 180000

describe('Login and onboarding', () => {
  beforeAll(async () => {
    await page.goto(process.env.E2E_TEST_URL)
  })

  it(
    'Login normally',
    async () => {
      const loginPage = new LoginPage()
      await loginPage.login(
        process.env.E2E_TEST_GOOGLE_LOGIN_USERNAME,
        process.env.E2E_TEST_GOOGLE_LOGIN_PASSWORD
      )
    },
    timeout
  )
})
