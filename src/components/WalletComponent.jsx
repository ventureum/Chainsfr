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
import { getCryptoSymbol, getCryptoTitle, getCryptoDecimals } from '../tokens'
import { walletCryptoSupports } from '../wallet'
import Paths from '../Paths'
import env from '../typedEnv'
import numeral from 'numeral'
import utils from '../utils'
import update from 'immutability-helper'

const WALLET_TYPE = 'drive'

class WalletComponent extends Component {
  constructor (props) {
    super(props)
    this.state = {
      addAddressModalOpen: false,
      moreMenu: {}
    }
  }

  handleMoreBtnOnOpen = cryptoType => event => {
    this.setState(update(this.state, { moreMenu: { [cryptoType]: _cryptoType => update(_cryptoType || {}, { anchorEl: { $set: event.currentTarget } }) } }))
  }

  handleMoreBtnOnClose = cryptoType => event => {
    this.setState(update(this.state, { moreMenu: { [cryptoType]: { anchorEl: { $set: null } } } }))
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
                    <MenuItem onClick={this.handleMoreBtnOnClose(walletByCryptoType.cryptoType)}>Direct Transfer</MenuItem>
                    <MenuItem onClick={this.handleMoreBtnOnClose(walletByCryptoType.cryptoType)}>View Address</MenuItem>
                    <MenuItem onClick={this.handleMoreBtnOnClose(walletByCryptoType.cryptoType)}>View Private Key</MenuItem>
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
  }
})

export default withStyles(styles)(WalletComponent)
