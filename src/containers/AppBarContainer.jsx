// @flow
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { createLoadingSelector } from '../selectors'

import AppBarComponent from '../components/AppBarComponent'
import { onLogout } from '../actions/userActions'
import queryString from 'query-string'
import { backToHome } from '../actions/navigationActions'
import { push } from 'connected-react-router'
import path from '../Paths.js'

type Props = {|
  disabled: boolean,
  onLogout: Function,
  profile: Object,
  location: Object,
  isolate: boolean,
  handleDrawerToggle: Function,
  backToHome: Function,
  push: Function,
  isMainNet: boolean
|}

class AppBarContainer extends Component<Props> {
  backToHome = () => {
    const { backToHome } = this.props
    backToHome()
  }

  onSetting = () => {
    this.props.push(path.userSetting)
  }

  render () {
    let { location } = this.props
    // recover '&' from encoded '&amp;'
    // used for intercom product tour
    const urlParams = queryString.parse(location.search.replace(/amp%3B|amp;/g, ''))
    let step = parseInt(urlParams.step) || 0

    return (
      <AppBarComponent
        backToHome={this.backToHome}
        onSetting={this.onSetting}
        step={step}
        {...this.props}
      />
    )
  }
}

const loadingSelector = createLoadingSelector([
  'DECRYPT_CLOUD_WALLET_ACCOUNT',
  'VERIFY_ESCROW_ACCOUNT_PASSWORD',
  'DIRECT_TRANSFER',
  'SUBMIT_TX',
  'VERIFY_ACCOUNT',
  'ACCEPT_TRANSFER',
  'CANCEL_TRANSFER',
  'GET_TX_COST',
  'GET_TRANSFER_PASSWORD',
  'SET_TOKEN_ALLOWANCE_WAIT_FOR_CONFIRMATION'
])

const mapDispatchToProps = dispatch => {
  return {
    onLogout: () => dispatch(onLogout()),
    backToHome: () => dispatch(backToHome()),
    push: path => dispatch(push(path))
  }
}

const mapStateToProps = state => {
  return {
    profile: state.userReducer.profile,
    disabled: loadingSelector(state)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AppBarContainer)
