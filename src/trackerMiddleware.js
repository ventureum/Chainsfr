import ReactGA from 'react-ga'
import isPromise from 'is-promise'
import env from './typedEnv'

const options = {}

export const trackPage = (page) => {
  ReactGA.set({
    page,
    ...options
  })
  ReactGA.pageview(page)
}

export const trackEvent = ({ category, action, label, value }) => {
  ReactGA.event({
    category: category,
    action: action,
    label: label,
    value: value
  })
}

export const trackUser = (userId) => {
  ReactGA.set({ userId })
}

export const trackException = ({ description, fatal = true }) => {
  ReactGA.exception({
    description,
    fatal
  })
}

let currentPage = ''
var currentUserId = null

export const trackerMiddleware = store => next => action => {
  switch (action.type) {
    case 'persist/REHYDRATE':
      // init GA
      ReactGA.initialize(env.REACT_APP_GA_TRACKING_ID, { debug: env.REACT_APP_ENV === 'test' })

      if (currentUserId === null) {
        const profile = action.payload && action.payload.userReducer && action.payload.userReducer.profile
        if (profile && profile.googleId) {
          currentUserId = profile.googleId
          trackUser(currentUserId)
        }
      }
      break
    case '@@router/LOCATION_CHANGE':
      const nextPage = `${action.payload.location.pathname}${action.payload.location.search}`

      if (currentPage !== nextPage) {
        currentPage = nextPage
        trackPage(nextPage)
      }
      break
    case 'LOGIN':
      // register user
      trackUser(action.payload.googleId)
      currentUserId = action.payload.googleId
      break
    case 'LOGOUT_FULFILLED':
      trackEvent({
        category: 'User',
        action: action.type
      })
      // unregister user
      trackUser(null)
      currentUserId = null
      break
    case 'ENQUEUE_SNACKBAR':
    case 'REMOVE_SNACKBAR':
      // ignore snackbar actions
      break
    default:
      // report all other action types
      trackEvent({
        category: 'Action',
        action: action.type
      })
  }
  // If not a promise, continue on
  if (!isPromise(action.payload)) {
    return next(action)
  } else {
    // report all async errors
    return next(action).catch(error => {
      const errorMsg = (typeof error === 'string') ? error : error.message
      trackException({ description: `[${action.type}] ${errorMsg}` })
      throw error
    })
  }
}
