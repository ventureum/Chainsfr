import React, { Component } from 'react'

import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'

class SquareButtonComponent extends Component {
  render () {
    const { classes, disabled, selected, onClick, logo, title, desc } = this.props
    let btnStyle = classes.btn
    let btnTitleStyle = classes.btnTitle
    let btnDescStyle = classes.btnDesc

    if (disabled) {
      btnStyle = classes.btnDisabled
      btnTitleStyle = classes.btnTitleDisabled
      btnDescStyle = classes.btnDescDisabled
    }

    if (selected) {
      btnStyle = classes.btnSelected
      btnTitleStyle = classes.btnTitleSelected
      btnDescStyle = classes.btnDescSelected
    }

    return (
      <Grid className={btnStyle} container direction='column' jutify='center' alignItems='center' onClick={onClick}>
        <Grid item>
          <img className={classes.btnLogo} src={logo} alt='wallet-logo' />
        </Grid>
        <Grid item>
          <Typography className={btnTitleStyle} align='center'>
            {title}
          </Typography>
        </Grid>
        <Grid item>
          <Typography className={btnDescStyle} align='center'>
            {desc}
          </Typography>
        </Grid>
      </Grid>
    )
  }
}

const styles = theme => ({
  btn: {
    width: '180px',
    height: '230px',
    padding: '10px 15px 25px',
    marginLeft: '10px',
    marginRight: '10px',
    borderRadius: '5px',
    backgroundColor: '#fff',
    transition: 'all .3s ease'
  },
  btnSelected: {
    width: '180px',
    height: '230px',
    padding: '10px 15px 25px',
    marginLeft: '10px',
    marginRight: '10px',
    borderRadius: '5px',
    backgroundColor: '#05c0a5',
    transition: 'all .3s ease'
  },
  btnDisabled: {
    width: '180px',
    height: '230px',
    padding: '10px 15px 25px',
    marginLeft: '10px',
    marginRight: '10px',
    borderRadius: '5px',
    backgroundColor: '#fff',
    transition: 'all .3s ease'
  },
  btnLogo: {
    height: '100px'
  },
  btnTitle: {
    fontWeight: '500',
    fontSize: '20px',
    marginBottom: '10px'
  },
  btnDesc: {
    lineHeight: '20px',
    color: '#506175',
    fontSize: '14px'
  },
  btnTitleDisabled: {
    fontWeight: '500',
    fontSize: '20px',
    marginBottom: '10px'
  },
  btnDescDisabled: {
    lineHeight: '20px',
    color: '#506175',
    fontSize: '14px'
  },
  btnTitleSelected: {
    fontWeight: '500',
    fontSize: '20px',
    marginBottom: '10px',
    color: 'white'
  },
  btnDescSelected: {
    lineHeight: '20px',
    fontSize: '14px',
    color: 'white'
  }
})

export default withStyles(styles)(SquareButtonComponent)
