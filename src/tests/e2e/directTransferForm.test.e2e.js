import LoginPage from './pages/login.page'
import DirectTransferFormPage from './pages/directTransferForm.page'
import { resetUserDefault } from './utils/reset.js'
import { getCryptoSymbol } from '../../tokens'

const timeout = 180000

describe('Direct transfer form tests', () => {
  beforeAll(async () => {
    await resetUserDefault()

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

  beforeEach(async () => {
    await page.goto(`${process.env.E2E_TEST_URL}/directTransfer`)
  })

  it(
    'Transfer in/out switch',
    async () => {
      const dtfPage = new DirectTransferFormPage()

      // default should be transfer out
      expect(await dtfPage.getAccountSwitchStatus()).toEqual('transferOut')
      let driveSelect = await dtfPage.getSelectStatus('drive')
      expect(driveSelect.label).toEqual('From')
      expect(driveSelect.name).toEqual('Wallet')
      expect(driveSelect.title).toEqual('Chainsfr')

      // switch to transfer in
      await dtfPage.dispatchFormActions('transferIn')
      expect(await dtfPage.getAccountSwitchStatus()).toEqual('transferIn')
      driveSelect = await dtfPage.getSelectStatus('drive')
      expect(driveSelect.label).toEqual('To')
      expect(driveSelect.name).toEqual('Wallet')
      expect(driveSelect.title).toEqual('Chainsfr')
    },
    timeout
  )

  it(
    'Transfer ETH into Drive',
    async () => {
      const walletType = 'metamask'
      const platformType = 'ethereum'
      const cryptoType = 'ethereum'
      const currencyAmount = '1'
      const sendMessage = 'bilibilibalaboom'

      const dtfPage = new DirectTransferFormPage()

      await dtfPage.dispatchFormActions('transferIn')
      await dtfPage.fillForm(
        { walletType, platformType, cryptoType, currencyAmount, sendMessage },
        true
      )

      const driveSelect = await dtfPage.getSelectStatus('drive')
      expect(driveSelect.label).toEqual('To')
      expect(driveSelect.name).toEqual('Wallet')
      expect(driveSelect.title).toEqual('Chainsfr')

      const accountSelect = await dtfPage.getSelectStatus('account')
      expect(accountSelect.walletType.toLowerCase()).toEqual(walletType)
      expect(accountSelect.platformType.toLowerCase()).toEqual(platformType)

      const coinSelect = await dtfPage.getSelectStatus('coin')
      expect(coinSelect.cryptoSymbol).toEqual(getCryptoSymbol(cryptoType))
      expect(parseFloat(coinSelect.balance)).toBeGreaterThan(0)
      expect(parseFloat(coinSelect.currencyBalance)).toBeGreaterThan(0)
      expect(coinSelect.address).toBeDefined()

      const cryptoAmountTextField = await dtfPage.getTextFieldStatus('cryptoAmount')
      expect(parseFloat(cryptoAmountTextField.text)).toBeGreaterThan(0)

      const currencyAmountTextField = await dtfPage.getTextFieldStatus('currencyAmount')
      expect(currencyAmountTextField.text).toEqual(currencyAmount)

      await dtfPage.dispatchFormActions('continue')
      expect(page.url()).toMatch('step=1')
    },
    timeout
  )

  it(
    'Transfer DAI into Drive',
    async () => {
      const walletType = 'metamask'
      const platformType = 'ethereum'
      const cryptoType = 'dai'
      const currencyAmount = '1'
      const sendMessage = 'bilibilibalaboom'

      const dtfPage = new DirectTransferFormPage()

      await dtfPage.dispatchFormActions('transferIn')
      await dtfPage.fillForm(
        { walletType, platformType, cryptoType, currencyAmount, sendMessage },
        true
      )

      const driveSelect = await dtfPage.getSelectStatus('drive')
      expect(driveSelect.label).toEqual('To')
      expect(driveSelect.name).toEqual('Wallet')
      expect(driveSelect.title).toEqual('Chainsfr')

      const accountSelect = await dtfPage.getSelectStatus('account')
      expect(accountSelect.walletType.toLowerCase()).toEqual(walletType)
      expect(accountSelect.platformType.toLowerCase()).toEqual(platformType)

      const coinSelect = await dtfPage.getSelectStatus('coin')
      expect(coinSelect.cryptoSymbol).toEqual(getCryptoSymbol(cryptoType))
      expect(parseFloat(coinSelect.balance)).toBeGreaterThan(0)
      expect(parseFloat(coinSelect.currencyBalance)).toBeGreaterThan(0)
      expect(coinSelect.address).toBeDefined()

      const cryptoAmountTextField = await dtfPage.getTextFieldStatus('cryptoAmount')
      expect(parseFloat(cryptoAmountTextField.text)).toBeGreaterThan(0)

      const currencyAmountTextField = await dtfPage.getTextFieldStatus('currencyAmount')
      expect(currencyAmountTextField.text).toEqual(currencyAmount)

      await dtfPage.dispatchFormActions('continue')
      expect(page.url()).toMatch('step=1')
    },
    timeout
  )

  it(
    'Transfer BTC into Drive',
    async () => {
      const walletType = 'ledger'
      const platformType = 'bitcoin'
      const cryptoType = 'bitcoin'
      const currencyAmount = '10'
      const sendMessage = 'bilibilibalaboom'

      const dtfPage = new DirectTransferFormPage()

      await dtfPage.dispatchFormActions('transferIn')
      await dtfPage.fillForm(
        { walletType, platformType, cryptoType, currencyAmount, sendMessage },
        true
      )

      const driveSelect = await dtfPage.getSelectStatus('drive')
      expect(driveSelect.label).toEqual('To')
      expect(driveSelect.name).toEqual('Wallet')
      expect(driveSelect.title).toEqual('Chainsfr')

      const accountSelect = await dtfPage.getSelectStatus('account')
      expect(accountSelect.walletType.toLowerCase()).toEqual(walletType)
      expect(accountSelect.platformType.toLowerCase()).toEqual(platformType)

      const coinSelect = await dtfPage.getSelectStatus('coin')
      expect(coinSelect.cryptoSymbol).toEqual(getCryptoSymbol(cryptoType))
      expect(parseFloat(coinSelect.balance)).toBeGreaterThan(0)
      expect(parseFloat(coinSelect.currencyBalance)).toBeGreaterThan(0)
      expect(coinSelect.address).toBeDefined()

      const cryptoAmountTextField = await dtfPage.getTextFieldStatus('cryptoAmount')
      expect(parseFloat(cryptoAmountTextField.text)).toBeGreaterThan(0)

      const currencyAmountTextField = await dtfPage.getTextFieldStatus('currencyAmount')
      expect(currencyAmountTextField.text).toEqual(currencyAmount)

      await dtfPage.dispatchFormActions('continue')
      expect(page.url()).toMatch('step=1')
    },
    timeout
  )

  it(
    'Transfer BTC from Drive',
    async () => {
      const walletType = 'ledger'
      const platformType = 'bitcoin'
      const cryptoType = 'bitcoin'
      const currencyAmount = '10'
      const sendMessage = 'bilibilibalaboom'

      const dtfPage = new DirectTransferFormPage()

      await dtfPage.fillForm(
        { walletType, platformType, cryptoType, currencyAmount, sendMessage },
        true
      )

      const driveSelect = await dtfPage.getSelectStatus('drive')
      expect(driveSelect.label).toEqual('From')
      expect(driveSelect.name).toEqual('Wallet')
      expect(driveSelect.title).toEqual('Chainsfr')

      const accountSelect = await dtfPage.getSelectStatus('account')
      expect(accountSelect.walletType.toLowerCase()).toEqual(walletType)
      expect(accountSelect.platformType.toLowerCase()).toEqual(platformType)

      const coinSelect = await dtfPage.getSelectStatus('coin')
      expect(coinSelect.cryptoSymbol).toEqual(getCryptoSymbol(cryptoType))
      expect(parseFloat(coinSelect.balance)).toBeGreaterThan(0)
      expect(parseFloat(coinSelect.currencyBalance)).toBeGreaterThan(0)
      expect(coinSelect.address).toBeDefined()

      const cryptoAmountTextField = await dtfPage.getTextFieldStatus('cryptoAmount')
      expect(parseFloat(cryptoAmountTextField.text)).toBeGreaterThan(0)

      const currencyAmountTextField = await dtfPage.getTextFieldStatus('currencyAmount')
      expect(currencyAmountTextField.text).toEqual(currencyAmount)

      await dtfPage.dispatchFormActions('continue')
      expect(page.url()).toMatch('step=1')
    },
    timeout
  )

  it(
    'Transfer DAI from Drive',
    async () => {
      const walletType = 'metamask'
      const platformType = 'ethereum'
      const cryptoType = 'dai'
      const currencyAmount = '1'
      const sendMessage = 'bilibilibalaboom'

      const dtfPage = new DirectTransferFormPage()

      await dtfPage.fillForm(
        { walletType, platformType, cryptoType, currencyAmount, sendMessage },
        true
      )

      const driveSelect = await dtfPage.getSelectStatus('drive')
      expect(driveSelect.label).toEqual('From')
      expect(driveSelect.name).toEqual('Wallet')
      expect(driveSelect.title).toEqual('Chainsfr')

      const accountSelect = await dtfPage.getSelectStatus('account')
      expect(accountSelect.walletType.toLowerCase()).toEqual(walletType)
      expect(accountSelect.platformType.toLowerCase()).toEqual(platformType)

      const coinSelect = await dtfPage.getSelectStatus('coin')
      expect(coinSelect.cryptoSymbol).toEqual(getCryptoSymbol(cryptoType))
      expect(parseFloat(coinSelect.balance)).toBeGreaterThan(0)
      expect(parseFloat(coinSelect.currencyBalance)).toBeGreaterThan(0)
      expect(coinSelect.address).toBeDefined()

      const cryptoAmountTextField = await dtfPage.getTextFieldStatus('cryptoAmount')
      expect(parseFloat(cryptoAmountTextField.text)).toBeGreaterThan(0)

      const currencyAmountTextField = await dtfPage.getTextFieldStatus('currencyAmount')
      expect(currencyAmountTextField.text).toEqual(currencyAmount)

      await dtfPage.dispatchFormActions('continue')
      expect(page.url()).toMatch('step=1')
    },
    timeout
  )

  it(
    'Transfer ETH from Drive',
    async () => {
      const walletType = 'ledger'
      const platformType = 'ethereum'
      const cryptoType = 'ethereum'
      const currencyAmount = '1'
      const sendMessage = 'bilibilibalaboom'

      const dtfPage = new DirectTransferFormPage()

      await dtfPage.fillForm(
        { walletType, platformType, cryptoType, currencyAmount, sendMessage },
        true
      )

      const driveSelect = await dtfPage.getSelectStatus('drive')
      expect(driveSelect.label).toEqual('From')
      expect(driveSelect.name).toEqual('Wallet')
      expect(driveSelect.title).toEqual('Chainsfr')

      const accountSelect = await dtfPage.getSelectStatus('account')
      expect(accountSelect.walletType.toLowerCase()).toEqual(walletType)
      expect(accountSelect.platformType.toLowerCase()).toEqual(platformType)

      const coinSelect = await dtfPage.getSelectStatus('coin')
      expect(coinSelect.cryptoSymbol).toEqual(getCryptoSymbol(cryptoType))
      expect(parseFloat(coinSelect.balance)).toBeGreaterThan(0)
      expect(parseFloat(coinSelect.currencyBalance)).toBeGreaterThan(0)
      expect(coinSelect.address).toBeDefined()

      const cryptoAmountTextField = await dtfPage.getTextFieldStatus('cryptoAmount')
      expect(parseFloat(cryptoAmountTextField.text)).toBeGreaterThan(0)

      const currencyAmountTextField = await dtfPage.getTextFieldStatus('currencyAmount')
      expect(currencyAmountTextField.text).toEqual(currencyAmount)

      await dtfPage.dispatchFormActions('continue')
      expect(page.url()).toMatch(/step=1/)
    },
    timeout
  )

  it(
    'Back Btn',
    async () => {
      const dtfPage = new DirectTransferFormPage()

      await dtfPage.dispatchFormActions('back')
      expect(page.url()).toMatch(/\/wallet/)
    },
    timeout
  )

  it(
    'Fill then switch (Metamask_ETH -> Metamask_ETH)',
    async () => {
      const walletType = 'metamask'
      const platformType = 'ethereum'
      const cryptoType = 'ethereum'
      const currencyAmount = '1'
      const sendMessage = 'bilibilibalaboom'

      const dtfPage = new DirectTransferFormPage()

      await dtfPage.fillForm(
        { walletType, platformType, cryptoType, currencyAmount, sendMessage },
        true
      )

      await dtfPage.dispatchFormActions('transferIn')
      expect(await dtfPage.getAccountSwitchStatus()).toEqual('transferIn')

      const cryptoAmountTextField = await dtfPage.getTextFieldStatus('cryptoAmount')
      expect(cryptoAmountTextField.text).toEqual('')

      const currencyAmountTextField = await dtfPage.getTextFieldStatus('currencyAmount')
      expect(currencyAmountTextField.text).toEqual('')

      await dtfPage.fillForm(
        { walletType, platformType, cryptoType, currencyAmount, sendMessage },
        true
      )
      await dtfPage.dispatchFormActions('continue')
      expect(page.url()).toMatch('step=1')
    },
    timeout
  )

  it(
    'Fill then switch (Metamask_ETH -> Ledger_BTC)',
    async () => {
      let walletType = 'metamask'
      let platformType = 'ethereum'
      let cryptoType = 'ethereum'
      let currencyAmount = '1'
      const sendMessage = 'bilibilibalaboom'

      const dtfPage = new DirectTransferFormPage()

      await dtfPage.fillForm(
        { walletType, platformType, cryptoType, currencyAmount, sendMessage },
        true
      )

      await dtfPage.dispatchFormActions('transferIn')
      expect(await dtfPage.getAccountSwitchStatus()).toEqual('transferIn')

      const cryptoAmountTextField = await dtfPage.getTextFieldStatus('cryptoAmount')
      expect(cryptoAmountTextField.text).toEqual('')

      const currencyAmountTextField = await dtfPage.getTextFieldStatus('currencyAmount')
      expect(currencyAmountTextField.text).toEqual('')

      walletType = 'ledger'
      platformType = 'bitcoin'
      cryptoType = 'bitcoin'
      currencyAmount = '10'

      await dtfPage.fillForm(
        { walletType, platformType, cryptoType, currencyAmount, sendMessage },
        true
      )
      await dtfPage.dispatchFormActions('continue')
      expect(page.url()).toMatch('step=1')
    },
    timeout
  )

  it(
    'Edge case: transfer in/out balance update test',
    async () => {
      const walletType = 'ledger'
      const platformType = 'bitcoin'
      const cryptoType = 'bitcoin'
      let ledgerBtcBalance
      let ledgerBtcCurrencyBalance
      let driveBtcBalance
      let driveBtcCurrencyBalance
      let cryptoAmountTextField
      let currencyAmountTextField
      const dtfPage = new DirectTransferFormPage()

      await dtfPage.fillForm({ walletType, platformType, cryptoType }, true)

      for (let i = 0; i < 3; i++) {
        await dtfPage.dispatchFormActions('transferOut')
        cryptoAmountTextField = await dtfPage.getTextFieldStatus('cryptoAmount')
        if (driveBtcBalance) {
          expect(cryptoAmountTextField.helperText).toEqual(driveBtcBalance)
        } else {
          driveBtcBalance = cryptoAmountTextField.helperText
        }

        currencyAmountTextField = await dtfPage.getTextFieldStatus('currencyAmount')
        if (driveBtcCurrencyBalance) {
          expect(currencyAmountTextField.helperText).toEqual(driveBtcCurrencyBalance)
        } else {
          driveBtcCurrencyBalance = currencyAmountTextField.helperText
        }

        await dtfPage.dispatchFormActions('transferIn')
        cryptoAmountTextField = await dtfPage.getTextFieldStatus('cryptoAmount')
        if (ledgerBtcBalance) {
          expect(cryptoAmountTextField.helperText).toEqual(ledgerBtcBalance)
        } else {
          ledgerBtcBalance = cryptoAmountTextField.helperText
        }

        currencyAmountTextField = await dtfPage.getTextFieldStatus('currencyAmount')
        if (ledgerBtcCurrencyBalance) {
          expect(currencyAmountTextField.helperText).toEqual(ledgerBtcCurrencyBalance)
        } else {
          ledgerBtcCurrencyBalance = currencyAmountTextField.helperText
        }
      }
    },
    timeout
  )
})
