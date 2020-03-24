import LandingPage from './pages/landing.page'
import RecipientPage from './pages/recipients.page'
import EmailTransferFormPage from './pages/emailTransferForm.page'
import WalletPage from './pages/wallet.page'
import LoginPage from './pages/login.page'

const timeout = 180000

describe('Email transfer form entry point tests', () => {
  beforeAll(async () => {
    await page.goto(process.env.E2E_TEST_URL)
    // login to app
    const loginPage = new LoginPage()
    await loginPage.login(
      process.env.E2E_TEST_GOOGLE_LOGIN_USERNAME,
      process.env.E2E_TEST_GOOGLE_LOGIN_PASSWORD,
      true
    )
  }, timeout)

  afterAll(async () => {
    await jestPuppeteer.resetBrowser()
  })

  afterEach(async () => {
    await page.goto(process.env.E2E_TEST_URL)
  })

  // it(
  //   'Landing page entry',
  //   async () => {
  //     const landingPage = new LandingPage()
  //     await landingPage.startEmailTransfer()
  //     const emtPage = new EmailTransferFormPage()
  //     // every field should be empty
  //     expect(await emtPage.formInputFieldToBe('recipient', { email: null })).toBe(true)
  //     expect(await emtPage.formInputFieldToBe('account', { account: null })).toBe(true)
  //   },
  //   timeout
  // )

  // it(
  //   'Recipients page entry',
  //   async () => {
  //     await Promise.all([
  //       page.waitForNavigation({
  //         waitUntil: 'networkidle0'
  //       }),
  //       page.goto(`${process.env.E2E_TEST_URL}/contacts`)
  //     ])
  //     // await page.waitFor(1000)
  //     const recipientPage = new RecipientPage()
  //     const recipients = await recipientPage.getRecipientList()
  //     let recipient = {}
  //     // assume there is at least one recipient
  //     if (recipients.length >= 1) {
  //       recipient = recipients[0]
  //       await page.click(`[data-test-id="send_to_recipient_${recipient.email}"]`)
  //     }

  //     const emtPage = new EmailTransferFormPage()
  //     //  field should be empty
  //     expect(await emtPage.formInputFieldToBe('recipient', { email: recipient.email })).toBe(true)
  //     expect(await emtPage.formInputFieldToBe('account', { account: null })).toBe(true)
  //   },
  //   timeout
  // )

  it(
    'Chainsfr wallet entry',
    async () => {
      await Promise.all([
        page.waitForNavigation({
          waitUntil: 'networkidle0'
        }),
        page.goto(`${process.env.E2E_TEST_URL}/wallet`)
      ])

      const walletPage = new WalletPage()
      await walletPage.sendFromCrypto('ethereum')
      const emtPage = new EmailTransferFormPage()
      //  field should be empty
      await page.waitFor(2000)
      // expect(await emtPage.formInputFieldToBe('recipient', { email: null })).toBe(true)
      // expect(await emtPage.formInputFieldToBe('account', { account: null })).toBe(true)
    },
    timeout
  )
})
