// @flow
import * as TransferFormComponents from '../components/TransferFormComponents'

import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import type { EmailType } from '../types/user.flow'
import Grid from '@material-ui/core/Grid'
import { getRecipients } from '../actions/userActions'
import { getTxFee } from '../actions/transferActions.js'
import { push } from 'connected-react-router'
import update from 'immutability-helper'
import { updateTransferForm } from '../actions/formActions'
import { useActionTracker } from '../hooksUtils'
import utils from '../utils'
import path from '../Paths.js'

type Props = {
  online: boolean,
  walletSelectionPrefilled: string,
  addressPrefilled: string,
  destinationPrefilled: EmailType,
  receiverNamePrefilled: string,
  cryptoTypePrefilled: string,
  walletSelectionPrefilled: string,
  platformTypePrefilled: string,
  addressPrefilled: string,
  xpubPrefilled: string
}

/*
 * EmailTransferFormContainer validates the form using its
 * own logic
 */

export default function EmailTransferFormContainer (props: Props) {
  const {
    online,
    destinationPrefilled,
    receiverNamePrefilled,
    cryptoTypePrefilled,
    walletSelectionPrefilled,
    platformTypePrefilled,
    addressPrefilled,
    xpubPrefilled
  } = props

  const profile = useSelector(state => state.userReducer.profile)
  const transferForm = useSelector(state => state.formReducer.transferForm)
  const recipients = useSelector(state => state.userReducer.recipients)
  const txFee = useSelector(state => state.transferReducer.txFee)
  const cryptoPrice = useSelector(state => state.cryptoPriceReducer.cryptoPrice)
  const currency = useSelector(state => state.cryptoPriceReducer.currency)

  const { formError } = transferForm

  const accountSelection = useSelector(state =>
    state.accountReducer.cryptoAccounts.find(_account =>
      utils.accountsEqual(_account, { id: state.formReducer.transferForm.accountId })
    )
  )

  const validateForm = transferForm => {
    // form must be filled without errors
    return (
      !!transferForm.accountId &&
      !!transferForm.senderName &&
      !!transferForm.sender &&
      !!transferForm.destination &&
      !!transferForm.receiverName &&
      !!transferForm.transferAmount &&
      !!transferForm.password &&
      !transferForm.formError.senderName &&
      !transferForm.formError.sender &&
      !transferForm.formError.destination &&
      !transferForm.formError.transferAmount &&
      !transferForm.formError.password &&
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

  // on mount with profile
  useEffect(
    () => {
      if (profile.isAuthenticated) {
        // prefill form
        updateForm({
          sender: { $set: profile.profileObj.email },
          senderName: { $set: profile.profileObj.name },
          destination: { $set: destinationPrefilled || transferForm.destination },
          receiverName: { $set: receiverNamePrefilled || transferForm.receiverName },

          // always clear transferAmount
          // this also applies going from step 2 to step 1
          transferAmount: { $set: '' },
          transferCurrencyAmount: { $set: '' },

          accountId: {
            $set: JSON.stringify({
              walletType: walletSelectionPrefilled,
              platformType: platformTypePrefilled,
              cryptoType: cryptoTypePrefilled,
              address: addressPrefilled,
              xpub: xpubPrefilled
            })
          }
        })
        // fetch recipients
        dispatch(getRecipients())
      }
    },
    // set data once user is logged in
    [profile.isAuthenticated]
  )

  // helper functions for converting currency
  const toCurrencyAmount = (cryptoAmount, cryptoType) =>
    utils.toCurrencyAmount(cryptoAmount, cryptoPrice[cryptoType])
  const toCryptoAmount = (currencyAmount, cryptoType) =>
    utils.toCryptoAmount(currencyAmount, cryptoPrice[cryptoType])

  const { actionsPending, actionsFulfilled } = useActionTracker(['getTxFee'], [['GET_TX_COST']])

  return (
    <Grid container direction='column' justify='center' alignItems='stretch'>
      <Grid item style={{ marginBottom: 30 }}>
        <TransferFormComponents.Title title={'Set up Transfer'} />
      </Grid>
      <Grid item>
        <TransferFormComponents.SelectRecipient
          destination={transferForm.destination}
          recipients={recipients}
          formError={formError}
          updateForm={updateForm}
          online={online}
        />
      </Grid>
      <Grid item>
        <TransferFormComponents.AccountDropdown
          purpose={'send'}
          accountSelection={accountSelection}
          filterCriteria={accountData =>
            !walletSelectionPrefilled ||
            (accountData.walletType === walletSelectionPrefilled &&
              accountData.platformType === platformTypePrefilled &&
              (accountData.address === addressPrefilled ||
                (accountData.hdWalletVariables &&
                  accountData.hdWalletVariables.xpub === xpubPrefilled)))
          }
          updateForm={updateForm}
          online={online}
        />
      </Grid>
      <Grid item>
        <TransferFormComponents.TransferAmountTextField
          accountSelection={accountSelection}
          transferAmount={transferForm.transferAmount}
          transferCurrencyAmount={transferForm.transferCurrencyAmount}
          txFee={txFee}
          toCurrencyAmount={toCurrencyAmount}
          toCryptoAmount={toCryptoAmount}
          currency={currency}
          formError={formError}
          getTxFee={txRequest => dispatch(getTxFee(txRequest))}
          updateForm={updateForm}
          disabled={!accountSelection || accountSelection.status !== 'SYNCED'}
          {...{ actionsPending, actionsFulfilled }}
        />
      </Grid>
      <Grid item>
        <TransferFormComponents.SecurityAnswer
          password={transferForm.password}
          updateForm={updateForm}
          formError={formError}
        />
      </Grid>
      <Grid item>
        <TransferFormComponents.SendMessage
          password={transferForm.password} // for cross validation
          sendMessage={transferForm.sendMessage}
          updateForm={updateForm}
          formError={formError}
        />
      </Grid>
      <Grid item>
        <TransferFormComponents.NavigationButtons
          validated={transferForm.validated || actionsPending.getTxFee || !online}
          onClickPrevious={() => dispatch(push(path.home))}
          onClickNext={() => dispatch(push(`${path.transfer}?step=1`))}
        />
      </Grid>
    </Grid>
  )
}
