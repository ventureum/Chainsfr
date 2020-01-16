// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import TransferComponent from '../components/TransferComponent'
import { clearTransferForm } from '../actions/formActions'
type Props = {
  step: number,
  history: Object,
  clearTransferForm: Function,
  transferForm: Object
}

class TransferContainer extends Component<Props> {
  componentWillUnmount () {
    this.props.clearTransferForm()
  }

  render () {
    return <TransferComponent history={this.props.history} transferForm={this.props.transferForm} />
  }
}

const mapDispatchToProps = dispatch => {
  return {
    clearTransferForm: () => dispatch(clearTransferForm())
  }
}
const mapStateToProps = state => {
  return {
    transferForm: state.formReducer.transferForm
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TransferContainer)
