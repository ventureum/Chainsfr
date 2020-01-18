/* eslint-disable */
import { createAccount } from '../accounts/AccountFactory.js'

addEventListener('message', async (event) => {
  const { action, payload } = event.data
  if (action === 'sync') {
    const accountData = payload
    
    let account  = createAccount(accountData)
    await account.syncWithNetwork()
    self.postMessage(account.getAccountData())
  } else {
    self.postMessage(new Error('Invalid action'))
  }
})
