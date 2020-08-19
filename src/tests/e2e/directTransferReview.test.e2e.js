import LoginPage from './pages/login.page'
import DireactTransferFormPage from './pages/directTransferForm.page'
import ReviewPage from './pages/sendReview.page'
import { resetUserDefault } from './utils/reset.js'
import { getWalletTitle } from '../../wallet'
import { getCryptoTitle, getCryptoSymbol } from './testUtils'

const timeout = 180000

function aboutEqual (valueA, valueB, tolerance = 0.05) {
  return Math.abs(valueA - valueB) < tolerance
}

describe('Direct transfer review tests', () => {
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

  beforeEach(async () => {
    await page.goto(`${process.env.E2E_TEST_URL}/directTransfer`, {
      waitUntil: 'networkidle0'
    })
  })

  it(
    'Transfer BTC from Drive to Ledger review',
    async () => {
      const walletType = 'ledger'
      const platformType = 'bitcoin'
      const cryptoType = 'bitcoin'
      const cryptoAmount = '0.001'
      const sendMessage = 'bilibilibalaboom'

      const formPage = new DireactTransferFormPage()

      await formPage.fillForm({
        walletType,
        platformType,
        cryptoType,
        cryptoAmount,
        sendMessage
      })
      await formPage.dispatchFormActions('continue')

      const reviewPage = new ReviewPage()
      await reviewPage.waitTillReady()

      expect(await reviewPage.getReviewFormInfo('title')).toEqual('Review Details')

      const senderAccount = await reviewPage.getReviewFormInfo('senderAccount')
      expect(senderAccount.walletType).toEqual(getWalletTitle('drive'))
      expect(senderAccount.platformType).toEqual(getCryptoTitle(platformType))
      expect(senderAccount.address).toBeDefined()

      const receiverAccount = await reviewPage.getReviewFormInfo('receiverAccount')
      expect(receiverAccount.walletType).toEqual(getWalletTitle(walletType))
      expect(receiverAccount.platformType).toEqual(getCryptoTitle(platformType))
      expect(receiverAccount.address).toBeDefined()

      const displayedAmount = await reviewPage.getReviewFormInfo('transferAmount')
      expect(parseFloat(displayedAmount.currencyAmount)).toBeGreaterThan(0)
      expect(
        aboutEqual(parseFloat(displayedAmount.transferAmount), parseFloat(cryptoAmount))
      ).toEqual(true)
      expect(displayedAmount.symbol).toEqual(getCryptoSymbol(cryptoType))

      const displayedTxFee = await reviewPage.getReviewFormInfo('txFee')
      expect(parseFloat(displayedTxFee.txFee)).toBeGreaterThan(0)
      expect(parseFloat(displayedTxFee.currencyTxFee)).toBeGreaterThan(0)
      expect(displayedTxFee.symbol).toEqual(getCryptoSymbol(platformType))

      const sendMessageTextField = await reviewPage.getReviewFormInfo('sendMessage')
      expect(sendMessageTextField.message).toEqual(sendMessage)
    },
    timeout
  )

  it(
    'Transfer ETH from Drive to MetaMask review',
    async () => {
      const walletType = 'metamask'
      const platformType = 'ethereum'
      const cryptoType = 'ethereum'
      const currencyAmount = '1'
      const sendMessage = 'bilibilibalaboom'

      const formPage = new DireactTransferFormPage()

      await formPage.fillForm({
        walletType,
        platformType,
        cryptoType,
        currencyAmount,
        sendMessage
      })
      await formPage.dispatchFormActions('continue')

      const reviewPage = new ReviewPage()
      await reviewPage.waitTillReady()

      expect(await reviewPage.getReviewFormInfo('title')).toEqual('Review Details')

      const senderAccount = await reviewPage.getReviewFormInfo('senderAccount')
      expect(senderAccount.walletType).toEqual(getWalletTitle('drive'))
      expect(senderAccount.platformType).toEqual(getCryptoTitle(platformType))
      expect(senderAccount.address).toBeDefined()

      const receiverAccount = await reviewPage.getReviewFormInfo('receiverAccount')
      expect(receiverAccount.walletType).toEqual(getWalletTitle(walletType))
      expect(receiverAccount.platformType).toEqual(getCryptoTitle(platformType))
      expect(receiverAccount.address).toBeDefined()

      const displayedAmount = await reviewPage.getReviewFormInfo('transferAmount')
      expect(parseFloat(displayedAmount.transferAmount)).toBeGreaterThan(0)
      expect(parseFloat(displayedAmount.currencyAmount)).toEqual(parseFloat(currencyAmount))
      expect(displayedAmount.symbol).toEqual(getCryptoSymbol(cryptoType))

      const displayedTxFee = await reviewPage.getReviewFormInfo('txFee')
      expect(parseFloat(displayedTxFee.txFee)).toBeGreaterThan(0)
      expect(parseFloat(displayedTxFee.currencyTxFee)).toBeGreaterThan(0)
      expect(displayedTxFee.symbol).toEqual(getCryptoSymbol(platformType))

      const sendMessageTextField = await reviewPage.getReviewFormInfo('sendMessage')
      expect(sendMessageTextField.message).toEqual(sendMessage)
    },
    timeout
  )

  it(
    'Transfer DAI from Drive to MetaMask review',
    async () => {
      const walletType = 'metamask'
      const platformType = 'ethereum'
      const cryptoType = 'dai'
      const currencyAmount = '1'
      const sendMessage = 'bilibilibalaboom'

      const formPage = new DireactTransferFormPage()

      await formPage.fillForm({
        walletType,
        platformType,
        cryptoType,
        currencyAmount,
        sendMessage
      })
      await formPage.dispatchFormActions('continue')

      const reviewPage = new ReviewPage()
      await reviewPage.waitTillReady()

      expect(await reviewPage.getReviewFormInfo('title')).toEqual('Review Details')

      const senderAccount = await reviewPage.getReviewFormInfo('senderAccount')
      expect(senderAccount.walletType).toEqual(getWalletTitle('drive'))
      expect(senderAccount.platformType).toEqual(getCryptoTitle(platformType))
      expect(senderAccount.address).toBeDefined()

      const receiverAccount = await reviewPage.getReviewFormInfo('receiverAccount')
      expect(receiverAccount.walletType).toEqual(getWalletTitle(walletType))
      expect(receiverAccount.platformType).toEqual(getCryptoTitle(platformType))
      expect(receiverAccount.address).toBeDefined()

      const displayedAmount = await reviewPage.getReviewFormInfo('transferAmount')
      expect(parseFloat(displayedAmount.transferAmount)).toBeGreaterThan(0)
      expect(parseFloat(displayedAmount.currencyAmount)).toEqual(parseFloat(currencyAmount))
      expect(displayedAmount.symbol).toEqual(getCryptoSymbol(cryptoType))

      const displayedTxFee = await reviewPage.getReviewFormInfo('txFee')
      expect(parseFloat(displayedTxFee.txFee)).toBeGreaterThan(0)
      expect(parseFloat(displayedTxFee.currencyTxFee)).toBeGreaterThan(0)
      expect(displayedTxFee.symbol).toEqual(getCryptoSymbol(platformType))

      const sendMessageTextField = await reviewPage.getReviewFormInfo('sendMessage')
      expect(sendMessageTextField.message).toEqual(sendMessage)
    },
    timeout
  )

  it(
    'Transfer ETH from MetaMask into Drive review',
    async () => {
      const walletType = 'metamask'
      const platformType = 'ethereum'
      const cryptoType = 'ethereum'
      const currencyAmount = '1'
      const sendMessage = 'bilibilibalaboom'

      const formPage = new DireactTransferFormPage()

      await formPage.dispatchFormActions('transferIn')
      await formPage.fillForm({
        walletType,
        platformType,
        cryptoType,
        currencyAmount,
        sendMessage
      })
      await formPage.dispatchFormActions('continue')

      const reviewPage = new ReviewPage()
      await reviewPage.waitTillReady()

      expect(await reviewPage.getReviewFormInfo('title')).toEqual('Review Details')

      const senderAccount = await reviewPage.getReviewFormInfo('senderAccount')
      expect(senderAccount.walletType).toEqual(getWalletTitle(walletType))
      expect(senderAccount.platformType).toEqual(getCryptoTitle(platformType))
      expect(senderAccount.address).toBeDefined()

      const receiverAccount = await reviewPage.getReviewFormInfo('receiverAccount')
      expect(receiverAccount.walletType).toEqual(getWalletTitle('drive'))
      expect(receiverAccount.platformType).toEqual(getCryptoTitle(platformType))
      expect(receiverAccount.address).toBeDefined()

      const displayedAmount = await reviewPage.getReviewFormInfo('transferAmount')
      expect(parseFloat(displayedAmount.transferAmount)).toBeGreaterThan(0)
      expect(parseFloat(displayedAmount.currencyAmount)).toEqual(parseFloat(currencyAmount))
      expect(displayedAmount.symbol).toEqual(getCryptoSymbol(cryptoType))

      const displayedTxFee = await reviewPage.getReviewFormInfo('txFee')
      expect(parseFloat(displayedTxFee.txFee)).toBeGreaterThan(0)
      expect(parseFloat(displayedTxFee.currencyTxFee)).toBeGreaterThan(0)
      expect(displayedTxFee.symbol).toEqual(getCryptoSymbol(platformType))

      const sendMessageTextField = await reviewPage.getReviewFormInfo('sendMessage')
      expect(sendMessageTextField.message).toEqual(sendMessage)
    },
    timeout
  )

  it(
    'Transfer DAI from MetaMask into Drive review',
    async () => {
      const walletType = 'metamask'
      const platformType = 'ethereum'
      const cryptoType = 'dai'
      const currencyAmount = '1'
      const sendMessage = 'bilibilibalaboom'

      const formPage = new DireactTransferFormPage()

      await formPage.dispatchFormActions('transferIn')
      await formPage.fillForm({
        walletType,
        platformType,
        cryptoType,
        currencyAmount,
        sendMessage
      })
      await formPage.dispatchFormActions('continue')

      const reviewPage = new ReviewPage()
      await reviewPage.waitTillReady()

      expect(await reviewPage.getReviewFormInfo('title')).toEqual('Review Details')

      const senderAccount = await reviewPage.getReviewFormInfo('senderAccount')
      expect(senderAccount.walletType).toEqual(getWalletTitle(walletType))
      expect(senderAccount.platformType).toEqual(getCryptoTitle(platformType))
      expect(senderAccount.address).toBeDefined()

      const receiverAccount = await reviewPage.getReviewFormInfo('receiverAccount')
      expect(receiverAccount.walletType).toEqual(getWalletTitle('drive'))
      expect(receiverAccount.platformType).toEqual(getCryptoTitle(platformType))
      expect(receiverAccount.address).toBeDefined()

      const displayedAmount = await reviewPage.getReviewFormInfo('transferAmount')
      expect(parseFloat(displayedAmount.transferAmount)).toBeGreaterThan(0)
      expect(parseFloat(displayedAmount.currencyAmount)).toEqual(parseFloat(currencyAmount))
      expect(displayedAmount.symbol).toEqual(getCryptoSymbol(cryptoType))

      const displayedTxFee = await reviewPage.getReviewFormInfo('txFee')
      expect(parseFloat(displayedTxFee.txFee)).toBeGreaterThan(0)
      expect(parseFloat(displayedTxFee.currencyTxFee)).toBeGreaterThan(0)
      expect(displayedTxFee.symbol).toEqual(getCryptoSymbol(platformType))

      const sendMessageTextField = await reviewPage.getReviewFormInfo('sendMessage')
      expect(sendMessageTextField.message).toEqual(sendMessage)
    },
    timeout
  )

  it(
    'Transfer BTC from Ledger into Drive review',
    async () => {
      const walletType = 'ledger'
      const platformType = 'bitcoin'
      const cryptoType = 'bitcoin'
      const cryptoAmount = '0.001'
      const sendMessage = 'bilibilibalaboom'

      const formPage = new DireactTransferFormPage()

      await formPage.dispatchFormActions('transferIn')
      await formPage.fillForm({
        walletType,
        platformType,
        cryptoType,
        cryptoAmount,
        sendMessage
      })
      await formPage.dispatchFormActions('continue')

      const reviewPage = new ReviewPage()
      await reviewPage.waitTillReady()

      expect(await reviewPage.getReviewFormInfo('title')).toEqual('Review Details')

      const senderAccount = await reviewPage.getReviewFormInfo('senderAccount')
      expect(senderAccount.walletType).toEqual(getWalletTitle(walletType))
      expect(senderAccount.platformType).toEqual(getCryptoTitle(platformType))
      expect(senderAccount.address).toBeDefined()

      const receiverAccount = await reviewPage.getReviewFormInfo('receiverAccount')
      expect(receiverAccount.walletType).toEqual(getWalletTitle('drive'))
      expect(receiverAccount.platformType).toEqual(getCryptoTitle(platformType))
      expect(receiverAccount.address).toBeDefined()

      const displayedAmount = await reviewPage.getReviewFormInfo('transferAmount')
      expect(parseFloat(displayedAmount.currencyAmount)).toBeGreaterThan(0)
      expect(
        aboutEqual(parseFloat(displayedAmount.transferAmount), parseFloat(cryptoAmount))
      ).toEqual(true)
      expect(displayedAmount.symbol).toEqual(getCryptoSymbol(cryptoType))

      const displayedTxFee = await reviewPage.getReviewFormInfo('txFee')
      expect(parseFloat(displayedTxFee.txFee)).toBeGreaterThan(0)
      expect(parseFloat(displayedTxFee.currencyTxFee)).toBeGreaterThan(0)
      expect(displayedTxFee.symbol).toEqual(getCryptoSymbol(platformType))

      const sendMessageTextField = await reviewPage.getReviewFormInfo('sendMessage')
      expect(sendMessageTextField.message).toEqual(sendMessage)
    },
    timeout
  )
})
