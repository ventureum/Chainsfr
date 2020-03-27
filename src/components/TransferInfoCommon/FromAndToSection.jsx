// @flow
import React, { Component } from 'react'
import Avatar from '@material-ui/core/Avatar'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import UserAvatar from '../MicroComponents/UserAvatar'
import Divider from '@material-ui/core/Divider'
import Button from '@material-ui/core/Button'
import { getWalletLogo, getWalletTitle } from '../../wallet'
import { getCryptoTitle } from '../../tokens'
import type { AccountData } from '../../types/account.flow'

// render account data
// row: wallet icon [row: account.name, row: account.platformType]
// row: Show address btn
class AccountInfo extends Component<
  {
    account: AccountData,
    directionLabel: string
  },
  {
    showAddress: boolean
  }
> {
  state = {
    showAddress: false
  }

  render () {
    const { account, directionLabel } = this.props
    const { showAddress } = this.state

    return (
      <Box display='flex' flexDirection='column' alignItems='flex-start' width='100%'>
        <Box display='flex' flexDirection='row' alignItems='center' mb={2}>
          <Box mr={1}>
            <Avatar
              style={{ borderRadius: '2px', width: '32px' }}
              src={getWalletLogo(account.walletType)}
            ></Avatar>
          </Box>
          <Box>
            <Typography
              variant='body2'
              id='senderName'
              data-test-id={`${directionLabel.toLowerCase()}_account_name`}
            >
              {account.name}
            </Typography>
            <Typography
              variant='caption'
              id='sender'
              data-test-id={`${directionLabel.toLowerCase()}_wallet_platform`}
            >
              {`${getWalletTitle(account.walletType)}, ${getCryptoTitle(account.platformType)}`}
            </Typography>
          </Box>
        </Box>
        <Button
          style={{
            background: `rgba(57, 51, 134, 0.1)`,
            borderRadis: '4px',
            fontSize: '12px',
            padding: '6px 10px 6px 10px'
          }}
          color='primary'
          onClick={() => this.setState({ showAddress: !showAddress })}
          data-test-id={`show_${directionLabel.toLowerCase()}_address_btn`}
        >
          {showAddress ? 'Hide Address' : 'Show Address'}
        </Button>
        {showAddress && (
          <Box mt={1}>
            <Typography variant='caption' data-test-id={`${directionLabel.toLowerCase()}_address`}>
              {account.address}
            </Typography>
          </Box>
        )}
      </Box>
    )
  }
}

export type UserInfoType = {
  name: string,
  email: string,
  directionLabel: string,
  avatar?: string // optional avatar img
}

function UserInfo (props: UserInfoType) {
  const { name, email, avatar, directionLabel } = props

  return (
    <Box display='flex' flexDirection='row' alignItems='center'>
      <Box mr={1}>
        <UserAvatar name={name} src={avatar} style={{ width: 32 }} />
      </Box>
      <Box>
        <Typography variant='body2' data-test-id={`${directionLabel.toLowerCase()}_name`}>
          {name}
        </Typography>
        <Typography variant='caption' data-test-id={`${directionLabel.toLowerCase()}_email`}>
          {email}
        </Typography>
      </Box>
    </Box>
  )
}

function FromAndToSection (props: {
  directionLabel: string,
  user: ?UserInfoType,
  account: ?AccountData
}) {
  const { directionLabel, user, account } = props
  return (
    <Box display='flex' flexDirection='row' alignItems='flex-start' width='100%'>
      {/* transfer direction label */}
      <Box mr={2} mt={1} width='60px'>
        <Typography
          variant='button'
          align='center'
          style={{
            borderRadius: '100px',
            color: '#777777',
            height: '14px',
            fontSize: '12px',
            padding: '5px 10px 5px 10px',
            backgroundColor: '#E9E9E9'
          }}
        >
          {directionLabel}
        </Typography>
      </Box>
      {/* user info and account info (optional) shown in one column */}
      <Box display='flex' flexDirection='column' alignItems='flex-start' width='100%'>
        {user && <UserInfo {...user} directionLabel={directionLabel} />}
        {/* separate user and account by a divider */}
        {user && account && (
          <Box pt={1} pb={1} width='100%'>
            <Divider />
          </Box>
        )}
        {account && <AccountInfo account={account} directionLabel={directionLabel} />}
      </Box>
    </Box>
  )
}

export default FromAndToSection
