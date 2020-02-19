// @flow
import React, { PureComponent } from 'react'

import { backToHome } from '../actions/navigationActions'
import { connect } from 'react-redux'
import NavDrawerComponent from '../components/NavDrawerComponent'
import { onLogout } from '../actions/userActions'

type Props = {
  location: Object,
  profile: Object,
  onLogout: Function,
  open: boolean,
  handleDrawerToggle: Function,
  backToHome: Function
}

class NaviDrawerContainer extends PureComponent<Props> {
  render () {
    let { location, profile, onLogout, open, handleDrawerToggle, backToHome } = this.props
    return (
      <NavDrawerComponent
        onLogout={onLogout}
        backToHome={backToHome}
        location={location}
        profile={profile}
        open={open}
        handleDrawerToggle={handleDrawerToggle}
      />
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    backToHome: () => dispatch(backToHome()),
    onLogout: () => dispatch(onLogout())
  }
}

const mapStateToProps = state => {
  return {
    profile: state.userReducer.profile
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NaviDrawerContainer)
