import React, { Component } from 'react'

import { connect } from 'react-redux'
import LandingPageComponent from '../components/LandingPageComponent'
import { goToStep } from '../actions/navigationActions'

class LandingPageContainer extends Component {
  render () {
    return (
      <LandingPageComponent
        {...this.props}
      />
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    goToStep: (n) => dispatch(goToStep('send', n))
  }
}

export default connect(
  null,
  mapDispatchToProps
)(LandingPageContainer)
