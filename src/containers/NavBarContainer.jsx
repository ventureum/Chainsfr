import React, { Component } from 'react'
import { connect } from 'react-redux'
import NavBarComponent from '../components/NavBarComponent'
import { onLogout } from '../actions/userActions'
import { backToHome } from '../actions/navigationActions'
import path from '../Paths.js'

class NavBarContainer extends Component {
  backToHome=() => {
    const { location, backToHome } = this.props
    if (location.pathname === path.transfer) {
      backToHome()
    }
  }

  render () {
    let { onLogout, profile } = this.props
    return (
      <NavBarComponent
        onLogout={onLogout}
        profile={profile}
        backToHome={this.backToHome}
      />)
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
    profile: state.userReducer.profile
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NavBarContainer)
