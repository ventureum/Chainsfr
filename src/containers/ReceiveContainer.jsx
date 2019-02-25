import React, { Component } from 'react'
import { connect } from 'react-redux'
import ReceiveComponent from '../components/ReceiveComponent'

class ReceiveContainer extends Component {
  render () {
    return (
      <ReceiveComponent step={this.props.step} history={this.props.history} />
    )
  }
}

const mapStateToProps = state => {
  return {
    step: state.navigationReducer.receive
  }
}

export default connect(
  mapStateToProps
)(ReceiveContainer)
