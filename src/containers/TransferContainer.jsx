import React, { Component } from 'react'
import { connect } from 'react-redux'
import TransferComponent from '../components/TransferComponent'

class TransferContainer extends Component {
  render () {
    return (
      <TransferComponent step={this.props.step} history={this.props.history} />
    )
  }
}

const mapStateToProps = state => {
  return {
    step: state.navigationReducer.send
  }
}

export default connect(
  mapStateToProps
)(TransferContainer)
