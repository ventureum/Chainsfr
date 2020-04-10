import MetamaskPage from './metamask.page'
import log from 'loglevel'
log.setDefaultLevel('info')

class DirectTransferAuthPage {
  async connect (walletType = 'drive', cryptoType='ethereum', approveAllowance=false) {
    const metamaskPage = new MetamaskPage()
    await expect(page).toClick('button', { text: 'Connect' })
    if (walletType === 'metamask') {
      // handle popup
      await metamaskPage.approve(approveAllowance)
    }
  }
}

export default DirectTransferAuthPage
