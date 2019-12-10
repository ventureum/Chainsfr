import React from 'react'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import OfflineIcon from '../images/offline-icon.png'

function OfflineComponent (props) {
  return (
    <Grid
      container
      spacing={0}
      align='center'
      justify='center'
      direction='column'
      style={{ minHeight: '100vh' }}
    >
      <Grid item>
        <Grid container direction='column' alignItems='center' justify='center'>
          <Grid item>
            <img src={OfflineIcon} alt='offline-icon' />
          </Grid>
          <Grid item>
            <Typography variant='h1'>Connect to the Internet</Typography>
          </Grid>
          <Grid item>
            <Typography variant='h3'> You're offline. Check your connection.</Typography>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default OfflineComponent
