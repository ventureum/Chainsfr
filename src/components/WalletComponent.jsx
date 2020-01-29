import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box'
import Container from '@material-ui/core/Container'
import Card from '@material-ui/core/Card'
import Menu from '@material-ui/core/Menu'
import ListItemText from '@material-ui/core/ListItemText'
import MenuItem from '@material-ui/core/MenuItem'
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'
import Button from '@material-ui/core/Button'
import CircularProgress from '@material-ui/core/CircularProgress'
import { getCryptoSymbol } from '../tokens'
import { UserRecentTransactions } from './LandingPageComponent.jsx'
import { accountStatus } from '../types/account.flow'
import SendToAnotherAccountModal from '../containers/SendToAnotherAccountModalContainer'
import path from '../Paths.js'

class WalletComponent extends Component {
  state = {
    anchorEl: null,
    sendToAnotherAccountModal: false
  }

  handleModalClose = () => {
    this.setState({
      sendToAnotherAccountModal: false
    })
  }

  renderChainsfrWalletSection = () => {
    const { classes, cloudWalletAccounts, push } = this.props
    const { anchorEl } = this.state

    return (
      <Grid container alignItems='center' justify='center' className={classes.coloredBackgrond}>
        <Container maxWidth='lg'>
          <div style={{ marginBottom: '30px' }}>
            <Grid container alignItems='center' justify='space-between'>
              <Box mb={2}>
                <Typography variant='h2'>Chainsfr Wallet</Typography>
              </Box>
              <Grid item>
                <Grid container alignItems='center' spacing={3}>
                  <Grid item>
                    <Button color='primary' variant='outlined'>
                      Receive
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button
                      color='primary'
                      variant='contained'
                      onClick={event => this.setState({ anchorEl: event.currentTarget })}
                    >
                      Send
                      <ArrowDropDownIcon></ArrowDropDownIcon>
                    </Button>
                    <Menu
                      anchorEl={anchorEl}
                      getContentAnchorEl={null}
                      open={Boolean(anchorEl)}
                      keepMounted
                      onClose={() => this.setState({ anchorEl: null })}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left'
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left'
                      }}
                    >
                      <MenuItem
                        onClick={() => {
                          this.setState({ sendToAnotherAccountModal: true, anchorEl: null })
                        }}
                      >
                        <ListItemText primary='Send to my accounts' />
                      </MenuItem>
                      <MenuItem onClick={() => push(`${path.transfer}?walletSelection=drive`)}>
                        <ListItemText primary='Send to others' />
                      </MenuItem>
                    </Menu>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </div>
          <div>
            <Grid container direction='row' alignItems='center' justify='center' spacing={2}>
              {cloudWalletAccounts.map((account, index) => {
                return (
                  <Grid item key={index}>
                    <Card className={classes.balanceCard}>
                      <Grid container alignItems='center' justify='center' direction='column'>
                        <Grid item>
                          {account.status !== accountStatus.syncing ? (
                            <Typography variant='h1'>{account.balanceInStandardUnit}</Typography>
                          ) : (
                            <CircularProgress></CircularProgress>
                          )}
                        </Grid>
                        <Grid item>
                          <Typography variant='caption'>
                            {getCryptoSymbol(account.cryptoType)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Card>
                  </Grid>
                )
              })}
            </Grid>
          </div>
        </Container>
      </Grid>
    )
  }

  render () {
    const { actionsPending, transferHistory, loadMoreTransferHistory, online } = this.props
    const { sendToAnotherAccountModal } = this.state
    return (
      <div>
        {this.renderChainsfrWalletSection()}
        <UserRecentTransactions
          actionsPending={actionsPending}
          transferHistory={transferHistory}
          loadMoreTransferHistory={loadMoreTransferHistory}
        />
        {sendToAnotherAccountModal && (
          <SendToAnotherAccountModal
            handleClose={() => {
              this.handleModalClose()
            }}
            open={sendToAnotherAccountModal}
            online={online}
          />
        )}
      </div>
    )
  }
}

const styles = theme => ({
  coloredBackgrond: {
    backgroundColor: '#FAFBFE'
  },
  balanceCard: {
    width: '320px',
    height: '160px',
    padding: '0px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '0px'
  }
})

export default withStyles(styles)(WalletComponent)
