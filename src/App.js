import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
import { connectedRouterRedirect } from 'redux-auth-wrapper/history4/redirect'
import locationHelperBuilder from 'redux-auth-wrapper/history4/locationHelper'
import LoginContainer from './containers/LoginContainer'
import TransferContainer from './containers/TransferContainer'
import ReceiveContainer from './containers/ReceiveContainer'
import CancelContainer from './containers/CancelContainer'
import WalletContainer from './containers/WalletContainer'
import RecipientsContainer from './containers/RecipientsContainer'
import ReferralContainer from './containers/ReferralContainer'
import Footer from './static/Footer'
import NaviBar from './containers/NavBarContainer'
import paths from './Paths'
import { ThemeProvider } from '@material-ui/styles'
import { store, history } from './configureStore'
import LandingPage from './containers/LandingPageContainer'
import { SnackbarProvider } from 'notistack'
import NotifierComponent from './components/NotifierComponent'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import { themeChainsfr } from './styles/theme'
import CookieConsent from 'react-cookie-consent'
import { getCryptoPrice } from './actions/cryptoPriceActions'

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

const loginLayoutStyle = {
  minHeight: '100vh',
  flexDirection: 'column',
  display: 'flex'
}

const componentStyle = {
  minHeight: '100vh',
  flexDirection: 'column'
}

const StyledCookieConsent = () => {
  return (
    <CookieConsent buttonText='Accept' buttonStyle={{ background: '#4285F4', color: 'white' }}>
      This website uses cookies to enhance the user experience.
    </CookieConsent>
  )
}

const DefaultLayout = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={matchProps => (
        <div style={defaultLayoutStyle}>
          <StyledCookieConsent />
          <NaviBar {...matchProps} />
          <div style={componentStyle}>
            <Component {...matchProps} />
          </div>
          <NotifierComponent />
          <Footer />
        </div>
      )}
    />
  )
}

const LoginLayout = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={matchProps => (
        <div style={loginLayoutStyle}>
          <StyledCookieConsent />
          <Component {...matchProps} />
          <NotifierComponent />
        </div>
      )}
    />
  )
}

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      auth: false
    }
    console.info(`Build ${process.env.REACT_APP_VERSION}-${process.env.REACT_APP_ENV}`)
  }

  componentDidMount () {
    // refresh price immediately
    store.dispatch(getCryptoPrice(['bitcoin', 'ethereum', 'dai']))
    // refresh price every 60 seconds
    setInterval(() => store.dispatch(getCryptoPrice(['bitcoin', 'ethereum', 'dai'])), 60000)
  }

  render () {
    return (
      <ThemeProvider theme={themeChainsfr}>
        <Provider store={store}>
          <SnackbarProvider
            action={[
              <IconButton key='close' aria-label='Close' color='inherit'>
                <CloseIcon />
              </IconButton>
            ]}
          >
            <ConnectedRouter history={history}>
              <Switch>
                <LoginLayout
                  path={paths.login}
                  component={userIsNotAuthenticated(LoginContainer)}
                />
                <DefaultLayout
                  exact
                  path={paths.home}
                  component={userIsAuthenticated(LandingPage)}
                />
                <DefaultLayout
                  exact
                  path={paths.wallet}
                  component={userIsAuthenticated(WalletContainer)}
                />
                <DefaultLayout
                  path={`${paths.transfer}`}
                  component={userIsAuthenticated(TransferContainer)}
                />
                <DefaultLayout
                  path={`${paths.receive}`}
                  component={userIsAuthenticated(ReceiveContainer)}
                />
                <DefaultLayout
                  path={`${paths.cancel}`}
                  component={userIsAuthenticated(CancelContainer)}
                />
                <DefaultLayout
                  path={`${paths.recipients}`}
                  component={userIsAuthenticated(RecipientsContainer)}
                />
                <DefaultLayout
                  path={`${paths.referral}`}
                  component={userIsAuthenticated(ReferralContainer)}
                />
              </Switch>
            </ConnectedRouter>
          </SnackbarProvider>
        </Provider>
      </ThemeProvider>
    )
  }
}

export default App
