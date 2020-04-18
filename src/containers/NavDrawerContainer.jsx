// @flow
import React, { PureComponent } from 'react'

import { backToHome } from '../actions/navigationActions'
import { connect } from 'react-redux'
import NavDrawerComponent from '../components/NavDrawerComponent'
import { onLogout } from '../actions/userActions'
import { push } from 'connected-react-router'
import path from '../Paths.js'

type Props = {
  location: Object,
  profile: Object,
  onLogout: Function,
  open: boolean,
  push: Function,
  handleDrawerToggle: Function,
  backToHome: Function,
  isMainNet: boolean
}

class NaviDrawerContainer extends PureComponent<Props> {
  onSetting = () => {
    this.props.push(path.userSetting)
  }

  render () {
    let {
      location,
      profile,
      onLogout,
      open,
      handleDrawerToggle,
      backToHome,
      isMainNet
    } = this.props
    return (
      <NavDrawerComponent
        onSetting={this.onSetting}
        onLogout={onLogout}
        backToHome={backToHome}
        location={location}
        profile={profile}
        open={open}
        handleDrawerToggle={handleDrawerToggle}
        isMainNet={isMainNet}
      />
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    backToHome: () => dispatch(backToHome()),
    onLogout: () => dispatch(onLogout()),
    push: path => dispatch(push(path))
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
)(NaviDrawerContainer)
