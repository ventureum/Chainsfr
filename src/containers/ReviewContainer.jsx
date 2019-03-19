// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import Review from '../components/ReviewComponent'
import { submitTx, getTxCost } from '../actions/transferActions'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import { goToStep } from '../actions/navigationActions'

type Props = {
  submitTx: Function,
  getTxCost: Function,
  goToStep: Function,
  transferForm: Object,
  cryptoSelection: string,
  walletSelection: string,
  wallet: Object,
  txCost: Object,
  actionsPending: {
    submitTx: boolean,
    getTxCost: boolean
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
const getTxCostSelector = createLoadingSelector(['GET_TX_COST'])

const errorSelector = createErrorSelector(['SUBMIT_TX', 'TRANSACTION_HASH_RETRIEVED'])

const mapDispatchToProps = dispatch => {
  return {
    submitTx: (txRequest) => dispatch(submitTx(txRequest)),
    getTxCost: (txRequest) => dispatch(getTxCost(txRequest)),
    goToStep: (n) => dispatch(goToStep('send', n))
  }
}

const mapStateToProps = state => {
  return {
    transferForm: state.formReducer.transferForm,
    cryptoSelection: state.formReducer.cryptoSelection,
    walletSelection: state.formReducer.walletSelection,
    wallet: state.walletReducer.wallet[state.formReducer.walletSelection],
    txCost: state.transferReducer.txCost,
    actionsPending: {
      submitTx: submitTxSelector(state),
      getTxCost: getTxCostSelector(state)
    },
    error: errorSelector(state)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReviewContainer)
