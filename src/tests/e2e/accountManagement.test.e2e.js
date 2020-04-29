import AccountManagementPage from './pages/accounts.page'
import LoginPage from './pages/login.page'
import { resetUserDefault } from './utils/reset.js'
import ReduxTracker from './utils/reduxTracker'

const timeout = 180000
const reduxTracker = new ReduxTracker()

describe('Account Management page tests', () => {
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

  beforeEach(async () => {
    await Promise.all([
      reduxTracker.waitFor(
        [
          {
            action: {
              type: 'GET_CRYPTO_ACCOUNTS_FULFILLED'
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
      page.waitForNavigation({
        waitUntil: 'networkidle0'
      }),
      page.goto(`${process.env.E2E_TEST_URL}/accounts`)
    ])
  })

  it(
    'Delete account',
    async () => {
      const accountPage = new AccountManagementPage()
      const accounts = await accountPage.getAccountsList()

      const index = accounts.findIndex(
        account =>
          account.walletType === 'Metamask' &&
          account.platformType === 'Ethereum' &&
          account.assets === 'Multiple Coins'
      )

      await Promise.all([
        reduxTracker.waitFor(
          [
            {
              action: {
                type: 'REMOVE_CRYPTO_ACCOUNTS_FULFILLED'
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
        accountPage.deleteAccounts(index)
      ])
    },
    timeout
  )

  it(
    'Change wallet name',
    async () => {
      const accountPage = new AccountManagementPage()
      const accounts = await accountPage.getAccountsList()

      const index = accounts.findIndex(
        account =>
          account.walletType === 'Ledger' &&
          account.platformType === 'Ethereum' &&
          account.assets === 'Multiple Coins'
      )

      await Promise.all([
        reduxTracker.waitFor(
          [
            {
              action: {
                type: 'MODIFY_CRYPTO_ACCOUNTS_NAME_FULFILLED'
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
        accountPage.changeAccountsName(index, 'new account name')
      ])
    },
    timeout
  )

  it(
    'Show account QR code',
    async () => {
      const accountPage = new AccountManagementPage()
      const accounts = await accountPage.getAccountsList()

      const index = accounts.findIndex(
        account =>
          account.walletType === 'Ledger' &&
          account.platformType === 'Ethereum' &&
          account.assets === 'Multiple Coins'
      )
      const { qrCodeElement, address } = await accountPage.showAccountQRCode(index)

      await expect(qrCodeElement).toBeDefined()
      await expect(address).toBeDefined()
    },
    timeout
  )

  it(
    'Add accounts (MetaMask)',
    async () => {
      const accountPage = new AccountManagementPage()
      const newAccountName = 'New Account'
      await Promise.all([
        reduxTracker.waitFor(
          [
            {
              action: {
                type: 'ADD_CRYPTO_ACCOUNTS_FULFILLED'
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
        accountPage.addMetaMaskAccount(newAccountName)
      ])

      const accounts = await accountPage.getAccountsList()

      const index = accounts.findIndex(
        account =>
          account.walletType === 'Metamask' &&
          account.platformType === 'Ethereum' &&
          account.assets === 'Multiple Coins' &&
          account.name === newAccountName
      )
      expect(index).toBeGreaterThanOrEqual(0)
    },
    timeout
  )
})
