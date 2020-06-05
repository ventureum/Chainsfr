import { getElementTextContent } from '../testUtils'

class UserSettingPage {
  async clickTab (tabName) {
    switch (tabName) {
      case 'accountInfo': {
        await page.click('[data-test-id="account_info"]')
        break
      }
      case 'security': {
        await page.click('[data-test-id="security"]')
        break
      }
      case 'advanced': {
        await page.click('[data-test-id="advanced"]')
        break
      }
      default: {
        throw new Error(`Invalid tab: ${tabName}`)
      }
    }
  }

  async openBackupFolder () {
    // assume in advanced tab
    await page.click('[data-test-id="backup_folder_btn"]')
  }

  async openGoogleTwoFactorLink () {
    // assume in security tab
    await page.click('[data-test-id="google_two_factor_auth_btn"]')
  }

  async signOut () {
    // assume in account info tab
    await page.click('[data-test-id="sign_out_btn"]')
  }

  async getUserInfo () {
    // assume in account info tab
    const name = await getElementTextContent(await page.$('[data-test-id="user_name"]'))
    const email = await getElementTextContent(await page.$('[data-test-id="user_email"]'))
    const joinDate = await getElementTextContent(await page.$('[data-test-id="join_date"]'))
    return { name, email, joinDate }
  }

  async getBackupDate () {
    return getElementTextContent(await page.$('.MuiAlert-message'))
  }
}

export default UserSettingPage
