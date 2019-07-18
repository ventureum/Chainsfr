import React from 'react'
import { withStyles } from '@material-ui/core'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'

class FooterComponent extends React.Component {
  render () {
    const { classes } = this.props
    return (
      <footer className={classes.root}>
        <div className={classes.sectionContainer}>
          <Grid container className={classes.linkContainer} direction='row'>
            <Grid item xs={12} sm={3} className={classes.itemContainer}>
              <Grid container justify='center'>
                <Typography className={classes.chainsfrText}>
                  chainsfr
                </Typography>
              </Grid>
            </Grid>
            <Grid item xs={12} sm={5} className={classes.itemContainer}>
              <Typography className={classes.descriptionText}>
                Chainsfr is a cryptocurrency transfer service, powered by Google Drive APIs and Amazon Web Services.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4} className={classes.itemContainer}>
              <Grid container justify='center' alignItems='center'>
                <Grid item>
                  <a
                    href='https://docs.google.com/document/d/e/2PACX-1vScWE32Rzf-z8OYmzS9mKTBcpVftWMbeR_BfbhmeJxHDF4jaiYXyUfPOtGif7mI6RSpoQ19onaawdYE/pub'
                    target='_blank'
                    rel='noopener noreferrer'
                    className={classes.link}
                  >
                    Terms
                  </a>
                </Grid>
                <Grid item>
                  <a
                    target='_blank'
                    rel='noopener noreferrer'
                    href='https://chat.chainsfr.com'
                    className={classes.link}>
                    <i className='fab fa-rocketchat' />
                  </a>
                </Grid>
                <Grid item>
                  <a
                    rel='noopener noreferrer'
                    href='https://twitter.com/chainsfr_com'
                    target='_blank'
                    className={classes.link}>
                    <i className='fab fa-twitter' />
                  </a>
                </Grid>
                <Grid item>
                  <a
                    target='_blank'
                    rel='noopener noreferrer'
                    href='https://github.com/ventureum/Chainsfr'
                    className={classes.link}>
                    <i className='fab fa-github' />
                  </a>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid container direction='column' alignItems='center' justify='center' className={classes.copyRightContainer}>
            <Typography className={classes.copyright}>
              Build {process.env.REACT_APP_VERSION}-{process.env.REACT_APP_ENV}
            </Typography>
            <Grid item >
              <Typography className={classes.copyright}>
                &copy; {'2018 - '}{1900 + new Date().getYear()} All rights reserved.
              </Typography>
            </Grid>
          </Grid>
        </div>
      </footer>
    )
  }
}

const style = theme => ({
  root: {
    backgroundColor: '#333333',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  sectionContainer: {
    width: '100%',
    minHeight: '130px',
    maxWidth: '1200px',
    padding: '50px 0px 20px 0px',
    margin: '0px 20px 0px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  copyright: {
    fontSize: '12px',
    letterSpacing: '0.2px',
    lineHeight: '18px',
    color: '#a8a8a8',
    marginTop: '5px'
  },
  copyRightContainer: {
    height: '100%',
    marginTop: '30px'
  },
  link: {
    color: '#fff',
    textDecoration: 'none',
    marginRight: '20px'
  },
  descriptionText: {
    fontWeight: '400',
    fontSize: '16px',
    color: '#fff',
    margin: '0px 10px 0px 10px'
  },
  chainsfrText: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#fff'
  },
  itemContainer: {
    marginTop: '20px'
  }
})

export default withStyles(style)(FooterComponent)
