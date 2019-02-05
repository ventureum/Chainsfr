import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { withStyles } from '@material-ui/core/styles'
import MetamaskLogo from '../images/metamask-button.svg'
import HardwareWalletLogo from '../images/hardware-wallet-button.svg'
import EthereumLogo from '../images/eth.svg'
import BitcoinLogo from '../images/btc.svg'
import DaiLogo from '../images/dai.svg'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import SquareButton from './SquareButtonComponent'
import Button from '@material-ui/core/Button'
import ErrorIcon from '@material-ui/icons/Error'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemText from '@material-ui/core/ListItemText'
import Radio from '@material-ui/core/Radio'
import Divider from '@material-ui/core/Divider'
import CircularProgress from '@material-ui/core/CircularProgress'
import { Link } from 'react-router-dom'
import paths from '../Paths'
import utils from '../utils'
import numeral from 'numeral'

const walletCryptoSupports = {
  'basic': ['ethereum', 'bitcoin', 'dai'],
  'metamask': ['ethereum'],
  'ledger': ['ethereum', 'bitcoin', 'dai']
}

const walletSelections = [
  {
    walletType: 'basic',
    title: 'Basic',
    desc: 'Use Basic Wallet',
    logo: MetamaskLogo,
    disabled: true
  },
  {
    walletType: 'metamask',
    title: 'Metamask',
    desc: 'MetaMask Extension',
    logo: MetamaskLogo,
    disabled: false,
    supportedCrypto: ['ethereum']
  },
  {
    walletType: 'ledger',
    title: 'Ledger',
    desc: 'Ledger Hardware Wallet',
    logo: HardwareWalletLogo,
    disabled: true,
    supportedCrypto: ['ethereum', 'bitcoin', 'dai']
  }
]

const cryptoSelections = [
  {
    cryptoType: 'ethereum',
    title: 'Ethereum',
    symbol: 'ETH',
    logo: EthereumLogo,
    disabled: false
  },
  {
    cryptoType: 'bitcoin',
    title: 'Bitcoin',
    symbol: 'BTC',
    logo: BitcoinLogo,
    disabled: true
  },
  {
    cryptoType: 'dai',
    title: 'Dai',
    symbol: 'DAI',
    logo: DaiLogo,
    disabled: true
  }
]

class WalletSelectionComponent extends Component {
  static propTypes = {
    walletType: PropTypes.string,
    cryptoType: PropTypes.string,
    onCryptoSelected: PropTypes.func,
    onWalletSelected: PropTypes.func,
    handleNext: PropTypes.func
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

  renderCryptoSelection = () => {
    const { classes, walletType, cryptoType, onCryptoSelected, metamask, actionsPending } = this.props

    if (actionsPending.checkMetamaskConnection) {
      return (
        <Grid container direction='column' justify='center' alignItems='center'>
          <Grid item>
            <CircularProgress className={classes.circularProgress} />
          </Grid>
        </Grid>
      )
    }

    return (
      <List className={classes.cryptoList}>
        {cryptoSelections.filter(c => walletCryptoSupports[walletType].includes(c.cryptoType)).map(c =>
          (<div key={c.cryptoType}>
            <Divider />
            <ListItem
              button
              onClick={() => onCryptoSelected(c.cryptoType)}
              className={classes.cryptoListItem}
            >
              <Radio
                color='primary'
                checked={c.cryptoType === cryptoType}
                tabIndex={-1}
                disableRipple
              />
              <ListItemText primary={c.symbol} secondary={c.title} />
              <ListItemSecondaryAction>
                { walletType === 'metamask' &&
                  c.cryptoType === 'ethereum' &&
                  metamask &&
                  numeral(utils.toHumanReadableUnit(metamask.balance)).format('0.000a') }
              </ListItemSecondaryAction>
            </ListItem>
          </div>))}
        <Divider />
      </List>
    )
  }

  render () {
    const { classes, walletType, cryptoType } = this.props
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
        <Grid item>
          <Grid container direction='row' justify='center' spacing={24}>
            <Grid item>
              <Button color='primary'>
                Cancel Transfer
              </Button>
            </Grid>
            <Grid item>
              <Button
                fullWidth
                variant='contained'
                color='primary'
                size='large'
                component={Link}
                to={paths.transfer + paths.recipientStep}
                disabled={!walletType || !cryptoType}
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
  }
})

export default withStyles(styles)(WalletSelectionComponent)
