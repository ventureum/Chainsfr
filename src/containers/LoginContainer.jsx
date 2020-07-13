import React, { Component } from 'react'
import { connect } from 'react-redux'
import LoginComponent from '../components/LoginComponent'
import PreloadingComponent from '../components/PreloadingComponent'
import { onGoogleLoginReturn, postLoginPreparation } from '../actions/userActions'
import { createCloudWallet, getCloudWallet } from '../actions/walletActions'
import { getCryptoAccounts } from '../actions/accountActions'
import { getTransfer } from '../actions/transferActions'
import { createLoadingSelector, createErrorSelector } from '../selectors'
import env from '../typedEnv'
import queryString from 'query-string'
import utils from '../utils'
import moment from 'moment'

class LoginContainer extends Component {
  state = { renderReceiveLogin: false, renderReceiptLogin: false }
  componentDidMount () {
    const { history, getTransfer } = this.props
    // recover '&' from encoded '&amp;'
    // used for intercom product tour
    const value = queryString.parse(history.location.search.replace(/amp%3B|amp;/g, ''))
    if (value) {
      const redirect = value.redirect
      if (redirect && redirect.includes('/receive?id=')) {
        // get transfer data for receive login page rendering
        const receivingId = queryString.parse(value.redirect.slice(8)).id
        getTransfer(null, receivingId)
        this.setState({ renderReceiveLogin: true })
      }
      if (redirect && redirect.includes('/receipt')) {
        // get transfer data for receipt login page rendering
        const { transferId, receivingId } = queryString.parse(value.redirect.slice(8))
        getTransfer(transferId, receivingId)
        this.setState({ renderReceiptLogin: true })
      }
    }
  }

  onGoogleLoginReturn = loginData => {
    this.props.postLoginPreparation(loginData)
  }

  render () {
    let { transfer, actionsPending, cryptoPrice, currency, push, history } = this.props

    if (actionsPending.postLoginPreparation) {
      return <PreloadingComponent actionsPending={actionsPending} />
    }

    if (transfer) {
      const { sendTimestamp, receiveTimestamp, cancelTimestamp } = transfer
      var sendTime = moment.unix(sendTimestamp).format('MMM Do YYYY, HH:mm:ss')
      if (receiveTimestamp) {
        var receiveTime = moment.unix(receiveTimestamp).format('MMM Do YYYY, HH:mm:ss')
      }
      if (cancelTimestamp)
        var cancelTime = moment.unix(cancelTimestamp).format('MMM Do YYYY, HH:mm:ss')
      var toCurrencyAmount = cryptoAmount =>
        utils.toCurrencyAmount(cryptoAmount, cryptoPrice[transfer.cryptoType], currency)
      var currencyAmount = {
        transferAmount: toCurrencyAmount(transfer.transferAmount)
      }
    }

    return (
      <LoginComponent
        onGoogleLoginReturn={this.onGoogleLoginReturn}
        isMainNet={env.REACT_APP_ENV === 'prod'}
        renderReceiveLogin={this.state.renderReceiveLogin}
        renderReceiptLogin={this.state.renderReceiptLogin}
        transfer={transfer}
        sendTime={sendTime}
        receiveTime={receiveTime}
        cancelTime={cancelTime}
        currencyAmount={currencyAmount}
        push={push}
        path={history.location.pathname || '/login'}
      />
    )
  }
}

const getTransferSelector = createLoadingSelector(['GET_TRANSFER'])
const postLoginPreparationSelector = createLoadingSelector(['POST_LOGIN_PREPARATION'])
const createCloudWalletSelector = createLoadingSelector(['CREATE_CLOUD_WALLET'])
const getCloudWalletSelector = createLoadingSelector(['GET_CLOUD_WALLET'])
const errorSelector = createErrorSelector([
  'CREATE_CLOUD_WALLET',
  'GET_CLOUD_WALLET',
  'POST_LOGIN_PREPARATION',
  'GET_CRYPTO_ACCOUNTS',
  'GET_TRANSFER'
])

const mapStateToProps = state => {
  return {
    transfer: state.transferReducer.transfer,
    profile: state.userReducer.profile,
    cloudWalletConnected: state.userReducer.cloudWalletConnected,
    cryptoPrice: state.cryptoPriceReducer.cryptoPrice,
    currency: state.cryptoPriceReducer.currency,
    actionsPending: {
      postLoginPreparation: postLoginPreparationSelector(state),
      createCloudWallet: createCloudWalletSelector(state),
      getCloudWallet: getCloudWalletSelector(state),
      getTransfer: getTransferSelector(state)
    },
    error: errorSelector(state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onGoogleLoginReturn: loginData => dispatch(onGoogleLoginReturn(loginData)),
    postLoginPreparation: (idToken, userProfile) =>
      dispatch(postLoginPreparation(idToken, userProfile)),
    getCryptoAccounts: idToken => dispatch(getCryptoAccounts()),
    createCloudWallet: (password, progress) => dispatch(createCloudWallet(password, progress)),
    getCloudWallet: () => dispatch(getCloudWallet()),
    getTransfer: (transferId, receivingId) => dispatch(getTransfer(transferId, receivingId))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LoginContainer)
