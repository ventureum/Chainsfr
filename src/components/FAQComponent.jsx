import React, { Component } from 'react'

import { withStyles } from '@material-ui/core/styles'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'
import Fab from '@material-ui/core/Fab'
import Icon from '@material-ui/core/Icon'
import withMobileDialog from '@material-ui/core/withMobileDialog'
import classNames from 'classnames'

const DOC_URL = 'https://ventureum.github.io/Chainsfer/#/#'

class FAQComponent extends Component {
  state = {
    open: false
  }

  handleClickOpen = () => {
    this.setState({ open: true })
  }

  handleClose = () => {
    this.setState({ open: false })
  }

  render () {
    let { classes, docId, fullScreen } = this.props
    return (
      <div>
        <Fab
          color='primary'
          size='large'
          aria-label='Help'
          onClick={this.handleClickOpen}
          className={classes.lowerLeftFixed}
        >
          <Icon
            className={classNames(classes.icon, 'fa fa-question')}
            color='primary'
          />
        </Fab>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby='faq-dialog'
          fullWidth
          fullScreen={fullScreen}
          maxWidth='md'
          scroll='paper'
          className={fullScreen ? undefined : classes.lowerLeftFixed}
        >
          <DialogContent className={classes.zeroPadding}>
            <DialogContentText>
              <iframe
                title='faq-iframe'
                className={fullScreen ? classes.iframeMobile : classes.iframe}
                src={DOC_URL + docId}
                allowFullScreen
                frameBorder='0'
              />
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color='primary' id='close'>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    )
  }
}

const styles = theme => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end'
  },
  lowerLeftFixed: {
    margin: 0,
    top: 'auto',
    right: 20,
    bottom: 20,
    left: 'auto',
    position: 'fixed'
  },
  zeroPadding: {
    padding: '0px 0px 0px 0px !important'
  },
  iframe: {
    minHeight: '60vh',
    minWidth: '50vw',
    width: '100%',
    height: '100%'
  },
  iframeMobile: {
    minHeight: '100vh',
    minWidth: '100vw',
    width: '100%',
    height: '100%'
  },
  icon: {
    color: 'white',
    margin: theme.spacing.unit * 2
  }
})

export default withMobileDialog()(withStyles(styles)(FAQComponent))
