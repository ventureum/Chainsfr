import createAccount from './accounts/AccountFactory'

self.addEventListener('message', async (event) => { // eslint-disable-line
  const { action, payload } = event.data
  if (action === 'sync') {
    const { accountData } = payload
    
    let account  = createAccount(accountData)
    await account.syncWithNetwork()
    self.postMessage(account.getAccountData()) // eslint-disable-line
  } else {
    self.postMessage(new Error('Invalid action')) // eslint-disable-line
  }
})
