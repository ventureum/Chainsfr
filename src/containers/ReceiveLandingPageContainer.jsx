import React, { Component } from 'react'

import ReceiveLandingPageComponent from '../components/ReceiveLandingPageComponent'

class ReceiveLandingPageContainer extends Component {
  render () {
    console.log(this.props)
    return (<ReceiveLandingPageComponent />)
  }
}


export default ReceiveLandingPageContainer
