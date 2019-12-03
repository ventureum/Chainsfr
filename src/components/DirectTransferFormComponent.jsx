import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles'

import clsx from 'clsx'
import Grid from '@material-ui/core/Grid'
import Icon from '@material-ui/core/Icon'
import InputAdornment from '@material-ui/core/InputAdornment'
import TextField from '@material-ui/core/TextField'
import AccountDropdown from '../containers/AccountDropdownContainer'
import { getCryptoSymbol } from '../tokens'

class DirectTransferFormComponent extends Component {
  render () {
    const {
      classes,
      currency,
      handleTransferFormChange,
      accountSelection,
      transferForm,
      balanceCurrencyAmount
    } = this.props
    const { formError, transferAmount, transferCurrencyAmount, destination } = transferForm
    return (
      <Grid container direction='column' spacing={2}>
        <Grid item>
          <TextField
            fullWidth
            id='sender'
            label='From'
            margin='normal'
            variant='outlined'
            value={'Chainsfr Wallet'}
            disabled
          />
        </Grid>
        <Grid item>
          <AccountDropdown
            onChange={handleTransferFormChange('destination')}
            filterCriteria={accountData => accountData.walletType !== 'drive'}
            accountId={destination}
            inputLabel='To'
          />
        </Grid>
        <Grid item>
          <Grid container direction='row' justify='center' alignItems='center' spacing={2}>
            <Grid item xs>
              <TextField
                margin='normal'
                fullWidth
                id='currencyAmount'
                variant='outlined'
                label='Fiat'
                error={!!formError.transferCurrencyAmount}
                helperText={formError.transferCurrencyAmount || `Balance: ${balanceCurrencyAmount}`}
                type='number'
                disabled={!accountSelection}
                onChange={handleTransferFormChange('transferCurrencyAmount')}
                value={transferCurrencyAmount}
                InputProps={{
                  startAdornment: <InputAdornment position='start'>{currency}</InputAdornment>
                }}
              />
            </Grid>
            <Grid item align='center'>
              <Icon className={clsx(classes.icon, 'fa fa-exchange-alt')} />
            </Grid>
            <Grid item xs>
              <TextField
                margin='normal'
                fullWidth
                id='cryptoAmount'
                variant='outlined'
                label='Amount (Cryptocurrency)'
                error={!!formError.transferAmount}
                type='number'
                helperText={
                  formError.transferAmount ||
                  (accountSelection
                    ? `Balance: ${accountSelection.balanceInStandardUnit} ${getCryptoSymbol(
                        accountSelection.cryptoType
                      )}`
                    : 'Balance: 0')
                }
                disabled={!accountSelection}
                onChange={handleTransferFormChange('transferAmount')}
                value={transferAmount}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      {getCryptoSymbol(accountSelection && accountSelection.cryptoType)}
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    )
  }
}

const styles = theme => ({})
export default withStyles(styles)(DirectTransferFormComponent)
