import React, { Component } from 'react'
import { connect } from 'react-redux'
import TransferComponent from './TransferComponent'
import { transfer, checkMetamaskConnection, submitTx, checkLedgerNanoSConnection } from './actions'

class TransferContainer extends Component {
  render () {
    const { open, onClose, transfer, submitTx, checkMetamaskConnection, metamask, wallet, checkLedgerNanoSConnection, ledgerNanoS } = this.props
    return (
      <TransferComponent
        open={open}
        onClose={onClose}
        wallet={wallet}
        metamask={metamask}
        transfer={transfer}
        submitTx={submitTx}
        checkMetamaskConnection={checkMetamaskConnection}
        ledgerNanoS={ledgerNanoS}
        checkLedgerNanoSConnection={checkLedgerNanoSConnection}
      />
    )
  }
}

const mapDispatchToProps = dispatch => {
  return {
    transfer: (fromWallet, pin, value, destination) => dispatch(transfer(fromWallet, pin, value, destination)),
    checkMetamaskConnection: () => dispatch(checkMetamaskConnection(dispatch)),
    submitTx: (txRequest) => dispatch(submitTx(txRequest)),
    checkLedgerNanoSConnection: () => dispatch(checkLedgerNanoSConnection())
  }
}

const mapStateToProps = state => {
  return {
    wallet: state.userReducer.wallet,
    metamask: state.userReducer.metamask,
    ledgerNanoS: state.userReducer.ledgerNanoS
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TransferContainer)
