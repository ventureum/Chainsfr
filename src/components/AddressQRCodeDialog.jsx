import React from 'react'
import { withStyles, useTheme } from '@material-ui/core/styles'
import Avatar from '@material-ui/core/Avatar'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import CloseIcon from '@material-ui/icons/Close'
import DialogActions from '@material-ui/core/DialogActions'
import DialogTitle from '@material-ui/core/DialogTitle'
import DialogContent from '@material-ui/core/DialogContent'
import Dialog from '@material-ui/core/Dialog'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import QRCode from 'qrcode.react'
import IconButton from '@material-ui/core/IconButton'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import { getWalletTitle, getWalletLogo } from '../wallet'
import { getCryptoTitle } from '../tokens.js'

const titleStyles = theme => ({
  root: {
    margin: 0,
    padding: '0px 10px 0px 10px'
  },
  closeButton: {
    position: 'absolute',
    right: '5%',
    top: '5%',
    color: theme.palette.grey[500]
  }
})

const Title = withStyles(titleStyles)(props => {
  const { classes, onClose, account } = props
  return (
    <DialogTitle disableTypography className={classes.root}>
      <Box display='flex' flexDirection='row' alignItems='center'>
        <Avatar
          style={{ borderRadius: '0px', marginRight: 10 }}
          src={getWalletLogo(account.walletType)}
        ></Avatar>
        <Box>
          <Typography variant='body2'>{account.name}</Typography>
          <Typography variant='caption'>
            {getWalletTitle(account.walletType)}, {getCryptoTitle(account.platformType)}
          </Typography>
        </Box>
        <Typography variant='h6'></Typography>
      </Box>
      <IconButton
        aria-label='close'
        className={classes.closeButton}
        onClick={onClose}
        data-test-id='close_qr_code'
      >
        <CloseIcon />
      </IconButton>
    </DialogTitle>
  )
})

const contentStyle = theme => ({
  root: {
    padding: '0px 10px 0px 10px',
    justifyContent: 'center',
    flex: 'none'
  },
  paper: {
    borderRadius: '16px'
  }
})

const Content = withStyles(contentStyle)(props => {
  const { address, classes, fullScreen } = props

  return (
    <DialogContent className={classes.root}>
      <Paper elevation={1} className={classes.paper}>
        <Box padding={2} mt={2} mb={2} display='flex' alignItems='center' justifyContent='center'>
          <QRCode value={address} size={fullScreen ? 275 : 225} data-test-id='qr_code_img' />
        </Box>
      </Paper>
      <Box display='flex' flexDirection='column' alignItems='center'>
        <Typography variant='body1'>Wallet Address</Typography>
        <Typography variant='caption' style={{ marginTop: 10 }} data-test-id='address'>
          {address}
        </Typography>
      </Box>
    </DialogContent>
  )
})

const actionStyles = theme => ({
  root: {
    marginTop: '20px',
    padding: '0px 10px 0px 10px',
    justifyContent: 'center'
  }
})

const Action = withStyles(actionStyles)(props => {
  const { classes, address } = props
  return (
    <DialogActions disableSpacing className={classes.root}>
      <CopyToClipboard text={address}>
        <Button variant='contained' color='primary'>
          Copy
        </Button>
      </CopyToClipboard>
    </DialogActions>
  )
})

const dialogStyles = theme => ({
  root: {
    backgroundColor: '#F8F8F8',
    padding: '30px 20px 30px 20px',
    justifyContent: 'center',
    alignItems: 'stretch'
  }
})

function AddressQRCodeDialog (props) {
  const { open, handleClose, account, classes } = props
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('xs'))

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      classes={{ paperScrollPaper: classes.root }}
      transitionDuration={500}
      fullScreen={fullScreen}
    >
      <Title account={account} onClose={handleClose}></Title>
      <Content address={account.address} fullScreen={fullScreen} />
      <Action address={account.address} />
    </Dialog>
  )
}

export default withStyles(dialogStyles)(AddressQRCodeDialog)
