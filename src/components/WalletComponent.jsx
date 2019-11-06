import React, { Component, useState } from 'react'
import './App.css'

import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import SendIcon from '@material-ui/icons/Send'
import OpenInNewIcon from '@material-ui/icons/OpenInNew'
import Box from '@material-ui/core/Box'
import Container from '@material-ui/core/Container'
import Card from '@material-ui/core/Card'
import Menu from '@material-ui/core/Menu'
import ListItemText from '@material-ui/core/ListItemText'
import Skeleton from '@material-ui/lab/Skeleton'
import MenuItem from '@material-ui/core/MenuItem'
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'
import MoreVertIcon from '@material-ui/icons/MoreVert'
import Divider from '@material-ui/core/Divider'
import Button from '@material-ui/core/Button'
import { Link } from 'react-router-dom'
import CircularProgress from '@material-ui/core/CircularProgress'
import LinearProgress from '@material-ui/core/LinearProgress'
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
import validator from 'validator'
import BN from 'bn.js'
import bitcore from 'bitcore-lib'
import Tooltip from '@material-ui/core/Tooltip'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import FileCopyIcon from '@material-ui/icons/FileCopy'
import url from '../url'
import * as Web3Utils from 'web3-utils'
import WalletUtils from '../wallets/utils'
import { UserRecentTransactions } from './LandingPageComponent.jsx'

const WALLET_TYPE = 'drive'

function SendToAnotherAccount (props) {
  const { accounts } = props
  const [amount, setAmount] = useState(null)
  const [memo, setMemo] = useState(null)

  function validateAmount (cryptoType, balance, amount) {
    const decimals = getCryptoDecimals(cryptoType)
    if (
      !validator.isFloat(amount, { min: 0.001, max: utils.toHumanReadableUnit(balance, decimals) })
    ) {
      if (amount === '-' || parseFloat(amount) < 0.001) {
        return 'The amount must be greater than 0.001'
      } else {
        return `Exceed your balance of ${utils.toHumanReadableUnit(balance, decimals)}`
      }
    }
  }

  return
}

class WalletComponent extends Component {
  state = {
    anchorEl: null
  }

  renderChainsfrWalletSection = () => {
    const { classes, cloudWallet, actionsPending } = this.props
    const { anchorEl } = this.state
    const cryptoList = walletCryptoSupports['drive']

    // Do not remove <div style={{ padding: 10 }}>
    // See https://material-ui.com/components/grid/#limitations
    return (
      <Grid container alignItems='center' justify='center' className={classes.coloredBackgrond}>
        <Container maxWidth='lg'>
          <div style={{ marginBottom: '30px' }}>
            <Grid container alignItems='center' justify='space-between'>
              <Box mb={2}>
                <Typography variant='h3'>Chainsfr Wallet</Typography>
              </Box>
              <Grid item>
                <Grid container alignItems='center' spacing={3}>
                  <Grid item>
                    <Button color='primary' variant='outlined'>
                      Receive
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button
                      color='primary'
                      variant='contained'
                      onClick={event => this.setState({ anchorEl: event.currentTarget })}
                    >
                      Send
                      <ArrowDropDownIcon></ArrowDropDownIcon>
                    </Button>
                    <Menu
                      anchorEl={anchorEl}
                      getContentAnchorEl={null}
                      open={Boolean(anchorEl)}
                      keepMounted
                      onClose={() => this.setState({ anchorEl: null })}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left'
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left'
                      }}
                    >
                      <MenuItem>
                        <ListItemText primary='Send to my accounts' />
                      </MenuItem>
                      <MenuItem>
                        <ListItemText primary='Send to others' />
                      </MenuItem>
                    </Menu>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </div>
          <div>
            <Grid container direction='row' alignItems='center' justify='center' spacing={2}>
              {cryptoList.map((crypto, index) => {
                return (
                  <Grid item>
                    <Card className={classes.balanceCard} key={index}>
                      <Grid container alignItems='center' justify='center' direction='column'>
                        <Grid item>
                          {cloudWallet.connected ? (
                            <Typography variant='h2'>
                              {cloudWallet.crypto[crypto.cryptoType][0].balanceInStandardUnit}
                            </Typography>
                          ) : (
                            <CircularProgress></CircularProgress>
                          )}
                        </Grid>
                        <Grid item>
                          <Typography variant='caption'>
                            {getCryptoSymbol(crypto.cryptoType)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Card>
                  </Grid>
                )
              })}
            </Grid>
          </div>
        </Container>
      </Grid>
    )
  }

  render () {
    const { actionsPending, transferHistory, loadMoreTransferHistory } = this.props

    return (
      <div>
        {this.renderChainsfrWalletSection()}
        <UserRecentTransactions
          actionsPending={actionsPending}
          transferHistory={transferHistory}
          loadMoreTransferHistory={loadMoreTransferHistory}
        />
      </div>
    )
  }
}

// class WalletComponent extends Component {
//   constructor (props) {
//     super(props)
//     this.state = {
//       addAddressModalOpen: false,
//       viewAddressDialogOpen: false,
//       viewPrivateKeyDialogOpen: false,
//       directTransferDialogOpen: false,
//       directTransferDialogStep: '', // one of ['RECIPIANT, REVIEW, RECEIPT']
//       selectedCryptoType: '',
//       directTransferDialogForm: {
//         destinationAddress: '',
//         transferAmount: ''
//       },
//       directTransferDialogFormError: {},
//       moreMenu: {},
//       copied: false
//     }
//   }

//   componentDidUpdate (prevProps, prevState) {
//     let { actionsPending, receipt, wallet } = this.props
//     const {
//       directTransferDialogForm,
//       selectedCryptoType,
//       directTransferDialogOpen,
//       directTransferDialogFormError
//     } = this.state
//     const { transferAmount } = directTransferDialogForm
//     if (prevProps.actionsPending.directTransfer && !actionsPending.directTransfer && receipt) {
//       // direct transfer action is completed
//       // sucessfully retrieved the receipt
//       // jump to receipt step
//       this.setState({ directTransferDialogStep: 'RECEIPT' }) // eslint-disable-line
//     } else if (
//       prevState.directTransferDialogForm.transferAmount !== transferAmount &&
//       directTransferDialogOpen &&
//       !directTransferDialogFormError.transferAmount
//     ) {
//       this.props.getTxFee({
//         fromWallet: WalletUtils.toWalletDataFromState('drive', selectedCryptoType, wallet),
//         transferAmount: directTransferDialogForm.transferAmount
//       })
//     } else if (
//       directTransferDialogOpen &&
//       !actionsPending.getTxFee &&
//       prevProps.actionsPending.getTxFee
//     ) {
//       this.setState(
//         update(this.state, {
//           // eslint-disable-line
//           directTransferDialogFormError: {
//             transferAmount: {
//               $set: this.validate('transferAmount', directTransferDialogForm.transferAmount)
//             }
//           }
//         })
//       )
//     }
//   }

//   handleMoreBtnOnOpen = cryptoType => event => {
//     this.setState(
//       update(this.state, {
//         moreMenu: {
//           [cryptoType]: _cryptoType =>
//             update(_cryptoType || {}, { anchorEl: { $set: event.currentTarget } })
//         }
//       })
//     )
//   }

//   handleMoreBtnOnClose = cryptoType => event => {
//     this.setState(update(this.state, { moreMenu: { [cryptoType]: { anchorEl: { $set: null } } } }))
//   }

//   toggleDirectTransferDialog = (open, cryptoType) => {
//     var _state = this.state

//     if (open) {
//       var unlocked = !!this.props.wallet.crypto[cryptoType][0].privateKey
//       if (unlocked) {
//         // only show dialog when wallet is unlocked
//         _state = update(_state, {
//           directTransferDialogOpen: { $set: open },
//           selectedCryptoType: { $set: cryptoType },
//           directTransferDialogStep: { $set: 'RECIPIANT' }
//         })
//       } else {
//         this.props.unlockCloudWallet({
//           cryptoType: cryptoType,
//           onClose: () => this.toggleDirectTransferDialog(open, cryptoType)
//         })
//       }
//     }

//     if (!open) {
//       // close the dialog
//       _state = update(_state, { directTransferDialogOpen: { $set: false } })
//       // close dropdown menu as well
//       _state = update(_state, {
//         moreMenu: { [this.state.selectedCryptoType]: { anchorEl: { $set: null } } }
//       })
//       _state = update(_state, {
//         directTransferDialogForm: {
//           $set: {
//             destinationAddress: '',
//             transferAmount: ''
//           }
//         }
//       })
//     }
//     this.setState(_state)
//   }

//   toggleViewAddressDialog = (open, cryptoType) => {
//     let _state = update(this.state, {
//       viewAddressDialogOpen: { $set: open },
//       selectedCryptoType: { $set: cryptoType }
//     })
//     if (!open) {
//       // close dropdown menu as well
//       _state = update(_state, {
//         moreMenu: { [this.state.selectedCryptoType]: { anchorEl: { $set: null } } }
//       })
//     }
//     this.setState(_state)
//   }

//   toggleViewPrivateKeyDialog = (open, cryptoType) => {
//     let _state = this.state

//     if (open) {
//       var unlocked = !!this.props.wallet.crypto[cryptoType][0].privateKey
//       if (unlocked) {
//         _state = update(this.state, {
//           viewPrivateKeyDialogOpen: { $set: open },
//           selectedCryptoType: { $set: cryptoType }
//         })
//       } else {
//         this.props.unlockCloudWallet({
//           cryptoType: cryptoType,
//           onClose: () => this.toggleViewPrivateKeyDialog(open, cryptoType)
//         })
//       }
//     } else {
//       // close the dialog
//       _state = update(this.state, { viewPrivateKeyDialogOpen: { $set: open } })
//       // close dropdown menu as well
//       _state = update(_state, {
//         moreMenu: { [this.state.selectedCryptoType]: { anchorEl: { $set: null } } }
//       })
//     }
//     this.setState(_state)
//   }

//   validate = (name, value) => {
//     const { wallet, txFee } = this.props
//     const { selectedCryptoType } = this.state
//     let balance = wallet ? wallet.crypto[selectedCryptoType][0].balance : null
//     const decimals = getCryptoDecimals(selectedCryptoType)
//     if (name === 'transferAmount' && wallet && balance) {
//       if (
//         !validator.isFloat(value, {
//           min: 0.001,
//           max: utils.toHumanReadableUnit(balance, decimals, 8)
//         })
//       ) {
//         if (value === '-' || parseFloat(value) < 0.001) {
//           return 'The amount must be greater than 0.001'
//         } else {
//           return `The amount cannot exceed your current balance ${utils.toHumanReadableUnit(
//             balance,
//             decimals
//           )}`
//         }
//       } else {
//         // balance check passed
//         if (['ethereum', 'dai'].includes(selectedCryptoType)) {
//           // ethereum based coins
//           // now check if ETH balance is sufficient for paying tx fees
//           if (
//             selectedCryptoType === 'ethereum' &&
//             txFee &&
//             new BN(balance).lt(
//               new BN(txFee.costInBasicUnit).add(
//                 utils.toBasicTokenUnit(parseFloat(value), decimals, 8)
//               )
//             )
//           ) {
//             return 'Insufficent funds for paying transaction fees'
//           }
//           if (
//             selectedCryptoType === 'dai' &&
//             txFee &&
//             new BN(balance).lt(new BN(txFee.costInBasicUnit))
//           ) {
//             return 'Insufficent funds for paying transaction fees'
//           }
//         } else if (
//           selectedCryptoType === 'bitcoin' &&
//           txFee &&
//           new BN(balance).lt(
//             new BN(txFee.costInBasicUnit).add(
//               utils.toBasicTokenUnit(parseFloat(value), decimals, 8)
//             )
//           )
//         ) {
//           return 'Insufficent funds for paying transaction fees'
//         }
//       }
//     } else if (name === 'destinationAddress') {
//       if (selectedCryptoType === 'bitcoin') {
//         if (
//           !bitcore.Address.isValid(value, bitcore.Networks[env.REACT_APP_BITCOIN_JS_LIB_NETWORK])
//         ) {
//           return 'Invalid address'
//         }
//       } else if (['ethereum', 'dai'].includes(selectedCryptoType)) {
//         if (!Web3Utils.isAddress(value)) {
//           return 'Invalid address'
//         }
//       } else if (selectedCryptoType === 'libra') {
//         if (value.length !== 64 || !/^[a-f0-9]+$/.test(value)) {
//           // length of 64, only contains 0-9, a-f
//           return 'Invalid address'
//         }
//       }
//       return null
//     }
//   }

//   handleDirectTransferDialogFormChange = name => event => {
//     this.setState(
//       update(this.state, {
//         directTransferDialogForm: { [name]: { $set: event.target.value } },
//         directTransferDialogFormError: { [name]: { $set: this.validate(name, event.target.value) } }
//       })
//     )
//   }

//   validateForm = () => {
//     const { directTransferDialogForm, directTransferDialogFormError } = this.state

//     // form must be filled without errors
//     return (
//       directTransferDialogForm.destinationAddress &&
//       directTransferDialogForm.transferAmount &&
//       !directTransferDialogFormError.destinationAddress &&
//       !directTransferDialogFormError.transferAmount
//     )
//   }

//   directTransferDialogOnSubmit = () => {
//     const { directTransferDialogForm, selectedCryptoType } = this.state
//     const { wallet, directTransfer, txFee } = this.props

//     if (
//       selectedCryptoType &&
//       directTransferDialogForm.transferAmount &&
//       directTransferDialogForm.destinationAddress
//     ) {
//       // submit direct transfer request
//       directTransfer({
//         fromWallet: WalletUtils.toWalletDataFromState('drive', selectedCryptoType, wallet),
//         destinationAddress: directTransferDialogForm.destinationAddress,
//         transferAmount: directTransferDialogForm.transferAmount,
//         txFee: txFee
//       })
//     }
//   }

//   renderDirectTransferDialogRecipiantStep = () => {
//     let { classes, wallet, txFee, actionsPending } = this.props
//     let {
//       directTransferDialogOpen,
//       directTransferDialogForm,
//       directTransferDialogFormError,
//       selectedCryptoType
//     } = this.state

//     if (directTransferDialogOpen) {
//       let _balance = wallet.crypto[selectedCryptoType][0].balance
//       let _decimals = getCryptoDecimals(selectedCryptoType)
//       var balance = _balance
//         ? numeral(utils.toHumanReadableUnit(_balance, _decimals)).format('0.0000a')
//         : '0'
//     }

//     return (
//       <>
//         <DialogTitle>Direct Transfer</DialogTitle>
//         <DialogContent>
//           <TextField
//             className={classes.directTransferToAddressTextField}
//             variant='outlined'
//             autoFocus
//             id='destinationAddress'
//             label='To Address'
//             fullWidth
//             value={directTransferDialogForm.destinationAddress}
//             onChange={this.handleDirectTransferDialogFormChange('destinationAddress')}
//             error={!!directTransferDialogFormError.destinationAddress}
//             helperText={directTransferDialogFormError.destinationAddress}
//           />
//           <TextField
//             variant='outlined'
//             id='amount'
//             label='Amount'
//             fullWidth
//             value={directTransferDialogForm.transferAmount}
//             onChange={this.handleDirectTransferDialogFormChange('transferAmount')}
//             helperText={directTransferDialogFormError.transferAmount || `Balance: ${balance}`}
//             error={!!directTransferDialogFormError.transferAmount}
//           />
//           <Grid item className={classes.txFeeSection}>
//             <Typography variant='body1' align='left'>
//               Transaction Fee
//             </Typography>
//             {!actionsPending.getTxFee ? (
//               <Typography variant='caption' align='left'>
//                 {txFee ? txFee.costInStandardUnit : 0}{' '}
//                 {getCryptoSymbol(getTxFeesCryptoType(selectedCryptoType))}
//               </Typography>
//             ) : (
//               <CircularProgress size={18} color='primary' />
//             )}
//           </Grid>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => this.toggleDirectTransferDialog(false)} color='primary'>
//             Cancel
//           </Button>
//           <Button
//             variant='contained'
//             onClick={() => this.setState({ directTransferDialogStep: 'REVIEW' })}
//             color='primary'
//             disabled={!this.validateForm() || actionsPending.getTxFee}
//           >
//             Continue to Review
//           </Button>
//         </DialogActions>
//       </>
//     )
//   }

//   renderDirectTransferDialogReviewStep = () => {
//     let { classes, actionsPending } = this.props
//     let { directTransferDialogForm, selectedCryptoType } = this.state

//     return (
//       <>
//         <DialogTitle>Direct Transfer</DialogTitle>
//         <DialogContent>
//           <Typography align='left' variant='body2'>
//             You are about to send {directTransferDialogForm.transferAmount}{' '}
//             {getCryptoSymbol(selectedCryptoType)} to the following address:
//           </Typography>
//           <Typography align='left' style={{ marginBottom: '20px' }} variant='body2'>
//             {directTransferDialogForm.destinationAddress}
//           </Typography>
//           <Typography align='left' variant='body2'>
//             Please double check on the amount and address. The transfser is irreversible.
//           </Typography>
//         </DialogContent>
//         <DialogActions>
//           <Button
//             onClick={() => this.setState({ directTransferDialogStep: 'RECIPIANT' })}
//             color='primary'
//           >
//             Back
//           </Button>
//           <div className={classes.directTxConfirmBtnContainer}>
//             <Button
//               variant='contained'
//               onClick={this.directTransferDialogOnSubmit}
//               color='primary'
//               disabled={actionsPending.directTransfer}
//             >
//               Confirm to Transfer
//             </Button>
//             {actionsPending.directTransfer ? (
//               <CircularProgress size={24} className={classes.directTxConfirmBtnProgress} />
//             ) : null}
//           </div>
//         </DialogActions>
//       </>
//     )
//   }

//   renderDirectTransferDialogReceiptStep = () => {
//     let { classes, receipt } = this.props

//     return (
//       <>
//         <DialogTitle>Direct Transfer</DialogTitle>
//         <DialogContent>
//           <Typography variant='body2' className={classes.informReceiverText} align='left'>
//             Succeed! It may take a few minutes to complete the transaction. You can track the
//             transaction
//             <MuiLink
//               target='_blank'
//               rel='noopener'
//               href={url.getExplorerTx(receipt.cryptoType, receipt.sendTxHash)}
//             >
//               {' here'}
//             </MuiLink>
//           </Typography>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => this.toggleDirectTransferDialog(false)} color='primary'>
//             Close
//           </Button>
//         </DialogActions>
//       </>
//     )
//   }

//   renderDirectTransferDialog = () => {
//     let { directTransferDialogOpen, directTransferDialogStep } = this.state

//     return (
//       <Dialog open={directTransferDialogOpen}>
//         {directTransferDialogStep === 'RECIPIANT' && this.renderDirectTransferDialogRecipiantStep()}
//         {directTransferDialogStep === 'REVIEW' && this.renderDirectTransferDialogReviewStep()}
//         {directTransferDialogStep === 'RECEIPT' && this.renderDirectTransferDialogReceiptStep()}
//       </Dialog>
//     )
//   }

//   renderViewAddressDialog = () => {
//     const { viewAddressDialogOpen, selectedCryptoType, copied } = this.state
//     const { classes, wallet } = this.props
//     const address = wallet.crypto[selectedCryptoType][0].address

//     return (
//       <Dialog open={viewAddressDialogOpen}>
//         <DialogTitle>Address</DialogTitle>
//         <DialogContent>
//           <Grid container direction='row' alignItems='center'>
//             <Grid item>
//               <Typography variant='h6' align='left'>
//                 {address}
//               </Typography>
//             </Grid>
//             <Grid item>
//               <CopyToClipboard
//                 text={address}
//                 onCopy={() => {
//                   this.setState({ copied: true }, () =>
//                     setTimeout(() => this.setState({ copied: false }), 1500)
//                   )
//                 }}
//               >
//                 <Tooltip placement='top' open={copied} title='Copied'>
//                   <IconButton disableRipple className={classes.iconBtn}>
//                     <FileCopyIcon fontSize='small' />
//                   </IconButton>
//                 </Tooltip>
//               </CopyToClipboard>
//             </Grid>
//           </Grid>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => this.toggleViewAddressDialog(false)} color='primary'>
//             Close
//           </Button>
//         </DialogActions>
//       </Dialog>
//     )
//   }

//   renderViewPrivateKeyDialog = () => {
//     const { viewPrivateKeyDialogOpen, selectedCryptoType, copied } = this.state
//     const { classes, wallet, actionsPending } = this.props

//     const privateKey = wallet.crypto[selectedCryptoType][0].privateKey
//     return (
//       <Dialog open={viewPrivateKeyDialogOpen}>
//         <DialogTitle>Private Key</DialogTitle>
//         <DialogContent className={classes.minWidth200px}>
//           {wallet.crypto[selectedCryptoType][0].privateKey && !actionsPending.decryptCloudWallet ? (
//             <Grid container direction='row' alignItems='center'>
//               <Grid item>
//                 <Typography cvariant='h6' align='left'>
//                   {privateKey}
//                 </Typography>
//               </Grid>
//               <Grid item>
//                 <CopyToClipboard
//                   text={privateKey}
//                   onCopy={() => {
//                     this.setState({ copied: true }, () =>
//                       setTimeout(() => this.setState({ copied: false }), 1500)
//                     )
//                   }}
//                 >
//                   <Tooltip placement='top' open={copied} title='Copied'>
//                     <IconButton disableRipple className={classes.iconBtn}>
//                       <FileCopyIcon fontSize='small' />
//                     </IconButton>
//                   </Tooltip>
//                 </CopyToClipboard>
//               </Grid>
//             </Grid>
//           ) : (
//             <LinearProgress />
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => this.toggleViewPrivateKeyDialog(false)} color='primary'>
//             Close
//           </Button>
//         </DialogActions>
//       </Dialog>
//     )
//   }

//   goToTransfer = cryptoType => {
//     var unlocked = !!this.props.wallet.crypto[cryptoType][0].privateKey
//     if (!unlocked) {
//       this.props.unlockCloudWallet({
//         cryptoType: cryptoType,
//         onClose: () => this.goToTransfer(cryptoType)
//       })
//     } else {
//       this.props.push(
//         `${Paths.transfer}?walletSelection=${WALLET_TYPE}&cryptoSelection=${cryptoType}`
//       )
//     }
//   }

//   renderItem = walletByCryptoType => {
//     let { classes } = this.props
//     var explorerLink = null
//     if (walletByCryptoType.cryptoType === 'ethereum') {
//       explorerLink = url.getEthExplorerAddress(walletByCryptoType.address)
//     } else if (walletByCryptoType.cryptoType === 'dai') {
//       explorerLink = url.getEthExplorerToken(env.REACT_APP_DAI_ADDRESS, walletByCryptoType.address)
//     } else if (walletByCryptoType.cryptoType === 'bitcoin') {
//       explorerLink = url.getBtcExplorerAddress(walletByCryptoType.address)
//     } else if (walletByCryptoType.cryptoType === 'libra') {
//       explorerLink = url.getLibraExplorerAddress(walletByCryptoType.address)
//     }

//     let moreMenu = this.state.moreMenu[walletByCryptoType.cryptoType]

//     return (
//       /* add key to fragment to supress non-unique key warnings */
//       <React.Fragment key={walletByCryptoType.cryptoType}>
//         <ListItem>
//           <Grid container direction='row' alignItems='center'>
//             <Grid item lg={9} md={8} sm={6} xs={3}>
//               <Typography variant='h6' align='left'>
//                 {getCryptoSymbol(walletByCryptoType.cryptoType)}
//               </Typography>
//               <Typography variant='caption' align='left'>
//                 {getCryptoTitle(walletByCryptoType.cryptoType)}
//               </Typography>
//             </Grid>
//             <Grid item lg={1} md={1} sm={1} xs={4}>
//               <Typography align='right' variant='body2'>
//                 {numeral(
//                   utils.toHumanReadableUnit(
//                     walletByCryptoType.balance,
//                     getCryptoDecimals(walletByCryptoType.cryptoType)
//                   )
//                 ).format('0.0000a')}
//               </Typography>
//             </Grid>
//             <Grid item lg={2} md={3} sm={5} xs={5}>
//               <Grid container direction='row' justify='flex-end'>
//                 <Grid item>
//                   <Tooltip title='Transfer'>
//                     <IconButton
//                       className={classes.button}
//                       aria-label='Send'
//                       onClick={() => this.goToTransfer(walletByCryptoType.cryptoType)}
//                     >
//                       <SendIcon />
//                     </IconButton>
//                   </Tooltip>
//                 </Grid>
//                 <Grid item>
//                   <Tooltip title='Show in Explorer'>
//                     <IconButton
//                       className={classes.button}
//                       aria-label='Explorer'
//                       target='_blank'
//                       href={explorerLink}
//                     >
//                       <OpenInNewIcon />
//                     </IconButton>
//                   </Tooltip>
//                 </Grid>
//                 <Grid item>
//                   <Tooltip title='More'>
//                     <IconButton
//                       className={classes.button}
//                       aria-label='Explorer'
//                       onClick={this.handleMoreBtnOnOpen(walletByCryptoType.cryptoType)}
//                     >
//                       <MoreVertIcon />
//                     </IconButton>
//                   </Tooltip>
//                   <Menu
//                     anchorEl={moreMenu && moreMenu.anchorEl}
//                     open={Boolean(moreMenu && moreMenu.anchorEl)}
//                     onClose={this.handleMoreBtnOnClose(walletByCryptoType.cryptoType)}
//                   >
//                     <MenuItem
//                       onClick={() =>
//                         this.toggleDirectTransferDialog(true, walletByCryptoType.cryptoType)
//                       }
//                     >
//                       Direct Transfer
//                     </MenuItem>
//                     <MenuItem
//                       onClick={() =>
//                         this.toggleViewAddressDialog(true, walletByCryptoType.cryptoType)
//                       }
//                     >
//                       View Address
//                     </MenuItem>
//                     <MenuItem
//                       onClick={() =>
//                         this.toggleViewPrivateKeyDialog(true, walletByCryptoType.cryptoType)
//                       }
//                     >
//                       View Private Key
//                     </MenuItem>
//                   </Menu>
//                 </Grid>
//               </Grid>
//             </Grid>
//           </Grid>
//         </ListItem>
//         <Divider />
//       </React.Fragment>
//     )
//   }

//   render () {
//     const { classes, wallet, actionsPending } = this.props
//     const { directTransferDialogOpen, viewAddressDialogOpen, viewPrivateKeyDialogOpen } = this.state

//     let walletList = []
//     if (wallet.connected) {
//       walletList = walletCryptoSupports[WALLET_TYPE].map(crypto => {
//         return {
//           cryptoType: crypto.cryptoType,
//           balance: wallet.crypto[crypto.cryptoType][0].balance,
//           address: wallet.crypto[crypto.cryptoType][0].address
//         }
//       })
//     }

//     return (
//       <Grid container direction='column' alignItems='center'>
//         <Grid item className={classes.walletListContainer}>
//           <Grid container direction='column'>
//             <Grid item className={classes.headerSection}>
//               {/* Back button */}
//               <Button color='primary' className={classes.backBtn} component={Link} to={Paths.home}>
//                 {'< Back to Home'}
//               </Button>
//               {/* Title */}
//             </Grid>
//             <Grid item className={classes.headerSection}>
//               <Typography variant='h3' align='left'>
//                 My Drive Wallet
//               </Typography>
//             </Grid>
//             <Grid item>
//               <Grid container direction='column' alignItems='center'>
//                 <List className={classes.walletList}>
//                   {/* List header */}
//                   <ListItem key='walletListHeader'>
//                     <Grid container direction='row' alignItems='center'>
//                       <Grid item lg={9} md={8} sm={6} xs={3}>
//                         <Typography variant='caption' align='left'>
//                           Token
//                         </Typography>
//                       </Grid>
//                       <Grid item lg={1} md={1} sm={1} xs={4}>
//                         <Typography variant='caption' align='right'>
//                           Balance
//                         </Typography>
//                       </Grid>
//                     </Grid>
//                   </ListItem>
//                   <Divider />
//                   {/* List content */}
//                   {!actionsPending.getCloudWallet &&
//                     wallet.connected &&
//                     walletList.map(wallet => this.renderItem(wallet))}
//                 </List>
//                 {actionsPending.getCloudWallet && (
//                   <Grid item align='center'>
//                     <CircularProgress
//                       size={24}
//                       color='primary'
//                       className={classes.buttonProgress}
//                     />
//                   </Grid>
//                 )}
//                 {directTransferDialogOpen && this.renderDirectTransferDialog()}
//                 {viewAddressDialogOpen && this.renderViewAddressDialog()}
//                 {viewPrivateKeyDialogOpen && this.renderViewPrivateKeyDialog()}
//               </Grid>
//             </Grid>
//           </Grid>
//         </Grid>
//       </Grid>
//     )
//   }
// }

const styles = theme => ({
  walletList: {
    width: '100%'
  },
  walletListContainer: {
    padding: '60px 30px 60px 30px',
    width: '100%',
    maxWidth: '1200px'
  },
  headerSection: {
    marginBottom: '30px'
  },
  backBtn: {
    fontSize: '12px',
    fontWeight: 500,
    padding: '0px'
  },
  directTransferToAddressTextField: {
    marginTop: '10px',
    marginBottom: '30px'
  },
  txFeeSection: {
    marginTop: '30px'
  },
  minWidth200px: {
    minWidth: '300px'
  },
  directTxConfirmBtnContainer: {
    position: 'relative'
  },
  directTxConfirmBtnProgress: {
    position: 'absolute',
    left: '45%',
    top: '20%'
  },
  coloredBackgrond: {
    backgroundColor: '#FAFBFE'
  },
  balanceCard: {
    width: '320px',
    height: '160px',
    padding: '0px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '0px'
  }
})

export default withStyles(styles)(WalletComponent)
