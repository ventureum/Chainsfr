import React, { Component } from 'react'

import { withStyles } from '@material-ui/core/styles'
import { Typography, Button, Grid, Divider } from '@material-ui/core'
import AccountCircle from '@material-ui/icons/AccountCircle'
import Avatar from '@material-ui/core/Avatar'
import SendIcon from '@material-ui/icons/Send'
import MoreIcon from '@material-ui/icons/MoreHoriz'
import IconButton from '@material-ui/core/IconButton'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import Tooltip from '@material-ui/core/Tooltip'
import Table from '@material-ui/core/Table'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableBody from '@material-ui/core/TableBody'
import Skeleton from '@material-ui/lab/Skeleton'
import { getCryptoSymbol, getCryptoLogo } from '../tokens.js'
import { accountStatus } from '../types/account.flow'
import { getWalletTitle } from '../wallet'
import AddAccountModal from '../containers/AddAccountModalContainer'

class AccountsManagementComponent extends Component {
  state = {
    addAccountModal: false
  }

  toggleAddAccountModal = () => {
    this.setState(prevState => {
      return {
        addAccountModal: !prevState.addAccountModal
      }
    })
  }

  renderCryptoAccountsList = () => {
    const { classes, cryptoAccounts, actionsPending } = this.props
    return (
      <Grid container direction='column'>
        {!actionsPending.getCryptoAccounts && cryptoAccounts.length === 0 ? (
          <Typography variant='body1' align='center'>
            It seems you don't have any accounts saved
          </Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Account Name</TableCell>
                <TableCell align='right'>Provider</TableCell>
                <TableCell align='right'>Amount</TableCell>
                <TableCell align='right'>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cryptoAccounts.map((accountData, i) => {
                return (
                  <TableRow key={i}>
                    <TableCell component='th' scope='row'>
                      <Grid container spacing={1}>
                        <Grid item>
                          <Avatar src={getCryptoLogo(accountData.cryptoType)}></Avatar>
                        </Grid>
                        <Grid item xs>
                          <Typography variant='body2'>{accountData.name}</Typography>
                          <Typography variant='caption'>
                            {accountData.cryptoType === 'bitcoin'
                              ? `${accountData.hdWalletVariables.xpub.slice(
                                  0,
                                  16
                                )}...${accountData.hdWalletVariables.xpub.slice(-24)}`
                              : accountData.address}
                          </Typography>
                        </Grid>
                      </Grid>
                    </TableCell>
                    <TableCell align='right'>{getWalletTitle(accountData.walletType)}</TableCell>
                    <TableCell align='right'>
                      {accountData.status === accountStatus.syncing ? (
                        <Skeleton style={{ margin: '0px', width: '100%', minWidth: '100px' }} />
                      ) : (
                        `${getCryptoSymbol(accountData.cryptoType)} ${
                          accountData.balanceInStandardUnit
                        }`
                      )}
                    </TableCell>
                    <TableCell align='right'>
                      <MoreIcon className={classes.iconBtn} id='moreBtn' />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
        {/* {moreMenu && this.renderMoreMenu(chosenRecipient)} */}
      </Grid>
    )
  }

  render () {
    const { classes, addCryptoAccount } = this.props
    const { addAccountModal } = this.state
    return (
      <Grid container justify='center'>
        <Grid item className={classes.sectionContainer}>
          <Grid container direction='column'>
            <Grid item style={{ width: '100%' }}>
              <Grid container alignItems='center' justify='space-between'>
                <Grid item>
                  <Typography variant='h2'>Connected Accounts</Typography>
                </Grid>
                <Grid item>
                  <Button
                    className={classes.addRecipientBtn}
                    variant='contained'
                    color='primary'
                    onClick={() => {
                      this.toggleAddAccountModal()
                    }}
                  >
                    Add Account
                  </Button>
                </Grid>
              </Grid>
            </Grid>
            <Grid item>{this.renderCryptoAccountsList()}</Grid>
          </Grid>
        </Grid>
        {addAccountModal && (
          <AddAccountModal
            open={addAccountModal}
            handleClose={this.toggleAddAccountModal}
          ></AddAccountModal>
        )}
      </Grid>
    )
  }
}

const styles = theme => ({
  sectionContainer: {
    width: '100%',
    maxWidth: '1200px',
    margin: '60px 0px 60px 0px',
    padding: '0px 50px 0px 50px'
  },
  recipientItem: {
    padding: '20px'
  },
  recipientItemColored: {
    backgroundColor: '#FAFBFE',
    padding: '20px'
  },
  recipientIcon: {
    fontSize: '40px',
    marginRight: '10px',
    color: '#333333'
  },
  iconBtn: {
    color: '#777777',
    fontSize: '20px'
  },
  divider: {
    margin: '20px 0px 20px 0px'
  }
})
export default withStyles(styles)(AccountsManagementComponent)
