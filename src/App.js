import React, { Component } from 'react'
import {
  BrowserRouter as Router,
  Route,
  Switch
} from 'react-router-dom'
import { connectedRouterRedirect } from 'redux-auth-wrapper/history4/redirect'
import locationHelperBuilder from 'redux-auth-wrapper/history4/locationHelper'
import LoginContainer from './LoginContainer'
import WalletContainer from './WalletContainer'
import TransferContainer from './TransferContainer'

const userIsAuthenticated = connectedRouterRedirect({
  // The url to redirect user to if they fail
  redirectPath: '/login',
  // If selector is true, wrapper will not redirect
  // For example let's check that state contains user data
  authenticatedSelector: state => state.userReducer.profile.isAuthenticated,
  // A nice display name for this check
  wrapperDisplayName: 'UserIsAuthenticated'
})

const locationHelper = locationHelperBuilder({})

const userIsNotAuthenticated = connectedRouterRedirect({
  // This sends the user either to the query param route if we have one, or to the landing page if none is specified and the user is already logged in
  redirectPath: (state, ownProps) => locationHelper.getRedirectQueryParam(ownProps) || '/',
  // This prevents us from adding the query parameter when we send the user away from the login page
  allowRedirectBack: false,
  // If selector is true, wrapper will not redirect
  // So if there is no user data, then we show the page
  authenticatedSelector: state => !state.userReducer.profile.isAuthenticated,
  // A nice display name for this check
  wrapperDisplayName: 'UserIsNotAuthenticated'
})

const defaultLayoutStyle = {
  display: 'flex',
  minHeight: '100vh',
  flexDirection: 'column'
}

const DefaultLayout = ({ component: Component, ...rest }) => {
  return (
    <Route {...rest} render={matchProps => (
      <div style={defaultLayoutStyle}>
        <Component {...matchProps} />
      </div>
    )} />
  )
}

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      auth: false
    }
  }

  render () {
    return (
      <Router>
        <Switch>
          <Route path='/login' component={userIsNotAuthenticated(LoginContainer)} />
          <DefaultLayout exact path='/' component={userIsAuthenticated(WalletContainer)} />
          <DefaultLayout path='/send' component={TransferContainer} />
        </Switch>
      </Router>)
  }
}

export default App
