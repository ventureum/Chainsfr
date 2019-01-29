import React, { Component } from 'react'
import './App.css'

import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Avatar from '@material-ui/core/Avatar'
import classNames from 'classnames'
import Icon from '@material-ui/core/Icon'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEthereum } from '@fortawesome/free-brands-svg-icons'
import Divider from '@material-ui/core/Divider'
import Fab from '@material-ui/core/Fab'
import AddIcon from '@material-ui/icons/Add'
import CreateAddressContainer from './CreateAddressContainer'

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

  deleteFile = async (fileId) => {
    let rv = await window.gapi.client.drive.files.delete({
      fileId: fileId
    })
    console.log(rv)
  }

  loadFile = async (fileId) => {
    let rv = await window.gapi.client.drive.files.get({
      fileId: fileId,
      alt: 'media'
    })
    return rv.result
  }

  saveFileGeneric = async (file, raw) => {
    if (!window.gapi.client.drive) {
      await window.gapi.client.load('drive', 'v3')
    }

    async function addContent (fileId) {
      return window.gapi.client.request({
        path: '/upload/drive/v3/files/' + fileId,
        method: 'PATCH',
        params: {
          uploadType: 'media'
        },
        body: file.content
      })
    }
    var metadata = {
      mimeType: 'application/json',
      name: file.name,
      fields: 'id'
    }
    if (raw) {
      delete metadata['mimeType']
    }

    if (file.parents) {
      metadata.parents = file.parents
    }

    if (file.id) { // just update
      let resp = await addContent(file.id).then(function (resp) {
        console.log('File just updated', resp.result)
      })
    } else { // create and update
      console.log(window.gapi.client.drive.files)
      let resp = await window.gapi.client.drive.files.create({
        resource: metadata
      })
      resp = await addContent(resp.result.id)
      console.log('created and added content', resp.result)
    }
  }

  addFile = async (data) => {
    try {
      await this.saveFileGeneric({
        content: JSON.stringify({ data: 'abcdde' }),
        name: 'test.json',
        parents: ['appDataFolder']
      }, false)
    } catch (err) {
      console.log(err)
    }
  }

  listFiles = async () => {
    try {
      let rv = await window.gapi.client.drive.files.list({
        spaces: 'appDataFolder',
        fields: 'nextPageToken, files(id, name)',
        pageSize: 100
      })

      let files = rv.result.files
      files.map(async (f) => console.log(await this.loadFile(f.id)))

      // delete first one
      await this.deleteFile(files[0].id)
    } catch (err) {
      console.log(err)
    }
  }

  addAddressOnClick = () => {
    this.setState({addAddressModalOpen: true})
  }

  addAdressOnClose = () => {
    this.setState({addAddressModalOpen: false})
  }

  renderAddress (address) {
    return (
      <ListItem>
        <Avatar>
          <FontAwesomeIcon icon={faEthereum} />
        </Avatar>
        <ListItemText primary={address.alias} secondary={address.balance} />
        <ListItemSecondaryAction>
          { address.public ? 'Public' : 'Private' }
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
                  { addressList.map(addr => this.renderAddress(addr))}
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
