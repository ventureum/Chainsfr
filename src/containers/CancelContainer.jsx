import React, { Component } from 'react'
import { connect } from 'react-redux'
import CancelComponent from '../components/CancelComponent'

class CancelContainer extends Component {
  render () {
    return (
      <CancelComponent step={this.props.step} history={this.props.history} />
    )
  }
}

const mapStateToProps = state => {
  return {
    step: state.navigationReducer.cancel
  }
}

export default connect(
  mapStateToProps
)(CancelContainer)
