import React, { Component } from 'react'
import { connect } from 'react-redux'
import Review from '../components/ReviewComponent'
import { submitTx } from '../actions'

class ReviewContainer extends Component {
  render () {
    return (
      <Review
        {...this.props}
      />
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    submitTx: (txRequest) => dispatch(submitTx(txRequest))
  }
}

const mapStateToProps = state => {
  return {
    transferForm: state.transferReducer.transferForm,
    cryptoSelection: state.transferReducer.cryptoSelection,
    walletSelection: state.transferReducer.walletSelection,
    metamask: state.userReducer.metamask
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReviewContainer)
