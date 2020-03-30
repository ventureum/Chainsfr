import log from 'loglevel'
log.setDefaultLevel('info')

class EmailTransferAuthPage {
  async connect () {
    await expect(page).toClick('button', { text: 'Connect' })
  }

  async getAllowance () {
    const textFieldElement = await page.$('#allowance')
    const helperTextElement = await page.$('#allowance-helper-text')
    const allowance = await (await textFieldElement.getProperty('value')).jsonValue()
    return allowance
  }
}

export default EmailTransferAuthPage
