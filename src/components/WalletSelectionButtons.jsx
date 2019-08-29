import React from 'react'

import { makeStyles } from '@material-ui/styles'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import { spacing } from '../styles/base'
import { walletSelections, walletDisabledByCrypto } from '../wallet'

const basicWalletStyle = {
  paddingTop: '32px',
  paddingBottom: '32px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  height: '100px'
}

const useStyles = makeStyles({
  walletLogo: {
    height: '64px',
    alignSelf: 'center',
    marginBottom: spacing.base
  },
  walletCard: {
    ...basicWalletStyle,
    border: '1px solid #E9E9E9',
    boxShadow: 'none',
    marginBottom: '10px'
  },
  walletCardSelected: {
    ...basicWalletStyle,
    border: '1px solid #4285F4',
    borderRadius: '8px',
    backgroundColor: 'rgba(66,133,244,0.1)',
    transition: 'all .3s ease',
    marginBottom: '10px'
  },
  walletCardDisabled: {
    ...basicWalletStyle,
    border: '1px solid #D2D2D2',
    borderRadius: '8px',
    backgroundColor: '#F8F8F8',
    transition: 'all .3s ease',
    boxShadow: 'none',
    marginBottom: '10px'
  },
  walletSelectionContainer: {
    backgroundColor: '#FAFBFE',
    marginBottom: '20px'
  }
})

export function WalletButton(props) {
  const { walletType, handleClick, selected, disabled, disabledReason } = props
  const wallet = walletSelections.find(w => w.walletType === walletType)
  const classes = useStyles()
  let cardStyle = classes.walletCard
  if (selected) cardStyle = classes.walletCardSelected
  if (disabled) cardStyle = classes.walletCardDisabled
  return (
    <Card
      className={cardStyle}
      onClick={() => {
        if (!disabled && handleClick) handleClick(wallet.walletType)
      }}
    >
      <img className={classes.walletLogo} src={wallet.logo} alt='wallet-logo' />
      <Typography variant='body1' align='center'>
        {wallet.title}
      </Typography>
      {disabled && <Typography variant='caption'>{disabledReason}</Typography>}
    </Card>
  )
}

export default function WalletSelectionButtons(props) {
  const { handleClick, walletSelection, cryptoType, lastUsedWallet } = props
  const classes = useStyles()
  return (
    <Grid
      container
      direction='row'
      alignItems='center'
      spacing={2}
      className={classes.walletSelectionContainer}
    >
      {walletSelections.map((w, i) => {
        return (
          <Grid item sm={3} xs={12} key={i}>
            <WalletButton
              id={w.walletType}
              walletType={w.walletType}
              selected={w.walletType === walletSelection}
              disabled={
                (w.disabled &&
                  !(
                    lastUsedWallet &&
                    lastUsedWallet[w.walletType] &&
                    lastUsedWallet[w.walletType].crypto[cryptoType]
                  )) ||
                (cryptoType && walletDisabledByCrypto(w.walletType, cryptoType))
              }
              handleClick={handleClick}
              disabledReason={w.disabledReason || ' '}
            />
          </Grid>
        )
      })}
    </Grid>
  )
}
