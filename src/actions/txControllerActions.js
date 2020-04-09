function txControllerUpdateTransactions (transactions: Object) {
  return {
    type: 'TX_CONTROLLER_UPDATE_TRANSACTION',
    payload: transactions
  }
}

export { txControllerUpdateTransactions }
