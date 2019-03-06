import React, { Component } from 'react'
import './App.css'

import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Avatar from '@material-ui/core/Avatar'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEthereum } from '@fortawesome/free-brands-svg-icons'
import Fab from '@material-ui/core/Fab'
import AddIcon from '@material-ui/icons/Add'
import CreateAddressContainer from '../containers/CreateAddressContainer'

/**
 * Print files.
 */

class WalletComponent extends Component {
  constructor (props) {
    super(props)
    this.state = {
      addAddressModalOpen: false
    }
  }

  addAddressOnClick = async () => {
    this.setState({ addAddressModalOpen: true })
  }

  addAdressOnClose = () => {
    this.setState({ addAddressModalOpen: false })
  }

  renderAddress (address) {
    return (
      <ListItem>
        <Avatar>
          <FontAwesomeIcon icon={faEthereum} />
        </Avatar>
        <ListItemText primary={address.alias} secondary={address.balance} />
        <ListItemSecondaryAction>
          {address.public ? 'Public' : 'Private'}
        </ListItemSecondaryAction>
      </ListItem>
    )
  }

  render () {
    const { classes } = this.props

    const addressList = [
      {
        alias: 'Primary',
        public: true,
        address: '0x43f2981d05d075a4c13e71defbb683751256d2d1',
        cryptoType: 'Ethereum',
        balance: 13.23
      },
      {
        alias: 'Secondary',
        public: false,
        address: '0x43f2981d05d075a4c13e71defbb683751256d2d1',
        cryptoType: 'Ethereum',
        balance: 15.23
      },
      {
        alias: 'Another',
        public: false,
        address: '0x43f2981d05d075a4c13e71defbb683751256d2d1',
        cryptoType: 'Ethereum',
        balance: 100.20
      }
    ]

    return (
      <div className={classes.root}>
        <Grid container direction='column' alignItems='center'>
          <Grid container direction='column' className={classes.projectListContainer} alignItems='center'>
            <Typography variant='h4' className={classes.projectsHeader}>Wallet</Typography>
            <Grid container direction='row' alignItems='center'>
              <Paper className={classes.addrList}>
                <List>
                  {addressList.map(addr => this.renderAddress(addr))}
                </List>
                <Grid container direction='row' justify='flex-end'>
                  <Grid item>
                    <Fab color='primary' aria-label='Add' className={classes.fab} onClick={this.addAddressOnClick}>
                      <AddIcon />
                    </Fab>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
        <CreateAddressContainer open={this.state.addAddressModalOpen} onClose={this.addAdressOnClose} />
      </div>
    )
  }
}

const styles = theme => ({
  root: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  addrList: {
    width: '100%'
  },
  projectListContainer: {
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
  projectsHeader: {
    marginBottom: 16,
    color: '#333333',
    alignSelf: 'flex-start'
  },
  fab: {
    textAlign: 'right',
    margin: theme.spacing.unit
  }
})

export default withStyles(styles)(WalletComponent)
