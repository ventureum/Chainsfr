import ReactGA from 'react-ga'
import isPromise from 'is-promise'
import env from './typedEnv'
import moment from 'moment'

const options = {}
const GA_ENABLED = !!env.REACT_APP_GA_TRACKING_ID

export const initTracker = () => {
  // init GA
  if (!GA_ENABLED) return
  ReactGA.initialize(env.REACT_APP_GA_TRACKING_ID, { debug: env.REACT_APP_ENV === 'test' })
}

export const trackPage = (page) => {
  if (!GA_ENABLED) return
  ReactGA.set({
    page,
    ...options
  })
  ReactGA.pageview(page)
}

export const trackEvent = ({ category, action, label, value }) => {
  if (!GA_ENABLED) return
  ReactGA.event({
    category: category,
    action: action,
    label: label,
    value: value
  })
}

export const trackUser = (userId) => {
  if (!GA_ENABLED) return
  ReactGA.set({ userId })
}

export const trackException = ({ description, fatal = true }) => {
  if (!GA_ENABLED) return
  ReactGA.exception({
    description,
    fatal
  })
}

export const intercomBoot = () => {
  if (window.Intercom) {
    window.Intercom('boot', {})
  }
}

export const intercomLogin = (userId, profile) => {
  if (window.Intercom) {
    window.Intercom('boot', {
      user_id: userId,
      email: profile.email,
      name: profile.name,
      familyName: profile.familyName,
      givenName: profile.givenName,
      avatar: {
        type: 'avatar',
        image_url: profile.imageUrl
      },
      created_at: moment().unix()
    })
  }
}

let currentPage = ''
var currentUserId = null

export const trackerMiddleware = store => next => action => {
  switch (action.type) {
    case 'persist/REHYDRATE':
      initTracker()
      intercomBoot()
      if (currentUserId === null) {
        const profile = action.payload && action.payload.userReducer && action.payload.userReducer.profile
        if (profile && profile.googleId) {
          currentUserId = profile.googleId
          trackUser(currentUserId)
          intercomLogin(currentUserId, profile.profileObj)
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
    case 'ON_GOOGLE_LOGIN_RETURN':
      currentUserId = action.payload.googleId
      const profile = action.payload.profileObj
      trackUser(currentUserId)
      intercomLogin(currentUserId, profile)
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
