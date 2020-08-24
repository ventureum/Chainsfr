import LoginPage from './pages/login.page'
import RecipientsPage from './pages/recipients.page'
import paths from '../../Paths'
import { RECIPIENTS } from './mocks/recipients'
import { resetUserDefault } from './utils/reset'
import log from 'loglevel'
log.setDefaultLevel('info')

const timeout = 50000
const CONTACT_NAME = 'e2e-user'
const CONTACT_EMAIL = 'e2e-user@gmail.com'
const CONTACT_NAME_EDITED = 'e2e-user-edited'
const CONTACT_EMAIL_EDITED = 'e2e-user-edited@gmail.com'

describe('Recipients Page', () => {
  let loginPage
  let recipientsPage
  beforeAll(async done => {
    // we assume user has not logged in yet
    await jestPuppeteer.resetBrowser()

    // setup interceptor
    await requestInterceptor.setRequestInterception(true)
    requestInterceptor.byPass({
      platform: 'chainsfrApi',
      method: 'GET_RECIPIENTS'
    })

    await page.goto(process.env.E2E_TEST_URL, {
      waitUntil: 'networkidle0'
    })
    loginPage = new LoginPage()
    recipientsPage = new RecipientsPage()
    await loginPage.login(
      process.env.E2E_TEST_GOOGLE_LOGIN_USERNAME,
      process.env.E2E_TEST_GOOGLE_LOGIN_PASSWORD,
      true // mock login
    )

    await Promise.all([
      page.waitForNavigation(),
      expect(page).toClick('span', { text: 'Contacts' })
    ])

    done()
  }, timeout)

  afterAll(async () => {
    requestInterceptor.showStats()
  })

  beforeEach(async () => {
    await resetUserDefault()
  })

  test('Show init recipient list', async () => {
    const recipientList = await recipientsPage.getRecipientList()
    expect(recipientList).toHaveLength(RECIPIENTS.length)
  })

  test(
    'Add and delete a recipient',
    async () => {
      await recipientsPage.addRecipient(CONTACT_NAME, CONTACT_EMAIL)
      await page.waitFor(1000)

      expect(await recipientsPage.toHave(CONTACT_NAME, CONTACT_EMAIL)).toBe(true)

      await recipientsPage.removeRecipient(CONTACT_NAME, CONTACT_EMAIL)
      await page.waitFor(1000)

      expect(await recipientsPage.toHave(CONTACT_NAME, CONTACT_EMAIL)).toBe(false)
    },
    timeout
  )

  test(
    'Add, Edit and delete a recipient',
    async () => {
      await recipientsPage.addRecipient(CONTACT_NAME, CONTACT_EMAIL)
      await page.waitFor(1000)

      expect(await recipientsPage.toHave(CONTACT_NAME, CONTACT_EMAIL)).toBe(true)

      await recipientsPage.editRecipient(
        CONTACT_NAME,
        CONTACT_EMAIL,
        CONTACT_NAME_EDITED,
        CONTACT_EMAIL_EDITED
      )
      await page.waitFor(1000)

      expect(await recipientsPage.toHave(CONTACT_NAME, CONTACT_EMAIL)).toBe(false)
      expect(await recipientsPage.toHave(CONTACT_NAME_EDITED, CONTACT_EMAIL_EDITED)).toBe(true)

      await recipientsPage.removeRecipient(CONTACT_NAME_EDITED, CONTACT_EMAIL_EDITED)
      await page.waitFor(1000)

      expect(await recipientsPage.toHave(CONTACT_NAME_EDITED, CONTACT_EMAIL_EDITED)).toBe(false)
    },
    timeout
  )
})
