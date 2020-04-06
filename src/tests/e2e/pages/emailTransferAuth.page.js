import MetamaskPage from './metamask.page'
import log from 'loglevel'
log.setDefaultLevel('info')

class EmailTransferAuthPage {
  async connect (walletType = 'drive', cryptoType='ethereum', approveAllowance=false) {
    const metamaskPage = new MetamaskPage()
    await expect(page).toClick('button', { text: 'Connect' })
    if (walletType === 'metamask') {
      // handle popup
      await metamaskPage.approve(approveAllowance)
    }
  }

  async getAllowance () {
    const textFieldElement = await page.$('#allowance')
    const helperTextElement = await page.$('#allowance-helper-text')
    const allowance = await (await textFieldElement.getProperty('value')).jsonValue()
    return allowance
  }
}

export default EmailTransferAuthPage
