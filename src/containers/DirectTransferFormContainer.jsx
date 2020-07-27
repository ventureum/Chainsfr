// @flow
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import * as TransferFormComponents from '../components/TransferFormComponents'
import Grid from '@material-ui/core/Grid'
import { getRecipients } from '../actions/userActions'
import { getTxFee } from '../actions/transferActions.js'
import { push } from 'connected-react-router'
import update from 'immutability-helper'
import { updateTransferForm } from '../actions/formActions'
import { useActionTracker, usePrevious } from '../hooksUtils'
import utils from '../utils'
import path from '../Paths.js'
type Props = {
  online: boolean
}

/*
 * EmailTransferFormContainer validates the form using its
 * own logic
 */

export default function DirectTransferFormContainer (props: Props) {
  const { online } = props

  const [isSendingFromDriveWallet, setIsSendingFromDriveWallet] = useState(true)

  const profile = useSelector(state => state.userReducer.profile)
  const transferForm = useSelector(state => state.formReducer.transferForm)
  const txFee = useSelector(state => state.transferReducer.txFee)
  const cryptoPrice = useSelector(state => state.cryptoPriceReducer.cryptoPrice)
  const currency = useSelector(state => state.cryptoPriceReducer.currency)
  const cryptoAccounts = useSelector(state => state.accountReducer.cryptoAccounts)

  const { accountId, receiveAccountId, formError } = transferForm

  const sendAccountSelection = useSelector(state =>
    state.accountReducer.cryptoAccounts.find(_account =>
      utils.accountsEqual(_account, { id: state.formReducer.transferForm.accountId })
    )
  )

  const receiveAccountSelection = useSelector(state =>
    state.accountReducer.cryptoAccounts.find(_account =>
      utils.accountsEqual(_account, { id: state.formReducer.transferForm.receiveAccountId })
    )
  )

  const prevIsSendingFromDriveWallet = usePrevious(isSendingFromDriveWallet)

  const validateForm = transferForm => {
    // form must be filled without errors
    return (
      // send account
      !!transferForm.accountId &&
      // receive account
      !!transferForm.receiveAccountId &&
      // other info
      !!transferForm.senderName &&
      !!transferForm.sender &&
      !!transferForm.transferAmount &&
      !!txFee &&
      !transferForm.formError.senderName &&
      !transferForm.formError.sender &&
      !transferForm.formError.transferAmount &&
      !transferForm.formError.sendMessage
    )
  }

  const updateForm = content => {
    const _transferForm = update(transferForm, content)

    dispatch(
      updateTransferForm(
        update(_transferForm, {
          // validate form on every form change
          validated: { $set: validateForm(_transferForm) }
        })
      )
    )
  }

  const dispatch = useDispatch()

  // on mount
  useEffect(() => {
    if (profile.isAuthenticated) {
      // prefill form
      updateForm({
        sender: { $set: profile.profileObj.email },
        senderName: { $set: profile.profileObj.name },
        transferType: { $set: 'DIRECT_TRANSFER' }
      })
      // fetch recipients
      dispatch(getRecipients())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile])

  // update send account selection
  useEffect(() => {
    let selectedCryptoType
    let accountIdType
    if (
      prevIsSendingFromDriveWallet !== undefined &&
      prevIsSendingFromDriveWallet !== isSendingFromDriveWallet
    ) {
      // swap sendAccount and receiveAccount
      updateForm({
        // $FlowFixMe
        accountId: { $set: receiveAccountId },
        receiveAccountId: { $set: accountId },
        // clear amount field after every account
        transferAmount: { $set: '' },
        transferCurrencyAmount: { $set: '' },
        formError: {
          transferAmount: {
            $set: null
          }
        }
      })
    } else {
      if (isSendingFromDriveWallet) {
        if (receiveAccountSelection) {
          // receive account is selected
          // use receive account cryptoType to select drive account
          selectedCryptoType = receiveAccountSelection.cryptoType
          accountIdType = 'accountId'
        }
      } else {
        if (sendAccountSelection) {
          // send account is selected
          // use send account cryptoType to select drive account
          selectedCryptoType = sendAccountSelection.cryptoType
          accountIdType = 'receiveAccountId'
        }
      }
      if (selectedCryptoType && accountIdType) {
        const driveAccount = cryptoAccounts.find(
          account => account.walletType === 'drive' && account.cryptoType === selectedCryptoType
        )
        updateForm({
          // $FlowFixMe
          [accountIdType]: { $set: driveAccount.id },
          // clear amount field after every account
          transferAmount: { $set: '' },
          transferCurrencyAmount: { $set: '' },
          formError: {
            transferAmount: {
              $set: null
            }
          }
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSendingFromDriveWallet, receiveAccountId, accountId])

  // helper functions for converting currency
  const toCurrencyAmount = (cryptoAmount, cryptoType) =>
    utils.toCurrencyAmount(cryptoAmount, cryptoPrice[cryptoType])
  const toCryptoAmount = (currencyAmount, cryptoType) =>
    utils.toCryptoAmount(currencyAmount, cryptoPrice[cryptoType])

  const { actionsPending, actionsFulfilled } = useActionTracker(['getTxFee'], [['GET_TX_COST']])

  const nonDriveAccountsFilter = accountData => accountData.walletType !== 'drive'

  return (
    <Grid container direction='column' justify='center' alignItems='stretch'>
      <Grid item>
        <TransferFormComponents.AccountSwitch
          transferOut={isSendingFromDriveWallet}
          onChange={state => setIsSendingFromDriveWallet(state)}
        />
      </Grid>
      {isSendingFromDriveWallet && (
        <Grid item>
          <TransferFormComponents.MockDriveWalletDropdown inputLabel={'From'} />
        </Grid>
      )}
      <Grid item>
        <TransferFormComponents.AccountDropdown
          inputLabel={isSendingFromDriveWallet ? 'To' : 'From'}
          purpose={isSendingFromDriveWallet ? 'receive' : 'send'}
          accountSelection={
            isSendingFromDriveWallet ? receiveAccountSelection : sendAccountSelection
          }
          filterCriteria={nonDriveAccountsFilter}
          // force use receiveAccountId instead of accountId
          updateForm={content =>
            updateForm(
              isSendingFromDriveWallet
                ? {
                    receiveAccountId: content.accountId
                  }
                : {
                    accountId: content.accountId
                  }
            )
          }
          hideBalance={isSendingFromDriveWallet}
        />
      </Grid>
      {!isSendingFromDriveWallet && (
        <Grid item>
          <TransferFormComponents.MockDriveWalletDropdown inputLabel={'To'} />
        </Grid>
      )}
      <Grid item>
        <TransferFormComponents.TransferAmountTextField
          accountSelection={sendAccountSelection}
          transferAmount={transferForm.transferAmount}
          transferCurrencyAmount={transferForm.transferCurrencyAmount}
          txFee={txFee}
          toCurrencyAmount={toCurrencyAmount}
          toCryptoAmount={toCryptoAmount}
          currency={currency}
          formError={formError}
          getTxFee={txRequest => dispatch(getTxFee(txRequest))}
          updateForm={updateForm}
          disabled={
            !sendAccountSelection ||
            !receiveAccountSelection ||
            sendAccountSelection.status !== 'SYNCED' ||
            receiveAccountSelection.status !== 'SYNCED'
          }
          {...{ actionsPending, actionsFulfilled }}
        />
      </Grid>
      <Grid item>
        <TransferFormComponents.SendMessage
          sendMessage={transferForm.sendMessage}
          updateForm={updateForm}
          formError={formError}
        />
      </Grid>
      <Grid item>
        <TransferFormComponents.NavigationButtons
          validated={transferForm.validated && !actionsPending.getTxFee && online}
          onClickPrevious={() => dispatch(push(path.wallet))}
          onClickNext={() => dispatch(push(`${path.directTransfer}?step=1`))}
        />
      </Grid>
    </Grid>
  )
}
