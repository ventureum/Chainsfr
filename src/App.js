import React, { Component } from 'react'
import {
  BrowserRouter as Router,
  Route,
  Switch
} from 'react-router-dom'
import { connectedRouterRedirect } from 'redux-auth-wrapper/history4/redirect'
import locationHelperBuilder from 'redux-auth-wrapper/history4/locationHelper'
import LoginContainer from './containers/LoginContainer'
import WalletContainer from './containers/WalletContainer'
import TransferContainer from './containers/TransferContainer'
import Footer from './static/Footer'
import NaviBar from './components/NavBarComponent'
import WalletSelection from './containers/WalletSelectionContainer'
import SetReipientAndPin from './containers/SetReipientAndPinContainer'
import Review from './containers/ReviewContainer'

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
  flexDirection: 'column'
}

const componentStyle = {
  minHeight: '100vh',
  flexDirection: 'column'
}

const DefaultLayout = ({ component: Component, ...rest }) => {
  return (
    <Route {...rest} render={matchProps => (
      <div style={defaultLayoutStyle}>
        <NaviBar />
        <div style={componentStyle}>
          <Component {...matchProps} />
        </div>
        <Footer />
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
          <DefaultLayout path='/Transfer/WalletSelection' component={({...props}) => (
            <TransferContainer component={WalletSelection} {...props} />
          )} />
          <DefaultLayout path='/Transfer/SetReipientAndPin' component={({...props}) => (
            <TransferContainer component={SetReipientAndPin} {...props} />
          )} />
          <DefaultLayout path='/Transfer/Review' component={({...props}) => (
            <TransferContainer component={Review} {...props} />
          )} />
        </Switch>
      </Router>
    )
  }
}

export default App
