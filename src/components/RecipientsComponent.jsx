import React, { Component } from 'react'

import { withStyles } from '@material-ui/core/styles'
import { Typography, Button, Grid, Divider } from '@material-ui/core'
import AccountCircle from '@material-ui/icons/AccountCircle'
import SendIcon from '@material-ui/icons/Send'
import MoreIcon from '@material-ui/icons/MoreHoriz'
import IconButton from '@material-ui/core/IconButton'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import Tooltip from '@material-ui/core/Tooltip'

class RecipientsComponent extends Component {
  state = {
    moreMenu: false,
    moreMenuAnchorEl: null
  }

  toggleMoreMenu = (anchorEl, recipient) => {
    this.setState(prevState => {
      return {
        moreMenu: !prevState.moreMenu,
        moreMenuAnchorEl: prevState.moreMenuAnchorEl ? null : anchorEl,
        chosenRecipient: recipient
      }
    })
  }

  renderMoreMenu = recipient => {
    const { editRecipient, removeRecipient } = this.props
    const { moreMenuAnchorEl, moreMenu } = this.state
    return (
      <Menu
        anchorEl={moreMenuAnchorEl}
        open={moreMenu}
        onClose={event => this.toggleMoreMenu(event.currentTarget)}
      >
        <MenuItem
          onClick={event => {
            this.toggleMoreMenu(null)
            editRecipient(recipient)
          }}
        >
          Edit
        </MenuItem>
        <MenuItem
          onClick={event => {
            this.toggleMoreMenu(null)
            removeRecipient(recipient)
          }}
        >
          Delete
        </MenuItem>
      </Menu>
    )
  }

  renderRecipientsList = () => {
    const { classes, onSend, recipients, actionsPending } = this.props
    const { moreMenu, chosenRecipient } = this.state
    return (
      <Grid container direction='column'>
        {!actionsPending.getRecipients && recipients.length === 0 ? (
          <Typography variant='body1' align='center'>
            It seems you don't have any recipients saved
          </Typography>
        ) : (
          recipients.map((recipient, i) => (
            <Grid
              item
              key={i}
              className={i % 2 === 0 ? classes.recipientItem : classes.recipientItemColored}
            >
              <Grid container justify='space-between'>
                <Grid item>
                  <Grid container alignItems='center'>
                    <AccountCircle className={classes.recipientIcon} id='accountCircle' />
                    <div>
                      <Typography>{recipient.name}</Typography>
                      <Typography variant='caption'>{recipient.email}</Typography>
                    </div>
                  </Grid>
                </Grid>
                <Grid item>
                  <Grid container alignItems='center'>
                    <Grid item>
                      <Tooltip title='Transfer'>
                        <IconButton
                          style={{ marginRight: '40px' }}
                          onClick={() => onSend(recipient)}
                        >
                          <SendIcon className={classes.iconBtn} id='sendBtn' />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                    <Grid item>
                      <Tooltip title='More'>
                        <IconButton
                          onClick={event => this.toggleMoreMenu(event.currentTarget, recipient)}
                        >
                          <MoreIcon className={classes.iconBtn} id='moreBtn' />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          ))
        )}
        {moreMenu && this.renderMoreMenu(chosenRecipient)}
      </Grid>
    )
  }

  render () {
    const { classes, addRecipient } = this.props

    return (
      <Grid container justify='center'>
        <Grid item className={classes.sectionContainer}>
          <Grid container direction='column'>
            <Grid item style={{ width: '100%' }}>
              <Grid container alignItems='center' justify='space-between'>
                <Grid item>
                  <Typography variant='h2'>Recipients</Typography>
                </Grid>
                <Grid item>
                  <Button className={classes.addRecipientBtn} onClick={() => addRecipient()}>
                    Add Recipient
                  </Button>
                </Grid>
              </Grid>
            </Grid>
            <Divider className={classes.divider} />
            <Grid item>{this.renderRecipientsList()}</Grid>
          </Grid>
        </Grid>
      </Grid>
    )
  }
}

const styles = theme => ({
  sectionContainer: {
    width: '100%',
    maxWidth: '1200px',
    margin: '60px 0px 60px 0px',
    padding: '0px 50px 0px 50px'
  },
  recipientItem: {
    padding: '20px'
  },
  recipientItemColored: {
    backgroundColor: '#FAFBFE',
    padding: '20px'
  },
  recipientIcon: {
    fontSize: '40px',
    marginRight: '10px',
    color: '#333333'
  },
  iconBtn: {
    color: '#777777',
    fontSize: '20px'
  },
  addRecipientBtn: {
    border: '1px solid #396EC8',
    color: '#396EC8',
    borderRadius: '4px',
    textTransform: 'none'
  },
  divider: {
    margin: '20px 0px 20px 0px'
  }
})
export default withStyles(styles)(RecipientsComponent)
