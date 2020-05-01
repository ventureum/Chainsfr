import React, { Component } from 'react'

import { withStyles } from '@material-ui/core/styles'
import { Typography, Button, Grid, List, ListSubheader, ListItem } from '@material-ui/core'
import Avatar from '@material-ui/core/Avatar'
import { btnTexts } from '../styles/typography'
import { uiColors } from '../styles/color'
import Box from '@material-ui/core/Box'
import Container from '@material-ui/core/Container'
import clsx from 'clsx'
import CloseIcon from '@material-ui/icons/Close'
import CircularProgress from '@material-ui/core/CircularProgress'
import DeleteIcon from '@material-ui/icons/Delete'
import Divider from '@material-ui/core/Divider'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogActions from '@material-ui/core/DialogActions'
import ExpandLessIcon from '@material-ui/icons/ExpandLess'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import EditIcon from '@material-ui/icons/Edit'
import IconButton from '@material-ui/core/IconButton'
import QRCode from '../images/qrcode.svg'
import Table from '@material-ui/core/Table'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableBody from '@material-ui/core/TableBody'
import TextField from '@material-ui/core/TextField'
import SendIcon from '@material-ui/icons/Send'
import Skeleton from '@material-ui/lab/Skeleton'
import { getCryptoSymbol, getCryptoTitle } from '../tokens.js'
import { accountStatus } from '../types/account.flow'
import { getWalletTitle, getWalletLogo } from '../wallet'
import AddAccountModal from '../containers/AddAccountModalContainer'
import EmptyStateImage from '../images/empty_state_01.png'
import AddressQRCodeDialog from './AddressQRCodeDialog'
import numeral from 'numeral'
class AccountsManagementComponent extends Component {
  state = {
    addAccountModal: false,
    chosenAccount: {},
    deleteConfirmModal: false,
    changeNameModal: false,
    addressQRCodeDialog: false,
    newAccountName: '',
    expandedRow: {}
  }

  componentDidMount () {
    window.addEventListener('resize', this.resize)
    this.resize()
  }
  componentWillUnmount () {
    window.removeEventListener('resize', this.resize)
  }
  resize = () => {
    this.setState({ windowWidth: window.innerWidth })
  }

  toggleAddAccountModal = account => {
    this.setState(prevState => {
      return {
        addAccountModal: !prevState.addAccountModal,
        chosenAccount: account
      }
    })
  }

  toggleDeleteConfirmModal = account => {
    this.setState(prevState => {
      return {
        deleteConfirmModal: !prevState.deleteConfirmModal,
        chosenAccount: account
      }
    })
  }

  toggleChangeNameModal = account => {
    this.setState(prevState => {
      return {
        changeNameModal: !prevState.changeNameModal,
        chosenAccount: account,
        newAccountName: ''
      }
    })
  }

  toggleAddressQRCodeDialog = account => {
    this.setState(prevState => {
      return {
        addressQRCodeDialog: !prevState.addressQRCodeDialog,
        chosenAccount: account
      }
    })
  }

  handleNewAccountNameChange = accountName => {
    this.setState({ newAccountName: accountName })
  }

  renderDeleteConfirmModal = () => {
    const { chosenAccount, deleteConfirmModal } = this.state
    const { removeCryptoAccounts, classes, online } = this.props
    return (
      <Dialog
        open={deleteConfirmModal}
        onClose={() => this.toggleDeleteConfirmModal()}
        maxWidth='md'
        classes={{ paper: classes.confirmDialogPaper }}
      >
        <DialogTitle disableTypography className={classes.dialogTitle}>
          <Typography variant='h2'>Delete Account</Typography>
          <IconButton
            onClick={() => this.toggleDeleteConfirmModal()}
            className={classes.closeButton}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <DialogContentText>Are you sure you want to delete the account?</DialogContentText>
        </DialogContent>
        <DialogActions className={classes.dialogAction}>
          <Button onClick={() => this.toggleDeleteConfirmModal()}>Cancel</Button>
          <Button
            variant='contained'
            disabled={!online}
            onClick={() => {
              removeCryptoAccounts(chosenAccount)
              this.toggleDeleteConfirmModal()
            }}
            className={classes.deleteBtn}
            data-test-id='delete_confirm_btn'
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  renderChangeNameModal = () => {
    const { chosenAccount, changeNameModal, newAccountName } = this.state
    const { modifyCryptoAccountsName, classes, online } = this.props
    return (
      <Dialog
        open={changeNameModal}
        onClose={() => this.toggleChangeNameModal()}
        maxWidth='md'
        classes={{ paper: classes.confirmDialogPaper }}
      >
        <DialogTitle disableTypography className={classes.dialogTitle}>
          <Typography variant='h2'>Change Account Name</Typography>
          <IconButton onClick={() => this.toggleChangeNameModal()} className={classes.closeButton}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <TextField
            fullWidth
            id='newName'
            label='New Account Name'
            placeholder='Account Name'
            variant='outlined'
            helperText={'Please enter a new account name'}
            onChange={event => {
              this.handleNewAccountNameChange(event.target.value)
            }}
            value={newAccountName || ''}
            data-test-id='new_name_text_field'
          />
        </DialogContent>
        <DialogActions className={classes.dialogAction}>
          <Button onClick={() => this.toggleChangeNameModal()}>Cancel</Button>
          <Button
            disabled={!online}
            onClick={() => {
              modifyCryptoAccountsName(chosenAccount, newAccountName)
              this.toggleChangeNameModal()
            }}
            variant='contained'
            color='primary'
            data-test-id='rename_confirm_btn'
          >
            Change
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  expandRow = account => {
    this.setState(prevState => {
      return {
        expandedRow: {
          ...prevState.expandedRow,
          [account.id]: !prevState.expandedRow[account.id]
        }
      }
    })
  }

  handleAccountAction = (account, action) => {
    switch (action) {
      case 'edit':
        this.toggleChangeNameModal(account)
        break
      case 'delete':
        this.toggleDeleteConfirmModal(account)
        break
      case 'address':
        this.toggleAddressQRCodeDialog(account)
        break
      case 'send':
        this.props.handleTransferFrom(account)
        break
      default:
        return
    }
  }

  toCurrencyLocaleString = s => {
    return numeral(parseFloat(s)).format('(0.000 a)')
  }

  rednerAccountActionButtons = account => {
    const { classes } = this.props
    const { windowWidth } = this.state
    const wide = windowWidth >= 800

    return (
      <Box
        display='flex'
        flexDirection='row'
        alignItems='center'
        width='100%'
        justifyContent={wide ? 'flex-start' : 'center'}
      >
        <Button
          onClick={() => {
            this.handleAccountAction(account, 'edit')
          }}
          color='primary'
          classes={{ label: classes.actionBtnLabel, root: classes.actionBtnBase }}
          data-test-id='edit_account_btn'
        >
          <EditIcon className={classes.buttonIcon} />
          Edit
        </Button>
        <Button
          onClick={() => {
            this.handleAccountAction(account, 'delete')
          }}
          classes={{ label: classes.actionBtnLabel, root: classes.actionBtnBase }}
          color='primary'
          data-test-id='delete_account_btn'
        >
          <DeleteIcon className={classes.buttonIcon} />
          Delete
        </Button>
        <Button
          onClick={() => {
            this.handleAccountAction(account, 'address')
          }}
          classes={{ label: classes.actionBtnLabel, root: classes.actionBtnBase }}
          color='primary'
          data-test-id='address_qr_code'
        >
          <img src={QRCode} alt='' width='18' height='18' />
          Address
        </Button>
        <Button
          color='primary'
          onClick={() => {
            this.handleAccountAction(account, 'send')
          }}
          // assuming all accounts under the same grouped account share
          // the disable status
          disabled={!account.assets[0].sendable}
          classes={{ label: classes.actionBtnLabel, root: classes.actionBtnBase }}
          data-test-id='send_from_account_btn'
        >
          <SendIcon className={classes.buttonIcon} />
          Send
        </Button>
      </Box>
    )
  }

  renderAccountsWideTable = () => {
    const { classes, categorizedAccounts, currency } = this.props
    const { expandedRow } = this.state
    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell colSpan={2}>Account Name</TableCell>
            <TableCell align='left' style={{ width: '18%' }}>
              Assets
            </TableCell>
            <TableCell align='left' style={{ width: '18%' }}>
              {currency}
            </TableCell>
            <TableCell align='left' style={{ width: '2%' }} />
          </TableRow>
        </TableHead>
        <TableBody>
          {categorizedAccounts.map((account, i) => {
            const expanded = expandedRow[account.id]
            const rowCellClassName = expanded
              ? clsx(classes.cellOverFlow, classes.noBottomBrd)
              : classes.cellOverFlow
            return (
              <React.Fragment key={'wide' + i}>
                <TableRow
                  key={i}
                  onClick={() => {
                    this.expandRow(account)
                  }}
                  hover
                  selected={expanded}
                  style={{ cursor: 'pointer' }}
                  data-test-id={`account_list_item_${i}`}
                >
                  <TableCell
                    align='left'
                    className={clsx(rowCellClassName, classes.avatar)}
                    padding='none'
                  >
                    <Avatar
                      style={{ borderRadius: '0px', marginLeft: 15 }}
                      src={getWalletLogo(account.walletType)}
                    />
                  </TableCell>

                  <TableCell align='left' className={rowCellClassName}>
                    <Box>
                      <Typography variant='body2' data-test-id='account_name'>
                        {account.name}
                      </Typography>
                      <Typography variant='caption' data-test-id='wallet_platform'>
                        {getWalletTitle(account.walletType)}, {getCryptoTitle(account.platformType)}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell align='left' className={rowCellClassName} data-test-id='assets_cell'>
                    {account.status === accountStatus.syncing ? (
                      <Skeleton style={{ margin: '0px', width: '100%', minWidth: '100px' }} />
                    ) : account.assets.length === 1 ? (
                      `${getCryptoSymbol(
                        account.assets[0].cryptoType
                      )} ${this.toCurrencyLocaleString(account.assets[0].balanceInStandardUnit)}`
                    ) : (
                      'Multiple Coins'
                    )}
                  </TableCell>
                  <TableCell align='left' className={rowCellClassName}>
                    $ {this.toCurrencyLocaleString(account.totalMarketValue)}
                  </TableCell>
                  <TableCell align='left' className={rowCellClassName}>
                    {expanded ? (
                      <ExpandLessIcon className={classes.iconBtn} />
                    ) : (
                      <ExpandMoreIcon className={classes.iconBtn} />
                    )}
                  </TableCell>
                </TableRow>
                {expanded &&
                  account.assets.map((asset, i) => {
                    const isLast = account.assets.length - 1 === i
                    return (
                      <TableRow key={'expended-' + i}>
                        <TableCell
                          padding='none'
                          className={isLast ? undefined : classes.noBottomBrd}
                        />
                        {i === 0 && (
                          <>
                            <TableCell
                              rowSpan={account.assets.length}
                              colSpan={account.assets.length === 1 ? 5 : 1}
                              className={classes.btnCellWide}
                            >
                              {this.rednerAccountActionButtons(account)}
                            </TableCell>
                          </>
                        )}
                        {account.assets.length > 1 && (
                          <>
                            <TableCell>
                              {`${getCryptoSymbol(asset.cryptoType)}`}{' '}
                              {`${this.toCurrencyLocaleString(asset.balanceInStandardUnit)}`}
                            </TableCell>
                            <TableCell>
                              $ {this.toCurrencyLocaleString(asset.marketValue)}
                            </TableCell>
                            {isLast && <TableCell />}
                          </>
                        )}
                      </TableRow>
                    )
                  })}
              </React.Fragment>
            )
          })}
        </TableBody>
      </Table>
    )
  }

  renderAccountsNarrowList = () => {
    const { classes, categorizedAccounts } = this.props
    const { expandedRow } = this.state
    return (
      <List
        subheader={
          <Box display='flex' flexDirection='row' justifyContent='space-between' pr={3}>
            <ListSubheader>Account Name</ListSubheader>
            <ListSubheader>USD</ListSubheader>
          </Box>
        }
      >
        {categorizedAccounts.map((account, i) => {
          const expanded = expandedRow[account.id]
          return (
            <React.Fragment key={'narrow' + i}>
              <Divider />
              <ListItem
                key={i}
                button
                onClick={() => {
                  this.expandRow(account)
                }}
                className={classes.listItemBase}
              >
                <Box
                  display='flex'
                  flexDirection='row'
                  alignItems='center'
                  justifyContent='space-between'
                  width='100%'
                >
                  <div style={{ maxWidth: '40%' }}>
                    <Box display='flex' flexDirection='row' alignItems='center'>
                      <Avatar
                        style={{ borderRadius: '0px', marginRight: 10 }}
                        src={getWalletLogo(account.walletType)}
                      />
                      <Box>
                        <Typography variant='body2'>{account.name}</Typography>
                        <Typography variant='caption'>
                          {getWalletTitle(account.walletType)},{' '}
                          {getCryptoTitle(account.platformType)}
                        </Typography>
                      </Box>
                    </Box>
                  </div>
                  <div>
                    <Box display='flex' flexDirection='row' justifyContent='flex-end'>
                      <Box display='flex' flexDirection='column' alignItems='flex-end'>
                        {account.status === accountStatus.syncing ? (
                          <Skeleton style={{ margin: '0px', width: '100%', minWidth: '100px' }} />
                        ) : account.assets.length === 1 ? (
                          <Typography variant='body2'>
                            {`${getCryptoSymbol(
                              account.assets[0].cryptoType
                            )} ${this.toCurrencyLocaleString(
                              account.assets[0].balanceInStandardUnit
                            )}`}
                          </Typography>
                        ) : (
                          <Typography variant='body2'>Multiple Coins</Typography>
                        )}
                        <Typography variant='caption' component='p'>
                          $ {this.toCurrencyLocaleString(account.totalMarketValue)}
                        </Typography>
                      </Box>
                      <Box ml={1}>
                        {expanded ? (
                          <ExpandLessIcon className={classes.iconBtn} />
                        ) : (
                          <ExpandMoreIcon className={classes.iconBtn} />
                        )}
                      </Box>
                    </Box>
                  </div>
                </Box>
              </ListItem>
              {expanded && (
                <Box
                  display='flex'
                  flexDirection='column'
                  alignItems='stretch'
                  justifyContent='flex-start'
                  pl={4}
                  pr={3}
                >
                  <ListItem style={{ padding: '10px 0px 10px 0px' }}>
                    {this.rednerAccountActionButtons(account)}
                  </ListItem>
                  {account.assets.length > 1 &&
                    account.assets.map(accountData => {
                      return (
                        <>
                          <Divider style={{ marginLeft: 10 }} />
                          <ListItem className={classes.listItemBase}>
                            <Box
                              display='flex'
                              flexDirection='row'
                              justifyContent='space-between'
                              width='100%'
                            >
                              <Typography variant='body2'>
                                {`${getCryptoSymbol(accountData.cryptoType)}`}{' '}
                                {`${this.toCurrencyLocaleString(
                                  accountData.balanceInStandardUnit
                                )}`}
                              </Typography>
                              <Typography variant='body2'>
                                $ {this.toCurrencyLocaleString(accountData.marketValue)}
                              </Typography>
                            </Box>
                          </ListItem>
                        </>
                      )
                    })}
                </Box>
              )}
            </React.Fragment>
          )
        })}
        <Divider />
      </List>
    )
  }

  renderUpperSection = () => {
    const { classes } = this.props
    return (
      <Box
        className={classes.coloredBackgrond}
        alignItems='center'
        justifyContent='center'
        display='flex'
      >
        <Container className={classes.container}>
          <Grid container>
            <Grid item md={6} xs={12} className={classes.upperBigGridItem}>
              <Box
                display='flex'
                alignItems='flex-start'
                flexDirection='column'
                justifyContent='center'
                height='100%'
              >
                <Typography variant='h2'>Manage Connected Accounts</Typography>
                <Typography className={classes.decText}>
                  Native supports for popular exchanges, mobile and hardware wallets
                </Typography>
                <Box display='flex' mt={2}>
                  <Button
                    onClick={() => {
                      this.toggleAddAccountModal()
                    }}
                    variant='contained'
                    color='primary'
                    data-test-id='connect_account_btn'
                  >
                    Add Connection to Existing Accounts
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    )
  }

  render () {
    const { classes, categorizedAccounts, actionsPending, online } = this.props
    const {
      addAccountModal,
      deleteConfirmModal,
      changeNameModal,
      windowWidth,
      addressQRCodeDialog,
      chosenAccount
    } = this.state

    const wide = windowWidth >= 960
    return (
      <Box display='flex' flexDirection='column'>
        {this.renderUpperSection()}
        <Container className={classes.container}>
          <Box display='flex' flexDirection='column'>
            {!actionsPending.getCryptoAccounts && categorizedAccounts.length === 0 ? (
              <Box display='flex' flexDirection='column' alignItems='center' mt={6} mb={6}>
                <Box mb={2}>
                  <img src={EmptyStateImage} alt='Empty State' />
                </Box>
                <Typography variant='subtitle2' color='textSecondary'>
                  It seems you don't have any accounts saved
                </Typography>
              </Box>
            ) : actionsPending.getCryptoAccounts ? (
              <CircularProgress style={{ marginTop: '10px', alignSelf: 'center' }} />
            ) : wide ? (
              this.renderAccountsWideTable()
            ) : (
              this.renderAccountsNarrowList()
            )}
          </Box>
        </Container>
        {addAccountModal && (
          <AddAccountModal
            open={addAccountModal}
            handleClose={this.toggleAddAccountModal}
            online={online}
          />
        )}
        {deleteConfirmModal && this.renderDeleteConfirmModal()}
        {changeNameModal && this.renderChangeNameModal()}
        {addressQRCodeDialog && (
          <AddressQRCodeDialog
            open={addressQRCodeDialog}
            handleClose={() => {
              this.toggleAddressQRCodeDialog()
            }}
            account={chosenAccount}
          />
        )}
      </Box>
    )
  }
}

const styles = theme => ({
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
    padding: '30px',
    width: '100vh',
    [theme.breakpoints.up('sm')]: {
      maxWidth: '540px'
    }
  },
  dialogTitle: {
    marginBottom: theme.spacing(2),
    padding: 0
  },
  dialogContent: {
    marginBottom: theme.spacing(2),
    paddingTop: theme.spacing(1),
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0
  },
  dialogAction: {
    marginBottom: theme.spacing(1),
    padding: 0
  },
  deleteBtn: {
    fontFamily: btnTexts.btnTextLight.fontFamily,
    fontWeight: btnTexts.btnTextLight.fontWeight,
    fontSize: btnTexts.btnTextLight.fontSize,
    lineHeight: btnTexts.btnTextLight.lineHeight,
    color: btnTexts.btnTextLight.color,
    backgroundColor: uiColors.error
  },
  noBottomBrd: {
    borderBottom: '0px'
  },
  actionBtnLabel: {
    flexDirection: 'column'
  },
  actionBtnBase: {
    padding: '10px 10px 10px 10px'
  },
  cellOverFlow: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  listItemBase: {
    padding: '10px 10px 10px 10px'
  },
  avatar: {
    width: 32,
    height: 32
  },
  buttonIcon: {
    width: 18,
    height: 18
  },
  btnCellWide: {
    paddingTop: 30,
    paddingBottom: 30,
    paddingLeft: 0
  },
  coloredBackgrond: {
    backgroundColor: '#FAFBFE'
  },
  container: {
    paddingTop: 40,
    paddingBottom: 40,
    [theme.breakpoints.up('sm')]: {
      paddingLeft: '30px',
      paddingRight: '30px'
    }
  },
  upperBigGridItem: {
    [theme.breakpoints.down('sm')]: {
      paddingTop: '30px'
    }
  },
  decText: {
    [theme.breakpoints.up('md')]: {
      width: '80%',
      lineHeight: '20px',
      fontSize: 14,
      fontWeight: '600',
      color: '#777777'
    }
  }
})
export default withStyles(styles)(AccountsManagementComponent)
