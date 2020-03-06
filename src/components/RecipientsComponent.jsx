import React, { Component } from 'react'

import { withStyles } from '@material-ui/core/styles'
import { Typography, Button, Grid, Container } from '@material-ui/core'
import Box from '@material-ui/core/Box'
import SendIcon from '@material-ui/icons/SendRounded'
import MoreIcon from '@material-ui/icons/MoreHoriz'
import IconButton from '@material-ui/core/IconButton'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import Tooltip from '@material-ui/core/Tooltip'
import EmptyStateImage from '../images/empty_state_01.png'
import UserAvatar from './MicroComponents/UserAvatar'

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
          <Box display='flex' flexDirection='column' alignItems='center' mt={6} mb={6}>
            <Box mb={2}>
              <img src={EmptyStateImage} alt='Empty State' />
            </Box>
            <Typography variant='subtitle2' color='textSecondary'>
              It seems you don't have any recipients saved
            </Typography>
          </Box>
        ) : (
          recipients.map((recipient, i) => (
            <Grid
              item
              key={i}
              className={i % 2 === 0 ? classes.recipientItem : classes.recipientItemColored}
            >
              <Grid container justify='space-between'>
                <Grid item>
                  <Box display='flex' alignItems='center'>
                    <UserAvatar
                      style={{ width: 32 }}
                      name={recipient.name}
                      src={recipient.imageUrl}
                    />
                    <Box ml={1}>
                      <Typography>{recipient.name}</Typography>
                      <Typography variant='caption'>{recipient.email}</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item display='flex'>
                  <Box display='inline' mr={2}>
                    <Tooltip title='More'>
                      <IconButton
                        onClick={event => this.toggleMoreMenu(event.currentTarget, recipient)}
                      >
                        <MoreIcon color='secondary' id='moreBtn' />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Box display='inline'>
                    <Tooltip title='Send to Recipient'>
                      <IconButton onClick={() => onSend(recipient)}>
                        <SendIcon color='primary' id='sendBtn' />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          ))
        )}
        {moreMenu && this.renderMoreMenu(chosenRecipient)}
      </Grid>
    )
  }

  renderUpperSection = props => {
    const { classes, addRecipient } = this.props
    return (
      <Box
        className={classes.coloredBackgrond}
        alignItems='center'
        justifyContent='center'
        display='flex'
      >
        <Container className={classes.container}>
          <Box
            display='flex'
            alignItems='flex-start'
            flexDirection='column'
            justifyContent='center'
            height='100%'
          >
            <Typography variant='h2'>Manage Recipients</Typography>
            <Typography variant='h6' className={classes.decText}>
              Add recipients to use email transfer.
            </Typography>
            <Box display='flex' mt={2}>
              <Button variant='contained' color='primary' onClick={() => addRecipient()}>
                Add Recipient
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    )
  }

  render () {
    const { classes } = this.props
    return (
      <Box display='flex' flexDirection='column'>
        {this.renderUpperSection()}
        <Container className={classes.container}>{this.renderRecipientsList()}</Container>
      </Box>
    )
  }
}

const styles = theme => ({
  recipientItem: {
    padding: '20px'
  },
  recipientItemColored: {
    backgroundColor: '#FAFBFE',
    padding: '20px'
  },
  coloredBackgrond: {
    backgroundColor: '#FAFBFE'
  },
  container: {
    paddingTop: 40,
    paddingBottom: 40,
    [theme.breakpoints.up('sm')]: {
      paddingLeft:'30px',
      paddingRight:'30px'
    }
  },
  upperBigGridItem: {
    [theme.breakpoints.down('sm')]: {
      paddingTop: '30px'
    }
  },
  decText: {
    [theme.breakpoints.up('md')]: {
      width: '80%'
    }
  }
})
export default withStyles(styles)(RecipientsComponent)
