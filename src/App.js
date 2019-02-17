import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
import { connectedRouterRedirect } from 'redux-auth-wrapper/history4/redirect'
import locationHelperBuilder from 'redux-auth-wrapper/history4/locationHelper'
import LoginContainer from './containers/LoginContainer'
import WalletContainer from './containers/WalletContainer'
import TransferContainer from './containers/TransferContainer'
import ReceiveContainer from './containers/ReceiveContainer'
import ReceiveLandingPageContainer from './containers/ReceiveLandingPageContainer'
import Footer from './static/Footer'
import NaviBar from './components/NavBarComponent'
import paths from './Paths'
import { MuiThemeProvider, createMuiTheme, withStyles } from '@material-ui/core/styles'
import { store, history } from './configureStore'

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
      <MuiThemeProvider theme={theme}>
        <Provider store={store}>
          <ConnectedRouter history={history}>
            <Switch>
              <Route path={paths.login} component={userIsNotAuthenticated(LoginContainer)} />
              <DefaultLayout exact path={paths.home} component={userIsAuthenticated(WalletContainer)} />
              <DefaultLayout path={`${paths.transfer}/:step`} component={TransferContainer} />
              <DefaultLayout exact path={`${paths.receive}`} component={ReceiveLandingPageContainer} />
              <DefaultLayout path={`${paths.receive}/:step`} component={ReceiveContainer} />
            </Switch>
          </ConnectedRouter>
        </Provider>
      </MuiThemeProvider>
    )
  }
}

const theme = createMuiTheme({
  palette: {
    primary: {
      light: '#757ce8',
      main: '#3f50b5',
      dark: '#002884',
      contrastText: '#fff'
    },
    secondary: {
      light: '#ff7961',
      main: '#f44336',
      dark: '#ba000d',
      contrastText: '#000'
    }
  }
})

export default withStyles(theme)(App)
