import LoginPage from './pages/login.page'
import UserSettingPage from './pages/userSetting.page'
import { resetUserDefault } from './utils/reset.js'
import { getNewPopupPage } from './testUtils'
import ReduxTracker from './utils/reduxTracker'
import { EMAIL, PROFILE } from './mocks/user'
const timeout = 180000

describe('User setting page tests', () => {
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
  })

  beforeEach(async () => {
    const reduxTracker = new ReduxTracker()
    await Promise.all([
      reduxTracker.waitFor(
        [
          {
            action: {
              type: 'GET_UESR_CLOUD_WALLET_FOLDER_META_FULFILLED'
            }
          },
          {
            action: {
              type: 'GET_USER_JOIN_DATE_FULFILLED'
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
      page.goto(`${process.env.E2E_TEST_URL}/userSetting`)
    ])
  })

  it(
    'backup tab test',
    async () => {
      const userSetting = new UserSettingPage()
      await userSetting.clickTab('backup')
      const backupDate = await userSetting.getBackupDate()
      expect(backupDate).toMatch(/Your account was backed up on Mar 16th 2020/)

      const googleDriveBackupPage = await getNewPopupPage(browser, async () => {
        await userSetting.openBackupFolder()
      })
      expect(googleDriveBackupPage.url()).toMatch(/1UEpAHbwILhxb2CnI4PYYvqYz0qknTPMa/)
      await googleDriveBackupPage.close()
    },
    timeout
  )

  it(
    'security tab test',
    async () => {
      const userSetting = new UserSettingPage()
      await userSetting.clickTab('security')

      const twoFactorsPage = await getNewPopupPage(browser, async () => {
        await userSetting.openGoogleTwoFactorLink()
      })
      expect(twoFactorsPage.url()).toEqual('https://support.google.com/accounts/answer/185839')
      await twoFactorsPage.close()
    },
    timeout
  )

  it(
    'backup tab test',
    async () => {
      const userSetting = new UserSettingPage()

      const { name, email, joinDate } = await userSetting.getUserInfo()

      expect(name).toEqual(PROFILE.name)
      expect(email).toEqual(EMAIL)
      expect(joinDate).toMatch(/Joined on /)

      const reduxTracker = new ReduxTracker()
      await Promise.all([
        reduxTracker.waitFor(
          [
            {
              action: {
                type: 'LOGOUT_FULFILLED'
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
        userSetting.signOut()
      ])

      expect(page.url()).toMatch(/login?/)
    },
    timeout
  )
})
