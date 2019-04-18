import React, { Component } from 'react'

import { connect } from 'react-redux'
import FAQComponent from '../components/FAQComponent'

class FAQContainer extends Component {
  render () {
    return (
      <FAQComponent
        {...this.props}
      />
    )
  }
}

const mapStateToProps = state => {
  return {
    navigation: state.navigationReducer,
    location: state.router.location
  }
}

export default connect(
  mapStateToProps
)(FAQContainer)
