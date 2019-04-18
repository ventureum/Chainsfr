import React, { Component } from 'react'

import { withStyles } from '@material-ui/core/styles'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import Fab from '@material-ui/core/Fab'
import Icon from '@material-ui/core/Icon'
import classNames from 'classnames'

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
    let { classes } = this.props
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
          maxWidth='md'
          scroll='paper'
          className={classes.lowerLeftFixed}
        >
          <DialogContent className={classes.zeroPadding}>
            <DialogContentText>
              <iframe
                title='faq-iframe'
                className={classes.iframe}
                src='https://timothywangdev.github.io/Chainsfer/#/'
                allowFullScreen
                frameBorder='0'
              />
            </DialogContentText>
          </DialogContent>
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
    minWidth: '20vw',
    width: '100%',
    height: '100%'
  },
  icon: {
    color: 'white',
    margin: theme.spacing.unit * 2
  }
})

export default withStyles(styles)(FAQComponent)
