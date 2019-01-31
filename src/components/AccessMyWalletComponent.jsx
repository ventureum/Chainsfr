import React, { Component } from 'react'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import MetamaskLogo from '../images/metamask-button.svg'
import HardwareWalletLogo from '../images/hardware-wallet-button.svg'
import EthereumLogo from '../images/eth.svg'
import BitcoinLogo from '../images/btc.svg'
import DaiLogo from '../images/dai.svg'
import SquareButton from './SquareButtonComponent'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles'
import { Link } from 'react-router-dom'

const ether = {
  cryptoType: 'ethereum',
  title: 'Ethereum',
  abbreviation: 'ETH'
}
const bitcoin = {
  cryptoType: 'bitcoin',
  title: 'Bitcoin',
  abbreviation: 'BTC'
}
const dai = {
  cryptoType: 'dai',
  title: 'DAI',
  abbreviation: 'DAI'
}
const walletTypes = [
  {
    walletType: 'chainsfer',
    title: 'C-Wallet',
    desc: 'Use Chainsfer Wallet',
    disabled: true
  },
  {
    walletType: 'metamask',
    title: 'Metamask',
    desc: 'MetaMask Extension',
    disabled: false

  },
  {
    walletType: 'ledger',
    title: 'Ledger',
    desc: 'Ledger Hardware Wallet',
    disabled: false
  }
]
const logos = {
  ethereum: EthereumLogo,
  bitcoin: BitcoinLogo,
  dai: DaiLogo,
  ledger: HardwareWalletLogo,
  chainsfer: MetamaskLogo,
  metamask: MetamaskLogo
}

const walletCryptoSupports = {
  'chainsfer': [ether, bitcoin, dai],
  'metamask': [ether],
  'ledger': [ether, bitcoin, dai]
}

class AccessMyWallet extends Component {
  renderWalletSelection = (walletSelection) => {
    return (
      <Grid container direction='row' justify='center' alignItems='center'>
        {walletTypes.map((w, i) =>
          (<Grid item key={i}>
            <SquareButton
              disabled={w.disabled}
              onClick={() => this.props.selectWallet(w.walletType)}
              logo={logos[w.walletType]}
              title={w.title}
              desc={w.desc}
              selected={w.walletType === walletSelection}
            />
          </Grid>))}
      </Grid>
    )
  }

  renderCryptoSelection = (walletSelection, cryptoSelection) => {
    return (
      <Grid container direction='row' justify='center' alignItems='center'>
        {walletCryptoSupports[walletSelection].map((c, i) =>
          (<Grid item key={i}>
            <SquareButton
              onClick={() => this.props.selectCrypto(c.cryptoType)}
              logo={logos[c.cryptoType]}
              title={c.title}
              selected={c.cryptoType === cryptoSelection}
            />
          </Grid>))}
      </Grid>
    )
  }

  render () {
    const { walletSelection, cryptoSelection, classes } = this.props
    return (
      <Grid container direction='column' alignItems='center' >
        <Grid item className={classes.root}>
          <Grid container direction='column' justify='center' alignItems='stretch' spacing={24}>
            <Grid item>
              <Typography variant='h6' align='left'>
                Choose your wallet
              </Typography>
            </Grid>
            <Grid item>
              {this.renderWalletSelection(walletSelection)}
            </Grid>
            {walletSelection !== null && <div>
              <Grid item>
                <Typography variant='h6' align='left'>
                  Choose cryptocurrency
                </Typography>
              </Grid>
              <Grid item>
                {this.renderCryptoSelection(walletSelection, cryptoSelection)}
              </Grid>
            </div>}
            <Grid item>
              <Button
                fullWidth
                variant='contained'
                color='primary'
                size='large'
                component={Link}
                to='/SetReipientAndPin'
                disabled={!walletSelection || !cryptoSelection}
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
  root: {
    width: '100%',
    maxWidth: '1080px'
  }
})
export default withStyles(styles)(AccessMyWallet)
