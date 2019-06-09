// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import Review from '../components/ReviewComponent'
import { submitTx } from '../actions/transferActions'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import { goToStep } from '../actions/navigationActions'

type Props = {
  submitTx: Function,
  gettxFee: Function,
  goToStep: Function,
  transferForm: Object,
  cryptoSelection: string,
  walletSelection: string,
  wallet: Object,
  txFee: Object,
  actionsPending: {
    submitTx: boolean,
    gettxFee: boolean
  },
  error: any
}

class ReviewContainer extends Component<Props> {
  render () {
    return (
      <Review
        {...this.props}
      />
    )
  }
}

const submitTxSelector = createLoadingSelector(['SUBMIT_TX', 'TRANSACTION_HASH_RETRIEVED'])

const errorSelector = createErrorSelector(['SUBMIT_TX', 'TRANSACTION_HASH_RETRIEVED'])

const mapDispatchToProps = dispatch => {
  return {
    submitTx: (txRequest) => dispatch(submitTx(txRequest)),
    goToStep: (n) => dispatch(goToStep('send', n))
  }
}

const mapStateToProps = state => {
  return {
    transferForm: state.formReducer.transferForm,
    cryptoSelection: state.formReducer.cryptoSelection,
    walletSelection: state.formReducer.walletSelection,
    wallet: state.walletReducer.wallet[state.formReducer.walletSelection],
    txFee: state.transferReducer.txFee,
    actionsPending: {
      submitTx: submitTxSelector(state)
    },
    error: errorSelector(state)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReviewContainer)
