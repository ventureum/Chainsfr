// @flow
import React from 'react'
import AccountDropdownContainer from '../../containers/AccountDropdownContainer'

type Props = {
  online: boolean,
  purpose: string,
  accountId: Object,
  filterCriteria: Function,
  updateForm: Function
}
export default function AccountDropdown (props: Props) {
  const updateAccountSelection = account =>
    props.updateForm({
      accountId: { $set: account }
    })

  return (
    <AccountDropdownContainer {...props} onChange={updateAccountSelection} />
  )
}
