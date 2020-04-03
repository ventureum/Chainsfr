import MetamaskPage from './metamask.page'
import log from 'loglevel'
log.setDefaultLevel('info')

class DisconnectPage {
  async disconnect () {
    await expect(page).toClick('button', { text: 'Disconnect' })
    log.info('Disconnect clicked')
    await page.waitForNavigation()
  }

  async setAllowanceWithMetamask (amount) {
    const metamaskPage = new MetamaskPage()
    await expect(page).toFillForm('[data-test-id="set_erc20_allowance"]', {
        allowance: amount
      })
    await expect(page).toClick('button', { text: 'Set Allowance' })
    await metamaskPage.approve(false)
    log.info('Sending out tx to reset allowance, wait for confirmation...')
    await page.waitFor('[data-test-id="allowance_tx_hash"]', {
      timeout: 180000
    })
    log.info('Reset allowance tx confirmed')
  }
}

export default DisconnectPage
