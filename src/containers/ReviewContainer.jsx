// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import Review from '../components/ReviewComponent'
import { submitTx } from '../actions/transferActions'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import { goToStep } from '../actions/navigationActions'
import utils from '../utils'

type Props = {
  submitTx: Function,
  getTxFee: Function,
  goToStep: Function,
  transferForm: Object,
  wallet: Object,
  txFee: Object,
  cryptoPrice: Object,
  currency: string,
  actionsPending: {
    submitTx: boolean,
    getTxFee: boolean
  },
  error: any
}

class ReviewContainer extends Component<Props> {
  render () {
    const { cryptoPrice, txFee, transferForm, currency } = this.props
    const toCurrencyAmount = cryptoAmount =>
      utils.toCurrencyAmount(cryptoAmount, cryptoPrice[transferForm.accountId.cryptoType], currency)
    return (
      <Review
        {...this.props}
        currencyAmount={{
          transferAmount: transferForm && toCurrencyAmount(transferForm.transferAmount),
          txFee: txFee && toCurrencyAmount(txFee.costInStandardUnit)
        }}
      />
    )
  }
}

const submitTxSelector = createLoadingSelector(['SUBMIT_TX', 'TRANSACTION_HASH_RETRIEVED'])

const errorSelector = createErrorSelector(['SUBMIT_TX', 'TRANSACTION_HASH_RETRIEVED'])

const mapDispatchToProps = dispatch => {
  return {
    submitTx: txRequest => dispatch(submitTx(txRequest)),
    goToStep: n => dispatch(goToStep('send', n))
  }
}

const mapStateToProps = state => {
  return {
    userProfile: state.userReducer.profile.profileObj,
    transferForm: state.formReducer.transferForm,
    txFee: state.transferReducer.txFee,
    cryptoPrice: state.cryptoPriceReducer.cryptoPrice,
    currency: state.cryptoPriceReducer.currency,
    actionsPending: {
      submitTx: submitTxSelector(state)
    },
    error: errorSelector(state)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ReviewContainer)
