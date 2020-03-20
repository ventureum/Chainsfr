import log from 'loglevel'
import ReduxTracker from '../utils/reduxTracker'
log.setDefaultLevel('info')

class RecipientsPage {
  constructor () {
    this.reduxTracker = new ReduxTracker()
  }

  async toHave (name, email) {
    const recipientList = await this.getRecipientList()
    return !!recipientList.find(item => item.name === name && item.email === email)
  }

  async getRecipientList () {
    const recipientElementList = await page.$$('[data-test-id="recipient_list_item"]')
    const recipients = await Promise.all(
      recipientElementList.map(async elementHandle => {
        const nameElemtnHandle = await elementHandle.$('[data-test-id="recipient_name"]')
        const emailElementHandle = await elementHandle.$('[data-test-id="recipient_email"]')
        const name = await page.evaluate(el => el.textContent, nameElemtnHandle)
        const email = await page.evaluate(el => el.textContent, emailElementHandle)

        return { name, email, elementHandle }
      })
    )
    return recipients
  }

  async addRecipient (name, email) {
    // open dialog
    await expect(page).toClick('button', { text: 'Add Contacts' })
    await page.waitForFunction('document.querySelector("button")')

    log.info('Add recipient modal opened')

    await expect(page).toFillForm('[data-test-id="add_recipient_form"]', {
      name: name,
      email: email
    })

    log.info('Add recipient form filled')
    await page.waitFor(100)

    // submit
    await Promise.all([
      this.reduxTracker.waitFor(
        [
          {
            action: {
              type: 'ADD_RECIPIENT_FULFILLED'
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
      await expect(page).toClick('[data-test-id=add]')
    ])

    log.info('Recipient added')
  }

  async removeRecipient (name, email) {
    const recipientList = await this.getRecipientList()
    const target = recipientList.find(r => r.name === name && r.email === email)
    expect(target).toBeDefined()

    // click more btn
    await expect(target.elementHandle).toClick('button', {
      type: 'css',
      value: 'button[title="More"]'
    })
    await expect(page).toClick('li', { text: 'Delete' })

    // wait for delete modal
    await page.waitForSelector('div[role=dialog]')
    const modelElementHandler = await page.$('div[role=dialog]')
    // click delete btn in modal
    await Promise.all([
      this.reduxTracker.waitFor(
        [
          {
            action: {
              type: 'REMOVE_RECIPIENT_FULFILLED'
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
      expect(modelElementHandler).toClick('button', { text: 'Delete' })
    ])

    log.info('Recipient removed')
  }

  async editRecipient (name, email, newName, newEmail) {
    const recipientList = await this.getRecipientList()
    const target = recipientList.find(r => r.name === name && r.email === email)
    expect(target).toBeDefined()

    // click more btn
    await expect(target.elementHandle).toClick('button', {
      type: 'css',
      value: 'button[title="More"]'
    })
    await expect(page).toClick('li', { text: 'Edit' })

    // wait for delete modal
    await page.waitForSelector('div[role=dialog]')
    const modelElementHandler = await page.$('div[role=dialog]')

    await expect(modelElementHandler).toFillForm('[data-test-id="edit_recipient_form"]', {
      name: newName,
      email: newEmail
    })

    // click delete btn in modal
    await Promise.all([
      this.reduxTracker.waitFor(
        [
          {
            action: {
              type: 'EDIT_RECIPIENT_FULFILLED'
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
      expect(modelElementHandler).toClick('button', { text: 'Save' })
    ])

    log.info('Recipient edited')
  }
}

export default RecipientsPage
