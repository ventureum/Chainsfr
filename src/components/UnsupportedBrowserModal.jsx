import React from 'react'
import Button from '@material-ui/core/Button'
import CloseIcon from '@material-ui/icons/CloseRounded'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle'
import IconButton from '@material-ui/core/IconButton'

import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'

type UnsupportedBrowserModalProps = {
  open: boolean,
  handleClose: Function
}

const useStyles = makeStyles(theme => ({
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500]
  },
  dialogRoot: {
    [theme.breakpoints.up('sm')]: {
      maxWidth: '360px',
      height: '640px'
    }
  },
  contentRoot: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3)
  },
  actionRoot: {
    flexDirection: 'column',
    alignItems: 'stretch'
  },
  titleRoot: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    borderBottom: '1px solid #E9E9E9'
  },
  dialogContentText: {}
}))

const UnsupportedBrowserModal = (props: UnsupportedBrowserModalProps) => {
  const { handleClose, open } = props
  const classes = useStyles()

  return (
    <Dialog
      open={open}
      fullScreen={true}
      onClose={() => {
        handleClose()
      }}
      classes={{ paperScrollPaper: classes.dialogRoot }}
      fullWidth
    >
      <DialogTitle disableTypography className={classes.titleRoot}>
        <Typography variant='h3'>Open with Browser</Typography>
        <IconButton onClick={handleClose} className={classes.closeButton}>
          <CloseIcon className={classes.closeIcon} />
        </IconButton>
      </DialogTitle>
      <DialogContent className={classes.contentRoot}>
        <Typography variant='body1'>
          Google can't sign you in safely inside this app. Please open this view in a browser like
          Chrome or Safari to sign in with Google.
        </Typography>
      </DialogContent>
      <DialogActions className={classes.actionRoot}>
        <CopyToClipboard text={window.location}>
          <Button variant='contained' color='default'>
            Copy URL
          </Button>
        </CopyToClipboard>
      </DialogActions>
    </Dialog>
  )
}

export default UnsupportedBrowserModal
