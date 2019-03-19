// @flow
import React, { Component } from 'react'

import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import SquareButton from './SquareButtonComponent'
import Button from '@material-ui/core/Button'
import ErrorIcon from '@material-ui/icons/Error'
import CheckIcon from '@material-ui/icons/CheckCircle'
import RefreshIcon from '@material-ui/icons/Refresh'
import IconButton from '@material-ui/core/IconButton'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Radio from '@material-ui/core/Radio'
import Divider from '@material-ui/core/Divider'
import CircularProgress from '@material-ui/core/CircularProgress'
import utils from '../utils'
import numeral from 'numeral'
import { walletCryptoSupports, walletSelections } from '../wallet'
import { cryptoSelections, getCryptoSymbol, getCryptoDecimals } from '../tokens'
import path from '../Paths.js'
import { Link } from 'react-router-dom'

const WalletConnectionErrorMessage = {
  'metamask': 'Please make sure MetaMask is installed and authorization is accepted',
  ledger: 'Please make sure your Ledger device is connected, and you are in correct crypto app'
}

type Props = {
  onWalletSelected: Function,
  onCryptoSelected: Function,
  onUpdate: Function,
  goToStep: Function,
  classes: Object,
  syncProgress: {
    index: number,
    change: number
  },
  walletType: string,
  cryptoType: string,
  wallet: Object,
  actionsPending: Object,
  error: any
}

class WalletSelectionComponent extends Component<Props> {
  cryptoInWallet = (crypto: Object, walletType: string): boolean => {
    for (let item of walletCryptoSupports[walletType]) {
      if (item.cryptoType === crypto.cryptoType) return true
    }
    return false
  }

  cryptoDisabled = (crypto: Object, walletType: string): boolean => {
    for (let item of walletCryptoSupports[walletType]) {
      if (item.cryptoType === crypto.cryptoType && item.disabled) return true
    }
    return false
  }

  renderWalletSelection = () => {
    const { walletType, onWalletSelected } = this.props
    return (
      <Grid container direction='row' justify='center' alignItems='center'>
        {walletSelections.map(w =>
          (<Grid item key={w.walletType}>
            <SquareButton
              disabled={w.disabled}
              onClick={() => onWalletSelected(w.walletType)}
              logo={w.logo}
              title={w.title}
              desc={w.desc}
              selected={w.walletType === walletType}
            />
          </Grid>))}
      </Grid>
    )
  }

  renderBalance = () => {
    const { classes, walletType, wallet, actionsPending, cryptoType, syncProgress, onUpdate } = this.props
    if (actionsPending.checkWalletConnection) {
      return (
        <Grid container direction='column' justify='center' alignItems='center'>
          <Grid item>
            <CircularProgress className={classes.circularProgress} />
          </Grid>
        </Grid>
      )
    } else if (!wallet.connected) {
      return (
        <Grid container direction='row' alignItems='center'>
          <Grid item>
            <ErrorIcon className={classes.notConnectIcon} />
          </Grid>
          <Grid item>
            <Typography className={classes.notConnectText}>{WalletConnectionErrorMessage[walletType]}</Typography>
          </Grid>
        </Grid>
      )
    } else if (actionsPending.syncAccountInfo) {
      return (
        <Grid container direction='column' justify='center' alignItems='center'>
          <Grid item>
            <CircularProgress className={classes.circularProgress} />
          </Grid>
          <Grid item>
            <Typography className={classes.connectedtext}>
            Synchronizing {syncProgress.change !== 0 ? 'internal' : 'external'} addresss: {syncProgress.index}
            </Typography>
          </Grid>
        </Grid>
      )
    } else if (actionsPending.updateBtcAccountInfo) {
      return (
        <Grid container direction='column' justify='center' alignItems='center'>
          <Grid item>
            <CircularProgress className={classes.circularProgress} />
          </Grid>
          <Grid item>
            <Typography className={classes.connectedtext}>
            Update Acoount Info: {
                syncProgress.index === 0
                  ? 'checking used addresses'
                  : `discovering new ${syncProgress.change !== 0 ? 'internal' : 'external'} address: ${syncProgress.index}`
              }
            </Typography>
          </Grid>
        </Grid>
      )
    } else if (wallet && wallet.crypto[cryptoType] && wallet.crypto[cryptoType][0] && !actionsPending.syncAccountInfo) {
      return (
        <Grid container direction='row' alignItems='center'>
          <Grid item>
            <CheckIcon className={classes.connectedIcon} />
          </Grid>
          <Grid item>
            <Typography className={classes.connectedtext}>Account retrieved, your balance: {
              numeral(utils.toHumanReadableUnit(wallet.crypto[cryptoType][0].balance, getCryptoDecimals(cryptoType))).format('0.000a')} {getCryptoSymbol(cryptoType)}
            </Typography>
          </Grid>
          {walletType === 'ledger' &&
          <Grid item>
            <IconButton onClick={() => { onUpdate(cryptoType) }}>
              <RefreshIcon />
            </IconButton>
          </Grid>
          }
        </Grid>
      )
    }
  }

  renderCryptoSelection = () => {
    const { classes, walletType, cryptoType, onCryptoSelected, actionsPending } = this.props

    return (
      <List className={classes.cryptoList}>
        {cryptoSelections.filter(c => this.cryptoInWallet(c, walletType)).map(c =>
          (<div key={c.cryptoType}>
            <Divider />
            <ListItem
              button
              onClick={() => onCryptoSelected(c.cryptoType)}
              disabled={
                this.cryptoDisabled(c, walletType) ||
                actionsPending.syncAccountInfo ||
                actionsPending.checkWalletConnection ||
                actionsPending.updateBtcAccountInfo
              }
              className={classes.cryptoListItem}
            >
              <Radio
                color='primary'
                checked={c.cryptoType === cryptoType}
                tabIndex={-1}
                disableRipple
              />
              <ListItemText primary={c.symbol} secondary={this.cryptoDisabled(c, walletType) ? 'coming soon' : c.title} />
            </ListItem>
          </div>))}
        <Divider />
      </List>
    )
  }

  render () {
    const { classes, walletType, cryptoType, actionsPending, wallet } = this.props
    return (
      <Grid container direction='column' justify='center' alignItems='stretch' spacing={24}>
        <Grid item>
          <Grid container direction='row' justify='space-between'>
            <Grid item>
              <Typography variant='h6' align='left'>
                Choose your wallet
              </Typography>
            </Grid>
            <Grid item>
              <Button color='primary'>
                <ErrorIcon fontSize='small' color='primary' className={classes.faqIcon} />
                FAQ
              </Button>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          {this.renderWalletSelection()}
        </Grid>
        {walletType &&
        <Grid item>
          <Typography variant='h6' align='left'>
             Choose the coin
          </Typography>
        </Grid>
        }
        {walletType &&
        <Grid item>
          {this.renderCryptoSelection()}
        </Grid>}
        {cryptoType &&
          <Grid item>
            {this.renderBalance()}
          </Grid>}
        <Grid item>
          <Grid container direction='row' justify='center' spacing={24}>
            <Grid item>
              <Button
                color='primary'
                component={Link}
                to={path.home}
              >
              Cancel Transfer
              </Button>
            </Grid>
            <Grid item>
              <Button
                fullWidth
                variant='contained'
                color='primary'
                size='large'
                onClick={() => this.props.goToStep(1)}
                disabled={
                  !walletType ||
                  !cryptoType ||
                  !wallet.connected ||
                  actionsPending.checkWalletConnection ||
                  !wallet.crypto[cryptoType] ||
                  actionsPending.syncAccountInfo ||
                  actionsPending.updateBtcAccountInfo
                }
              >
              Continue
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    )
  }
}

const styles = theme => ({
  faqIcon: {
    marginRight: theme.spacing.unit
  },
  cryptoList: {
    width: '100%',
    backgroundColor: theme.palette.background.paper
  },
  notConnectIcon: {
    color: '#B00020',
    marginRight: '8px'
  },
  connectedIcon: {
    color: '#2E7D32',
    marginRight: '8px'
  },
  notConnectText: {
    color: '#333333',
    fontSize: '14px',
    fontWeight: 600

  },
  connectedtext: {
    color: '#333333',
    fontSize: '16px',
    fontWeight: 600
  }
})

export default withStyles(styles)(WalletSelectionComponent)
