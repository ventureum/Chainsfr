import React, { Component } from 'react'
import { connect } from 'react-redux'
import LoginComponent from '../components/LoginComponent'
import OnboardingComponent from '../components/OnboardingComponent'
import { onLogin, register } from '../actions/userActions'
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
    const value = queryString.parse(history.location.search)
    if (value) {
      const redirect = value.redirect
      if (redirect && redirect.includes('/receive?id=')) {
        // get transfer data for receive login page rendering
        const receivingId = queryString.parse(value.redirect.slice(8)).id
        getTransfer(null, receivingId)
        this.setState({ renderReceiveLogin: true })
      }
      if (redirect && redirect.includes('/receipt?')) {
        // get transfer data for receipt login page rendering
        const { transferId, receivingId } = queryString.parse(value.redirect.slice(8))
        getTransfer(transferId, receivingId)
        this.setState({ renderReceiptLogin: true })
      }
    }
  }

  componentDidUpdate (prevProps) {
    let { actionsPending } = this.props

    if (prevProps.actionsPending.register && !actionsPending.register) {
      // try to fetch user's cloud wallet after registration
      this.props.getCloudWallet()
      // fetch user accounts after explicitly logging in
      this.props.getCryptoAccounts()
    }
  }

  onLogin = loginData => {
    // this is what happens after Google login successfully
    // store loginData into redux
    this.props.onLogin(loginData)
    // register user
    this.props.register(loginData.idToken)
  }

  render () {
    let {
      profile,
      transfer,
      actionsPending,
      createCloudWallet,
      cryptoPrice,
      currency,
      error,
      push
    } = this.props

    if (error === 'WALLET_NOT_EXIST') {
      return (
        <OnboardingComponent
          createCloudWallet={createCloudWallet}
          profile={profile}
          actionsPending={actionsPending}
        />
      )
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
        onLogin={this.onLogin}
        actionsPending={actionsPending}
        isMainNet={env.REACT_APP_ENV === 'prod'}
        renderReceiveLogin={this.state.renderReceiveLogin}
        renderReceiptLogin={this.state.renderReceiptLogin}
        transfer={transfer}
        sendTime={sendTime}
        receiveTime={receiveTime}
        cancelTime={cancelTime}
        currencyAmount={currencyAmount}
        push={push}
      />
    )
  }
}

const getTransferSelector = createLoadingSelector(['GET_TRANSFER'])
const registerSelector = createLoadingSelector(['REGISTER'])
const createCloudWalletSelector = createLoadingSelector(['CREATE_CLOUD_WALLET'])
const getCloudWalletSelector = createLoadingSelector(['GET_CLOUD_WALLET'])
const errorSelector = createErrorSelector([
  'CREATE_CLOUD_WALLET',
  'GET_CLOUD_WALLET',
  'REGISTER',
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
      register: registerSelector(state),
      createCloudWallet: createCloudWalletSelector(state),
      getCloudWallet: getCloudWalletSelector(state),
      getTransfer: getTransferSelector(state)
    },
    error: errorSelector(state)
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onLogin: loginData => dispatch(onLogin(loginData)),
    register: idToken => dispatch(register(idToken)),
    getCryptoAccounts: idToken => dispatch(getCryptoAccounts()),
    createCloudWallet: (password, progress) => dispatch(createCloudWallet(password, progress)),
    getCloudWallet: () => dispatch(getCloudWallet()),
    getTransfer: (transferId, receivingId) => dispatch(getTransfer(transferId, receivingId))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginContainer)
