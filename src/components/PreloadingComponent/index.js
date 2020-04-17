import React, { useEffect } from 'react'
import Box from '@material-ui/core/Box'
import { makeStyles } from '@material-ui/styles'
import './styles.css'
import Typography from '@material-ui/core/Typography'

const Wave = props => {
  function buildWave (w, h) {
    const path = document.querySelector('#wave')
    const m = 0.512286623256592433

    const a = h / 4
    const y = h / 2

    const pathData = [
      'M',
      w * 0,
      y + a / 2,
      'c',
      a * m,
      0,
      -(1 - a) * m,
      -a,
      a,
      -a,
      's',
      -(1 - a) * m,
      a,
      a,
      a,
      's',
      -(1 - a) * m,
      -a,
      a,
      -a,
      's',
      -(1 - a) * m,
      a,
      a,
      a,
      's',
      -(1 - a) * m,
      -a,
      a,
      -a,

      's',
      -(1 - a) * m,
      a,
      a,
      a,
      's',
      -(1 - a) * m,
      -a,
      a,
      -a,
      's',
      -(1 - a) * m,
      a,
      a,
      a,
      's',
      -(1 - a) * m,
      -a,
      a,
      -a,
      's',
      -(1 - a) * m,
      a,
      a,
      a,
      's',
      -(1 - a) * m,
      -a,
      a,
      -a,
      's',
      -(1 - a) * m,
      a,
      a,
      a,
      's',
      -(1 - a) * m,
      -a,
      a,
      -a,
      's',
      -(1 - a) * m,
      a,
      a,
      a,
      's',
      -(1 - a) * m,
      -a,
      a,
      -a
    ].join(' ')

    path.setAttribute('d', pathData)
  }

  useEffect(() => {
    buildWave(60, 60)
  }, [])

  return (
    <div className='waveDivBox'>
      <svg
        xmlns='http://www.w3.org/2000/svg'
        width='110px'
        height='110px'
        viewBox='4 0 80 60'
        className='waveSvg'
      >
        <path id='wave' fill='none' stroke='#f89c35' strokeWidth='6' strokeLinecap='round' />
      </svg>
    </div>
  )
}

const preloadingStyles = makeStyles({
  text: {
    fontFamily: 'Poppins'
  }
})

const PreloadingComponent = props => {
  const { actionsPending } = props
  const classes = preloadingStyles()
  return (
    <Box
      height='100vh'
      width='100%'
      display='flex'
      alignItems='center'
      justifyContent='center'
      flexDirection='column'
    >
      <Wave />
      {actionsPending.createCloudWallet && (
        <Box mt={2} display='flex' alignItems='center' flexDirection='column'>
          <Typography variant='body2' color='primary' className={classes.text}>
            Setting up your account...
          </Typography>
          <Typography variant='body2' color='primary' className={classes.text}>
            It won't take long.
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default PreloadingComponent
