import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles'
import { ThemeProvider } from '@material-ui/styles'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'
import Fab from '@material-ui/core/Fab'
import Icon from '@material-ui/core/Icon'
import classNames from 'classnames'
import { isMobile } from 'react-device-detect'
import { theme } from '../styles/theme'
import { uiColors } from '../styles/color'

const DOC_URL = 'https://ventureum.github.io/Chainsfr/#/#'

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
    let { classes, docId } = this.props
    return (
      <div>
        <ThemeProvider theme={theme}>
          <Fab
            color='primary'
<<<<<<< HEAD
          />
        </Fab>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby='faq-dialog'
          fullScreen={isMobile}
          maxWidth='md'
          scroll='paper'
          classes={isMobile ? undefined : { paper: classes.lowerLeftFixed }}
        >
          <DialogContent className={classes.zeroPadding}>
            <iframe
              title='faq-iframe'
              className={isMobile ? classes.iframeMobile : classes.iframe}
              src={DOC_URL + docId}
              allowFullScreen
              frameBorder='0'
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color='primary' id='close'>
=======
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
            fullScreen={isMobile}
            maxWidth='md'
            scroll='paper'
            className={isMobile ? undefined : classes.lowerLeftFixed}
          >
            <DialogContent className={classes.zeroPadding}>
              <DialogContentText>
                <iframe
                  title='faq-iframe'
                  className={isMobile ? classes.iframeMobile : classes.iframe}
                  src={DOC_URL + docId}
                  allowFullScreen
                  frameBorder='0'
                />
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleClose} color='primary' id='close'>
>>>>>>> try createMuiTheme on FAQ
              Close
              </Button>
            </DialogActions>
          </Dialog>
        </ThemeProvider>
      </div>
    )
  }
}

const styles = theme => ({
  lowerLeftFixed: {
    margin: 0,
    top: 'auto',
    right: 20,
    bottom: 20,
    left: 'auto',
    position: 'fixed',
<<<<<<< HEAD
    maxWidth: 'none'
=======
    '&:hover': {
      backgroundColor: uiColors.primaryDark
    }
>>>>>>> try createMuiTheme on FAQ
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
    margin: theme.spacing(2)
  }
})

export default withStyles(styles)(FAQComponent)
