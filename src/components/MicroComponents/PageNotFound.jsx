import React from 'react'
import Box from '@material-ui/core/Box'
import Button from '@material-ui/core/Button'
import ChainsfrLogoSVG from '../../images/logo_chainsfr_617_128.svg'
import { Link } from 'react-router-dom'
import MuiLink from '@material-ui/core/Link'
import Paths from '../../Paths'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
  chainsfrLogo: {
    height: 24
  },
  textPadding: {
    marginTop: 20,
    marginBottom: 20
  }
}))

const PageNotFound = props => {
  const classes = useStyles()
  return (
    <Box
      display='flex'
      minHeight='85vh'
      justifyContent='space-between'
      alignItems='center'
      padding={6}
      flexDirection='column'
    >
      <img className={classes.chainsfrLogo} src={ChainsfrLogoSVG} alt='Chainsfr Logo' />
      <Box display='flex' flexDirection='column' alignItems='center' maxWidth='400px'>
        <Typography style={{ fontSize: '52px' }} className={classes.textPadding}>
          {'😞'}
        </Typography>
        <Typography variant='h1' className={classes.textPadding} align='center'>
          Oops, page not found.
        </Typography>
        <Typography variant='body2' align='center' className={classes.textPadding}>
          It looks like you're trying to access a page that has been deleted or never even existed.
        </Typography>
        <Button
          variant='contained'
          color='primary'
          component={Link}
          to={Paths.home}
          className={classes.textPadding}
        >
          Back to Homepage
        </Button>
      </Box>
      <Typography variant='caption' color='textSecondary'>
        <Box color='text.disabled' display='inline' data-test-id='copy_right'>
          &copy;
          {new Date().getFullYear()}
          <MuiLink target='_blank' rel='noopener noreferrer' href='https://ventureum.io/'>
            <Box ml={0.5} color='text.disabled' display='inline'>
              Ventureum Inc.
            </Box>
          </MuiLink>
        </Box>
      </Typography>
    </Box>
  )
}

export default PageNotFound
