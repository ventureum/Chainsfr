// @flow
import React, { Component } from 'react'

import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import SquareButton from './SquareButtonComponent'
import Button from '@material-ui/core/Button'
import ErrorIcon from '@material-ui/icons/Error'
import CheckIcon from '@material-ui/icons/CheckCircle'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Radio from '@material-ui/core/Radio'
import Divider from '@material-ui/core/Divider'
import utils from '../utils'
import numeral from 'numeral'
import { walletSelections, cryptoDisabled, cryptoInWallet, getWalletTitle } from '../wallet'
import { cryptoSelections, getCryptoSymbol, getCryptoDecimals } from '../tokens'
import path from '../Paths.js'
import { Link } from 'react-router-dom'
import BN from 'bn.js'
import LinearProgress from '@material-ui/core/LinearProgress'
import url from '../url'
import IconButton from '@material-ui/core/IconButton'
import OpenInNewIcon from '@material-ui/icons/OpenInNew'
import env from '../typedEnv'

const WalletConnectionErrorMessage = {
  'metamask': 'Please make sure MetaMask is installed and authorization is accepted',
  ledger: 'Please make sure your Ledger device is connected, and you are in correct crypto app'
}

type Props = {
  onWalletSelected: Function,
  onCryptoSelected: Function,
  classes: Object,
  syncProgress: {
    index: number,
    change: number
  },
  walletType: string,
  cryptoType: string,
  wallet: Object,
  handleNext: Function,
  actionsPending: Object
}

class WalletSelectionComponent extends Component<Props> {
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
    const { classes, walletType, wallet, actionsPending, cryptoType } = this.props
    var explorerLink = null
    if (cryptoType === 'ethereum' && wallet.crypto[cryptoType]) {
      explorerLink = url.getEthExplorerAddress(wallet.crypto[cryptoType][0].address)
    } else if (cryptoType === 'dai' && wallet.crypto[cryptoType]) {
      explorerLink = url.getEthExplorerToken(env.REACT_APP_DAI_ADDRESS, wallet.crypto[cryptoType][0].address)
    }
    if (actionsPending.checkCloudWalletConnection) {
      // special case, only show progress indicator while loading the cloud wallet
      return (
        <Grid container direction='column' justify='center' className={classes.balanceSection}>
          <Grid item>
            <Typography className={classes.connectedtext}>
              Loading Drive Wallet...
            </Typography>
          </Grid>
          <Grid item>
            <LinearProgress className={classes.linearProgress} />
          </Grid>
        </Grid>
      )
    } else if (actionsPending.checkWalletConnection) {
      return (
        <Grid container direction='column' justify='center' className={classes.balanceSection}>
          <Grid item>
            <Typography className={classes.connectedtext}>
              Please connect and unlock your wallet with the selected coin.
            </Typography>
          </Grid>
          <Grid item>
            <LinearProgress className={classes.linearProgress} />
          </Grid>
        </Grid>
      )
    } else if (!wallet.connected) {
      return (
        <Grid container direction='row' alignItems='center' className={classes.balanceSection} justify='space-between'>
          <Grid item>
            <Typography className={classes.notConnectText}>{WalletConnectionErrorMessage[walletType]}</Typography>
          </Grid>
          <Grid item>
            <ErrorIcon className={classes.notConnectIcon} />
          </Grid>
        </Grid>
      )
    } else if (actionsPending.syncAccountInfo) {
      return (
        <Grid container direction='column' justify='center' className={classes.balanceSection}>
          <Grid item>
            <Typography className={classes.connectedtext}>
            Synchronizing Account Info
            </Typography>
            <Grid item>
              <LinearProgress className={classes.linearProgress} />
            </Grid>
          </Grid>
        </Grid>
      )
    } else if (actionsPending.updateBtcAccountInfo) {
      return (
        <Grid container direction='column' justify='center' className={classes.balanceSection}>
          <Grid item>
            <Typography className={classes.connectedtext}>
            Updating Acoount Info
            </Typography>
          </Grid>
          <Grid item>
            <LinearProgress className={classes.linearProgress} />
          </Grid>
        </Grid>
      )
    } else if (wallet && wallet.crypto[cryptoType] && wallet.crypto[cryptoType][0] && !actionsPending.syncAccountInfo) {
      return (
        <Grid container direction='row' alignItems='center' className={classes.balanceSection} justify='space-between'>
          <Grid item>
            <Grid container direction='column'>
              <Grid item>
                <Typography className={classes.connectedtext}>
                  {getWalletTitle(walletType)} wallet connected
                </Typography>
              </Grid>
              { (cryptoType !== 'bitcoin' || walletType !== 'ledger') &&
                <Grid item>
                  <Grid container direction='row' alignItems='center'>
                    <Grid item>
                      <Typography className={classes.addressInfoText}>
                      Wallet address: {wallet.crypto[cryptoType][0].address}
                      </Typography>
                    </Grid>
                    <IconButton
                      className={classes.explorerButton}
                      aria-label='Explorer'
                      target='_blank' href={explorerLink}
                    >
                      <OpenInNewIcon className={classes.explorerIcon} />
                    </IconButton>
                  </Grid>
                </Grid>
              }
            </Grid>
          </Grid>
          <Grid item>
            <CheckIcon className={classes.connectedIcon} />
          </Grid>
        </Grid>
      )
    }
  }

  renderCryptoSelection = () => {
    const { classes, walletType, cryptoType, onCryptoSelected, actionsPending, wallet } = this.props

    return (
      <List className={classes.cryptoList}>
        {cryptoSelections.filter(c => cryptoInWallet(c, walletType)).map(c =>
          (<div key={c.cryptoType}>
            <Divider />
            <ListItem
              button
              onClick={() => onCryptoSelected(c.cryptoType)}
              disabled={
                cryptoDisabled(c, walletType) ||
                actionsPending.syncAccountInfo ||
                actionsPending.checkWalletConnection ||
                actionsPending.updateBtcAccountInfo
              }
              className={classes.cryptoListItem}
            >
              <Grid container direction='row' justify='space-between' alignItems='center'>
                <Radio
                  color='primary'
                  checked={c.cryptoType === cryptoType}
                  tabIndex={-1}
                  disableRipple
                />
                <ListItemText primary={c.symbol} secondary={cryptoDisabled(c, walletType) ? 'coming soon' : c.title} />
                {
                  wallet &&
                  c.cryptoType === cryptoType &&
                  wallet.connected &&
                  wallet.crypto[c.cryptoType] &&
                  wallet.crypto[c.cryptoType][0] &&
                  !actionsPending.syncAccountInfo &&
                  <Grid item >
                    <Typography className={classes.balanceText}>
                      {numeral(utils.toHumanReadableUnit(wallet.crypto[c.cryptoType][0].balance, getCryptoDecimals(c.cryptoType))).format('0.000a')} {getCryptoSymbol(cryptoType)}
                    </Typography>
                  </Grid>
                }
              </Grid>
            </ListItem>
          </div>))}
        <Divider />
      </List>
    )
  }

  render () {
    const { walletType, cryptoType, actionsPending, wallet, handleNext } = this.props

    return (
      <Grid container direction='column' justify='center' alignItems='stretch' spacing={24}>
        <Grid item>
          <Grid container direction='row'>
            <Grid item>
              <Typography variant='h6' align='left'>
                Choose your wallet
              </Typography>
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
                onClick={handleNext}
                disabled={
                  !walletType ||
                  !cryptoType ||
                  !wallet.connected ||
                  actionsPending.checkWalletConnection ||
                  !wallet.crypto[cryptoType] ||
                  actionsPending.syncAccountInfo ||
                  actionsPending.updateBtcAccountInfo ||
                  (new BN(wallet.crypto[cryptoType][0].balance)).lte(new BN(0))
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
    fontSize: '14px',
    fontWeight: 600
  },
  balanceSection: {
    backgroundColor: 'rgba(66,133,244,0.05)',
    padding: '20px',
    margin: '30px 0px 30px 0px',
    borderRadius: '4px'
  },
  linearProgress: {
    marginTop: '20px'
  },
  addressInfoText: {
    color: '#666666',
    fontSize: '12px'
  },
  balanceText: {
    fontSize: '18px',
    color: '#333333'
  },
  explorerIcon: {
    fontSize: '16px'
  },
  explorerButton: {
    padding: '0px 0px 0px 0px',
    marginLeft: '10px'
  }
})

export default withStyles(styles)(WalletSelectionComponent)
