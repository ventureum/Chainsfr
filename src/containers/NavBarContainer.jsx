import React, { Component } from 'react'
import { connect } from 'react-redux'
import NavBarComponent from '../components/NavBarComponent'
import { onLogout } from '../actions/userActions'

class NavBarContainer extends Component {
  render () {
    let { onLogout, profile } = this.props
    return (
      <NavBarComponent
        onLogout={onLogout}
        profile={profile}
      />)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onLogout: () => dispatch(onLogout())
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
