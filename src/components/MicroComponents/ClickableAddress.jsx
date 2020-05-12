// @flow
import React from 'react'
import Button from '@material-ui/core/Button'
import { Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import URL from '../../url'

type ClickableAddressProps = {
  children: string,
  typographyProps: Object
}

const styles = makeStyles({
  button: {
    padding: '10px',
    display: 'flex',
    alignItems: 'center'
  }
})

const ClickableAddress = (props: ClickableAddressProps) => {
  const { children, typographyProps } = props
  if (!children) return null
  const classes = styles()
  // TODO: Add cryptoType as props in the future if needed
  const cryptoType = children.startsWith('0x') ? 'ethereum' : 'bitcoin'

  return (
    <Button
      target='_blank'
      rel='noopener noreferrer'
      className={classes.button}
      href={URL.getExplorerAddress(cryptoType, children)}
    >
      <Typography {...typographyProps}>{children}</Typography>
    </Button>
  )
}

export default ClickableAddress
