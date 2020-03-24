import axios from 'axios'
import { GOOGLE_LOGIN_AUTH_OBJ } from '../mocks/user.js'
import { DEFAULT_DATA } from '../mocks/transfers'
import { RECIPIENTS } from '../mocks/recipients'
import { ACCOUNTS } from '../mocks/accounts.js'

import type { BackEndCryptoAccountType } from '../../../types/account.flow'
import type { RecipientType } from '../../../types/recipients.flow'
import type { TransferDataType } from '../../../types/transfer.flow'

const chainsferApi = axios.create({
  baseURL: process.env.REACT_APP_CHAINSFER_API_ENDPOINT,
  headers: {
    'Content-Type': 'application/json'
  },
  validateStatus: function (status) {
    return status == 200
  }
})

/* 
  @param recipients overwrite user recipients, ignore if set to null
  @param accounts overwrite user accounts, ignore if set to null
  @param transfers clear existing transfers and add the new transfers
         ignore if set to null
 */
async function resetUser (data: {
  recipients: ?Array<RecipientType>,
  accounts: ?Array<BackEndCryptoAccountType>,
  transfers: ?Array<TransferDataType>
}) {
  await chainsferApi.post('/user', {
    clientId: 'test-client',
    action: 'RESET_USER',
    idToken: GOOGLE_LOGIN_AUTH_OBJ.idToken,
    data
  })
}

async function resetUserDefault () {
  await resetUser({
    recipients: RECIPIENTS,
    accounts: ACCOUNTS,
    transfers: DEFAULT_DATA.transferDataList
  })
}

export { resetUser, resetUserDefault }