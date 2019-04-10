import React, { Component } from 'react'
import './App.css'

import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import SendIcon from '@material-ui/icons/Send'
import OpenInNewIcon from '@material-ui/icons/OpenInNew'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import Divider from '@material-ui/core/Divider'
import Button from '@material-ui/core/Button'
import { Link } from 'react-router-dom'
import CircularProgress from '@material-ui/core/CircularProgress'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import DialogTitle from '@material-ui/core/DialogTitle'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import TextField from '@material-ui/core/TextField'
import MuiLink from '@material-ui/core/Link'
import { getCryptoSymbol, getCryptoTitle, getCryptoDecimals, getTxFeesCryptoType } from '../tokens'
import { walletCryptoSupports } from '../wallet'
import Paths from '../Paths'
import env from '../typedEnv'
import numeral from 'numeral'
import utils from '../utils'
import update from 'immutability-helper'
import classNames from 'classnames'
import validator from 'validator'
import Web3 from 'web3'
import BN from 'bn.js'

const WALLET_TYPE = 'drive'

class WalletComponent extends Component {
  constructor (props) {
    super(props)
    this.state = {
      addAddressModalOpen: false,
      viewAddressDialogOpen: false,
      viewPrivateKeyDialogOpen: false,
      directTransferDialogOpen: false,
      directTransferDialogStep: '', // one of ['RECIPIANT, REVIEW, RECEIPT']
      selectedCryptoType: '',
      directTransferDialogForm: {
        destinationAddress: '',
        transferAmount: ''
      },
      directTransferDialogFormError: {},
      moreMenu: {}
    }
  }

  componentDidUpdate (prevProps) {
    let { actionsPending, receipt } = this.props
    if (prevProps.actionsPending.directTransfer &&
        !actionsPending.directTransfer &&
        receipt) {
      // direct transfer action is completed
      // sucessfully retrieved the receipt
      // jump to receipt step
      this.setState({ directTransferDialogStep: 'RECEIPT' })
    }
  }

  handleMoreBtnOnOpen = cryptoType => event => {
    this.setState(update(this.state, { moreMenu: { [cryptoType]: _cryptoType => update(_cryptoType || {}, { anchorEl: { $set: event.currentTarget } }) } }))
  }

  handleMoreBtnOnClose = cryptoType => event => {
    this.setState(update(this.state, { moreMenu: { [cryptoType]: { anchorEl: { $set: null } } } }))
  }

  toggleDirectTransferDialog = (open, cryptoType) => {
    let _state = update(this.state, { directTransferDialogOpen: { $set: open },
      selectedCryptoType: { $set: cryptoType },
      directTransferDialogStep: { $set: 'RECIPIANT' }
    })
    if (open) {
      this.props.getTxCost({ cryptoType: cryptoType })
    } else {
      // close dropdown menu as well
      _state = update(_state, { moreMenu: { [this.state.selectedCryptoType]: { anchorEl: { $set: null } } } })
    }
    this.setState(_state)
  }

  toggleViewAddressDialog = (open, cryptoType) => {
    let _state = update(this.state, { viewAddressDialogOpen: { $set: open },
      selectedCryptoType: { $set: cryptoType }
    })
    if (!open) {
      // close dropdown menu as well
      _state = update(_state, { moreMenu: { [this.state.selectedCryptoType]: { anchorEl: { $set: null } } } })
    }
    this.setState(_state)
  }

  toggleViewPrivateKeyDialog = (open, cryptoType) => {
    let _state = update(this.state, { viewPrivateKeyDialogOpen: { $set: open },
      selectedCryptoType: { $set: cryptoType }
    })
    if (!open) {
      // close dropdown menu as well
      _state = update(_state, { moreMenu: { [this.state.selectedCryptoType]: { anchorEl: { $set: null } } } })
    }
    this.setState(_state)
  }

  validate = (name, value) => {
    const { wallet, txCost } = this.props
    const { selectedCryptoType } = this.state
    let balance = wallet ? wallet.crypto[selectedCryptoType][0].balance : null
    const decimals = getCryptoDecimals(selectedCryptoType)
    if (name === 'transferAmount' && wallet && balance) {
      if (!validator.isFloat(value, { min: 0.0001, max: utils.toHumanReadableUnit(balance, decimals, 8) })) {
        if (value === '-' || parseFloat(value) < 0.0001) {
          return 'The amount must be greater than 0.0001'
        } else {
          return `The amount cannot exceed your current balance ${utils.toHumanReadableUnit(balance, decimals)}`
        }
      } else {
        // balance check passed
        if (['ethereum', 'dai'].includes(selectedCryptoType)) {
          // ethereum based coins
          // now check if ETH balance is sufficient for paying tx fees
          if (selectedCryptoType === 'ethereum' &&
              new BN(balance).lt(new BN(txCost.costInBasicUnit).add(utils.toBasicTokenUnit(parseFloat(value), decimals, 8)))) {
            return 'Insufficent funds for paying transaction fees'
          }
          if (selectedCryptoType === 'dai' &&
              new BN(balance).lt(new BN(txCost.costInBasicUnit))
          ) {
            return 'Insufficent funds for paying transaction fees'
          }
        }
      }
    } else if (name === 'destinationAddress') {
      if (!Web3.utils.isAddress(value)) {
        return 'Invalid address'
      }
    }
    return null
  }

  handleDirectTransferDialogFormChange = name => event => {
    this.setState(update(this.state, { directTransferDialogForm: { [name]: { $set: event.target.value } },
      directTransferDialogFormError: { [name]: { $set: this.validate(name, event.target.value) } } }))
  }

  validateForm = () => {
    const { directTransferDialogForm, directTransferDialogFormError } = this.state

    // form must be filled without errors
    return (
      directTransferDialogForm.destinationAddress &&
      directTransferDialogForm.transferAmount &&
      !directTransferDialogFormError.destinationAddress &&
      !directTransferDialogFormError.transferAmount)
  }

  directTransferDialogOnSubmit = () => {
    const {
      directTransferDialogForm,
      selectedCryptoType
    } = this.state
    const { wallet, directTransfer, txCost } = this.props

    if (selectedCryptoType &&
        directTransferDialogForm.transferAmount &&
        directTransferDialogForm.destinationAddress
    ) {
      // submit direct transfer request
      directTransfer({
        fromWallet: wallet,
        cryptoType: selectedCryptoType,
        destinationAddress: directTransferDialogForm.destinationAddress,
        transferAmount: directTransferDialogForm.transferAmount,
        txCost: txCost
      })
    }
  }

  renderDirectTransferDialogRecipiantStep = () => {
    let { classes, wallet, txCost, actionsPending } = this.props
    let {
      directTransferDialogOpen,
      directTransferDialogForm,
      directTransferDialogFormError,
      selectedCryptoType
    } = this.state

    if (directTransferDialogOpen) {
      let _balance = wallet.crypto[selectedCryptoType][0].balance
      let _decimals = getCryptoDecimals(selectedCryptoType)
      var balance = _balance ? numeral(utils.toHumanReadableUnit(_balance, _decimals)).format('0.000a') : '0'
    }

    return (
      <>
        <DialogTitle>Direct Transfer</DialogTitle>
        <DialogContent>
          <TextField
            className={classes.directTransferToAddressTextField}
            variant='outlined'
            autoFocus
            id='destinationAddress'
            label='To Address'
            fullWidth
            value={directTransferDialogForm.destinationAddress}
            onChange={this.handleDirectTransferDialogFormChange('destinationAddress')}
            error={!!directTransferDialogFormError.destinationAddress}
            helperText={directTransferDialogFormError.destinationAddress}
          />
          <TextField
            variant='outlined'
            id='amount'
            label='Amount'
            fullWidth
            value={directTransferDialogForm.transferAmount}
            onChange={this.handleDirectTransferDialogFormChange('transferAmount')}
            helperText={directTransferDialogFormError.transferAmount || `Balance: ${balance}`}
            error={!!directTransferDialogFormError.transferAmount}
          />
          <Grid item className={classes.txFeeSection}>
            <Typography className={classes.txFeeSectionTitle} align='left'>
              Transaction Fee
            </Typography>
            {!actionsPending.getTxCost && txCost
              ? <Typography className={classes.txFeeSectionFee} align='left'>
                {txCost.costInStandardUnit} {getCryptoSymbol(getTxFeesCryptoType(selectedCryptoType))}
              </Typography>
              : <CircularProgress size={18} color='primary' />}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.toggleDirectTransferDialog(false)} color='primary'>
            Cancel
          </Button>
          <Button
            variant='contained'
            onClick={() => this.setState({ directTransferDialogStep: 'REVIEW' })}
            color='primary'
            disabled={!this.validateForm()}
          >
            Continue to Review
          </Button>
        </DialogActions>
      </>
    )
  }

  renderDirectTransferDialogReviewStep = () => {
    let { classes } = this.props
    let {
      directTransferDialogForm,
      selectedCryptoType
    } = this.state

    return (
      <>
        <DialogTitle>Direct Transfer</DialogTitle>
        <DialogContent>
          <Typography align='left' className={classes.directTransferReviewText}>
            You are about to send {directTransferDialogForm.transferAmount} {getCryptoSymbol(selectedCryptoType)} to the following address:
          </Typography>
          <Typography align='left' className={classNames(classes.directTransferReviewText, classes.marginBottom20px)}>
            {directTransferDialogForm.destinationAddress}
          </Typography>
          <Typography align='left' className={classes.directTransferReviewText}>
            Please double check on the amount and address.
            The transfser is irreversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.setState({ directTransferDialogStep: 'RECIPIANT' })} color='primary'>
            Back
          </Button>
          <Button
            variant='contained'
            onClick={this.directTransferDialogOnSubmit}
            color='primary'
          >
            Confirm to Transfer
          </Button>
        </DialogActions>
      </>
    )
  }

  renderDirectTransferDialogReceiptStep = () => {
    let { classes, receipt } = this.props

    return (
      <>
        <DialogTitle>Direct Transfer</DialogTitle>
        <DialogContent>
          <Typography variant='body2' className={classes.informReceiverText} align='left'>
            Succeed! It may take a few minutes to complete the transaction. You can track the transaction
            <MuiLink target='_blank' rel='noopener' href={`https://rinkeby.etherscan.io/tx/${receipt.sendTxHash}`}>
              {' here'}
            </MuiLink>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.toggleDirectTransferDialog(false)} color='primary'>
            Close
          </Button>
        </DialogActions>
      </>
    )
  }

  renderDirectTransferDialog = () => {
    let { directTransferDialogOpen, directTransferDialogStep } = this.state

    return (
      <Dialog open={directTransferDialogOpen}>
        {directTransferDialogStep === 'RECIPIANT' && this.renderDirectTransferDialogRecipiantStep()}
        {directTransferDialogStep === 'REVIEW' && this.renderDirectTransferDialogReviewStep()}
        {directTransferDialogStep === 'RECEIPT' && this.renderDirectTransferDialogReceiptStep()}
      </Dialog>
    )
  }

  renderViewAddressDialog = () => {
    const { viewAddressDialogOpen, selectedCryptoType } = this.state
    const { classes, wallet } = this.props

    return (
      <Dialog open={viewAddressDialogOpen}>
        <DialogTitle>Address</DialogTitle>
        <DialogContent>
          <Typography className={classes.addressDialog} align='left'>
            {selectedCryptoType !== 'bitcoin' ? '0x' : ''}{wallet.crypto[selectedCryptoType][0].address}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.toggleViewAddressDialog(false)} color='primary'>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  renderViewPrivateKeyDialog = () => {
    const { viewPrivateKeyDialogOpen, selectedCryptoType } = this.state
    const { classes, wallet } = this.props

    return (
      <Dialog open={viewPrivateKeyDialogOpen}>
        <DialogTitle>Private Key</DialogTitle>
        <DialogContent>
          <Typography className={classes.addressDialog} align='left'>
            {
              selectedCryptoType === 'bitcoin' ? wallet.crypto[selectedCryptoType][0].WIF
                : wallet.crypto[selectedCryptoType][0].privateKey
            }
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.toggleViewPrivateKeyDialog(false)} color='primary'>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  renderItem = (walletByCryptoType) => {
    let { classes } = this.props
    var explorerLink = null
    if (walletByCryptoType.cryptoType === 'ethereum') {
      let network = env.REACT_APP_NETWORK_NAME !== 'mainnet' ? env.REACT_APP_NETWORK_NAME : ''
      explorerLink = `https://${network}.etherscan.io/address/${walletByCryptoType.address}`
    } else if (walletByCryptoType.cryptoType === 'dai') {
      let network = env.REACT_APP_NETWORK_NAME !== 'mainnet' ? env.REACT_APP_NETWORK_NAME : ''
      explorerLink = `https://${network}.etherscan.io/token/${env.REACT_APP_DAI_ADDRESS}?a=${walletByCryptoType.address}`
    } else if (walletByCryptoType.cryptoType === 'bitcoin') {
      let network = env.REACT_APP_BTC_NETWORK !== 'mainnet' ? 'btc-testnet' : 'btc'
      explorerLink = `https://live.blockcypher.com/${network}/address/${walletByCryptoType.address}`
    }

    let moreMenu = this.state.moreMenu[walletByCryptoType.cryptoType]

    return (
      /* add key to fragment to supress non-unique key warnings */
      <React.Fragment key={walletByCryptoType.cryptoType}>
        <ListItem>
          <Grid container direction='row' alignItems='center'>
            <Grid item lg={9} md={8} sm={6} xs={3}>
              <Typography className={classes.walletCryptoSymbol} align='left'>
                {getCryptoSymbol(walletByCryptoType.cryptoType)}
              </Typography>
              <Typography className={classes.walletCryptoTitle} align='left'>
                {getCryptoTitle(walletByCryptoType.cryptoType)}
              </Typography>
            </Grid>
            <Grid item lg={1} md={1} sm={1} xs={4}>
              <Typography align='right' className={classes.walletCryptoBalance}>
                {numeral(utils.toHumanReadableUnit(walletByCryptoType.balance, getCryptoDecimals(walletByCryptoType.cryptoType))).format('0.000a')}
              </Typography>
            </Grid>
            <Grid item lg={2} md={3} sm={5} xs={5}>
              <Grid container direction='row' justify='flex-end'>
                <Grid item>
                  <IconButton
                    className={classes.button}
                    aria-label='Send'
                    component={Link}
                    to={`${Paths.transfer}?walletSelection=${WALLET_TYPE}&cryptoSelection=${walletByCryptoType.cryptoType}`}
                  >
                    <SendIcon />
                  </IconButton>
                </Grid>
                <Grid item>
                  <IconButton
                    className={classes.button}
                    aria-label='Explorer'
                    target='_blank' href={explorerLink}
                  >
                    <OpenInNewIcon />
                  </IconButton>
                </Grid>
                <Grid item>
                  <IconButton
                    className={classes.button}
                    aria-label='Explorer'
                    onClick={this.handleMoreBtnOnOpen(walletByCryptoType.cryptoType)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    anchorEl={moreMenu && moreMenu.anchorEl}
                    open={Boolean(moreMenu && moreMenu.anchorEl)}
                    onClose={this.handleMoreBtnOnClose(walletByCryptoType.cryptoType)}
                  >
                    <MenuItem onClick={() => this.toggleDirectTransferDialog(true, walletByCryptoType.cryptoType)}>Direct Transfer</MenuItem>
                    <MenuItem onClick={() => this.toggleViewAddressDialog(true, walletByCryptoType.cryptoType)}>View Address</MenuItem>
                    <MenuItem onClick={() => this.toggleViewPrivateKeyDialog(true, walletByCryptoType.cryptoType)}>View Private Key</MenuItem>
                  </Menu>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </ListItem>
        <Divider />
      </React.Fragment>
    )
  }

  render () {
    const { classes, wallet, actionsPending } = this.props
    const {
      directTransferDialogOpen,
      viewAddressDialogOpen,
      viewPrivateKeyDialogOpen
    } = this.state

    let walletList = []
    if (wallet.connected) {
      walletList = walletCryptoSupports[WALLET_TYPE].map(crypto => {
        return {
          cryptoType: crypto.cryptoType,
          balance: wallet.crypto[crypto.cryptoType][0].balance,
          address: wallet.crypto[crypto.cryptoType][0].address
        }
      })
    }

    return (
      <div className={classes.root}>
        <Grid container direction='column' alignItems='center'>
          <Grid container direction='column' className={classes.walletListContainer} alignItems='center'>
            <Grid item className={classes.headerSection}>
              {/* Back button */}
              <Button
                color='primary'
                className={classes.backBtn}
                component={Link}
                to={Paths.home}
              >
                {'< Back to Home'}
              </Button>
              {/* Title */}
              <Typography className={classes.title} align='left'>My Chainsfer Wallet</Typography>
            </Grid>
            <Grid container direction='column' alignItems='center'>
              <List className={classes.walletList}>
                {/* List header */}
                <ListItem key='walletListHeader'>
                  <Grid container direction='row' alignItems='center'>
                    <Grid item lg={9} md={8} sm={6} xs={3}>
                      <Typography className={classes.walletListHeaderLabel} align='left'>
                        Token
                      </Typography>
                    </Grid>
                    <Grid item lg={1} md={1} sm={1} xs={4}>
                      <Typography className={classes.walletListHeaderLabel} align='right'>
                        Balance
                      </Typography>
                    </Grid>
                  </Grid>
                </ListItem>
                <Divider />
                {/* List content */}
                {!actionsPending.getCloudWallet && wallet.connected &&
                 walletList.map(wallet => this.renderItem(wallet))
                }
              </List>
              {actionsPending.getCloudWallet &&
              <Grid item align='center'>
                <CircularProgress
                  size={24}
                  color='primary'
                  className={classes.buttonProgress}
                />
              </Grid>
              }
              {directTransferDialogOpen && this.renderDirectTransferDialog()}
              {viewAddressDialogOpen && this.renderViewAddressDialog()}
              {viewPrivateKeyDialogOpen && this.renderViewPrivateKeyDialog()}
            </Grid>
          </Grid>
        </Grid>
      </div>
    )
  }
}

const styles = theme => ({
  root: {
    flex: 1
  },
  walletList: {
    width: '100%'
  },
  title: {
    fontSize: '18px',
    fontWeight: '500',
    color: '#333333',
    alignSelf: 'flex-start',
    marginBottom: '30px'
  },
  walletListContainer: {
    marginTop: '60px',
    '@media (min-width: 380px) and (max-width : 751px)': {
      maxWidth: '380px'
    },
    '@media (min-width: 752px) and (max-width : 1129px)': {
      maxWidth: '752px'
    },
    '@media (min-width: 1130px) and (max-width : 1489px)': {
      maxWidth: '1130px'
    },
    '@media (min-width: 1490px) ': {
      maxWidth: '1490px'
    }
  },
  walletListHeaderLabel: {
    fontSize: '12px',
    color: '#777777',
    fontWeight: 500
  },
  walletCryptoTitle: {
    fontSize: '12px',
    color: '#777777'
  },
  walletCryptoSymbol: {
    fontSize: '12px',
    color: '#333333'
  },
  walletCryptoBalance: {
    fontSize: '14px',
    color: '#333333'
  },
  projectsHeader: {
    marginBottom: 16,
    color: '#333333',
    alignSelf: 'flex-start'
  },
  headerSection: {
    alignSelf: 'flex-start',
    marginLeft: '16px'
  },
  backBtn: {
    fontSize: '12px',
    fontWeight: 500,
    padding: '0px',
    marginBottom: '30px'
  },
  directTransferToAddressTextField: {
    marginTop: '10px',
    marginBottom: '30px'
  },
  directTransferReviewText: {
    color: '#333333',
    fontSize: '14px'
  },
  marginBottom20px: {
    marginBottom: '20px'
  },
  txFeeSection: {
    marginTop: '30px'
  },
  txFeeSectionFee: {
    color: '#777777',
    fontSize: '12px'
  },
  txFeeSectionTitle: {
    color: '#333333',
    fontSize: '18px'
  },
  addressDialog: {
    fontSize: '12px'
  }
})

export default withStyles(styles)(WalletComponent)
