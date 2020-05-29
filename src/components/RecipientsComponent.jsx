import React, { Component } from 'react'

import { withStyles } from '@material-ui/core/styles'
import { Typography, Button, Grid, Container } from '@material-ui/core'
import Box from '@material-ui/core/Box'
import SendIcon from '@material-ui/icons/SendRounded'
import MoreIcon from '@material-ui/icons/MoreHoriz'
import IconButton from '@material-ui/core/IconButton'
import GoogleIcon from '../images/google-icon.svg'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import Tooltip from '@material-ui/core/Tooltip'
import EmptyStateImage from '../images/empty_state_01.png'
import UserAvatar from './MicroComponents/UserAvatar'
import Skeleton from '@material-ui/lab/Skeleton'
import CheckCircleSharpIcon from '@material-ui/icons/CheckCircleSharp'

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
    const { classes, onSend, recipients, actionsPending, pending } = this.props
    const { moreMenu, chosenRecipient } = this.state
    const skeletonOnly = pending
    return (
      <Grid container direction='column'>
        {!actionsPending.getRecipients && recipients.length === 0 ? (
          <Box display='flex' flexDirection='column' alignItems='center' mt={6} mb={6}>
            <Box mb={2}>
              <img src={EmptyStateImage} alt='Empty State' />
            </Box>
            <Typography variant='subtitle2' color='textSecondary'>
              It seems you don't have any contacts saved
            </Typography>
          </Box>
        ) : (
          recipients.map((recipient, i) => (
            <Grid
              item
              key={i}
              className={i % 2 === 0 ? classes.recipientItem : classes.recipientItemColored}
              data-test-id='recipient_list_item'
            >
              <Grid container justify='space-between'>
                <Grid item>
                  <Box display='flex' alignItems='center'>
                    {!skeletonOnly ? (
                      <UserAvatar
                        style={{ width: 32 }}
                        name={recipient.name}
                        src={recipient.imageUrl}
                      />
                    ) : (
                      <Skeleton
                        variant='circle'
                        width={32}
                        height={32}
                        className={classes.skeleton}
                      />
                    )}
                    {!skeletonOnly ? (
                      <Box ml={1}>
                        <Typography data-test-id='recipient_name'>{recipient.name}</Typography>
                        <Box display='flex' alignItems='center'>
                          <Typography variant='caption' data-test-id='recipient_email'>
                            {recipient.email}
                          </Typography>
                          {recipient.registeredUser === true && (
                            <CheckCircleSharpIcon className={classes.registeredUserIcon} />
                          )}
                        </Box>
                      </Box>
                    ) : (
                      <Box>
                        <Skeleton width={50} height={20} className={classes.skeleton} />
                        <Skeleton width={60} height={12} className={classes.skeleton} />
                      </Box>
                    )}
                  </Box>
                </Grid>
                <Grid item display='flex'>
                  <Box display='inline' mr={2}>
                    {!skeletonOnly && (
                      <IconButton
                        onClick={event => this.toggleMoreMenu(event.currentTarget, recipient)}
                      >
                        <MoreIcon color='secondary' id='moreBtn' />
                      </IconButton>
                    )}
                  </Box>
                  <Box display='inline'>
                    {!skeletonOnly && (
                      <Tooltip title='Send to Contact'>
                        <IconButton
                          onClick={() => onSend(recipient)}
                          data-test-id={`send_to_recipient_${recipient.email}`}
                        >
                          <SendIcon color='primary' id='sendBtn' />
                        </IconButton>
                      </Tooltip>
                    )}
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
    const { classes, addRecipient, pending } = this.props
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
            <Typography variant='h2'>Manage Contacts</Typography>
            <Grid container>
              <Grid item sm={'auto'} xs={12} className={classes.btnItem}>
                <Button
                  variant='contained'
                  color='primary'
                  onClick={() => addRecipient()}
                  disabled={pending}
                >
                  Add Contacts
                </Button>
              </Grid>
              <Grid item sm={'auto'} xs={12} className={classes.btnItem}>
                <Button
                  className={classes.lightbtn}
                  color='primary'
                  onClick={() => {}}
                  data-test-id='connect_google_contact'
                  classes={{ label: classes.lightbtnSpan }}
                  disabled={pending}
                  id='intercom_google_contract'
                >
                  <Box
                    className={classes.iconContainer}
                    display='flex'
                    justifyContent='center'
                    alignItems='center'
                  >
                    <img src={GoogleIcon} style={{ width: 18 }} alt='googleIcon' />
                  </Box>
                  Connect to Google Contacts
                </Button>
              </Grid>
            </Grid>
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
      paddingLeft: '30px',
      paddingRight: '30px'
    }
  },
  upperBigGridItem: {
    [theme.breakpoints.down('sm')]: {
      paddingTop: '30px'
    }
  },
  decText: {
    [theme.breakpoints.up('md')]: {
      width: '80%',
      lineHeight: '20px',
      fontSize: 14,
      fontWeight: '600',
      color: '#777777'
    }
  },
  skeleton: {
    margin: 5
  },
  registeredUserIcon: {
    color: '#43B284',
    fontSize: '18px',
    marginLeft: '5px'
  },
  lightbtn: {
    backgroundColor: 'rgba(57, 51, 134, 0.05)',
    padding: '5px 20px 5px 5px'
  },
  lightbtnSpan: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  iconContainer: {
    backgroundColor: '#ffffff',
    borderRadius: '50%',
    left: '0px',
    top: '0px',
    padding: '5px',
    height: '18px',
    marginRight: '10px'
  },
  btnItem: {
    marginRight: '30px',
    marginTop: '20px'
  }
})
export default withStyles(styles)(RecipientsComponent)
