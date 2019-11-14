// @flow
import React, { Component } from 'react'
import clsx from 'clsx'
import Grid from '@material-ui/core/Grid'
import Avatar from '@material-ui/core/Avatar'
import Button from '@material-ui/core/Button'
import Box from '@material-ui/core/Box'
import LinearProgress from '@material-ui/core/LinearProgress'
import { withStyles } from '@material-ui/core/styles'
import Select from '@material-ui/core/Select'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import OutlinedInput from '@material-ui/core/OutlinedInput'
import Divider from '@material-ui/core/Divider'
import Typography from '@material-ui/core/Typography'
import { accountStatus } from '../types/account.flow'

type Props = {
  classes: Object,
  account: ?Object,
  cryptoAccounts: Array<Object>,
  error: Object,
  onChange: Function
}

class AccountDropdownComponent extends Component<Props> {
  renderAccountItem = item => {
    const { classes } = this.props
    return (
      <div>
        <Typography>{item.name}</Typography>
        <Typography className={classes.securityAnswerBtnHelperText}>
          {item.address}
        </Typography>
      </div>
    )
  }

  render () {
    const { classes, account, cryptoAccounts, onChange, error } = this.props
    return (
      <>
        <Grid item>
          <FormControl className={classes.formControl} variant='outlined'>
            <InputLabel htmlFor='destination-helper'>Select Account</InputLabel>
            <Select
              renderValue={value => {
                return (
                  <div>
                    <Typography>{value.name}</Typography>
                    <Typography className={classes.securityAnswerBtnHelperText}>
                      {value.cryptoType === 'bitcoin'
                        ? `${value.hdWalletVariables.xpub.slice(
                          0,
                          16
                        )}...${value.hdWalletVariables.xpub.slice(-24)}`
                        : value.address}
                    </Typography>
                  </div>
                )
              }}
              value={account || ''}
              onChange={onChange}
              input={<OutlinedInput labelWidth={125} name='Select Account' />}
              error={!!error}
              id='accountSelection'
            >
              {cryptoAccounts.map((accountData, index) => {
                return (
                  <MenuItem key={index} value={accountData}>
                    {this.renderAccountItem(accountData)}
                  </MenuItem>
                )
              })}
              {cryptoAccounts.length !== 0 && <Divider />}
              <MenuItem value='addCryptoAccount'>
                <Button onClick={() => {}} style={{ width: '100%' }}>
                  <Typography>Add Account</Typography>
                </Button>
              </MenuItem>
            </Select>
          </FormControl>
          {account && account.status === accountStatus.syncing && (
            <Box
              style={{
                padding: '20px',
                backgroundColor: 'rgba(57, 51, 134, 0.05)',
                borderRadius: '4px'
              }}
            >
              <Typography variant='body2' style={{ marginBottom: '10px' }}>
                Checking your account
              </Typography>
              <LinearProgress />
            </Box>
          )}
        </Grid>
      </>
    )
  }
}

const styles = theme => ({
  formControl: {
    width: '100%',
    margin: '5px 0px 5px 0px'
  }
})

export default withStyles(styles)(AccountDropdownComponent)
