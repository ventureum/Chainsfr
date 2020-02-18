// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import DirectTransferComponent from '../components/DirectTransferComponent'
import { clearTransferForm } from '../actions/formActions'
type Props = {
  step: number,
  history: Object,
  clearTransferForm: Function,
  transferForm: Object,
  online: boolean
}

class DirectTransferContainer extends Component<Props> {
  componentWillUnmount () {
    this.props.clearTransferForm()
  }

  render () {
    return <DirectTransferComponent history={this.props.history} transferForm={this.props.transferForm} online={this.props.online}/>
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

export default connect(mapStateToProps, mapDispatchToProps)(DirectTransferContainer)
