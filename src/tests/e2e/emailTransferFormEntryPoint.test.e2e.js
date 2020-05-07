import AccountsPage from './pages/accounts.page'
import LandingPage from './pages/landing.page'
import RecipientPage from './pages/recipients.page'
import EmailTransferFormPage from './pages/emailTransferForm.page'
import WalletPage from './pages/wallet.page'
import LoginPage from './pages/login.page'
import queryString from 'query-string'
import { resetUserDefault } from './utils/reset.js'

const timeout = 180000

describe('Email transfer form entry point tests', () => {
  beforeAll(async () => {
    await resetUserDefault()
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

  it(
    'Landing page entry',
    async () => {
      const landingPage = new LandingPage()
      await landingPage.startEmailTransfer()
      const emtPage = new EmailTransferFormPage()
      // every field should be empty
      expect(await emtPage.formInputFieldToBe('recipient', { email: null })).toBe(true)
      expect(await emtPage.formInputFieldToBe('account', { account: null })).toBe(true)
    },
    timeout
  )

  it(
    'Recipients page entry',
    async () => {
      await Promise.all([
        page.waitForNavigation({
          waitUntil: 'networkidle0'
        }),
        page.goto(`${process.env.E2E_TEST_URL}/contacts`)
      ])
      // await page.waitFor(1000)
      const recipientPage = new RecipientPage()
      const recipients = await recipientPage.getRecipientList()
      let recipient = {}
      // assume there is at least one recipient
      if (recipients.length >= 1) {
        recipient = recipients[0]
        await page.click(`[data-test-id="send_to_recipient_${recipient.email}"]`)
      }

      const emtPage = new EmailTransferFormPage()
      expect(await emtPage.formInputFieldToBe('recipient', { email: recipient.email })).toBe(true)
      expect(await emtPage.formInputFieldToBe('account', { account: null })).toBe(true)
    },
    timeout
  )

  it(
    'Chainsfr wallet entry (ethereum)',
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

      const search = page.url().split('?')[1]
      const urlParams = queryString.parse(search)
      expect(await emtPage.formInputFieldToBe('recipient', { email: null })).toBe(true)
      expect(
        await emtPage.formInputFieldToBe('account', {
          walletType: urlParams.walletSelection,
          platformType: urlParams.platformType
        })
      ).toBe(true)
      expect(
        await emtPage.formInputFieldToBe('coin', {
          address: urlParams.addresss,
          cryptoType: urlParams.cryptoType
        })
      ).toBe(true)
    },
    timeout
  )

  it(
    'Chainsfr wallet entry (dai)',
    async () => {
      await Promise.all([
        page.waitForNavigation({
          waitUntil: 'networkidle0'
        }),
        page.goto(`${process.env.E2E_TEST_URL}/wallet`)
      ])

      const walletPage = new WalletPage()
      await walletPage.sendFromCrypto('dai')
      const emtPage = new EmailTransferFormPage()

      const search = page.url().split('?')[1]
      const urlParams = queryString.parse(search)
      expect(await emtPage.formInputFieldToBe('recipient', { email: null })).toBe(true)
      expect(
        await emtPage.formInputFieldToBe('account', {
          walletType: urlParams.walletSelection,
          platformType: urlParams.platformType
        })
      ).toBe(true)
      expect(
        await emtPage.formInputFieldToBe('coin', {
          address: urlParams.addresss,
          cryptoType: urlParams.cryptoType
        })
      ).toBe(true)
    },
    timeout
  )

  it(
    'Chainsfr wallet entry (bitcoin)',
    async () => {
      await Promise.all([
        page.waitForNavigation({
          waitUntil: 'networkidle0'
        }),
        page.goto(`${process.env.E2E_TEST_URL}/wallet`)
      ])

      const walletPage = new WalletPage()
      await walletPage.sendFromCrypto('bitcoin')
      const emtPage = new EmailTransferFormPage()

      const search = page.url().split('?')[1]
      const urlParams = queryString.parse(search)
      expect(await emtPage.formInputFieldToBe('recipient', { email: null })).toBe(true)
      expect(
        await emtPage.formInputFieldToBe('account', {
          walletType: urlParams.walletSelection,
          platformType: urlParams.platformType
        })
      ).toBe(true)
      expect(
        await emtPage.formInputFieldToBe('coin', {
          cryptoType: urlParams.cryptoType
        })
      ).toBe(true)
    },
    timeout
  )

  it(
    'Accounts management entry (ethereum multiple coins)',
    async () => {
      await Promise.all([
        page.waitForNavigation({
          waitUntil: 'networkidle0'
        }),
        page.goto(`${process.env.E2E_TEST_URL}/connections`)
      ])
      const accountPage = new AccountsPage()
      const accounts = await accountPage.getAccountsList()
      const index = accounts.findIndex(
        account =>
          account.walletType === 'Metamask' &&
          account.platformType === 'Ethereum' &&
          account.assets === 'Multiple Coins'
      )

      await accountPage.sendFromAccount(index)

      const emtPage = new EmailTransferFormPage()
      expect(await emtPage.formInputFieldToBe('recipient', { email: null })).toBe(true)
      expect(
        await emtPage.formInputFieldToBe('account', {
          walletType: accounts[index].walletType.toLowerCase(),
          platformType: accounts[index].platformType.toLowerCase()
        })
      ).toBe(true)
      // multiple coin leave coin selection unfilled.
      expect(await emtPage.formInputFieldToBe('coin', {})).toBe(true)
    },
    timeout
  )

  it(
    'Accounts management entry (bitcoin)',
    async () => {
      await Promise.all([
        page.waitForNavigation({
          waitUntil: 'networkidle0'
        }),
        page.goto(`${process.env.E2E_TEST_URL}/connections`)
      ])
      const accountPage = new AccountsPage()
      const accounts = await accountPage.getAccountsList()
      const index = accounts.findIndex(account => account.platformType === 'Bitcoin')

      await accountPage.sendFromAccount(index)

      const emtPage = new EmailTransferFormPage()
      expect(await emtPage.formInputFieldToBe('recipient', { email: null })).toBe(true)
      expect(
        await emtPage.formInputFieldToBe('account', {
          walletType: accounts[index].walletType.toLowerCase(),
          platformType: accounts[index].platformType.toLowerCase()
        })
      ).toBe(true)
      expect(
        await emtPage.formInputFieldToBe('coin', {
          cryptoType: accounts[index].platformType.toLowerCase()
        })
      ).toBe(true)
    },
    timeout
  )
})
