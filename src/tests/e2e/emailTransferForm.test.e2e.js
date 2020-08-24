import AccountsPage from './pages/accounts.page'
import LandingPage from './pages/landing.page'
import recipientPage from './pages/recipients.page'
import EmailTransferFormPage from './pages/emailTransferForm.page'
import WalletPage from './pages/wallet.page'
import LoginPage from './pages/login.page'
import ReduxTracker from './utils/reduxTracker'
import { resetUserDefault } from './utils/reset.js'

const timeout = 180000

async function fillForm (formInfo) {
  const {
    formPage,
    recipient,
    walletType,
    platformType,
    cryptoType,
    currencyAmount,
    cryptoAmount,
    securityAnswer,
    sendMessage
  } = formInfo
  const reduxTracker = new ReduxTracker()

  await formPage.updateForm('recipient', { email: recipient })
  expect(await formPage.formProceedable()).toBe(false)

  await formPage.updateForm('account', { walletType: walletType, platformType: platformType })
  expect(await formPage.formProceedable()).toBe(false)

  await formPage.updateForm('coin', { cryptoType: cryptoType })
  expect(await formPage.formProceedable()).toBe(false)

  await Promise.all([
    reduxTracker.waitFor(
      [
        {
          action: {
            type: 'GET_TX_COST_FULFILLED'
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
    currencyAmount
      ? formPage.updateForm('currencyAmount', { currencyAmount: currencyAmount })
      : formPage.updateForm('cryptoAmount', { cryptoAmount: cryptoAmount })
  ])
  expect(await formPage.formProceedable()).toBe(false)

  await formPage.updateForm('securityAnswer', { securityAnswer: securityAnswer })
  expect(await formPage.formProceedable()).toBe(true)

  await formPage.updateForm('sendMessage', { sendMessage: sendMessage })
  expect(await formPage.formProceedable()).toBe(true)
}

describe('Email transfer form tests', () => {
  beforeAll(async () => {
    await resetUserDefault()
    await jestPuppeteer.resetBrowser()

    // setup interceptor
    await requestInterceptor.setRequestInterception(true)

    await page.goto(process.env.E2E_TEST_URL, {
      waitUntil: 'networkidle0'
    })
    // login to app
    const loginPage = new LoginPage()
    await loginPage.login(
      process.env.E2E_TEST_GOOGLE_LOGIN_USERNAME,
      process.env.E2E_TEST_GOOGLE_LOGIN_PASSWORD,
      true
    )
  }, timeout)

  beforeEach(async () => {
    await page.goto(`${process.env.E2E_TEST_URL}/send`, {
      waitUntil: 'networkidle0'
    })
  })

  afterAll(async () => {
    requestInterceptor.showStats()
    await jestPuppeteer.resetBrowser()
  })

  it(
    'Fill everything correctly (Ethereum)',
    async () => {
      const emtPage = new EmailTransferFormPage()
      const recipient = 'alice@gmail.com'
      const walletType = 'metamask'
      const platformType = 'ethereum'
      const cryptoType = 'ethereum'

      await fillForm({
        formPage: emtPage,
        recipient: recipient,
        walletType: walletType,
        platformType: platformType,
        cryptoType: cryptoType,
        currencyAmount: '1',
        securityAnswer: '123456',
        sendMessage: 'nothing'
      })

      // should have no error
      expect(await emtPage.formInputFieldToBe('recipient', { email: recipient })).toBe(true)
      expect(
        await emtPage.formInputFieldToBe('account', {
          walletType: walletType,
          platformType: platformType
        })
      ).toBe(true)
      expect(
        await emtPage.formInputFieldToBe('coin', {
          cryptoType: cryptoType
        })
      ).toBe(true)
      expect((await emtPage.getTextFieldStatus('currencyAmount')).error).toBe(false)
      expect((await emtPage.getTextFieldStatus('cryptoAmount')).error).toBe(false)
      expect((await emtPage.getTextFieldStatus('securityAnswer')).error).toBe(false)
      expect((await emtPage.getTextFieldStatus('sendMessage')).error).toBe(false)
    },
    timeout
  )

  it(
    'Fill everything correctly (DAI)',
    async () => {
      const emtPage = new EmailTransferFormPage()
      const recipient = 'timothy@ventureum.io'
      const walletType = 'metamask'
      const platformType = 'ethereum'
      const cryptoType = 'dai'

      await fillForm({
        formPage: emtPage,
        recipient: recipient,
        walletType: walletType,
        platformType: platformType,
        cryptoType: cryptoType,
        currencyAmount: '1',
        securityAnswer: '123456',
        sendMessage: 'nothing'
      })

      // should have no error
      expect(await emtPage.formInputFieldToBe('recipient', { email: recipient })).toBe(true)
      expect(
        await emtPage.formInputFieldToBe('account', {
          walletType: walletType,
          platformType: platformType
        })
      ).toBe(true)
      expect(
        await emtPage.formInputFieldToBe('coin', {
          cryptoType: cryptoType
        })
      ).toBe(true)
      expect((await emtPage.getTextFieldStatus('currencyAmount')).error).toBe(false)
      expect((await emtPage.getTextFieldStatus('cryptoAmount')).error).toBe(false)
      expect((await emtPage.getTextFieldStatus('securityAnswer')).error).toBe(false)
      expect((await emtPage.getTextFieldStatus('sendMessage')).error).toBe(false)
    },
    timeout
  )

  it(
    'Fill everything correctly (Bitcoin)',
    async () => {
      const emtPage = new EmailTransferFormPage()
      const recipient = 'bob@gmail.com'
      const walletType = 'ledger'
      const platformType = 'bitcoin'
      const cryptoType = 'bitcoin'

      await fillForm({
        formPage: emtPage,
        recipient: recipient,
        walletType: walletType,
        platformType: platformType,
        cryptoType: cryptoType,
        cryptoAmount: '0.001',
        securityAnswer: '123456',
        sendMessage: 'nothing'
      })

      // should have no error
      expect(await emtPage.formInputFieldToBe('recipient', { email: recipient })).toBe(true)
      expect(
        await emtPage.formInputFieldToBe('account', {
          walletType: walletType,
          platformType: platformType
        })
      ).toBe(true)
      expect(
        await emtPage.formInputFieldToBe('coin', {
          cryptoType: cryptoType
        })
      ).toBe(true)
      expect((await emtPage.getTextFieldStatus('currencyAmount')).error).toBe(false)
      expect((await emtPage.getTextFieldStatus('cryptoAmount')).error).toBe(false)
      expect((await emtPage.getTextFieldStatus('securityAnswer')).error).toBe(false)
      expect((await emtPage.getTextFieldStatus('sendMessage')).error).toBe(false)
    },
    timeout
  )

  it(
    'Ethereum account should have 5 coins',
    async () => {
      const emtPage = new EmailTransferFormPage()
      const walletType = 'metamask'
      const platformType = 'ethereum'

      await emtPage.updateForm('account', { walletType: walletType, platformType: platformType })
      const coinList = await emtPage.getCoinList()
      expect(coinList.length).toEqual(5)
    },
    timeout
  )

  it(
    'Bitcoin account should have one coin',
    async () => {
      const emtPage = new EmailTransferFormPage()
      const walletType = 'ledger'
      const platformType = 'bitcoin'

      await emtPage.updateForm('account', { walletType: walletType, platformType: platformType })
      const coinList = await emtPage.getCoinList()
      expect(coinList.length).toEqual(1)
    },
    timeout
  )

  it(
    'Transfer amount error tests',
    async () => {
      const emtPage = new EmailTransferFormPage()
      const reduxTracker = new ReduxTracker()
      const recipient = 'alice@gmail.com'
      const walletType = 'metamask'
      const platformType = 'ethereum'
      const cryptoType = 'ethereum'
      const LARGE_AMOUNT = '99999999'

      await emtPage.updateForm('recipient', { email: recipient })
      await emtPage.updateForm('account', { walletType: walletType, platformType: platformType })
      await emtPage.updateForm('coin', { cryptoType: cryptoType })

      // amount > balance
      await emtPage.updateForm('currencyAmount', { currencyAmount: LARGE_AMOUNT })
      // check
      expect(await emtPage.formInputFieldToBe('cryptoAmount', { existOnly: true })).toBe(true)
      expect((await emtPage.getTextFieldStatus('cryptoAmount')).error).toBe(true)
      expect((await emtPage.getTextFieldStatus('cryptoAmount')).helperText).toMatch(
        /Exceed your balance of/
      )

      // amount < 0.001
      await emtPage.updateForm('currencyAmount', { currencyAmount: '0' })
      expect(await emtPage.formInputFieldToBe('cryptoAmount', { existOnly: true })).toBe(true)
      expect((await emtPage.getTextFieldStatus('cryptoAmount')).error).toBe(true)
      expect((await emtPage.getTextFieldStatus('cryptoAmount')).helperText).toMatch(
        /The amount must be greater than 0.001/
      )

      // amount is invalid
      await emtPage.updateForm('currencyAmount', { currencyAmount: '.' })
      expect(await emtPage.formInputFieldToBe('currencyAmount', { existOnly: true })).toBe(true)
      expect((await emtPage.getTextFieldStatus('currencyAmount')).error).toBe(true)
      expect((await emtPage.getTextFieldStatus('currencyAmount')).helperText).toMatch(
        /Please enter a valid amount/
      )
    },
    timeout
  )

  it(
    'send message === security answer error tests',
    async () => {
      const emtPage = new EmailTransferFormPage()
      const reduxTracker = new ReduxTracker()
      const recipient = 'alice@gmail.com'
      const walletType = 'metamask'
      const platformType = 'ethereum'
      const cryptoType = 'ethereum'

      await emtPage.updateForm('recipient', { email: recipient })
      await emtPage.updateForm('account', { walletType: walletType, platformType: platformType })
      await emtPage.updateForm('coin', { cryptoType: cryptoType })
      await emtPage.updateForm('currencyAmount', { currencyAmount: '1' })
      await emtPage.updateForm('securityAnswer', { securityAnswer: '123456' })
      await emtPage.updateForm('sendMessage', { sendMessage: '123456' })

      expect((await emtPage.getTextFieldStatus('sendMessage')).error).toBe(true)
      expect((await emtPage.getTextFieldStatus('sendMessage')).helperText).toMatch(
        /Message cannot contain words from the security answer/
      )

      await emtPage.updateForm('sendMessage', { sendMessage: 'abc' })
      expect((await emtPage.getTextFieldStatus('sendMessage')).error).toBe(false)
    },
    timeout
  )

  it(
    'short security answer error ',
    async () => {
      const emtPage = new EmailTransferFormPage()
      const reduxTracker = new ReduxTracker()
      const recipient = 'alice@gmail.com'
      const walletType = 'metamask'
      const platformType = 'ethereum'
      const cryptoType = 'ethereum'

      await emtPage.updateForm('recipient', { email: recipient })
      await emtPage.updateForm('account', { walletType: walletType, platformType: platformType })
      await emtPage.updateForm('coin', { cryptoType: cryptoType })
      await emtPage.updateForm('currencyAmount', { currencyAmount: '1' })
      await emtPage.updateForm('securityAnswer', { securityAnswer: '1' })

      expect((await emtPage.getTextFieldStatus('securityAnswer')).error).toBe(true)
      expect((await emtPage.getTextFieldStatus('securityAnswer')).helperText).toMatch(
        /Length must be greater or equal than 6/
      )

      await emtPage.updateForm('securityAnswer', { securityAnswer: '123456789' })

      expect((await emtPage.getTextFieldStatus('securityAnswer')).error).toBe(false)
      expect((await emtPage.getTextFieldStatus('securityAnswer')).helperText).toMatch(
        /What's Security Answer?/
      )
    },
    timeout
  )
})
