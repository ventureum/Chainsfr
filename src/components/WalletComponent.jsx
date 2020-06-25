// @flow
import React, { useState } from 'react'

import { useSelector } from 'react-redux'
import Avatar from '@material-ui/core/Avatar'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import Container from '@material-ui/core/Container'
import Divider from '@material-ui/core/Divider'
import Drawer from '@material-ui/core/Drawer'
import EmptyStateImage from '../images/empty_state_01.png'
import Grid from '@material-ui/core/Grid'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import CloseIcon from '@material-ui/icons/Close'
import numeral from 'numeral'
import path from '../Paths.js'
import {
  getCryptoDecimals,
  getCryptoLogo,
  getCryptoTitle,
  getCryptoSymbol,
  cryptoOrder
} from '../tokens'
import utils from '../utils'
import url from '../url'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import QRCode from '../images/qrcode.svg'
import SendIcon from '@material-ui/icons/Send'
import InfiniteScroll from 'react-infinite-scroller'
import CircularProgress from '@material-ui/core/CircularProgress'
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
import Chip from '@material-ui/core/Chip'
import { AccountData } from '../types/account.flow'

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

  // must copy to avoid making changes to redux
  let sortedCloudWalletAccounts = [...cloudWalletAccounts]
  sortedCloudWalletAccounts.sort((a, b) => {
    return cryptoOrder[b.cryptoType] - cryptoOrder[a.cryptoType]
  })

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

      var { txHash, standaloneTx, transferData, timestamp, pending } = tx
    }
    if (!skeletonOnly) {
      if (standaloneTx) {
        // 1. normal tx
        const { from, to, value } = standaloneTx
        transferTypeIcon = (
          <Icon fontSize='small'>
            <img src={SwapVertIcon} alt='swap icon' style={{ color: '#A8A8A8' }} />
          </Icon>
        )
        if (from === accountAddressLower) {
          transferIn = false
          title = to.slice(0, 6) + '...' + to.slice(-4)
        } else {
          transferIn = true
          title = from.slice(0, 6) + '...' + to.slice(-4)
        }
        transferAmount = utils.toHumanReadableUnit(value, getCryptoDecimals(cryptoType)).toString()
        transferFiatAmount = utils.toCurrencyAmount(transferAmount, cryptoPrice[cryptoType])
        receiptIcon = <OpenInNewIcon color='primary' />
        receiptLink = url.getExplorerTx(cryptoType, txHash)
      } else if (transferData) {
        // case 2 and case 3
        if (transferData.transferMethod === 'DIRECT_TRANSFER') {
          // 3. direct transfer
          transferTypeIcon = (
            <Icon fontSize='small'>
              <img src={SwapVertIcon} alt='swap icon' style={{ color: '#A8A8A8' }} />
            </Icon>
          )
          transferIn = transferData.destinationAccount.walletType === 'drive'
          title = !transferIn
            ? transferData.destinationAccount.name
            : transferData.senderAccount.name
          receiptLink = `${path.receipt}?transferId=${transferData.transferId}`
        } else if (transferData.transferMethod === 'EMAIL_TRANSFER') {
          // 2. email transfer
          transferTypeIcon = <EmailIcon style={{ color: '#A8A8A8' }} />
          title =
            transferData.transferType === 'SENDER'
              ? transferData.receiverName
              : transferData.senderName
          transferIn = transferData.transferType === 'RECEIVER'
          receiptLink = transferIn
            ? `${path.receipt}?receivingId=${transferData.receivingId}`
            : `${path.receipt}?transferId=${transferData.transferId}`
        }

        transferAmount = transferData.transferAmount
        transferFiatAmount = transferData.transferFiatAmountSpot
        receiptIcon = <ReceiptIcon color='primary' />
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
                <Box display='flex' flexDirection='row' alignItems='center'>
                  <Typography variant='body2'> {title} </Typography>
                  <Box ml={1}>
                    {pending && (
                      <Chip
                        size='small'
                        label='pending'
                        style={{ backgroundColor: '#E9E9E9', color: '#777777' }}
                      />
                    )}
                  </Box>
                </Box>
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
    let allTxs = []

    if (txHistory) {
      // combine pending and confirmed txs
      const pendingTxs = txHistory.pendingTxs.map(tx => {
        tx.pending = true
        return tx
      })

      const confirmedTxs = txHistory.confirmedTxs
      allTxs = [...pendingTxs, ...confirmedTxs]
    }

    return (
      <InfiniteScroll
        loader={
          actionsPending.getTxHistoryByAccount && (
            <Grid container direction='row' justify='center' key={0} alignItems='center'>
              <CircularProgress color='primary' style={{ marginTop: '30px' }} />
            </Grid>
          )
        }
        threshold={10}
        pageStart={0}
        useWindow={false}
        initialLoad={false}
        loadMore={() => null}
        hasMore={false}
      >
        {!actionsPending.getTxHistoryByAccount && allTxs.length === 0 && (
          <>
            <Divider />
            <Box display='flex' flexDirection='column' alignItems='center' mt={6} mb={6}>
              <Box mb={2}>
                <img src={EmptyStateImage} alt='Empty State' />
              </Box>
              <Typography variant='subtitle2' color='textSecondary'>
                It seems you don't have any transactions yet
              </Typography>
            </Box>
          </>
        )}
        {txHistory
          ? allTxs &&
            allTxs.map((tx, i) => (
              <React.Fragment key={i}>
                <Divider />
                {renderRecentTransferItem(account, tx, i)}
              </React.Fragment>
            ))
          : [null, null, null].map((tx, i) => (
              <React.Fragment key={i}>
                <Divider />
                {renderRecentTransferItem(account, tx, i)}
              </React.Fragment>
            ))}
      </InfiniteScroll>
    )
  }

  const renderAccountDrawer = () => {
    if (drawerState.open) {
      var account = sortedCloudWalletAccounts[drawerState.accountIdx]
      var balanceStandardTokenUnit = utils
        .toHumanReadableUnit(account.balance, getCryptoDecimals(account.cryptoType))
        .toString()
    }
    return (
      <>
        <Drawer
          anchor='right'
          open={drawerState.open}
          onClose={() => setDrawerState({ open: false, idx: -1 })}
          classes={{ paper: classes.drawerPapper }}
        >
          {account && (
            <Box padding={2}>
              <Grid container direction='column' justify='center' spacing={2}>
                {/* title */}
                <Grid item>
                  <Box display='flex' justifyContent='space-between' alignItems='flex-start'>
                    <Typography variant='h3'>
                      Wallet - {getCryptoTitle(account.cryptoType)}
                    </Typography>
                    <IconButton
                      onClick={() => setDrawerState({ open: false, idx: -1 })}
                      aria-label='close crypto tx history'
                      style={{ padding: 0 }}
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
                          />
                        </Box>
                        <Typography variant='body2'>
                          {getCryptoTitle(account.cryptoType)}
                        </Typography>
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
                          {numeral(balanceStandardTokenUnit).format('0.000[000]a')}
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
                      onClick={() => {
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
                      }}
                      disabled={account.cryptoType === 'tether'}
                      data-test-id='send_from_btn'
                    >
                      <SendIcon className={classes.buttonIcon} />
                      Send
                    </Button>
                  </Box>
                </Grid>
                {/* transfer history by accountId */}
                <Grid item>{renderTxHistory(account)}</Grid>
              </Grid>
            </Box>
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
      var balanceStandardTokenUnit = utils
        .toHumanReadableUnit(balance, getCryptoDecimals(cryptoType))
        .toString()
    }

    return (
      <React.Fragment key={idx}>
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
          data-test-id={
            !account ? 'crypto_list_item_skeleton' : `crypto_list_item_${account.cryptoType}`
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
                    />
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
                      {numeral(balanceStandardTokenUnit).format('0.000[000]a')}
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
      </React.Fragment>
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
        {!sortedCloudWalletAccounts || actionsPending.getCryptoAccounts
          ? [null, null, null].map((account, idx) => renderCryptoListItem(account, idx))
          : sortedCloudWalletAccounts.map((account, idx) => renderCryptoListItem(account, idx))}
      </Grid>
    )
  }

  const renderUpperSection = () => {
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
                <Typography variant='h2'>My Wallet</Typography>
                <Typography className={classes.decText}>
                  Transfer your balance between your Chainsfr wallet and connected wallets.
                </Typography>
                <Box display='flex' mt={2}>
                  <Button
                    variant='contained'
                    color='primary'
                    onClick={() => push(path.directTransfer)}
                  >
                    Balance Transfer
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    )
  }

  return (
    <Box display='flex' flexDirection='column'>
      {renderUpperSection()}
      <Container className={classes.container}>{renderCryptoList()}</Container>
      {renderAccountDrawer()}
    </Box>
  )
}

const useStyles = makeStyles(theme => {
  return {
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
    },
    drawerPapper: {
      maxWidth: '480px',
      width: '100%'
    }
  }
})

export default WalletComponent
