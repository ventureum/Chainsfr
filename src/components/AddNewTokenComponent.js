import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Avatar from '@material-ui/core/Avatar'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import CloseIcon from '@material-ui/icons/CloseRounded'
import CircularProgress from '@material-ui/core/CircularProgress'
import Drawer from '@material-ui/core/Drawer'
import Divider from '@material-ui/core/Divider'
import FormControl from '@material-ui/core/FormControl'
import Fuse from 'fuse.js'
import { getCryptoTitle } from '../tokens.js'
import { getWalletTitle, getWalletLogo } from '../wallet'
import InputLabel from '@material-ui/core/InputLabel'
import InputAdornment from '@material-ui/core/InputAdornment'
import IconButton from '@material-ui/core/IconButton'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import MenuItem from '@material-ui/core/MenuItem'
import OutlinedInput from '@material-ui/core/OutlinedInput'
import Select from '@material-ui/core/Select'
import SearchIcon from '@material-ui/icons/Search'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import TokenSearchIcon from '../images/tokensearch.svg'

const useStyle = makeStyles(theme => ({
  drawerPapper: {
    maxWidth: '480px',
    width: '100%'
  },
  title: {
    padding: `${theme.spacing(3)} ${theme.spacing(2)}`
  },
  listItem: {
    padding: theme.spacing(1)
  },
  listItemIcon: {
    marginRight: theme.spacing(2)
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(2),
    top: theme.spacing(1),
    color: theme.palette.grey[500]
  },
  closeIcon: {
    width: '24px',
    height: 'auto'
  }
}))

const TokenSearchComponent = props => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const { ethContracts, onSelect, selectedToken } = props
  const classes = useStyle()
  const fuse = new Fuse(Object.values(ethContracts), {
    shouldSort: true,
    threshold: 0.45,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: [{ name: 'name', weight: 0.5 }, { name: 'symbol', weight: 0.5 }]
  })

  function onQueryChange (e) {
    setSearchQuery(e.target.value)
    const result = fuse.search(e.target.value)
    setSearchResults(result.slice(0, 5))
  }

  const handleListItemClick = token => {
    onSelect(token)
  }

  return (
    <Box padding='20px 0px' display='flex' flexDirection='column' height='300px'>
      <FormControl>
        <TextField
          variant='outlined'
          value={searchQuery}
          placeholder='Search token'
          onChange={onQueryChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />
      </FormControl>
      {!searchQuery ? (
        <Box
          display='flex'
          flexDirection='column'
          alignItems='center'
          justifyContent='center'
          height='100%'
        >
          <img
            src={TokenSearchIcon}
            width='60px'
            height='65px'
            style={{ margin: '20px' }}
            alt='search_img'
          />
          <Typography variant='caption'>Search results</Typography>
        </Box>
      ) : (
        <List>
          {searchResults.map(({ item, refIndex }) => {
            return (
              <ListItem
                button
                key={refIndex}
                selected={selectedToken && selectedToken.refIndex === refIndex}
                onClick={() => {
                  handleListItemClick({ item, refIndex })
                }}
                className={classes.listItem}
              >
                <ListItemIcon className={classes.listItemIcon}>
                  <Avatar src={item.logo} alt={`${item.symbol}_logo`} className={{width: '60px', height: '65px'}} />
                </ListItemIcon>
                <ListItemText>
                  {item.name} ({item.symbol})
                </ListItemText>
              </ListItem>
            )
          })}
        </List>
      )}
    </Box>
  )
}

const AddTokenDrawer = props => {
  const [selectedWallet, setSelectedWallet] = useState('')
  const [selectedToken, setSelectedToken] = useState(null)

  const { open, ethContracts, addToken, adding } = props

  const classes = useStyle()
  const { wallets, onClose } = props

  function renderWalletItem (item: string) {
    item = JSON.parse(item)
    return (
      <Box>
        <Box display='flex' flexDirection='row' alignItems='center'>
          <Box mr={1} display='inline'>
            {/* wallet icon */}
            <Avatar style={{ borderRadius: '2px' }} src={getWalletLogo(item.walletType)} />
          </Box>
          <Box>
            {/* name and wallet title*/}
            <Typography variant='body2'>{item.name}</Typography>
            <Typography variant='caption'>
              {getWalletTitle(item.walletType)}, {getCryptoTitle(item.platformType)}
            </Typography>
          </Box>
        </Box>
      </Box>
    )
  }

  function submit () {
    addToken(JSON.parse(selectedWallet), selectedToken.item)
  }

  return (
    <Drawer anchor='right' open={open} onClose={onClose} classes={{ paper: classes.drawerPapper }}>
      <Box display='relative' padding='20px 30px'>
        <Typography variant='h3'>Add Tokens</Typography>
        <IconButton onClick={onClose} className={classes.closeButton}>
          <CloseIcon className={classes.closeIcon} />
        </IconButton>
      </Box>
      <Divider />
      <Box display='flex' flexDirection='column' padding='20px 30px'>
        <FormControl variant='outlined'>
          <InputLabel>Add to Wallet</InputLabel>
          <Select
            labelId='walletSelect'
            renderValue={renderWalletItem}
            value={selectedWallet}
            onChange={e => {
              setSelectedWallet(e.target.value)
            }}
            input={<OutlinedInput labelWidth={95} name='Add to Wallet' />}
            id='walletSelect'
          >
            {wallets.map((wallet, index) => (
              <MenuItem key={index} value={JSON.stringify(wallet)}>
                {renderWalletItem(JSON.stringify(wallet))}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TokenSearchComponent
          ethContracts={ethContracts}
          onSelect={setSelectedToken}
          selectedToken={selectedToken}
        />
        <Button
          disabled={!selectedToken || !selectedWallet || adding}
          variant='contained'
          color='primary'
          onClick={submit}
        >
          {adding ? <CircularProgress size={14} /> : 'Add'}
        </Button>
      </Box>
    </Drawer>
  )
}

export default AddTokenDrawer
