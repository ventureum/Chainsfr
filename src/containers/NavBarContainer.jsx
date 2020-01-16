import React, { Component } from 'react'
import { connect } from 'react-redux'
import NavBarComponent from '../components/NavBarComponent'
import { onLogout } from '../actions/userActions'
import queryString from 'query-string'
import { backToHome } from '../actions/navigationActions'
import path from '../Paths.js'

class NavBarContainer extends Component {
  backToHome = () => {
    const { location, backToHome } = this.props
    if (location.pathname === path.transfer) {
      backToHome()
    }
  }

  render () {
    let { onLogout, profile, location, cloudWalletConnected } = this.props
    const urlParams = queryString.parse(location.search)
    let step = parseInt(urlParams.step)
    return (
      <NavBarComponent
        onLogout={onLogout}
        profile={profile}
        cloudWalletConnected={cloudWalletConnected}
        backToHome={this.backToHome}
        location={location}
        step={step}
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

export default connect(mapStateToProps, mapDispatchToProps)(NavBarContainer)
