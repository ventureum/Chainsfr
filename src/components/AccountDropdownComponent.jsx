// @flow
import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import Avatar from '@material-ui/core/Avatar'
import Button from '@material-ui/core/Button'
import Box from '@material-ui/core/Box'
import LinearProgress from '@material-ui/core/LinearProgress'
import Select from '@material-ui/core/Select'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import OutlinedInput from '@material-ui/core/OutlinedInput'
import Divider from '@material-ui/core/Divider'
import Typography from '@material-ui/core/Typography'
import Skeleton from '@material-ui/lab/Skeleton'
import { accountStatus } from '../types/account.flow'
import { getCryptoSymbol, getCryptoLogo } from '../tokens.js'
import type { AccountData } from '../types/account.flow'
import { getWalletLogo, getWalletTitle, getWalletConfig } from '../wallet'
import { getPlatformTitle } from '../platforms'

// Material Icons
import AddIcon from '@material-ui/icons/AddRounded'

type Props = {
  account: ?AccountData,
  groupedAccount: ?Object,
  groupedCryptoAccounts: Array<Object>,
  purpose: string,
  pending: boolean,
  hideCryptoDropdown: boolean,
  error: Object,
  onChange: Function,
  addAccount: Function,
  toCurrencyAmount: Function,
  inputLabel: string
}

type State = {
  groupedAccount: ?Object,
  accountCryptoTypeSelectionLabelWidth: number,
  groupedAccountSelectionLabelWidth: number
}

class AccountDropdownComponent extends Component<Props, State> {
  groupedAccountSelectionLabelRef: any
  accountCryptoTypeSelectionLabelRef: any

  constructor (props: Props) {
    super(props)
    this.state = {
      groupedAccount: null,
      groupedAccountSelectionLabelWidth: 0,
      accountCryptoTypeSelectionLabelWidth: 0
    }
    this.groupedAccountSelectionLabelRef = React.createRef()
    this.accountCryptoTypeSelectionLabelRef = React.createRef()
  }
  componentDidMount () {
    this.setState({
      accountCryptoTypeSelectionLabelWidth: this.accountCryptoTypeSelectionLabelRef.current
        ? this.accountCryptoTypeSelectionLabelRef.current.offsetWidth
        : 0,
      groupedAccountSelectionLabelWidth: this.groupedAccountSelectionLabelRef.current.offsetWidth
    })
  }

  componentDidUpdate () {
    const { groupedAccount } = this.props
    if (
      groupedAccount &&
      // deep object comparison
      JSON.stringify(this.state.groupedAccount) !== JSON.stringify(groupedAccount)
    ) {
      this.setState({ groupedAccount: groupedAccount })
      this.autoSelectAccount(groupedAccount)
    }
  }

  autoSelectAccount = (groupedAccount: Object) => {
    if (groupedAccount.accounts && groupedAccount.accounts.length === 1) {
      // auto-select if accounts length is 1
      this.props.onChange({ target: { value: groupedAccount.accounts[0] } })
    }
  }

  renderGroupedAccountItem = (item: Object) => {
    if (item.skeletonOnly) {
      return (
        <React.Fragment>
          <Box pr={1} mb={1}>
            <Skeleton variant='circle' width={40} height={40} />
          </Box>
          <Skeleton height={6} />
          <Skeleton height={6} width='80%' />
        </React.Fragment>
      )
    }

    return (
      <Box display='flex' flexDirection='row' alignItems='center'>
        <Box mr={1} display='inline'>
          {/* wallet icon */}
          <Avatar style={{ borderRadius: '2px' }} src={getWalletLogo(item.walletType)}></Avatar>
        </Box>
        <Box>
          {/* name and wallet title*/}
          <Typography variant='body2'>{item.name}</Typography>
          <Typography variant='caption'>
            {getWalletTitle(item.walletType)}
            {item.platformType && `, ${getPlatformTitle(item.platformType)}`}
          </Typography>
        </Box>
      </Box>
    )
  }

  renderGroupedAccountCryptoTypeItem = (account: AccountData) => {
    return (
      <Box display='flex' justifyContent='space-between' flexGrow={1}>
        <Box display='flex' flexDirection='row' alignItems='center'>
          <Box mr={1} display='inline'>
            {/* wallet icon */}
            <Avatar
              style={{ borderRadius: '2px' }}
              src={getCryptoLogo(account.cryptoType)}
            ></Avatar>
          </Box>
          <Box>
            {/* name and wallet title*/}
            <Typography variant='body2'>{getCryptoSymbol(account.cryptoType)}</Typography>
          </Box>
        </Box>
        {/* balance */}
        <Box display='flex' flexDirection='column' alignItems='flex-end'>
          {account.status === accountStatus.syncing ? (
            <Skeleton style={{ margin: '0px', width: '100%', minWidth: '100px' }} />
          ) : (
            <Typography variant='body2'>
              {account.balanceInStandardUnit} {getCryptoSymbol(account.cryptoType)}
            </Typography>
          )}
          <Typography variant='caption'>
            {this.props.toCurrencyAmount(account.balanceInStandardUnit, account.cryptoType)}
          </Typography>
        </Box>
      </Box>
    )
  }

  render () {
    const {
      account,
      groupedCryptoAccounts,
      purpose,
      onChange,
      addAccount,
      pending,
      error,
      inputLabel,
      hideCryptoDropdown
    } = this.props

    let skeletonCryptoAccounts = []
    if (pending) {
      skeletonCryptoAccounts = [
        { skeletonOnly: true },
        { skeletonOnly: true },
        { skeletonOnly: true }
      ]
    }

    const { groupedAccount } = this.state

    return (
      <Grid container direction='column'>
        <FormControl variant='outlined' margin='normal'>
          <InputLabel ref={this.groupedAccountSelectionLabelRef} id='groupedAccountSelectionLabel'>
            {inputLabel}
          </InputLabel>
          <Select
            labelId='groupedAccountSelectionLabel'
            renderValue={this.renderGroupedAccountItem}
            value={groupedAccount || ''}
            onChange={e => {
              if (e.target.value !== 'addCryptoAccounts') {
                let groupedAccount = e.target.value
                this.setState({ groupedAccount })
                if (groupedAccount.accounts && groupedAccount.accounts.length > 1) {
                  // have more than one crypto types
                  // cannot auto select, clear cryptoType selection
                  onChange({ target: { value: null } })
                } else {
                  // only have one account -> one crypto type
                  // auto select account
                  this.autoSelectAccount(groupedAccount)
                }
              }
            }}
            input={
              <OutlinedInput
                labelWidth={this.state.groupedAccountSelectionLabelWidth}
                name={inputLabel}
              />
            }
            error={!!error}
            id='groupedAccountSelection'
          >
            {skeletonCryptoAccounts.map((groupedAccountData, index) => {
              return (
                <MenuItem key={index} value={groupedAccountData}>
                  {this.renderGroupedAccountItem(groupedAccountData)}
                </MenuItem>
              )
            })}
            {groupedCryptoAccounts.map((groupedAccountData, index) => {
              return (
                <MenuItem
                  key={index}
                  value={groupedAccountData}
                  disabled={
                    purpose === 'send' && !getWalletConfig(groupedAccountData.walletType).sendable
                  }
                >
                  {this.renderGroupedAccountItem(groupedAccountData)}
                </MenuItem>
              )
            })}
            {groupedCryptoAccounts.length !== 0 && <Divider />}
            <MenuItem value='addCryptoAccounts'>
              <Button onClick={() => addAccount()} color='primary' fullWidth>
                <AddIcon fontSize='small' />
                Add Account
              </Button>
            </MenuItem>
          </Select>
        </FormControl>
        {!hideCryptoDropdown && (
          <FormControl variant='outlined' margin='normal' disabled={!groupedAccount}>
            <InputLabel
              ref={this.accountCryptoTypeSelectionLabelRef}
              id='accountCryptoTypeSelectionLabel'
            >
              Select Coin
            </InputLabel>
            <Select
              labelId='accountCryptoTypeSelectionLabel'
              renderValue={this.renderGroupedAccountCryptoTypeItem}
              value={account || ''}
              onChange={onChange} // output final account selected
              input={
                <OutlinedInput
                  labelWidth={this.state.accountCryptoTypeSelectionLabelWidth}
                  name='Select Account'
                />
              }
              error={!!error}
              id='accountCryptoTypeSelection'
            >
              {groupedAccount &&
                groupedAccount.accounts.map((accountData, index) => {
                  return (
                    <MenuItem
                      key={index}
                      value={accountData}
                      disabled={
                        purpose === 'send' && !getWalletConfig(accountData.walletType).sendable
                      }
                    >
                      {this.renderGroupedAccountCryptoTypeItem(accountData)}
                    </MenuItem>
                  )
                })}
            </Select>
            {account && account.status === accountStatus.syncing && (
              <Box mt={1} p={2} bgcolor='background.default' borderRadius={4}>
                <Typography variant='body2' style={{ marginBottom: '10px' }}>
                  Checking your account
                </Typography>
                <LinearProgress />
              </Box>
            )}
            {account && account.status === accountStatus.synced && (
              <Box ml={1}>
                <Typography variant='caption'>Address {account.address}</Typography>
              </Box>
            )}
          </FormControl>
        )}
      </Grid>
    )
  }
}

export default AccountDropdownComponent
