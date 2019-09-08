// @flow
import React, { Component } from 'react'

import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
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
import { cryptoDisabled, cryptoInWallet, getWalletTitle } from '../wallet'
import { cryptoSelections, getCryptoSymbol, getCryptoDecimals } from '../tokens'
import path from '../Paths.js'
import { Link } from 'react-router-dom'
import BN from 'bn.js'
import LinearProgress from '@material-ui/core/LinearProgress'
import url from '../url'
import IconButton from '@material-ui/core/IconButton'
import OpenInNewIcon from '@material-ui/icons/OpenInNew'
import WalletSelectionButtons, { WalletButton } from './WalletSelectionButtons'
import Paper from '@material-ui/core/Paper'
import WalletConnectPaperContainer from '../containers/WalletConnectPaperContainer'

const WalletConnectionErrorMessage = {
  metamask: 'Please make sure MetaMask is installed and authorization is accepted',
  ledger: 'Please make sure your Ledger device is connected.'
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
  actionsPending: Object,
  currencyAmount: Object
}

class WalletSelectionComponent extends Component<Props> {
  lock = () => {
    const { actionsPending } = this.props
    const {
      checkWalletConnection,
      checkLedgerDeviceConnection,
      checkLedgerAppConnection,
      sync
    } = actionsPending
    return checkWalletConnection || checkLedgerDeviceConnection || checkLedgerAppConnection || sync
  }

  renderBalance = () => {
    const { classes, walletType, wallet, actionsPending, cryptoType } = this.props
    if (actionsPending.checkLedgerDeviceConnection) {
      return (
        <Grid container direction='column' justify='center'>
          <Grid item>
            <Typography variant='body2'>Please connect and unlock your Ledger device...</Typography>
          </Grid>
          <Grid item>
            <LinearProgress className={classes.linearProgress} />
          </Grid>
        </Grid>
      )
    } else if (actionsPending.checkLedgerAppConnection) {
      return (
        <Grid container direction='column' justify='center'>
          <Grid item>
            <Typography variant='body2'>
              Please navigate to selected crypto on your Ledger device...
            </Typography>
          </Grid>
          <Grid item>
            <LinearProgress className={classes.linearProgress} />
          </Grid>
        </Grid>
      )
    } else if (actionsPending.checkWalletConnection) {
      return (
        <Grid container direction='column' justify='center'>
          <Grid item>
            <Typography variant='body2'>Loading selected wallet data...</Typography>
          </Grid>
          <Grid item>
            <LinearProgress className={classes.linearProgress} />
          </Grid>
        </Grid>
      )
    } else if (!wallet.connected) {
      return (
        <Grid container direction='row' alignItems='center' justify='space-between'>
          <Grid item>
            <Typography id='walletNotConnectedText' variant='body2'>
              {WalletConnectionErrorMessage[walletType]}
            </Typography>
          </Grid>
          <Grid item>
            <ErrorIcon className={classes.notConnectIcon} />
          </Grid>
        </Grid>
      )
    } else if (actionsPending.sync) {
      return (
        <Grid container direction='column' justify='center'>
          <Grid item>
            <Typography variant='body2' id='synchronizeAccInfo'>
              Synchronizing Account Info
            </Typography>
            <Grid item>
              <LinearProgress className={classes.linearProgress} />
            </Grid>
          </Grid>
        </Grid>
      )
    } else if (
      wallet &&
      wallet.crypto[cryptoType] &&
      wallet.crypto[cryptoType][0] &&
      !this.lock()
    ) {
      return (
        <Grid container direction='row' alignItems='center' justify='space-between'>
          <Grid item>
            <Grid container direction='column'>
              <Grid item>
                <Typography variant='body2'>
                  {getWalletTitle(walletType)} wallet connected
                </Typography>
              </Grid>
              {(cryptoType !== 'bitcoin' || walletType !== 'ledger') && (
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
                      target='_blank'
                      href={url.getExplorerAddress(
                        cryptoType,
                        wallet.crypto[cryptoType][0].address
                      )}
                    >
                      <OpenInNewIcon className={classes.explorerIcon} />
                    </IconButton>
                  </Grid>
                </Grid>
              )}
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
    const {
      classes,
      walletType,
      cryptoType,
      onCryptoSelected,
      actionsPending,
      wallet,
      currencyAmount
    } = this.props
    if (walletType.endsWith('WalletConnect') && !wallet.connected) {
      // must be connected before chosing a coin type
      return (<> </>)
    }

    return (
      <List className={classes.cryptoList}>
        {cryptoSelections
          .filter(c => cryptoInWallet(c.cryptoType, walletType))
          .map(c => (
            <div key={c.cryptoType}>
              <Divider />
              <ListItem
                button
                onClick={() => onCryptoSelected(c.cryptoType)}
                disabled={cryptoDisabled(c.cryptoType, walletType) || this.lock()}
                id={c.cryptoType}
                className={classes.cryptoListItem}
              >
                <Grid container direction='row' justify='space-between' alignItems='center'>
                  <Radio
                    color='primary'
                    checked={c.cryptoType === cryptoType}
                    tabIndex={-1}
                    disableRipple
                    id={c.cryptoType}
                  />
                  <ListItemText
                    primary={c.symbol}
                    secondary={cryptoDisabled(c.cryptoType, walletType) ? 'Chrome Only' : c.title}
                  />
                  {wallet &&
                    c.cryptoType === cryptoType &&
                    wallet.connected &&
                    wallet.crypto[c.cryptoType] &&
                    wallet.crypto[c.cryptoType][0] &&
                    !actionsPending.syncAccountInfo && (
                      <Grid item>
                        <Typography className={classes.balanceText} id={`${c.cryptoType}Balance`}>
                          {numeral(
                            utils.toHumanReadableUnit(
                              wallet.crypto[c.cryptoType][0].balance,
                              getCryptoDecimals(c.cryptoType)
                            )
                          ).format('0.000a')}{' '}
                          {getCryptoSymbol(cryptoType)}
                        </Typography>
                        <Typography
                          className={classes.balanceCurrencyText}
                          id={`${c.cryptoType}CurrencyBalance`}
                        >
                          (≈ {currencyAmount[c.cryptoType]})
                        </Typography>
                      </Grid>
                    )}
                </Grid>
              </ListItem>
            </div>
          ))}
        <Divider />
      </List>
    )
  }

  renderWalletSection = () => {
    const { walletType, cryptoType, onWalletSelected, classes } = this.props
    return (
      <Container className={classes.topSectionContainer}>
        <Typography variant='h3' style={{ marginBottom: '10px' }}>
          Transfer from
        </Typography>
        {walletType ? (
          <Grid container spacing={3} justify='center'>
            <Grid item className={classes.walletBtnContainer}>
              <Grid container direction='column'>
                <WalletButton walletType={walletType} />
                <Button
                  color='primary'
                  style={{ alignSelf: 'center' }}
                  onClick={() => onWalletSelected('')}
                  disabled={this.lock()}
                >
                  Change
                </Button>
              </Grid>
            </Grid>
            <Grid item xs>
              <Grid container direction='column' alignItems='flex-start' spacing={2}>
                {walletType.endsWith('WalletConnect') && (
                  <Grid item>
                    <WalletConnectPaperContainer />
                  </Grid>
                )}
                <Grid item>
                  <Paper className={classes.paper}>
                    <Typography variant='body2'>Please choose a coin type to continue</Typography>
                  </Paper>
                </Grid>
                {cryptoType && (
                  <Grid item style={{ width: '90%' }}>
                    <Paper className={classes.balanceSection}>{this.renderBalance()}</Paper>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Grid>
        ) : (
          <WalletSelectionButtons handleClick={onWalletSelected} walletSelection={walletType} />
        )}
      </Container>
    )
  }

  render () {
    const { walletType, cryptoType, wallet, handleNext } = this.props

    return (
      <div style={{ padding: '10px' }}>
        <Grid container direction='column' justify='center' alignItems='stretch' spacing={3}>
          <Grid item>{this.renderWalletSection()}</Grid>
          {walletType && (
            <Grid item>
              <Typography variant='h3' align='left'>
                Choose a coin
              </Typography>
            </Grid>
          )}
          {walletType && <Grid item>{this.renderCryptoSelection()}</Grid>}
          <Grid item>
            <Grid container direction='row' justify='center' spacing={3}>
              <Grid item>
                <Button color='primary' component={Link} to={path.home}>
                  Cancel Transfer
                </Button>
              </Grid>
              <Grid item>
                <Button
                  id='continue'
                  fullWidth
                  variant='contained'
                  color='primary'
                  size='large'
                  onClick={handleNext}
                  disabled={
                    !walletType ||
                    !cryptoType ||
                    !wallet.connected ||
                    !wallet.crypto[cryptoType] ||
                    this.lock() ||
                    new BN(wallet.crypto[cryptoType][0].balance).lte(new BN(0))
                  }
                >
                  Continue
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
    )
  }
}

const styles = theme => ({
  cryptoList: {
    width: '100%',
    backgroundColor: theme.palette.background
  },
  notConnectIcon: {
    color: '#B00020',
    marginRight: '8px'
  },
  connectedIcon: {
    color: '#2E7D32',
    marginRight: '8px'
  },
  balanceSection: {
    padding: '20px',
    width: '100%'
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
  balanceCurrencyText: {
    fontSize: '14px',
    color: '#777777'
  },
  explorerIcon: {
    fontSize: '16px'
  },
  explorerButton: {
    padding: '0px 0px 0px 0px',
    marginLeft: '10px'
  },
  topSectionContainer: {
    backgroundColor: '#FAFBFE',
    paddingBottom: '20px',
    paddingTop: '20px',
    borderRadius: '10px'
  },
  paper: {
    padding: '10px',
    marginTop: '10px'
  },
  walletBtnContainer: {
    width: '220px'
  }
})

export default withStyles(styles)(WalletSelectionComponent)
