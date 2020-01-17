import React, { Component } from 'react'
import { connect } from 'react-redux'
import ReceiveComponent from '../components/ReceiveComponent'
import { getTransfer } from '../actions/transferActions'
import utils from '../utils'

class ReceiveContainer extends Component {
  render () {
    const { history, escrowAccount, transfer, accountSelection, getTransfer, receipt } = this.props
    return (
      <ReceiveComponent
        getTransfer={getTransfer}
        history={history}
        escrowAccount={escrowAccount}
        transfer={transfer}
        accountSelection={accountSelection}
        receipt={receipt}
      />
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    getTransfer: id => dispatch(getTransfer(null, id))
  }
}

const mapStateToProps = state => {
  return {
    escrowAccount: state.accountReducer.escrowAccount,
    transfer: state.transferReducer.transfer,
    accountSelection: state.accountReducer.cryptoAccounts.find(_account =>
      utils.accountsEqual(_account, state.formReducer.transferForm.accountId)
    ),
    receipt: state.transferReducer.receipt
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ReceiveContainer)
