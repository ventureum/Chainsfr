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
    await jestPuppeteer.resetBrowser()

    // setup interceptor
    await requestInterceptor.setRequestInterception(true)

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
    requestInterceptor.showStats()
    await jestPuppeteer.resetBrowser()
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
      await page.goto(`${process.env.E2E_TEST_URL}/contacts`, { waitUntil: 'networkidle0' })
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

  it(
    'Prefill recipient, account and transferCurrencyAmount',
    async () => {
      const WALLET_TYPE = 'metamask'
      const PLATFORM_TYPE = 'ethereum'
      const CRYPTO_TYPE = 'ethereum'
      const DESTINATION = 'alice@gmail.com'
      const RECEIVER_NAME = 'alice'
      const TRANSFER_CURRENCY_AMOUNT = '1'
      await page.goto(
        `${process.env.E2E_TEST_URL}/send?walletSelection=${WALLET_TYPE}` +
          `&cryptoType=${CRYPTO_TYPE}` +
          `&platformType=${PLATFORM_TYPE}` +
          `&destination=${DESTINATION}` +
          `&receiverName=${RECEIVER_NAME}` +
          `&transferCurrencyAmount=${TRANSFER_CURRENCY_AMOUNT}`,
        {
          waitUntil: 'networkidle0'
        }
      )

      const emtPage = new EmailTransferFormPage()
      expect(await emtPage.formInputFieldToBe('recipient', { email: DESTINATION })).toBe(true)
      expect(
        await emtPage.formInputFieldToBe('account', {
          walletType: WALLET_TYPE,
          platformType: PLATFORM_TYPE
        })
      ).toBe(true)
      expect(
        await emtPage.formInputFieldToBe('coin', {
          cryptoType: CRYPTO_TYPE
        })
      ).toBe(true)
      expect(
        await emtPage.formInputFieldToBe('currencyAmount', {
          currencyAmount: TRANSFER_CURRENCY_AMOUNT
        })
      ).toBe(true)
      expect(
        await emtPage.formInputFieldToBe('cryptoAmount', {
          existOnly: true
        })
      ).toBe(true)
    },
    timeout
  )

  it(
    'Prefill recipient, account and transferAmount',
    async () => {
      const WALLET_TYPE = 'metamask'
      const PLATFORM_TYPE = 'ethereum'
      const CRYPTO_TYPE = 'ethereum'
      const DESTINATION = 'alice@gmail.com'
      const RECEIVER_NAME = 'alice'
      const TRANSFER_AMOUNT = '0.1'
      await page.goto(
        `${process.env.E2E_TEST_URL}/send?walletSelection=${WALLET_TYPE}` +
          `&cryptoType=${CRYPTO_TYPE}` +
          `&platformType=${PLATFORM_TYPE}` +
          `&destination=${DESTINATION}` +
          `&receiverName=${RECEIVER_NAME}` +
          `&transferAmount=${TRANSFER_AMOUNT}`,
        {
          waitUntil: 'networkidle0'
        }
      )

      const emtPage = new EmailTransferFormPage()
      expect(await emtPage.formInputFieldToBe('recipient', { email: DESTINATION })).toBe(true)
      expect(
        await emtPage.formInputFieldToBe('account', {
          walletType: WALLET_TYPE,
          platformType: PLATFORM_TYPE
        })
      ).toBe(true)
      expect(
        await emtPage.formInputFieldToBe('coin', {
          cryptoType: CRYPTO_TYPE
        })
      ).toBe(true)
      expect(
        await emtPage.formInputFieldToBe('currencyAmount', {
          existOnly: true
        })
      ).toBe(true)
      expect(
        await emtPage.formInputFieldToBe('cryptoAmount', {
          cryptoAmount: TRANSFER_AMOUNT
        })
      ).toBe(true)
    },
    timeout
  )
})
