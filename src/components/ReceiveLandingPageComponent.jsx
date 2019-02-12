import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Icon from '@material-ui/core/Icon'
import Avatar from '@material-ui/core/Avatar'
import ReceiveLandingIllustration from '../images/receive-landing.svg'

class ReceiveLandingPageComponent extends Component {
  render () {
    let { classes } = this.props
    return (
      <Grid container direction='row' alignItems='center'>
        <Grid item xl={7} lg={7} md={7}>
          <Grid container direction='column' justify='center' alignItems='center'>
            <Grid item>
              <img src={ReceiveLandingIllustration} alt={'landing-illustration'} className={classes.landingIllustration} />
            </Grid>
            <Grid item>
              <Grid item className={classes.stepTitleContainer}>
                <Typography className={classes.stepTitle}>
                  Easy as 3 steps to complete the transfer
                </Typography>
              </Grid>
              <Grid item className={classes.step}>
                <Grid container direction='row'>
                  <Avatar className={classes.stepIcon}> 1 </Avatar>
                  <Typography align='left' className={classes.stepText}>
                    Log in to enter security answer
                  </Typography>
                </Grid>
              </Grid>
              <Grid item className={classes.step}>
                <Grid container direction='row'>
                  <Avatar className={classes.stepIcon}> 1 </Avatar>
                  <Typography align='left' className={classes.stepText}>
                    Select the wallet to deposit
                  </Typography>
                </Grid>
              </Grid>
              <Grid item className={classes.step}>
                <Grid container direction='row'>
                  <Avatar className={classes.stepIcon}> 1 </Avatar>
                  <Typography align='left' className={classes.stepText}>
                    Accept the transfer
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xl={5} lg={5} md={5}>
          asdsad
        </Grid>

      </Grid>
    )
  }
}

const styles = theme => ({
  landingIllustration: {
    maxWidth: '50%',
    marginBottom: '60px'
  },
  stepTitleContainer: {
    marginBottom: '30px'
  },
  step: {
    marginBottom: '22px'
  },
  stepTitle: {
    color: '#333333',
    fontWeight: 'bold',
    fontSize: '18px'
  },
  stepText: {
    color: '#333333',
    fontSize: '14px'
  },
  stepIcon: {
    height: '25px',
    width: '25px',
    backgroundColor: theme.palette.primary.main,
    marginRight: '9.5px'
  }
})

export default withStyles(styles)(ReceiveLandingPageComponent)
