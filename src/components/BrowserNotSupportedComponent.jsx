import React, { Component } from 'react'
import { Typography, Grid, Button } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import ChromeLogo from '../images/chrome.svg'
class BrowserNotSupportedComponent extends Component {
  render () {
    const { classes } = this.props
    return (
      <Grid container direction='column' justify='center' alignItems='center'>
        <Grid item className={classes.midContainer} >
          <Grid container direction='column' justify='center' >
            <Grid item>
              <Typography className={classes.title}>
                Hmmm, your browser version is not supported.
              </Typography>
            </Grid>
            <Grid item className={classes.subText}>
              <Typography>
                To maxiumize your experience of using Chainsfr,
              </Typography>
            </Grid>
            <Grid item className={classes.subText}>
              <Typography>
                please download the latest Google Chrome.
              </Typography>
            </Grid>
            <Grid item >
              <Grid container direction='column' alignItems='center' className={classes.logoBtnContainer}>
                <Grid item>
                  <img className={classes.chromeLogo} src={ChromeLogo} alt='wallet-logo' />
                </Grid>
                <Grid item>
                  <Button className={classes.btn} target='_blank' href='https://www.google.com/chrome' >
                    <Typography className={classes.btnText}>Download Google Chrome for FREE</Typography>
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    )
  }
}

const styles = theme => ({
  midContainer: {
    maxWidth: '600px',
    width: '100%',
    margin: '90px 10px 30px 10px'
  },
  title: {
    fontWeight: '500',
    color: '#333333',
    fontSize: '24px'
  },
  subText: {
    color: '#777777',
    fontSize: '14px'
  },
  chromeLogo: {
    width: '100px',
    height: '100px',
    margin: '30px 0px 30px 0px'
  },
  logoBtnContainer: {
    margin: '30px 0px 30px 0px'
  },
  btn: {
    padding: '10px 20px 10px 20px',
    border: '1px solid #4285F4',
    borderRadius: '4px',
    textTransform: 'none',
    '&:hover': {
      opacity: 0.9,
      color: '#4285F4'
    }
  },
  btnText: {
    color: '#4285F4',
    fontSize: '14px'
  }
})

export default withStyles(styles)(BrowserNotSupportedComponent)
