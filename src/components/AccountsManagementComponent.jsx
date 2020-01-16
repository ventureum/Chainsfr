import React, { Component } from 'react'

import { withStyles } from '@material-ui/core/styles'
import { Typography, Button, Grid } from '@material-ui/core'
import Avatar from '@material-ui/core/Avatar'
import { btnTexts } from '../styles/typography'
import { uiColors } from '../styles/color'
import Box from '@material-ui/core/Box'
import CloseIcon from '@material-ui/icons/Close'
import CircularProgress from '@material-ui/core/CircularProgress'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogActions from '@material-ui/core/DialogActions'
import MoreIcon from '@material-ui/icons/MoreHoriz'
import IconButton from '@material-ui/core/IconButton'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
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
import EmptyStateImage from '../images/empty_state_01.png'

class AccountsManagementComponent extends Component {
  state = {
    addAccountModal: false,
    chosenAccount: {},
    anchorEl: null,
    deleteConfirmModal: false
  }

  toggleAddAccountModal = () => {
    this.setState(prevState => {
      return {
        addAccountModal: !prevState.addAccountModal
      }
    })
  }

  toggleDeleteConfirmModal = () => {
    this.setState(prevState => {
      return {
        deleteConfirmModal: !prevState.deleteConfirmModal
      }
    })
  }

  renderDeleteConfirmModal = () => {
    const { chosenAccount, deleteConfirmModal } = this.state
    const { removeCryptoAccount, classes } = this.props
    return (
      <Dialog
        open={deleteConfirmModal}
        onClose={() => this.toggleDeleteConfirmModal()}
        maxWidth='md'
        classes={{ paper: classes.confirmDialogPaper }}
      >
        <DialogTitle disableTypography>
          <Typography variant='h2'>Delete Account</Typography>
          <IconButton
            onClick={() => this.toggleDeleteConfirmModal()}
            className={classes.closeButton}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent style={{ height: '100px', width: '560px' }}>
          <DialogContentText>Are you sure you want to delete the account?</DialogContentText>
        </DialogContent>
        <DialogActions style={{ marginBottom: '10px' }}>
          <Button onClick={() => this.toggleDeleteConfirmModal()}>Cancel</Button>
          <Button
            variant='contained'
            onClick={() => {
              removeCryptoAccount(chosenAccount)
              this.closeMoreMenu()
              this.toggleDeleteConfirmModal()
            }}
            className={classes.deleteBtn}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  openMoreMenu = chosenAccount => event => {
    this.setState({ anchorEl: event.currentTarget, chosenAccount: chosenAccount })
  }

  closeMoreMenu = () => {
    this.setState({ anchorEl: null, chosenAccount: {} })
  }

  renderCryptoAccountsList = () => {
    const { classes, cryptoAccounts, actionsPending } = this.props
    const { anchorEl, deleteConfirmModal } = this.state
    return (
      <Grid container direction='column'>
        {!actionsPending.getCryptoAccounts && cryptoAccounts.length === 0 ? (
          <Box display='flex' flexDirection='column' alignItems='center' mt={6} mb={6}>
            <Box mb={2}>
              <img src={EmptyStateImage} alt='Empty State Image' />
            </Box>
            <Typography variant='subtitle2' color='textSecondary'>
              It seems you don't have any accounts saved
            </Typography>
          </Box>
        ) : actionsPending.getCryptoAccounts ? (
          <CircularProgress style={{ marginTop: '10px', alignSelf: 'center' }} />
        ) : (
          <div style={{ width: '100%', overflowX: 'auto' }}>
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
                        <IconButton onClick={this.openMoreMenu(accountData)}>
                          <MoreIcon className={classes.iconBtn} id='moreBtn' />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
        {anchorEl && this.renderMoreMenu()}
        {deleteConfirmModal && this.renderDeleteConfirmModal()}
      </Grid>
    )
  }

  renderMoreMenu = () => {
    const { handleTransferFrom } = this.props
    const { anchorEl, chosenAccount } = this.state
    return (
      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={event => this.closeMoreMenu()}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        getContentAnchorEl={null}
      >
        <MenuItem
          onClick={() => {
            handleTransferFrom(chosenAccount)
            this.closeMoreMenu()
          }}
        >
          Transfer from account
        </MenuItem>
        <MenuItem
          onClick={() => {
            this.toggleDeleteConfirmModal()
          }}
        >
          Delete
        </MenuItem>
      </Menu>
    )
  }
  render () {
    const { classes } = this.props
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
            <Grid item style={{ width: '100%' }}>
              {this.renderCryptoAccountsList()}
            </Grid>
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
    [theme.breakpoints.up('sm')]: {
      padding: '0px 50px 0px 50px'
    },
    [theme.breakpoints.down('sm')]: {
      padding: '0px 10px 0px 10px'
    }
  },
  iconBtn: {
    color: '#777777',
    fontSize: '20px'
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500]
  },
  confirmDialogPaper: {
    padding: '20px'
  },
  deleteBtn: {
    fontFamily: btnTexts.btnTextLight.fontFamily,
    fontWeight: btnTexts.btnTextLight.fontWeight,
    fontSize: btnTexts.btnTextLight.fontSize,
    lineHeight: btnTexts.btnTextLight.lineHeight,
    color: btnTexts.btnTextLight.color,
    backgroundColor: uiColors.error
  }
})
export default withStyles(styles)(AccountsManagementComponent)
