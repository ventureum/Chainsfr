// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import AppBarComponent from '../components/AppBarComponent'
import { onLogout } from '../actions/userActions'
import queryString from 'query-string'
import { backToHome } from '../actions/navigationActions'
import path from '../Paths.js'

type Props = {
  onLogout: Function,
  profile: Object,
  location: Object,
  cloudWalletConnected: Boolean,
  handleDrawerToggle: Function,
  backToHome: Function
}

class AppBarContainer extends Component<Props> {
  backToHome = () => {
    const { location, backToHome } = this.props
    if (location.pathname === path.transfer) {
      backToHome()
    }
  }

  render () {
    let { onLogout, profile, location, cloudWalletConnected, handleDrawerToggle } = this.props
    const urlParams = queryString.parse(location.search)
    let step = parseInt(urlParams.step) || 0
    const navigatable = ![
      path.transfer,
      path.cancel,
      path.receipt,
      path.receive,
      path.login,
      path.directTransfer
    ].includes(location.pathname)
    return (
      <AppBarComponent
        onLogout={onLogout}
        profile={profile}
        cloudWalletConnected={cloudWalletConnected}
        backToHome={this.backToHome}
        location={location}
        step={step}
        handleDrawerToggle={handleDrawerToggle}
        navigatable={navigatable}
        disabled={!navigatable}
      />
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onLogout: () => dispatch(onLogout()),
    backToHome: () => dispatch(backToHome())
  }
}

const mapStateToProps = state => {
  return {
    profile: state.userReducer.profile,
    cloudWalletConnected: state.userReducer.cloudWalletConnected
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AppBarContainer)
