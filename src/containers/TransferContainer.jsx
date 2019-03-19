// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import TransferComponent from '../components/TransferComponent'

type Props = {
  step: number,
  history: Object
}

class TransferContainer extends Component<Props> {
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
