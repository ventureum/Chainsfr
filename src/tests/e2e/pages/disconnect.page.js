import log from 'loglevel'
log.setDefaultLevel('info')

class DisconnectPage {
  async disconnect () {
    await expect(page).toClick('button', { text: 'Disconnect' })
    log.info('Disconnect clicked')
    await page.waitForNavigation()
  }
}

export default DisconnectPage
