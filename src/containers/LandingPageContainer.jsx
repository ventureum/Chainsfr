import React, { Component } from 'react'

import { connect } from 'react-redux'
import LandingPageComponent from '../components/LandingPageComponent'
import { goToStep } from '../actions/navigationActions'
import { getTransferHistory } from '../actions/transferActions'
import { createLoadingSelector, createErrorSelector } from '../selectors'

class LandingPageContainer extends Component {

  componentDidMount () {
    if (this.props.profile.isAuthenticated) {
      // load transfer history for logged-in users
      this.props.getTransferHistory()
    }
  }

  render () {
    return (
      <LandingPageComponent
        {...this.props}
      />
    )
  }
}

const getTransferHistorySelector = createLoadingSelector(['GET_TRANSFER_HISTORY'])
const errorSelector = createErrorSelector(['GET_TRANSFER_HISTORY'])

const mapStateToProps = state => {
  return {
    transferHistory: state.transferReducer.transferHistory,
    profile: state.userReducer.profile,
    actionsPending: {
      getTransferHistory: getTransferHistorySelector(state)
    },
    error: errorSelector(state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    goToStep: (n) => dispatch(goToStep('send', n)),
    getTransferHistory: () => dispatch(getTransferHistory())
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LandingPageContainer)
