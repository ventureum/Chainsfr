import React, { Component } from 'react'

import { connect } from 'react-redux'
import queryString from 'query-string'
import ReceiveLandingPageComponent from '../components/ReceiveLandingPageComponent'
import { getTransfer } from '../actions/transferActions'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import { goToStep } from '../actions/navigationActions'

class ReceiveLandingPageContainer extends Component {
  componentDidMount () {
    let { location } = this.props
    const value = queryString.parse(location.search)
    this.props.getTransfer(value.id)
  }

  render () {
    return (
      <ReceiveLandingPageComponent
        {...this.props}
      />
    )
  }
}

const getTransferSelector = createLoadingSelector(['GET_TRANSFER'])
const errorSelector = createErrorSelector(['GET_TRANSFER'])

const mapDispatchToProps = dispatch => {
  return {
    getTransfer: (id) => dispatch(getTransfer(null, id)),
    goToStep: (n) => dispatch(goToStep('receive', n))
  }
}

const mapStateToProps = state => {
  return {
    transfer: state.transferReducer.transfer,
    actionsPending: {
      getTransfer: getTransferSelector(state)
    },
    error: errorSelector(state)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReceiveLandingPageContainer)
