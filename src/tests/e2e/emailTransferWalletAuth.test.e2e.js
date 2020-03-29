import LoginPage from './pages/login.page'
import EmailTransferFormPage from './pages/emailTransferForm.page'
import EmailTransferAuthPage from './pages/emailTransferAuth.page'
import ReduxTracker from './utils/reduxTracker'
import { resetUserDefault } from './utils/reset'
import ERC20_ABI from '../../contracts/ERC20.js'
import SimpleMultiSigContractArtifacts from '../../contracts/SimpleMultiSig.json'
import { getCrypto } from '../../tokens'
import { Base64 } from 'js-base64'
import url from '../../url'
import { getWallet } from './mocks/drive.js'
import log from 'loglevel'
import BN from 'bn.js'

log.setDefaultLevel('info')

// 3 min
const timeout = 180000

describe('Transfer Auth Tests', () => {
  let loginPage
  const reduxTracker = new ReduxTracker()
  const emtPage = new EmailTransferFormPage()
  const emtAuthPage = new EmailTransferAuthPage()
  const FORM_BASE = {
    formPage: emtPage,
    recipient: 'chainsfre2etest@gmail.com',
    currencyAmount: '1',
    securityAnswer: '123456',
    sendMessage: 'Send Message'
  }

  const NETWORK_ID = 4

  beforeAll(async () => {
    await resetUserDefault()
    await page.goto(`${process.env.E2E_TEST_URL}`)
    // login to app
    const loginPage = new LoginPage()
    await loginPage.login(
      process.env.E2E_TEST_GOOGLE_LOGIN_USERNAME,
      process.env.E2E_TEST_GOOGLE_LOGIN_PASSWORD,
      true
    )
  }, timeout)

  beforeEach(async () => {
    await Promise.all([
      page.waitForNavigation({
        waitUntil: 'networkidle0'
      }),
      page.goto(`${process.env.E2E_TEST_URL}/send`)
    ])
  })

  afterAll(async () => {
    await jestPuppeteer.resetBrowser()
  })

  const gotoAuthPage = async () => {
    // go to review page
    await Promise.all([
      page.waitForNavigation({
        waitUntil: 'networkidle0'
      }),
      expect(page).toClick('button', { text: 'Continue' })
    ])

    // go to auth page
    await Promise.all([
      page.waitForNavigation({
        waitUntil: 'networkidle0'
      }),
      expect(page).toClick('button', { text: 'Continue' })
    ])
  }

  const getAllowance = async (owner, spender, cryptoType) => {
    const Web3 = require('web3')
    let web3 = new Web3(new Web3.providers.HttpProvider(url.INFURA_API_URL))
    const targetContract = new web3.eth.Contract(ERC20_ABI, getCrypto(cryptoType).address)
    return targetContract.methods.allowance(owner, spender).call()
  }

  const getSetAllowanceTxObj = async (from, amount, cryptoType) => {
    const Web3 = require('web3')
    let web3 = new Web3(new Web3.providers.HttpProvider(url.INFURA_API_URL))
    const targetContract = new web3.eth.Contract(ERC20_ABI, getCrypto(cryptoType).address)
    const multiSigAddr = SimpleMultiSigContractArtifacts.networks[NETWORK_ID].address

    const data = targetContract.methods.approve(multiSigAddr, amount).encodeABI()

    let txObj = {
      from: from,
      to: getCrypto(cryptoType).address,
      data: data,
      value: '0'
    }

    // hard-coded gas to avoid weird out-of-gas from web3 using
    // web3.eth.estimateGas
    // 200,000
    txObj.gas = '0x30d40'
    // 20 GWEI
    txObj.gasPrice = '0x4a817c800'
    return txObj
  }

  test(
    'Send ETH from drive wallet',
    async () => {
      await emtPage.fillForm({
        ...FORM_BASE,
        walletType: 'drive',
        platformType: 'ethereum',
        cryptoType: 'ethereum'
      })

      await gotoAuthPage()

      // click connect
      await Promise.all([
        reduxTracker.waitFor(
          [
            {
              action: {
                type: 'CHECK_WALLET_CONNECTION_FULFILLED'
              }
            },
            {
              action: {
                type: 'VERIFY_ACCOUNT_FULFILLED'
              }
            },
            {
              action: {
                type: 'SUBMIT_TX_FULFILLED'
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
        expect(page).toClick('button', { text: 'Connect' })
      ])
    },
    timeout
  )

  test(
    'Send DAI from drive wallet (insufficient allowance)',
    async () => {
      const CRYPTO_AMOUNT = '1'
      await emtPage.fillForm({
        ...FORM_BASE,
        cryptoAmount: CRYPTO_AMOUNT,
        currencyAmount: null,
        walletType: 'drive',
        platformType: 'ethereum',
        cryptoType: 'dai'
      })

      // check approval value
      const address = await emtPage.getAccountAddress()
      const cryptoAmount = (await emtPage.getTextFieldStatus('cryptoAmount')).text
      const contractAddr = SimpleMultiSigContractArtifacts.networks[NETWORK_ID].address
      const currentAllowance = await getAllowance(address, contractAddr, 'dai')

      // get private key
      const walletFile = JSON.parse(Base64.decode((await getWallet()).accounts))
      const privateKey = walletFile[address].privateKey

      // setup web3
      const Web3 = require('web3')
      const web3 = new Web3(new Web3.providers.HttpProvider(url.INFURA_API_URL))
      web3.eth.accounts.wallet.add(privateKey)

      // reset allowance to 0
      const setAllowanceTxObj = await getSetAllowanceTxObj(address, '0', 'dai')
      log.info('Sending out tx to reset allowance, wait for confirmation...')
      const txReceipt = await web3.eth.sendTransaction(setAllowanceTxObj)

      // tx must be executed successfully
      expect(txReceipt.status).toBe(true)
      log.info('Reset allowance to 0 successfully')

      await gotoAuthPage()

      await expect(page).toMatch(
        'Please approve a transaction limit before being able to continue. Learn more about the approve process'
      )
      const allowance = await emtAuthPage.getAllowance()

      // allowance should match transfer crypto amount exactly
      expect(allowance).toBe(CRYPTO_AMOUNT)

      // click connect
      await Promise.all([
        reduxTracker.waitFor(
          [
            {
              action: {
                type: 'CHECK_WALLET_CONNECTION_FULFILLED'
              }
            },
            {
              action: {
                type: 'VERIFY_ACCOUNT_FULFILLED'
              }
            },
            {
              action: {
                type: 'SET_TOKEN_ALLOWANCE_FULFILLED'
              }
            },
            {
              action: {
                type: 'SET_TOKEN_ALLOWANCE_WAIT_FOR_CONFIRMATION_FULFILLED'
              }
            },
            {
              action: {
                type: 'SUBMIT_TX_FULFILLED'
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
        emtAuthPage.connect()
      ])
    },
    timeout
  )

  test(
    'Send DAI from drive wallet (sufficient allowance)',
    async () => {
      const CRYPTO_AMOUNT = '1'
      await emtPage.fillForm({
        ...FORM_BASE,
        cryptoAmount: CRYPTO_AMOUNT,
        currencyAmount: null,
        walletType: 'drive',
        platformType: 'ethereum',
        cryptoType: 'dai'
      })

      // check approval value
      const address = await emtPage.getAccountAddress()
      const cryptoAmount = (await emtPage.getTextFieldStatus('cryptoAmount')).text
      const contractAddr = SimpleMultiSigContractArtifacts.networks[NETWORK_ID].address
      const currentAllowance = await getAllowance(address, contractAddr, 'dai')

      // get private key
      const walletFile = JSON.parse(Base64.decode((await getWallet()).accounts))
      const privateKey = walletFile[address].privateKey

      // setup web3
      const Web3 = require('web3')
      const web3 = new Web3(new Web3.providers.HttpProvider(url.INFURA_API_URL))
      web3.eth.accounts.wallet.add(privateKey)

      // reset allowance to match cryptoAmount exactly
      // dai has decimals of 18
      const cryptoAmountBasicTokenUnit = new BN(1).pow(new BN(18)).toString()
      const setAllowanceTxObj = await getSetAllowanceTxObj(
        address,
        cryptoAmountBasicTokenUnit,
        'dai'
      )

      log.info('Sending out tx to reset allowance, wait for confirmation...')
      const txReceipt = await web3.eth.sendTransaction(setAllowanceTxObj)

      // tx must be executed successfully
      expect(txReceipt.status).toBe(true)
      log.info(`Reset allowance to ${CRYPTO_AMOUNT} successfully`)

      await gotoAuthPage()

      await expect(page).toMatch(`Your remaining authorized DAI transfer limit is ${CRYPTO_AMOUNT}`)

      // click connect
      await Promise.all([
        reduxTracker.waitFor(
          [
            {
              action: {
                type: 'CHECK_WALLET_CONNECTION_FULFILLED'
              }
            },
            {
              action: {
                type: 'VERIFY_ACCOUNT_FULFILLED'
              }
            },
            {
              action: {
                type: 'SUBMIT_TX_FULFILLED'
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
        emtAuthPage.connect()
      ])
    },
    timeout
  )

  test(
    'Send BTC from drive wallet',
    async () => {
      const CRYPTO_AMOUNT = '0.001'
      await emtPage.fillForm({
        ...FORM_BASE,
        cryptoAmount: CRYPTO_AMOUNT,
        walletType: 'drive',
        platformType: 'bitcoin',
        cryptoType: 'bitcoin'
      })

      await gotoAuthPage()

      // click connect
      await Promise.all([
        reduxTracker.waitFor(
          [
            {
              action: {
                type: 'CHECK_WALLET_CONNECTION_FULFILLED'
              }
            },
            {
              action: {
                type: 'VERIFY_ACCOUNT_FULFILLED'
              }
            },
            {
              action: {
                type: 'SUBMIT_TX_FULFILLED'
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
        emtAuthPage.connect()
      ])
    },
    timeout
  )
})
