import React, { Component } from 'react'

import { connect } from 'react-redux'
import queryString from 'query-string'
import CancelReviewComponent from '../components/ReceiveLandingPageComponent'
import { getTransfer } from '../actions/transferActions'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import { goToStep } from '../actions/navigationActions'
import { verifyPassword } from '../actions/walletActions'

class CancelReviewContainer extends Component {
  state = {
    password: null
  }

  componentDidMount () {
    let { location } = this.props
    const value = queryString.parse(location.search)
    this.setState({password: value.pwd})
    this.props.getTransfer(value.id)
  }

  componentDidUpdate () {
    let { transfer } = this.props
    if (transfer) {
      // now decrypt wallet
      this.props.verifyPassword(transfer.data, this.state.password)
    }
  }

  render () {
    return (
      <CancelReviewComponent
        {...this.props}
      />
    )
  }
}

const getTransferSelector = createLoadingSelector(['GET_TRANSFER'])
const verifyPasswordSelector = createLoadingSelector(['VERIFY_PASSWORD'])
const errorSelector = createErrorSelector(['GET_TRANSFER'])

const mapDispatchToProps = dispatch => {
  return {
    getTransfer: (id) => dispatch(getTransfer({id})),
    verifyPassword: (encriptedWallet, password) => dispatch(verifyPassword(encriptedWallet, password)),
    goToStep: (n) => dispatch(goToStep('receive', n))
  }
}

const mapStateToProps = state => {
  return {
    transfer: state.transferReducer.transfer,
    escrowWallet: state.walletReducer.escrowWallet,
    actionsPending: {
      getTransfer: getTransferSelector(state),
      verifyPassword: verifyPasswordSelector(state)
    },
    error: errorSelector(state)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CancelReviewContainer)
