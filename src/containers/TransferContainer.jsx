// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import TransferComponent from '../components/TransferComponent'
import { clearTransferForm } from '../actions/formActions'
type Props = {
  step: number,
  history: Object,
  clearTransferForm: Function
}

class TransferContainer extends Component<Props> {
  componentWillUnmount () {
    this.props.clearTransferForm()
  }

  render () {
    return <TransferComponent step={this.props.step} history={this.props.history} />
  }
}

const mapDispatchToProps = dispatch => {
  return {
    clearTransferForm: () => dispatch(clearTransferForm())
  }
}
const mapStateToProps = state => {
  return {
    step: state.navigationReducer.send
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TransferContainer)
