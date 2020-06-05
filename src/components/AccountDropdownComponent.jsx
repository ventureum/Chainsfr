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
import { getCryptoSymbol, getCryptoLogo, cryptoOrder } from '../tokens.js'
import type { AccountData, GroupedAccountType } from '../types/account.flow'
import { getWalletLogo, getWalletTitle, getWalletConfig } from '../wallet'
import { getPlatformTitle } from '../platforms'
import path from '../Paths'

// Material Icons
import AddIcon from '@material-ui/icons/AddRounded'

type Props = {
  account: ?AccountData,
  groupedAccount: ?GroupedAccountType,
  groupedCryptoAccounts: Array<Object>,
  purpose: string,
  pending: boolean,
  hideCryptoDropdown: boolean,
  error: Object,
  onChange: Function,
  addAccount: Function,
  toCurrencyAmount: Function,
  inputLabel: string,
  disableAccountSelect: boolean,
  push: Function
}

type State = {
  groupedAccount: ?GroupedAccountType,
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
    if (this.accountCryptoTypeSelectionLabelRef.current) {
      this.setState({
        accountCryptoTypeSelectionLabelWidth: this.accountCryptoTypeSelectionLabelRef.current
          .offsetWidth
      })
    }

    if (this.groupedAccountSelectionLabelRef.current) {
      this.setState({
        groupedAccountSelectionLabelWidth: this.groupedAccountSelectionLabelRef.current.offsetWidth
      })
    }
  }

  componentDidUpdate (prevProps: Props) {
    const { groupedAccount, groupedCryptoAccounts, inputLabel } = this.props
    if (
      !groupedAccount &&
      groupedCryptoAccounts &&
      groupedCryptoAccounts.length === 1 &&
      JSON.stringify(this.state.groupedAccount) !== JSON.stringify(groupedCryptoAccounts[0])
    ) {
      // auto-select grouped account
      this.autoSelectAccount(groupedCryptoAccounts[0])
    }
    if (
      groupedAccount &&
      // deep object comparison
      JSON.stringify(this.state.groupedAccount) !== JSON.stringify(groupedAccount)
    ) {
      this.autoSelectAccount(groupedAccount)
    }

    // update selected groupedAccount accountData if groupedCryptoAccounts have
    // been updated (e.g. sync status, balance value)
    if (this.state.groupedAccount && groupedCryptoAccounts) {
      const _groupedAccount = this.state.groupedAccount
      // find corresponding groupedAccount in groupedCryptoAccounts list
      const targetGroupedAccount = groupedCryptoAccounts.find(ga => {
        if (ga.walletType === 'coinbaseOAuthWallet') {
          return ga.walletType === _groupedAccount.walletType && ga.email === _groupedAccount.email
        } else {
          return (
            ga.walletType === _groupedAccount.walletType &&
            ga.platformType === _groupedAccount.platformType
          )
        }
      })

      // check if at least one of accountData items have changed
      // e.g. sync status, balance updates
      // using deep object comparison to check
      if (JSON.stringify(this.state.groupedAccount) !== JSON.stringify(targetGroupedAccount)) {
        this.setState({ groupedAccount: targetGroupedAccount })
      }
    }

    if (prevProps.inputLabel !== inputLabel) {
      if (this.accountCryptoTypeSelectionLabelRef.current) {
        this.setState({
          accountCryptoTypeSelectionLabelWidth: this.accountCryptoTypeSelectionLabelRef.current
            .offsetWidth
        })
      }
      if (this.groupedAccountSelectionLabelRef.current) {
        this.setState({
          groupedAccountSelectionLabelWidth: this.groupedAccountSelectionLabelRef.current
            .offsetWidth
        })
      }
    }
  }

  autoSelectAccount = (groupedAccount: Object) => {
    // first set groupedAccount (a.k.a auto select walletType and platformType)
    this.setState({ groupedAccount: groupedAccount })
    // then check if we only have one account in the groupedAccount
    // if so, auto select cryptoType/email
    if (groupedAccount.accounts && groupedAccount.accounts.length === 1) {
      // auto-select if accounts length is 1
      this.props.onChange({ target: { value: groupedAccount.accounts[0] } })
    }
  }

  renderGroupedAccountItem = (item: Object, purpose?: string) => {
    if (item.skeletonOnly) {
      return (
        <React.Fragment>
          <Box pr={1} mb={1}>
            <Skeleton
              variant='circle'
              data-test-id='account_load_skeleton'
              width={40}
              height={40}
            />
          </Box>
          <Skeleton height={6} />
          <Skeleton height={6} width='80%' />
        </React.Fragment>
      )
    }
    const walletConfig = getWalletConfig(item.walletType)
    return (
      <Box>
        <Box display='flex' flexDirection='row' alignItems='center'>
          <Box mr={1} display='inline'>
            {/* wallet icon */}
            <Avatar style={{ borderRadius: '2px' }} src={getWalletLogo(item.walletType)} />
          </Box>
          <Box>
            {/* name and wallet title*/}
            <Typography variant='body2'>{item.name}</Typography>
            <Typography variant='caption'>
              {getWalletTitle(item.walletType)}
              {item.platformType && `, ${getPlatformTitle(item.platformType)}`}
            </Typography>
            {!walletConfig.sendable && purpose === 'send' && (
              <Typography variant='caption' component='p'>
                {walletConfig.sendDisabledReason}
              </Typography>
            )}
          </Box>
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
            <Avatar style={{ borderRadius: '2px' }} src={getCryptoLogo(account.cryptoType)} />
          </Box>
          <Box>
            {/* name and wallet title*/}
            <Typography variant='body2' data-test-id='coin_symbol'>
              {getCryptoSymbol(account.cryptoType)}
            </Typography>
          </Box>
        </Box>
        {/* balance */}
        <Box display='flex' flexDirection='column' alignItems='flex-end'>
          {account.status === accountStatus.syncing ? (
            <Skeleton
              style={{ margin: '0px', width: '100%', minWidth: '100px' }}
              data-test-id='account_sync_skeleton'
            />
          ) : (
            <Typography variant='body2' data-test-id='coin_balance'>
              {account.balanceInStandardUnit} {getCryptoSymbol(account.cryptoType)}
            </Typography>
          )}
          <Typography variant='caption' data-test-id='coin_currency_balance'>
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
      hideCryptoDropdown,
      disableAccountSelect,
      push
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
    let sortedAccounts = []
    if (groupedAccount && groupedAccount.accounts) {
      // Must copy to avoid making changes to groupedAccount.accounts 
      sortedAccounts = [...groupedAccount.accounts]
      sortedAccounts.sort((a, b) => {
        return cryptoOrder[b.cryptoType] - cryptoOrder[a.cryptoType]
      })
    }
    return (
      <Grid container direction='column'>
        <FormControl
          variant='outlined'
          margin={hideCryptoDropdown ? 'none' : 'normal'}
          disabled={disableAccountSelect}
        >
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
            inputProps={{ 'data-test-id': 'account_selection' }}
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
            {!pending &&
              groupedCryptoAccounts.map((groupedAccountData, index) => {
                return (
                  <MenuItem
                    key={index}
                    value={groupedAccountData}
                    disabled={
                      purpose === 'send' &&
                      !getWalletConfig(groupedAccountData.walletType).sendable
                    }
                    data-test-id={`grouped_account_item_${groupedAccountData.walletType}_${
                      groupedAccountData.platformType
                    }`}
                  >
                    {this.renderGroupedAccountItem(groupedAccountData, purpose)}
                  </MenuItem>
                )
              })}
            {groupedCryptoAccounts.length !== 0 && <Divider />}
            <MenuItem value='addCryptoAccounts'>
              {purpose === 'send' ? (
                <Grid container justify='space-between' alignItems='center' spacing={1}>
                  <Grid item xs={12} sm>
                    <Typography variant='body2'>Want to use your other wallets?</Typography>
                  </Grid>
                  <Grid item xs={12} sm='auto'>
                    <Button variant='contained' onClick={() => push(path.connections)}>
                      Add Connection
                    </Button>
                  </Grid>
                </Grid>
              ) : (
                <Button onClick={() => addAccount()} color='primary' fullWidth>
                  <AddIcon fontSize='small' />
                  Add connection to your wallet
                </Button>
              )}
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
                  name='Select Wallet'
                />
              }
              inputProps={{ 'data-test-id': 'crypto_selection' }}
              error={!!error}
              id='accountCryptoTypeSelection'
            >
              {sortedAccounts.length !== 0 &&
                sortedAccounts.map((accountData, index) => {
                  return (
                    <MenuItem
                      key={index}
                      value={accountData}
                      disabled={
                        purpose === 'send' && !getWalletConfig(accountData.walletType).sendable
                      }
                      data-test-id={`crypto_list_item_${accountData.cryptoType}`}
                    >
                      {this.renderGroupedAccountCryptoTypeItem(accountData)}
                    </MenuItem>
                  )
                })}
            </Select>
            {account && account.status === accountStatus.syncing && (
              <Box
                mt={1}
                p={2}
                bgcolor='background.default'
                borderRadius={4}
                data-test-id='syncing'
              >
                <Typography variant='body2' style={{ marginBottom: '10px' }}>
                  Checking wallet information
                </Typography>
                <LinearProgress />
              </Box>
            )}
            {account && account.status === accountStatus.synced && (
              <Box ml={1}>
                <Typography variant='caption' data-test-id='coin_address'>
                  Address: {account.address}
                </Typography>
              </Box>
            )}
          </FormControl>
        )}
      </Grid>
    )
  }
}

export default AccountDropdownComponent
