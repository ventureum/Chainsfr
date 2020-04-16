import React, { Component, useState } from 'react'
import { Switch, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
import { connectedRouterRedirect } from 'redux-auth-wrapper/history4/redirect'
import Box from '@material-ui/core/Box'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import locationHelperBuilder from 'redux-auth-wrapper/history4/locationHelper'
import LoginContainer from './containers/LoginContainer'
import DirectTransferContainer from './containers/DirectTransferContainer'
import Disconnect from './components/MicroComponents/Disconnect'
import TransferContainer from './containers/TransferContainer'
import ReceiveContainer from './containers/ReceiveContainer'
import CancelContainer from './containers/CancelContainer'
import WalletContainer from './containers/WalletContainer'
import RecipientsContainer from './containers/RecipientsContainer'
import ReceiptContainer from './containers/ReceiptContainer'
import AccountsManagementContainer from './containers/AccountsManagementContainer'
import OAuthRedirectComponent from './components/OAuthRedirectComponent'
import UserSettingContainer from './containers/UserSettingContainer'
import AppBar from './containers/AppBarContainer'
import NavDrawer from './containers/NavDrawerContainer'
import paths from './Paths'
import { ThemeProvider } from '@material-ui/styles'
import { store, history, persistor } from './configureStore'
import LandingPage from './containers/LandingPageContainer'
import { SnackbarProvider } from 'notistack'
import NotifierComponent from './components/NotifierComponent'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import { themeChainsfr } from './styles/theme'
import CookieConsent from 'react-cookie-consent'
import { getCryptoPrice } from './actions/cryptoPriceActions'
import { onLogout, refreshAccessToken, postLoginPreparation } from './actions/userActions'
import { enqueueSnackbar, closeSnackbar } from './actions/notificationActions'
import { Detector } from 'react-detect-offline'
import { Hidden } from '@material-ui/core'
import { PersistGate } from 'redux-persist/integration/react'
import moment from 'moment'
import { erc20TokensList } from './erc20Tokens'
import { usePageVisibility } from 'react-page-visibility'
import env from './typedEnv'

const userIsAuthenticated = connectedRouterRedirect({
  // The url to redirect user to if they fail
  redirectPath: '/login',
  // If selector is true, wrapper will not redirect
  // For example let's check that state contains user data
  authenticatedSelector: state => {
    return state.userReducer.profile.isAuthenticated && state.userReducer.cloudWalletConnected
  },
  // A nice display name for this check
  wrapperDisplayName: 'UserIsAuthenticated'
})

const locationHelper = locationHelperBuilder({})

const userIsNotAuthenticated = connectedRouterRedirect({
  // This sends the user either to the query param route *if we have one, or to the landing page if none is specified and the user is already logged in
  redirectPath: (state, ownProps) => locationHelper.getRedirectQueryParam(ownProps) || '/',
  // This prevents us from adding the query parameter when we send the user away from the login page
  allowRedirectBack: false,
  // If selector is true, wrapper will not redirect
  // So if there is no user data, then we show the page
  authenticatedSelector: state =>
    !state.userReducer.profile.isAuthenticated || !state.userReducer.cloudWalletConnected,
  // A nice display name for this check
  wrapperDisplayName: 'UserIsNotAuthenticated'
})

const StyledCookieConsent = () => {
  const matches = useMediaQuery('(max-width:620px)')
  return (
    <CookieConsent
      style={{ justifyContent: 'flex-start', alignItems: 'center' }}
      contentStyle={{ flex: 'none', maxWidth: matches ? 300 : undefined }}
      buttonText='Accept'
      buttonStyle={{ background: '#4285F4', color: 'white', marginRight: 120 }}
    >
      This website uses cookies to enhance the user experience.
    </CookieConsent>
  )
}

const LoginLayout = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={matchProps => (
        <Box display='flex' flexDirection='column' minHeight='100vh'>
          <StyledCookieConsent />
          <Component {...matchProps} />
          <NotifierComponent />
        </Box>
      )}
    />
  )
}

let offlineNotification = null

const DefaultLayout = ({ component: Component, isolate, ...rest }) => {
  // isolate flag is used to toggle leftside navigation drawer
  // while isolate is true, users are not allow to navigate between paths
  const [openDrawer, setOpenDrawer] = useState(false)
  const handleDrawerToggle = () => {
    setOpenDrawer(previous => !previous)
  }

  const isVisible = env.NODE_ENV === 'development' ? true : usePageVisibility()

  return (
    <Route
      {...rest}
      render={matchProps => (
        <Detector
          polling
          render={({ online }) => {
            if (!online && isVisible) {
              offlineNotification = setTimeout(() => {
                store.dispatch(
                  enqueueSnackbar({
                    message: 'No Internet connection',
                    key: 'offline',
                    options: { variant: 'error', persist: true }
                  })
                )
              }, 3000)
            } else {
              clearTimeout(offlineNotification)
              store.dispatch(closeSnackbar('offline'))
            }
            if (isolate) {
              return (
                <Box display='flex' flexDirection='column' minHeight='100vh' alignItems='stretch'>
                  <AppBar {...matchProps} online={online} isolate={isolate} />
                  <Box>
                    <Component {...matchProps} online={online} />
                  </Box>
                  <StyledCookieConsent />
                  <NotifierComponent />
                </Box>
              )
            }
            return (
              <Box display='flex' flexDirection='row' minHeight='100vh' alignItems='stretch'>
                <NavDrawer
                  {...matchProps}
                  online={online}
                  open={openDrawer}
                  handleDrawerToggle={handleDrawerToggle}
                />
                <Box display='flex' flexDirection='column' flex='1' minHeight='100vh'>
                  <Hidden only={['sm', 'md', 'lg', 'xl']}>
                    <AppBar
                      {...matchProps}
                      online={online}
                      handleDrawerToggle={handleDrawerToggle}
                    />
                  </Hidden>
                  <Box>
                    <Component {...matchProps} online={online} />
                  </Box>
                </Box>
                <StyledCookieConsent />
                <NotifierComponent />
              </Box>
            )
          }}
        />
      )}
    />
  )
}

const LoginLayoutSwitch = props => {
  const query = props.location.search
  if (query.includes('?redirect=%2Freceipt') || query.includes('?redirect=%2Freceive')) {
    // special cases
    // use default layout for receipt and receive before authentication
    return <DefaultLayout {...props} />
  } else {
    return <LoginLayout {...props} />
  }
}

class App extends Component {
  constructor (props) {
    super(props)
    console.info(`Build ${process.env.REACT_APP_VERSION}-${process.env.REACT_APP_ENV}`)
    this.state = {
      preloadFinished: false
    }
  }

  // Do all the precheck inside this function
  // once it's finished, it sets preloadFinished flag to true.
  preload = async () => {
    const { profile } = store.getState().userReducer

    if (profile.isAuthenticated) {
      // check if access token has expired
      // note that tokenObj.expires_at is in milliseconds
      const accessTokenExpiresAt = profile.tokenObj.expires_at / 1000.0
      if (moment().unix() > accessTokenExpiresAt) {
        // if access token expires, logout
        await store.dispatch(onLogout())
      } else {
        store.dispatch(postLoginPreparation(profile))
        // if access token is still valid
        // refresh access token to make sure it is valid in the next one hour
        await store.dispatch(refreshAccessToken())
        // if timer exist, cancel it
        if (window.tokenRefreshTimer) clearInterval(window.tokenRefreshTimer)
        // refresh in 50 mins
        // use interval instead of timeout to avoid
        // in some cases token is not refreshed
        window.tokenRefreshTimer = setInterval(() => {
          store.dispatch(refreshAccessToken())
        }, 1000 * 60 * 50)
      }
    }

    this.setState({ preloadFinished: true })
  }

  componentDidMount () {
    this.preload()

    // refresh price immediately
    store.dispatch(getCryptoPrice(['bitcoin', 'ethereum', ...erc20TokensList]))
    // refresh price every 60 seconds
    setInterval(
      () => store.dispatch(getCryptoPrice(['bitcoin', 'ethereum', ...erc20TokensList])),
      60000
    )
  }

  render () {
    if (!this.state.preloadFinished) {
      return null
    }

    return (
      <ThemeProvider theme={themeChainsfr}>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
          <SnackbarProvider
            action={[
              <IconButton key='close' aria-label='Close' color='inherit'>
                <CloseIcon />
              </IconButton>
            ]}
          >
            <ConnectedRouter history={history}>
              <Switch>
                <LoginLayoutSwitch
                  path={paths.login}
                  isolate
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
                  isolate
                  path={`${paths.directTransfer}`}
                  component={userIsAuthenticated(DirectTransferContainer)}
                />
                <DefaultLayout
                  path={`${paths.transfer}`}
                  isolate
                  component={userIsAuthenticated(TransferContainer)}
                />
                <DefaultLayout
                  path={`${paths.receive}`}
                  isolate
                  component={userIsAuthenticated(ReceiveContainer)}
                />
                <DefaultLayout
                  path={`${paths.cancel}`}
                  isolate
                  component={userIsAuthenticated(CancelContainer)}
                />
                <DefaultLayout
                  path={`${paths.contacts}`}
                  component={userIsAuthenticated(RecipientsContainer)}
                />
                <DefaultLayout
                  path={`${paths.accounts}`}
                  component={userIsAuthenticated(AccountsManagementContainer)}
                />
                <DefaultLayout
                  path={`${paths.receipt}`}
                  isolate
                  component={userIsAuthenticated(ReceiptContainer)}
                />
                <DefaultLayout
                  path={`${paths.OAuthRedirect}`}
                  component={userIsAuthenticated(OAuthRedirectComponent)}
                />
                <DefaultLayout
                  path={`${paths.userSetting}`}
                  component={userIsAuthenticated(UserSettingContainer)}
                />
                {process.env.REACT_APP_ENV === 'test' && (
                  <DefaultLayout
                    path={`${paths.disconnect}`}
                    component={userIsAuthenticated(Disconnect)}
                  />
                )}
              </Switch>
            </ConnectedRouter>
          </SnackbarProvider>
          </PersistGate>
        </Provider>
      </ThemeProvider>
    )
  }
}

export default App
