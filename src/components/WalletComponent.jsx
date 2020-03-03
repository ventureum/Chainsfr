// @flow
import React, { useState } from 'react'

import { useSelector } from 'react-redux'
import Avatar from '@material-ui/core/Avatar'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import Divider from '@material-ui/core/Divider'
import Drawer from '@material-ui/core/Drawer'
import Grid from '@material-ui/core/Grid'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import CompareArrowsIcon from '@material-ui/icons/CompareArrows'
import CloseIcon from '@material-ui/icons/Close'
import numeral from 'numeral'
import path from '../Paths.js'
import { getCryptoDecimals, getCryptoLogo, getCryptoTitle, getCryptoSymbol } from '../tokens'
import utils from '../utils'
import url from '../url'
import { getWalletLogo, walletSelections } from '../wallet'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import QRCode from '../images/qrcode.svg'
import SendIcon from '@material-ui/icons/Send'
import InfiniteScroll from 'react-infinite-scroller'
import CircularProgress from '@material-ui/core/CircularProgress'
import EmptyStateImage from '../images/empty_state_01.png'
import SwapVertIcon from '../images/swap.svg'
import OpenInNewIcon from '@material-ui/icons/OpenInNew'
import ReceiptIcon from '@material-ui/icons/Receipt'
import EmailIcon from '@material-ui/icons/Email'
import moment from 'moment'
import Icon from '@material-ui/core/Icon'
import Link from '@material-ui/core/Link'
import IconButton from '@material-ui/core/IconButton'
import AddressQRCodeDialog from './AddressQRCodeDialog'
import Skeleton from '@material-ui/lab/Skeleton'
import type { AccountData } from '../types/account.flow'

function WalletComponent (props: {
  cloudWalletAccounts: Array<Object>,
  txHistoryByAccount: Object,
  push: Function,
  actionsPending: Object,
  toCurrencyAmount: Function
}) {
  const classes = useStyles()
  const [drawerState, setDrawerState] = useState({
    open: false,
    accountIdx: -1
  })

  const [addressQRCodeDialogOpen, setAddressQRCodeDialogOpen] = useState(false)

  const { cryptoPrice } = useSelector(state => state.cryptoPriceReducer)

  const { txHistoryByAccount, cloudWalletAccounts, toCurrencyAmount, push, actionsPending } = props

  const renderChainsfrWalletSection = () => {
    return (
      <Grid container direction='column'>
        {/* upper section */}
        <Grid item>
          {/* title and transfer btn row */}
          <Grid container direction='row' alignItems='center' justify='space-between'>
            <Grid item>
              <Typography variant='h2'> Wallet </Typography>
            </Grid>
            <Grid item>
              <Button variant='contained' color='primary' onClick={() => push(path.directTransfer)}>
                Balance Transfer
              </Button>
            </Grid>
          </Grid>
        </Grid>
        {/* subtitle row */}
        <Grid item>
          <Typography variant='h4'>
            Transfer your balances between your Chainsfr wallet and connected accounts. It’s fast
            and easy.
          </Typography>
        </Grid>
        {/* wallet icons row */}
        <Grid item style={{ marginTop: '30px' }}>
          <Grid container direction='row' alignItems='center' justify='flex-start' spacing={4}>
            {/* drive wallet logo */}
            <Grid item>
              <img className={classes.walletLogo} src={getWalletLogo('drive')} alt='wallet-logo' />
            </Grid>
            {/* exchange arrow */}
            <Grid item>
              <CompareArrowsIcon fontSize='large' />
            </Grid>
            {walletSelections
              .filter(w => {
                return (
                  w.walletType !== 'drive' &&
                  !w.hide &&
                  w.walletType !== 'metamask' &&
                  w.walletType !== 'metamaskWalletConnect'
                )
              })
              .map((w, i) => {
                return (
                  <Grid item>
                    <img className={classes.walletLogo} src={w.logo} alt='wallet-logo' />
                  </Grid>
                )
              })}
          </Grid>
        </Grid>
      </Grid>
    )
  }

  const renderRecentTransferItem = (account: AccountData, tx: ?Object, images) => {
    // three cases
    // 1. normal tx
    // 2. email transfer
    // 3. direct transfer

    // setup vars
    let transferTypeIcon
    let receiptIcon
    let title
    let transferAmount
    let transferFiatAmount
    let receiptLink
    let transferIn: ?boolean

    const skeletonOnly = !!!tx

    if (account && tx) {
      var { cryptoType } = account
      var accountAddressLower = account.address.toLowerCase()

      var { txHash, standaloneTx, transferData, timestamp } = tx
    }
    if (!skeletonOnly) {
      if (standaloneTx) {
        // 1. normal tx
        const { from, to, value } = standaloneTx
        transferTypeIcon = (
          <Icon fontSize='small'>
            <img src={SwapVertIcon} alt='swap icon' style={{color: '#A8A8A8'}} />
          </Icon>
        )
        if (from === accountAddressLower) {
          transferIn = false
          title = to.slice(0, 6) + '...' + to.slice(-4)
        } else {
          transferIn = true
          title = from.slice(0, 6) + '...' + to.slice(-4)
        }
        transferAmount = utils.toHumanReadableUnit(value, getCryptoDecimals(cryptoType))
        transferFiatAmount = utils.toCurrencyAmount(transferAmount, cryptoPrice[cryptoType])
        receiptIcon = <OpenInNewIcon color='primary' />
        receiptLink = url.getExplorerTx(cryptoType, txHash)
      } else if (transferData) {
        // case 2 and case 3
        if (transferData.transferMethod === 'DIRECT_TRANSFER') {
          // 3. direct transfer
          transferTypeIcon = (
          <Icon fontSize='small'>
            <img src={SwapVertIcon} alt='swap icon' style={{color: '#A8A8A8'}} />
          </Icon>
        )
          title =
            transferData.transferType === 'SENDER'
              ? transferData.destinationAccount.getAccountData().name
              : transferData.senderAccount.getAccountData()
        } else if (transferData.transferMethod === 'EMAIL_TRANSFER') {
          // 2. email transfer
          transferTypeIcon = <EmailIcon style={{ color: '#A8A8A8' }} />
          title =
            transferData.transferType === 'SENDER'
              ? transferData.receiverName
              : transferData.senderName
        }

        transferAmount = transferData.transferAmount
        transferFiatAmount = transferData.transferFiatAmountSpot
        transferIn = transferData.transferType === 'RECEIVER'
        receiptIcon = <ReceiptIcon color='primary' />
        receiptLink = transferIn
          ? `${path.receipt}?receivingId=${transferData.receivingId}`
          : `${path.receipt}?transferId=${transferData.transferId}`
      }
    }

    return (
      <Box display='flex' flexDirection='row' justifyContent='space-between' mt={2} mb={2}>
        {/* 
          left: transferType icon, [ accountName | Recipient | Sender name] 
          right:  { + | - } transferAmount, receipt icon
        */}
        <Box display='flex'>
          {!skeletonOnly ? (
            transferTypeIcon
          ) : (
            <Skeleton variant='circle' width={20} height={20} className={classes.skeleton} />
          )}
          <Box ml={1}>
            {!skeletonOnly ? (
              <>
                <Typography variant='body2'> {title} </Typography>
                <Typography variant='caption'>
                  {moment.unix(timestamp).format('MMM Do YYYY, HH:mm:ss')}
                </Typography>
              </>
            ) : (
              <>
                <Skeleton width={100} height={20} className={classes.skeleton} />
                <Skeleton width={125} height={12} className={classes.skeleton} />
              </>
            )}
          </Box>
        </Box>
        <Box display='flex'>
          <Box>
            <Box display='flex' justifyContent='flex-end'>
              {!skeletonOnly ? (
                <Typography
                  variant='body2'
                  style={{
                    color: transferIn ? '#037948' : '#333333'
                  }}
                >
                  {transferIn ? '+' : '-'} {transferAmount}
                </Typography>
              ) : (
                <Skeleton width={30} height={20} className={classes.skeleton} />
              )}
            </Box>
            <Box display='flex' justifyContent='flex-end'>
              {!skeletonOnly ? (
                <Typography variant='caption'>
                  {transferIn ? '+' : '-'} {'$'}
                  {transferFiatAmount}
                </Typography>
              ) : (
                <Skeleton width={50} height={18} className={classes.skeleton} />
              )}
            </Box>
          </Box>
          <Box ml={1}>
            {!skeletonOnly ? (
              <Link href={receiptLink} target='_blank'>
                {receiptIcon}
              </Link>
            ) : (
              <Skeleton width={18} height={18} className={classes.skeleton} />
            )}
          </Box>
        </Box>
      </Box>
    )
  }

  const renderTxHistory = account => {
    let txHistory = txHistoryByAccount[account.id]
    return (
      <InfiniteScroll
        loader={
          actionsPending.getTxHistoryByAccount && (
            <Grid container direction='row' justify='center' key={0} alignItems='center'>
              <CircularProgress color='primary' style={{ marginTop: '30px' }} />
            </Grid>
          )
        }
        threshold={50}
        pageStart={0}
        useWindow={false}
        initialLoad={false}
      >
        {!actionsPending.getTxHistoryByAccount &&
          txHistory &&
          txHistory.history &&
          txHistory.history.length === 0 && (
            <Box display='flex' flexDirection='column' alignItems='center' mt={6} mb={6}>
              <Box mb={2}>
                <img src={EmptyStateImage} alt='Empty State' />
              </Box>
              <Typography variant='subtitle2' color='textSecondary'>
                It seems you don't have any transactions yet
              </Typography>
            </Box>
          )}
        {txHistory
          ? txHistory.history.map((tx, i) => (
              <>
                <Divider />
                {renderRecentTransferItem(account, tx, i)}
              </>
            ))
          : [null, null, null].map((tx, i) => (
              <>
                <Divider />
                {renderRecentTransferItem(account, tx, i)}
              </>
            ))}
      </InfiniteScroll>
    )
  }

  const renderAccountDrawer = () => {
    if (drawerState.open) {
      var account = cloudWalletAccounts[drawerState.accountIdx]
      var balanceStandardTokenUnit = utils.toHumanReadableUnit(
        account.balance,
        getCryptoDecimals(account.cryptoType)
      )
    }
    return (
      <>
        <Drawer
          anchor='right'
          open={drawerState.open}
          onClose={() => setDrawerState({ open: false, idx: -1 })}
        >
          {account && (
            <Grid
              container
              direction='column'
              justify='center'
              style={{
                width: '480px',
                maxWidth: '100vw',
                margin: '20px'
              }}
              spacing={2}
            >
              {/* title */}
              <Grid item>
                <Box display='flex' justifyContent='space-between'>
                  <Typography variant='h3'>
                    Wallet - {getCryptoTitle(account.cryptoType)}
                  </Typography>
                  <IconButton
                    onClick={() => setDrawerState({ open: false, idx: -1 })}
                    aria-label='close crypto tx history'
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
              </Grid>
              <Grid item>
                <Divider />
              </Grid>

              {/* crypto icon, name and balance */}
              <Grid item>
                <Grid container direction='row' alignItems='center'>
                  {/* coin icon and name */}
                  <Grid item xs={6}>
                    <Box display='flex' flexDirection='row' alignItems='center'>
                      <Box mr={1} display='inline'>
                        <Avatar
                          style={{ height: '32px', borderRadius: '2px' }}
                          src={getCryptoLogo(account.cryptoType)}
                        ></Avatar>
                      </Box>
                      <Typography variant='body2'>{getCryptoTitle(account.cryptoType)}</Typography>
                    </Box>
                  </Grid>
                  {/* amount */}
                  <Grid item xs={6}>
                    <Box
                      display='flex'
                      flexDirection='column'
                      alignItems='flex-end'
                      justifyContent='flex-end'
                    >
                      <Typography variant='body2'>
                        {numeral(balanceStandardTokenUnit).format('0.00a')}
                      </Typography>
                      <Typography variant='body2'>
                        {`$${toCurrencyAmount(balanceStandardTokenUnit, account.cryptoType)}`}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>

              {/* Address and send icons */}
              <Grid item>
                <Box display='flex' justifyContent='center'>
                  <Button
                    classes={{ label: classes.actionBtnLabel, root: classes.actionBtnBase }}
                    color='primary'
                    onClick={() => setAddressQRCodeDialogOpen(true)}
                  >
                    <img src={QRCode} alt='' className={classes.buttonIcon} />
                    Address
                  </Button>
                  <Button
                    color='primary'
                    classes={{ label: classes.actionBtnLabel, root: classes.actionBtnBase }}
                    onClick={() =>
                      push(
                        `${path.transfer}` +
                          `?walletSelection=${account.walletType}` +
                          `&platformType=${account.platformType}` +
                          `&cryptoType=${account.cryptoType}` +
                          `${
                            account.platformType === 'bitcoin'
                              ? `&xpub=${account.hdWalletVariables.xpub}`
                              : `&address=${account.address}`
                          }`
                      )
                    }
                  >
                    <SendIcon className={classes.buttonIcon} />
                    Send
                  </Button>
                </Box>
              </Grid>
              {/* transfer history by accountId */}
              <Grid item>{renderTxHistory(account)}</Grid>
            </Grid>
          )}
        </Drawer>
        {addressQRCodeDialogOpen && (
          <AddressQRCodeDialog
            open={addressQRCodeDialogOpen}
            handleClose={() => setAddressQRCodeDialogOpen(false)}
            account={account}
          />
        )}
      </>
    )
  }

  const renderCryptoListItem = (account: ?AccountData, idx) => {
    const skeletonOnly = !!!account

    if (account) {
      var { cryptoType, balance } = account
      var balanceStandardTokenUnit = utils.toHumanReadableUnit(
        balance,
        getCryptoDecimals(cryptoType)
      )
    }

    return (
      <>
        {/* align content center vertically */}
        <Box
          display='flex'
          alignItems='center'
          onClick={() =>
            !skeletonOnly
              ? setDrawerState({
                  open: true,
                  accountIdx: idx
                })
              : null
          }
        >
          <Grid container direction='row' alignItems='center'>
            {/* coin icon and name */}
            <Grid item xs={6}>
              <Box display='flex' flexDirection='row' alignItems='center'>
                <Box mr={1} display='inline'>
                  {!skeletonOnly ? (
                    <Avatar
                      style={{ height: '32px', borderRadius: '2px' }}
                      src={getCryptoLogo(cryptoType)}
                    ></Avatar>
                  ) : (
                    <Skeleton
                      variant='circle'
                      width={32}
                      height={32}
                      className={classes.skeleton}
                    />
                  )}
                </Box>
                {!skeletonOnly ? (
                  <Box>
                    <Typography variant='body2'>{getCryptoSymbol(cryptoType)}</Typography>
                    <Typography variant='caption'>{getCryptoTitle(cryptoType)}</Typography>
                  </Box>
                ) : (
                  <Box>
                    <Skeleton width={50} height={20} className={classes.skeleton} />
                    <Skeleton width={60} height={12} className={classes.skeleton} />
                  </Box>
                )}
              </Box>
            </Grid>
            {/* Amount */}
            <Grid item xs={5}>
              <Box
                display='flex'
                flexDirection='column'
                alignItems='flex-end'
                justifyContent='flex-end'
              >
                {!skeletonOnly ? (
                  <>
                    <Typography variant='body2'>
                      {numeral(balanceStandardTokenUnit).format('0.00a')}
                    </Typography>
                    <Typography variant='caption'>
                      {`$${toCurrencyAmount(balanceStandardTokenUnit, cryptoType)}`}
                    </Typography>
                  </>
                ) : (
                  <>
                    <Skeleton width={30} height={20} className={classes.skeleton} />
                    <Skeleton width={70} height={20} className={classes.skeleton} />
                  </>
                )}
              </Box>
            </Grid>
            {/* right arrow */}
            <Grid item xs={1} align='right'>
              {!skeletonOnly && <ChevronRightIcon />}
            </Grid>
          </Grid>
        </Box>
        <Grid item>
          <Divider />
        </Grid>
      </>
    )
  }

  const renderCryptoList = () => {
    return (
      <Grid container direction='column' justify='center' spacing={2}>
        <Grid item>
          <Grid container direction='row' alignItems='center'>
            <Grid item xs={6}>
              <Typography variant='h6'>Coin</Typography>
            </Grid>
            <Grid item xs={5} align='right'>
              <Typography variant='h6'>Amount</Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <Divider />
        </Grid>
        {!cloudWalletAccounts || actionsPending.getCryptoAccounts
          ? [null, null, null].map((account, idx) => renderCryptoListItem(account, idx))
          : cloudWalletAccounts.map((account, idx) => renderCryptoListItem(account, idx))}
      </Grid>
    )
  }

  return (
    <>
      <Grid container justify='center'>
        <Grid item className={classes.sectionContainer}>
          <Grid container direction='column' spacing={10}>
            <Grid item>{renderChainsfrWalletSection()}</Grid>
            <Grid item>{renderCryptoList()}</Grid>
            {renderAccountDrawer()}
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

const useStyles = makeStyles(theme => {
  return {
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
    },
    walletLogo: {
      height: '64px',
      alignSelf: 'center'
    },
    actionBtnLabel: {
      flexDirection: 'column'
    },
    actionBtnBase: {
      padding: theme.spacing(1),
      marginLeft: theme.spacing(3),
      marginRight: theme.spacing(3)
    },
    buttonIcon: {
      width: 22,
      height: 22
    },
    skeleton: {
      margin: 5
    }
  }
})

export default WalletComponent
